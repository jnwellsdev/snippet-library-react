import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import SnippetListPage from '../SnippetListPage'
import * as firestoreService from '../../services/firestoreService'

// Mock the firestore service
vi.mock('../../services/firestoreService')

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')
	return {
		...actual,
		useNavigate: () => mockNavigate,
	}
})

// Mock components
vi.mock('../../components/snippets/SnippetCard', () => ({
	default: ({ snippet, onClick, className }) => (
		<div className={`mock-snippet-card ${className}`} data-testid={`snippet-card-${snippet.id}`} onClick={() => onClick(snippet)}>
			<h3>{snippet.title}</h3>
			<p>{snippet.htmlContent}</p>
			<span>by {snippet.authorEmail}</span>
			<button
				onClick={(e) => {
					e.stopPropagation()
				}}
			>
				Copy
			</button>
		</div>
	),
}))

// Test data
const mockSnippets = [
	{
		id: '1',
		title: 'Test Snippet 1',
		htmlContent: '<div>Test content 1</div>',
		authorEmail: 'user1@example.com',
		createdAt: { seconds: 1640995200 }, // 2022-01-01
		voteCount: 5,
	},
	{
		id: '2',
		title: 'Test Snippet 2',
		htmlContent: '<div>Test content 2</div>',
		authorEmail: 'user2@example.com',
		createdAt: { seconds: 1640995300 }, // 2022-01-01 + 100s
		voteCount: 3,
	},
	{
		id: '3',
		title: 'Test Snippet 3',
		htmlContent: '<div>Test content 3</div>',
		authorEmail: 'user3@example.com',
		createdAt: { seconds: 1640995400 }, // 2022-01-01 + 200s
		voteCount: 8,
	},
]

const renderWithRouter = (component) => {
	return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('SnippetListPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Loading State', () => {
		it('should display loading spinner when initially loading', async () => {
			// Mock a delayed response
			firestoreService.getSnippets.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(mockSnippets), 100)))

			renderWithRouter(<SnippetListPage />)

			expect(screen.getByText('All Snippets')).toBeInTheDocument()
			expect(screen.getByText('Discover HTML code snippets from the community')).toBeInTheDocument()
			expect(screen.getByText('Loading snippets...')).toBeInTheDocument()
			expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
		})

		it('should hide loading state after snippets are loaded', async () => {
			firestoreService.getSnippets.mockResolvedValue(mockSnippets)

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				expect(screen.queryByText('Loading snippets...')).not.toBeInTheDocument()
			})

			expect(screen.getByTestId('snippet-card-1')).toBeInTheDocument()
			expect(screen.getByTestId('snippet-card-2')).toBeInTheDocument()
			expect(screen.getByTestId('snippet-card-3')).toBeInTheDocument()
		})
	})

	describe('Error Handling', () => {
		it('should display error message when loading fails', async () => {
			const errorMessage = 'Network error'
			firestoreService.getSnippets.mockRejectedValue(new Error(errorMessage))

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
				expect(screen.getByText('Failed to load snippets. Please try again.')).toBeInTheDocument()
			})

			expect(screen.getByText('Try Again')).toBeInTheDocument()
		})

		it('should retry loading when retry button is clicked', async () => {
			firestoreService.getSnippets.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce(mockSnippets)

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				expect(screen.getByText('Try Again')).toBeInTheDocument()
			})

			fireEvent.click(screen.getByText('Try Again'))

			await waitFor(() => {
				expect(screen.getByTestId('snippet-card-1')).toBeInTheDocument()
			})

			expect(firestoreService.getSnippets).toHaveBeenCalledTimes(2)
		})
	})

	describe('Empty State', () => {
		it('should display empty state when no snippets exist', async () => {
			firestoreService.getSnippets.mockResolvedValue([])

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				expect(screen.getByText('No snippets yet')).toBeInTheDocument()
				expect(screen.getByText('Be the first to share an HTML snippet with the community!')).toBeInTheDocument()
			})

			expect(screen.getByText('Create First Snippet')).toBeInTheDocument()
		})

		it('should navigate to create page when create button is clicked in empty state', async () => {
			firestoreService.getSnippets.mockResolvedValue([])

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				expect(screen.getByText('Create First Snippet')).toBeInTheDocument()
			})

			fireEvent.click(screen.getByText('Create First Snippet'))

			expect(mockNavigate).toHaveBeenCalledWith('/create')
		})
	})

	describe('Snippet Display', () => {
		it('should display snippets in a grid layout', async () => {
			firestoreService.getSnippets.mockResolvedValue(mockSnippets)

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				expect(screen.getByTestId('snippet-card-1')).toBeInTheDocument()
				expect(screen.getByTestId('snippet-card-2')).toBeInTheDocument()
				expect(screen.getByTestId('snippet-card-3')).toBeInTheDocument()
			})

			// Check that snippets are displayed with correct content
			expect(screen.getByText('Test Snippet 1')).toBeInTheDocument()
			expect(screen.getByText('Test Snippet 2')).toBeInTheDocument()
			expect(screen.getByText('Test Snippet 3')).toBeInTheDocument()
		})

		it('should call getSnippets with correct pagination options', async () => {
			firestoreService.getSnippets.mockResolvedValue(mockSnippets)

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				expect(firestoreService.getSnippets).toHaveBeenCalledWith({
					orderByField: 'voteCount',
					orderDirection: 'desc',
					limitCount: 13, // SNIPPETS_PER_PAGE + 1
				})
			})
		})
	})

	describe('Navigation', () => {
		it('should navigate to snippet detail when snippet card is clicked', async () => {
			firestoreService.getSnippets.mockResolvedValue(mockSnippets)

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				expect(screen.getByTestId('snippet-card-1')).toBeInTheDocument()
			})

			fireEvent.click(screen.getByTestId('snippet-card-1'))

			expect(mockNavigate).toHaveBeenCalledWith('/snippets/1')
		})
	})

	describe('Basic Pagination', () => {
		it('should show load more button when there are more snippets', async () => {
			// Mock 13 snippets (more than SNIPPETS_PER_PAGE = 12)
			const manySnippets = Array.from({ length: 13 }, (_, i) => ({
				id: `${i + 1}`,
				title: `Snippet ${i + 1}`,
				htmlContent: `<div>Content ${i + 1}</div>`,
				authorEmail: `user${i + 1}@example.com`,
				createdAt: { seconds: 1640995200 + i * 100 },
				voteCount: i,
			}))

			firestoreService.getSnippets.mockResolvedValue(manySnippets)

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				expect(screen.getByText('Load More Snippets')).toBeInTheDocument()
			})

			// Should only display first 12 snippets
			expect(screen.getByTestId('snippet-card-1')).toBeInTheDocument()
			expect(screen.getByTestId('snippet-card-12')).toBeInTheDocument()
			expect(screen.queryByTestId('snippet-card-13')).not.toBeInTheDocument()
		})

		it('should show end message when no more snippets to load', async () => {
			firestoreService.getSnippets.mockResolvedValue(mockSnippets)

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				expect(screen.getByText("You've reached the end! 🎉")).toBeInTheDocument()
				expect(screen.getByText('Create a new snippet')).toBeInTheDocument()
			})

			expect(screen.queryByText('Load More Snippets')).not.toBeInTheDocument()
		})

		it('should navigate to create page when create link is clicked in end message', async () => {
			firestoreService.getSnippets.mockResolvedValue(mockSnippets)

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				expect(screen.getByText('Create a new snippet')).toBeInTheDocument()
			})

			fireEvent.click(screen.getByText('Create a new snippet'))

			expect(mockNavigate).toHaveBeenCalledWith('/create')
		})
	})

	describe('Accessibility', () => {
		it('should have proper heading structure', async () => {
			firestoreService.getSnippets.mockResolvedValue(mockSnippets)

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				expect(screen.getByRole('heading', { level: 1, name: 'All Snippets' })).toBeInTheDocument()
			})
		})

		it('should have proper button roles and labels', async () => {
			firestoreService.getSnippets.mockResolvedValue([])

			renderWithRouter(<SnippetListPage />)

			await waitFor(() => {
				const createButton = screen.getByRole('button', { name: 'Create First Snippet' })
				expect(createButton).toBeInTheDocument()
			})
		})
	})
})
