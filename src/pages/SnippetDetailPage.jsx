import { useEffect, useState } from 'react'
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router-dom'
import {
	LoadingButton,
	LoadingCard,
	PageContainer,
	SnippetDetail,
} from '../components'
import { getSnippet } from '../services/firestoreService'
import './SnippetDetailPage.css'

const SnippetDetailPage = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const location = useLocation()

	const [snippet, setSnippet] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

	// Determine initial tab from URL params
	const initialTab = searchParams.get('tab') || 'preview'

	// init snippet data
	useEffect(() => {
		const loadSnippet = async () => {
			if (!id) {
				setError('No snippet ID provided')
				setIsLoading(false)
				return
			}

			try {
				setIsLoading(true)
				setError(null)

				const snippetData = await getSnippet(id)

				if (!snippetData) {
					setError('Snippet not found')
					setSnippet(null)
				} else {
					setSnippet(snippetData)
				}
			} catch (err) {
				console.error('Error loading snippet:', err)
				setError('Failed to load snippet. Please try again.')
				setSnippet(null)
			} finally {
				setTimeout(() => setIsLoading(false), 500)
			}
		}

		loadSnippet()
	}, [id])

	const handleCopy = async (htmlContent) => {
		try {
			await navigator.clipboard.writeText(htmlContent)
			return Promise.resolve()
		} catch (error) {
			console.error('Failed to copy to clipboard:', error)
			return Promise.reject(error)
		}
	}
	const handleUpdate = async (updatedSnippet) => {
		// Portfolio mode: Simulate update without actual backend calls
		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1000))

			const updateData = {
				title: updatedSnippet.title,
				htmlContent: updatedSnippet.htmlContent,
				tags: updatedSnippet.tags || [],
			}

			// Update local state only
			setSnippet({
				...snippet,
				...updateData,
				updatedAt: new Date().toISOString(),
			})

			console.log('Snippet updated successfully (portfolio mode)')
		} catch (error) {
			console.error('Error updating snippet:', error)
			throw error
		}
	}
	const handleDelete = async (snippetId) => {
		// Portfolio mode: Simulate delete without actual backend calls
		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1000))

			console.log('Snippet deleted successfully (portfolio mode)')
			navigate('/snippets')
		} catch (error) {
			console.error('Error deleting snippet:', error)
			throw error
		}
	}

	const handleBackClick = () => {
		// Check if we came from the create page (would have tab=code in URL)
		// or if there's no previous history
		if (searchParams.get('tab') === 'code' || window.history.length <= 1) {
			// Go to snippets list instead of back to create form
			navigate('/snippets')
		} else {
			// Normal back navigation
			navigate(-1)
		}
	}

	if (isLoading) {
		return (
			<PageContainer>
				<div className='snippet-detail-page'>
					<div className='snippet-detail-container'>
						<div className='snippet-detail-navigation'>
							<LoadingButton variant='secondary' disabled>
								← Back
							</LoadingButton>
						</div>
						<LoadingCard variant='detail' />
					</div>
				</div>
			</PageContainer>
		)
	}

	if (error) {
		return (
			<PageContainer>
				<div className='snippet-detail-page'>
					<div className='snippet-detail-container'>
						<div className='snippet-detail-error'>
							<h2>Error</h2>
							<p>{error}</p>
							<div className='error-actions'>
								<LoadingButton variant='secondary' onClick={handleBackClick}>
									Go Back
								</LoadingButton>
								<LoadingButton
									variant='primary'
									onClick={() => window.location.reload()}
								>
									Try Again
								</LoadingButton>
							</div>
						</div>
					</div>
				</div>
			</PageContainer>
		)
	}

	return (
		<PageContainer>
			<div className='snippet-detail-page'>
				<div className='snippet-detail-container'>
					<div className='snippet-detail-navigation'>
						<LoadingButton variant='secondary' onClick={handleBackClick}>
							← Back
						</LoadingButton>
					</div>

					<SnippetDetail
						snippet={snippet}
						onCopy={handleCopy}
						onUpdate={handleUpdate}
						onDelete={handleDelete}
						className='snippet-detail-main'
						initialTab={initialTab}
					/>
				</div>
			</div>
		</PageContainer>
	)
}

export default SnippetDetailPage
