import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSnippets } from '../services/firestoreService'
import { SnippetCard, PageContainer, LoadingCard, LoadingButton, TagFilter } from '../components'
import './SnippetListPage.css'

const perPage = 12

const SnippetListPage = () => {
	const [snippets, setSnippets] = useState([])
	const [allSnippets, setAllSnippets] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [hasNextPage, setHasNextPage] = useState(false)
	const [lastDoc, setLastDoc] = useState(null)
	const [selectedTags, setSelectedTags] = useState([])
	const [sortBy, setSortBy] = useState('popular') // 'popular' or 'recent'

	const navigate = useNavigate()

	const loadSnippets = async (page = 1, lastValue = null, currentSortBy = sortBy) => {
		try {
			setLoading(true)
			setError(null)

			const orderByField = currentSortBy === 'recent' ? 'createdAt' : 'voteCount'
			const options = {
				orderByField,
				orderDirection: 'desc',
				limitCount: perPage + 1,
			}

			if (lastValue !== null && page > 1) {
				options.whereConditions = [{ field: orderByField, operator: '<=', value: lastValue }]
			}

			const fetchedSnippets = await getSnippets(options)

			if (page === 1) {
				const allSnippetsData = await getSnippets({
					orderByField,
					orderDirection: 'desc',
				})
				setAllSnippets(allSnippetsData)
			}

			// Check for more pages
			const hasMore = fetchedSnippets.length > perPage
			const displaySnippets = hasMore ? fetchedSnippets.slice(0, perPage) : fetchedSnippets

			if (page === 1) {
				setSnippets(displaySnippets)
			} else {
				setSnippets((prev) => [...prev, ...displaySnippets])
			}

			setHasNextPage(hasMore)

			// Store last value for pagination
			if (displaySnippets.length > 0) {
				const lastSnippet = displaySnippets[displaySnippets.length - 1]
				setLastDoc(lastSnippet[orderByField])
			}
		} catch (err) {
			console.error('Error loading snippets:', err)
			setError('Failed to load snippets. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	// init
	useEffect(() => {
		loadSnippets(1)
	}, [])

	const handleSnippetClick = (snippet) => {
		navigate(`/snippets/${snippet.id}`)
	}

	const handleLoadMore = () => {
		if (!loading && hasNextPage && lastDoc) {
			const nextPage = currentPage + 1
			setCurrentPage(nextPage)
			loadSnippets(nextPage, lastDoc, sortBy)
		}
	}

	const handleRetry = () => {
		setCurrentPage(1)
		setSnippets([])
		setAllSnippets([])
		setLastDoc(null)
		loadSnippets(1)
	}

	const handleTagsChange = (newSelectedTags) => {
		setSelectedTags(newSelectedTags)
	}

	const handleSortChange = (newSortBy) => {
		if (newSortBy !== sortBy) {
			setSortBy(newSortBy)
			setCurrentPage(1)
			setSnippets([])
			setAllSnippets([])
			setLastDoc(null)
			loadSnippets(1, null, newSortBy)
		}
	}

	const getFilteredSnippets = () => {
		if (selectedTags.length === 0) {
			return snippets
		}

		const filteredSnippets = allSnippets.filter((snippet) => {
			if (!snippet.tags || snippet.tags.length === 0) {
				return false
			}
			return selectedTags.some((tag) => snippet.tags.includes(tag))
		})

		return filteredSnippets
	}

	const displayedSnippets = getFilteredSnippets()

	if (loading && snippets.length === 0) {
		return (
			<PageContainer>
				<div className='snippet-list-page'>
					<div className='snippet-list-controls'>
						<div className='snippet-list-filters'>
							<TagFilter selectedTags={selectedTags} onTagsChange={handleTagsChange} sortBy={sortBy} onSortChange={handleSortChange} className='snippet-list-tag-filter' />
						</div>
					</div>

					<div className='snippet-list-grid'>
						<LoadingCard variant='snippet' count={perPage} />
					</div>

					<div className='loading-status'>Loading snippets...</div>
				</div>
			</PageContainer>
		)
	}

	if (error && snippets.length === 0) {
		return (
			<PageContainer>
				<div className='snippet-list-page'>
					<div className='snippet-list-error'>
						<div className='error-icon'>⚠️</div>
						<h2>Oops! Something went wrong</h2>
						<p>{error}</p>
						<button className='retry-button' onClick={handleRetry}>
							Try Again
						</button>
					</div>
				</div>
			</PageContainer>
		)
	}

	return (
		<PageContainer>
			<div className='snippet-list-page'>
				<div className='snippet-list-controls'>
					<div className='snippet-list-filters'>
						<TagFilter selectedTags={selectedTags} onTagsChange={handleTagsChange} sortBy={sortBy} onSortChange={handleSortChange} className='snippet-list-tag-filter' />
					</div>
				</div>

				{snippets.length === 0 && !loading ? (
					<div className='snippet-list-empty'>
						<h2>No snippets yet</h2>
						<p>Be the first to share an HTML snippet with the community!</p>
						<button className='create-snippet-button' onClick={() => navigate('/create')}>
							Create First Snippet
						</button>
					</div>
				) : displayedSnippets.length === 0 && selectedTags.length > 0 ? (
					<div className='snippet-list-empty'>
						<h2>No snippets found</h2>
						<button className='create-snippet-button' onClick={() => navigate('/create')}>
							Create New Snippet
						</button>
					</div>
				) : (
					<>
						<div className='snippet-list-grid'>
							{displayedSnippets.map((snippet) => (
								<SnippetCard key={snippet.id} snippet={snippet} onClick={handleSnippetClick} className='snippet-list-card' livePreview={true} />
							))}

							{loading && currentPage > 1 && <LoadingCard variant='snippet' count={6} />}
						</div>

						{selectedTags.length === 0 && hasNextPage && (
							<div className='snippet-list-pagination'>
								<LoadingButton onClick={handleLoadMore} loading={loading} loadingText='Loading more...' variant='primary' size='medium'>
									Load More Snippets
								</LoadingButton>
							</div>
						)}

						{selectedTags.length === 0 && !hasNextPage && snippets.length > 0 && (
							<div className='snippet-list-end'>
								<p>You've reached the end! 🎉</p>
								<p>
									<button className='create-snippet-link' onClick={() => navigate('/create')}>
										Create a new snippet
									</button>{' '}
									to add more content.
								</p>
							</div>
						)}
					</>
				)}

				{error && snippets.length > 0 && (
					<div className='snippet-list-error-inline'>
						<p>Failed to load more snippets. </p>
						<button className='retry-link' onClick={handleLoadMore}>
							Try again
						</button>
					</div>
				)}
			</div>
		</PageContainer>
	)
}

export default SnippetListPage
