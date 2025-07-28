import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import CreateSnippetPage from '../CreateSnippetPage'
import { AuthProvider } from '../../contexts/AuthContext'
import { createSnippet } from '../../services/firestoreService'

const mockNavigate = vi.fn()

// Mock the services
vi.mock('../../services/firestoreService')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock the auth context
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
}

const MockAuthProvider = ({ children, user = mockUser }) => {
  return (
    <AuthProvider value={{ user, isAuthenticated: !!user }}>
      {children}
    </AuthProvider>
  )
}

const renderWithProviders = (component, { user = mockUser } = {}) => {
  return render(
    <BrowserRouter>
      <MockAuthProvider user={user}>
        {component}
      </MockAuthProvider>
    </BrowserRouter>
  )
}

describe('CreateSnippetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page header and form', () => {
    renderWithProviders(<CreateSnippetPage />)

    expect(screen.getByText('Create New Snippet')).toBeInTheDocument()
    expect(screen.getByText(/share your html code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/html content/i)).toBeInTheDocument()
  })

  it('renders help section with tips', () => {
    renderWithProviders(<CreateSnippetPage />)

    expect(screen.getByText('Tips for creating great snippets:')).toBeInTheDocument()
    expect(screen.getByText(/use descriptive titles/i)).toBeInTheDocument()
    expect(screen.getByText(/include complete, working html/i)).toBeInTheDocument()
  })

  it('renders cancel button', () => {
    renderWithProviders(<CreateSnippetPage />)

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('navigates back when cancel button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateSnippetPage />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('shows error when user is not authenticated', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateSnippetPage />, { user: null })

    const titleInput = screen.getByLabelText(/title/i)
    const htmlInput = screen.getByLabelText(/html content/i)
    const submitButton = screen.getByRole('button', { name: /create snippet/i })

    await user.type(titleInput, 'Test Title')
    await user.type(htmlInput, '<div>Test Content</div>')
    await user.click(submitButton)

    expect(screen.getByText(/you must be logged in/i)).toBeInTheDocument()
  })

  it('creates snippet and navigates on successful submission', async () => {
    const user = userEvent.setup()
    const mockSnippetId = 'new-snippet-id'
    createSnippet.mockResolvedValue(mockSnippetId)

    renderWithProviders(<CreateSnippetPage />)

    const titleInput = screen.getByLabelText(/title/i)
    const htmlInput = screen.getByLabelText(/html content/i)
    const submitButton = screen.getByRole('button', { name: /create snippet/i })

    await user.type(titleInput, 'Test Snippet')
    await user.type(htmlInput, '<div>Hello World</div>')
    await user.click(submitButton)

    await waitFor(() => {
      expect(createSnippet).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Snippet',
          htmlContent: '<div>Hello World</div>',
          authorId: 'test-user-id',
          authorEmail: 'test@example.com',
          voteCount: 0,
          tags: [],
        })
      )
    })

    expect(mockNavigate).toHaveBeenCalledWith(`/snippets/${mockSnippetId}`)
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    createSnippet.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithProviders(<CreateSnippetPage />)

    const titleInput = screen.getByLabelText(/title/i)
    const htmlInput = screen.getByLabelText(/html content/i)
    const submitButton = screen.getByRole('button', { name: /create snippet/i })

    await user.type(titleInput, 'Test Snippet')
    await user.type(htmlInput, '<div>Hello World</div>')
    await user.click(submitButton)

    expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  it('shows error message on submission failure', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Failed to create snippet'
    createSnippet.mockRejectedValue(new Error(errorMessage))

    renderWithProviders(<CreateSnippetPage />)

    const titleInput = screen.getByLabelText(/title/i)
    const htmlInput = screen.getByLabelText(/html content/i)
    const submitButton = screen.getByRole('button', { name: /create snippet/i })

    await user.type(titleInput, 'Test Snippet')
    await user.type(htmlInput, '<div>Hello World</div>')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('allows dismissing error messages', async () => {
    const user = userEvent.setup()
    createSnippet.mockRejectedValue(new Error('Test error'))

    renderWithProviders(<CreateSnippetPage />)

    const titleInput = screen.getByLabelText(/title/i)
    const htmlInput = screen.getByLabelText(/html content/i)
    const submitButton = screen.getByRole('button', { name: /create snippet/i })

    await user.type(titleInput, 'Test Snippet')
    await user.type(htmlInput, '<div>Hello World</div>')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument()
    })

    const dismissButton = screen.getByLabelText(/dismiss error/i)
    await user.click(dismissButton)

    expect(screen.queryByText('Test error')).not.toBeInTheDocument()
  })

  it('trims whitespace from form data before submission', async () => {
    const user = userEvent.setup()
    const mockSnippetId = 'new-snippet-id'
    createSnippet.mockResolvedValue(mockSnippetId)

    renderWithProviders(<CreateSnippetPage />)

    const titleInput = screen.getByLabelText(/title/i)
    const htmlInput = screen.getByLabelText(/html content/i)
    const submitButton = screen.getByRole('button', { name: /create snippet/i })

    await user.type(titleInput, '  Test Snippet  ')
    await user.type(htmlInput, '  <div>Hello World</div>  ')
    await user.click(submitButton)

    await waitFor(() => {
      expect(createSnippet).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Snippet',
          htmlContent: '<div>Hello World</div>',
        })
      )
    })
  })

  it('disables cancel button during submission', async () => {
    const user = userEvent.setup()
    createSnippet.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithProviders(<CreateSnippetPage />)

    const titleInput = screen.getByLabelText(/title/i)
    const htmlInput = screen.getByLabelText(/html content/i)
    const submitButton = screen.getByRole('button', { name: /create snippet/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })

    await user.type(titleInput, 'Test Snippet')
    await user.type(htmlInput, '<div>Hello World</div>')
    await user.click(submitButton)

    expect(cancelButton).toBeDisabled()
  })
})