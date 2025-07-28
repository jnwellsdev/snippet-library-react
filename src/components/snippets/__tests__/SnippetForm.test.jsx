import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import SnippetForm from '../SnippetForm'

describe('SnippetForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders form fields correctly', () => {
    render(<SnippetForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/html content/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create snippet/i })).toBeInTheDocument()
  })

  it('shows character count for title field', () => {
    render(<SnippetForm onSubmit={mockOnSubmit} />)

    expect(screen.getByText('0/200')).toBeInTheDocument()
  })

  it('updates character count when typing in title', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'Test Title')

    expect(screen.getByText('10/200')).toBeInTheDocument()
  })

  it('validates required fields on submit', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /create snippet/i })
    await user.click(submitButton)

    expect(screen.getByText(/field is required and must be a string/i)).toBeInTheDocument()
    expect(screen.getByText(/html content is required and must be a string/i)).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates title length constraints', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/title/i)
    
    // Remove maxlength attribute to test validation
    titleInput.removeAttribute('maxlength')
    
    const longTitle = 'a'.repeat(201)
    
    await user.type(titleInput, longTitle)
    await user.tab() // Trigger blur event

    expect(screen.getByText(/field must be 200 characters or less/i)).toBeInTheDocument()
  })

  it('validates HTML content is not empty', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/title/i)
    const htmlInput = screen.getByLabelText(/html content/i)
    
    await user.type(titleInput, 'Valid Title')
    await user.type(htmlInput, '   ') // Only whitespace
    await user.tab()

    const submitButton = screen.getByRole('button', { name: /create snippet/i })
    await user.click(submitButton)

    expect(screen.getByText(/html content cannot be empty/i)).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('detects potentially dangerous HTML content', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/title/i)
    const htmlInput = screen.getByLabelText(/html content/i)
    
    await user.type(titleInput, 'Valid Title')
    await user.type(htmlInput, '<script>alert("xss")</script>')
    await user.tab()

    expect(screen.getByText(/html content contains potentially unsafe elements/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/title/i)
    const htmlInput = screen.getByLabelText(/html content/i)
    
    await user.type(titleInput, 'Test Snippet')
    await user.type(htmlInput, '<div>Hello World</div>')

    const submitButton = screen.getByRole('button', { name: /create snippet/i })
    await user.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Test Snippet',
      htmlContent: '<div>Hello World</div>',
    })
  })

  it('clears errors when user starts typing', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={mockOnSubmit} />)

    // First trigger validation error
    const submitButton = screen.getByRole('button', { name: /create snippet/i })
    await user.click(submitButton)

    expect(screen.getByText(/field is required and must be a string/i)).toBeInTheDocument()

    // Then start typing to clear error
    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'T')

    expect(screen.queryByText(/field is required and must be a string/i)).not.toBeInTheDocument()
  })

  it('disables form when loading', () => {
    render(<SnippetForm onSubmit={mockOnSubmit} loading={true} />)

    const titleInput = screen.getByLabelText(/title/i)
    const htmlInput = screen.getByLabelText(/html content/i)
    const submitButton = screen.getByRole('button', { name: /creating/i })

    expect(titleInput).toBeDisabled()
    expect(htmlInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Creating...')
  })

  it('populates form with initial data', () => {
    const initialData = {
      title: 'Initial Title',
      htmlContent: '<div>Initial Content</div>',
    }

    render(<SnippetForm onSubmit={mockOnSubmit} initialData={initialData} />)

    expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument()
    expect(screen.getByDisplayValue('<div>Initial Content</div>')).toBeInTheDocument()
  })

  it('shows validation errors only after field is touched', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/title/i)
    
    // Error should not show initially
    expect(screen.queryByText(/field is required and must be a string/i)).not.toBeInTheDocument()
    
    // Focus and blur without entering text
    await user.click(titleInput)
    await user.tab()

    // Now error should show
    expect(screen.getByText(/field is required and must be a string/i)).toBeInTheDocument()
  })

  it('prevents form submission when loading', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={mockOnSubmit} loading={true} />)

    const submitButton = screen.getByRole('button', { name: /creating/i })
    await user.click(submitButton)

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
})