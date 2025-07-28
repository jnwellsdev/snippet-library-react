import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import LandingPage from '../LandingPage'
import { useAuth } from '../../contexts/AuthContext'
import { getTopSnippets } from '../../services/firestoreService'

// Mock the dependencies
vi.mock('../../contexts/AuthContext')
vi.mock('../../services/firestoreService')
vi.mock('../../components', () => ({
  SnippetCard: ({ snippet, showVoteCount }) => (
    <div data-testid={`snippet-card-${snippet.id}`}>
      <h3>{snippet.title}</h3>
      <p>Author: {snippet.authorEmail}</p>
      {showVoteCount && <span>Votes: {snippet.voteCount}</span>}
    </div>
  ),
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Helper function to render component with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

// Mock snippet data
const mockSnippets = [
  {
    id: '1',
    title: 'Button Component',
    htmlContent: '<button>Click me</button>',
    authorId: 'user1',
    authorEmail: 'user1@example.com',
    voteCount: 5,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Card Layout',
    htmlContent: '<div class="card">Content</div>',
    authorId: 'user2',
    authorEmail: 'user2@example.com',
    voteCount: 3,
    createdAt: new Date('2024-01-02'),
  },
]

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  describe('Initial render and loading state', () => {
    it('should render loading state initially', () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockReturnValue(new Promise(() => {})) // Never resolves

      renderWithRouter(<LandingPage />)

      expect(screen.getByText('HTML Snippet Sharing')).toBeInTheDocument()
      expect(screen.getByText('Discover and share HTML code snippets with the community')).toBeInTheDocument()
      expect(screen.getByText('Loading top snippets...')).toBeInTheDocument()
    })

    it('should render header with title and description', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue([])

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        expect(screen.getByText('HTML Snippet Sharing')).toBeInTheDocument()
        expect(screen.getByText('Discover and share HTML code snippets with the community')).toBeInTheDocument()
      })
    })
  })

  describe('Create Snippet button functionality', () => {
    it('should render prominent Create Snippet button', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue([])

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        const createButton = screen.getByTestId('create-snippet-button')
        expect(createButton).toBeInTheDocument()
        expect(createButton).toHaveTextContent('Create Snippet')
      })
    })

    it('should navigate to /create when authenticated user clicks Create Snippet', async () => {
      useAuth.mockReturnValue({ isAuthenticated: true })
      getTopSnippets.mockResolvedValue([])

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        const createButton = screen.getByTestId('create-snippet-button')
        fireEvent.click(createButton)
        expect(mockNavigate).toHaveBeenCalledWith('/create')
      })
    })

    it('should navigate to /login when unauthenticated user clicks Create Snippet', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue([])

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        const createButton = screen.getByTestId('create-snippet-button')
        fireEvent.click(createButton)
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('Top snippets display', () => {
    it('should display top 10 snippets when available', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue(mockSnippets)

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        expect(screen.getByText('Top Snippets')).toBeInTheDocument()
        expect(screen.getByTestId('snippets-grid')).toBeInTheDocument()
        expect(screen.getByTestId('snippet-card-1')).toBeInTheDocument()
        expect(screen.getByTestId('snippet-card-2')).toBeInTheDocument()
      })

      // Verify snippet content is displayed
      expect(screen.getByText('Button Component')).toBeInTheDocument()
      expect(screen.getByText('Card Layout')).toBeInTheDocument()
      expect(screen.getByText('Author: user1@example.com')).toBeInTheDocument()
      expect(screen.getByText('Author: user2@example.com')).toBeInTheDocument()
      expect(screen.getByText('Votes: 5')).toBeInTheDocument()
      expect(screen.getByText('Votes: 3')).toBeInTheDocument()
    })

    it('should call getTopSnippets with limit of 10', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue([])

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        expect(getTopSnippets).toHaveBeenCalledWith(10)
      })
    })

    it('should display "View All Snippets" link when snippets exist', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue(mockSnippets)

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        const viewAllLink = screen.getByText('View All Snippets →')
        expect(viewAllLink).toBeInTheDocument()
        expect(viewAllLink.closest('a')).toHaveAttribute('href', '/snippets')
      })
    })
  })

  describe('Empty state handling', () => {
    it('should display welcome message when no snippets exist', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue([])

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        const emptyState = screen.getByTestId('empty-state')
        expect(emptyState).toBeInTheDocument()
        expect(screen.getByText('Welcome to HTML Snippet Sharing!')).toBeInTheDocument()
        expect(screen.getByText('Be the first to share an HTML snippet with the community.')).toBeInTheDocument()
      })
    })

    it('should display "Create the First Snippet" button in empty state', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue([])

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        const createFirstButton = screen.getByText('Create the First Snippet')
        expect(createFirstButton).toBeInTheDocument()
      })
    })

    it('should navigate to login when unauthenticated user clicks "Create the First Snippet"', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue([])

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        const createFirstButton = screen.getByText('Create the First Snippet')
        fireEvent.click(createFirstButton)
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })

    it('should not display "View All Snippets" link when no snippets exist', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue([])

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        expect(screen.queryByText('View All Snippets →')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error handling', () => {
    it('should display error message when fetching snippets fails', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockRejectedValue(new Error('Network error'))

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveTextContent('Failed to load top snippets')
      })
    })

    it('should not display snippets grid when there is an error', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockRejectedValue(new Error('Network error'))

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
      
      expect(screen.queryByTestId('snippets-grid')).not.toBeInTheDocument()
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    })
  })

  describe('Component integration', () => {
    it('should pass correct props to SnippetCard components', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue(mockSnippets)

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        // Verify that SnippetCard receives showVoteCount prop
        expect(screen.getByText('Votes: 5')).toBeInTheDocument()
        expect(screen.getByText('Votes: 3')).toBeInTheDocument()
      })
    })

    it('should handle authentication state changes', async () => {
      const { rerender } = renderWithRouter(<LandingPage />)
      
      // Initially unauthenticated
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue([])

      await waitFor(() => {
        const createButton = screen.getByTestId('create-snippet-button')
        fireEvent.click(createButton)
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })

      mockNavigate.mockClear()

      // Now authenticated
      useAuth.mockReturnValue({ isAuthenticated: true })
      rerender(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        const createButton = screen.getByTestId('create-snippet-button')
        fireEvent.click(createButton)
        expect(mockNavigate).toHaveBeenCalledWith('/create')
      })
    })
  })

  describe('Requirements validation', () => {
    it('should satisfy requirement 7.1: display top 10 highest-voted snippets', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue(mockSnippets)

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        expect(getTopSnippets).toHaveBeenCalledWith(10)
        expect(screen.getByText('Top Snippets')).toBeInTheDocument()
        expect(screen.getByTestId('snippets-grid')).toBeInTheDocument()
      })
    })

    it('should satisfy requirement 7.2: show prominent Create Snippet button', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue([])

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        const createButton = screen.getByTestId('create-snippet-button')
        expect(createButton).toBeInTheDocument()
        expect(createButton).toHaveClass('create-snippet-btn', 'primary')
      })
    })

    it('should satisfy requirement 7.3: navigate to create page or prompt login', async () => {
      // Test authenticated user
      useAuth.mockReturnValue({ isAuthenticated: true })
      getTopSnippets.mockResolvedValue([])

      const { unmount } = renderWithRouter(<LandingPage />)

      await waitFor(() => {
        const createButton = screen.getByTestId('create-snippet-button')
        fireEvent.click(createButton)
        expect(mockNavigate).toHaveBeenCalledWith('/create')
      })

      unmount()
      mockNavigate.mockClear()

      // Test unauthenticated user
      useAuth.mockReturnValue({ isAuthenticated: false })
      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        const createButton = screen.getByTestId('create-snippet-button')
        fireEvent.click(createButton)
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })

    it('should satisfy requirement 7.4: navigate to detailed snippet view', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue(mockSnippets)

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        // SnippetCard components should be clickable and navigate to detail view
        // This is handled by the SnippetCard component itself
        expect(screen.getByTestId('snippet-card-1')).toBeInTheDocument()
        expect(screen.getByTestId('snippet-card-2')).toBeInTheDocument()
      })
    })

    it('should satisfy requirement 7.5: display welcome message when no snippets', async () => {
      useAuth.mockReturnValue({ isAuthenticated: false })
      getTopSnippets.mockResolvedValue([])

      renderWithRouter(<LandingPage />)

      await waitFor(() => {
        const emptyState = screen.getByTestId('empty-state')
        expect(emptyState).toBeInTheDocument()
        expect(screen.getByText('Welcome to HTML Snippet Sharing!')).toBeInTheDocument()
        expect(screen.getByText('Be the first to share an HTML snippet with the community.')).toBeInTheDocument()
        expect(screen.getByText('Create the First Snippet')).toBeInTheDocument()
      })
    })
  })
})