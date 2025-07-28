import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSnippets } from '../services/firestoreService'
import {
  SnippetCard,
  PageContainer,
  LoadingSpinner,
  LoadingCard,
  LoadingButton,
  TagFilter,
} from '../components'
import './SnippetListPage.css'

const perPage = 12

/**
 * SnippetListPage component for displaying paginated list of snippets
 */
const SnippetListPage = () => {
  const [snippets, setSnippets] = useState([])
  const [allSnippets, setAllSnippets] = useState([]) // Store all snippets for filtering
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [lastDoc, setLastDoc] = useState(null)
  const [copyMessage, setCopyMessage] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  const navigate = useNavigate()

  // Load snippets for current page
  const loadSnippets = async (page = 1, lastCreatedAt = null) => {
    try {
      setLoading(true)
      setError(null)

      const options = {
        orderByField: 'createdAt',
        orderDirection: 'desc',
        limitCount: perPage + 1, // Get one extra to check if there's a next page
      }

      // For pagination, we'll use a where condition to get snippets created before the last one
      if (lastCreatedAt && page > 1) {
        options.whereConditions = [
          { field: 'createdAt', operator: '<', value: lastCreatedAt },
        ]
      }

      const fetchedSnippets = await getSnippets(options)

      // Store all snippets for filtering if it's the first page
      if (page === 1) {
        // Load all snippets for filtering (we'll optimize this later if needed)
        const allSnippetsData = await getSnippets({
          orderByField: 'createdAt',
          orderDirection: 'desc',
        })
        setAllSnippets(allSnippetsData)
      }

      // Check if there are more pages
      const hasMore = fetchedSnippets.length > perPage
      const displaySnippets = hasMore
        ? fetchedSnippets.slice(0, perPage)
        : fetchedSnippets

      if (page === 1) {
        setSnippets(displaySnippets)
      } else {
        setSnippets((prev) => [...prev, ...displaySnippets])
      }

      setHasNextPage(hasMore)

      // Store the last document's createdAt for pagination
      if (displaySnippets.length > 0) {
        const lastSnippet = displaySnippets[displaySnippets.length - 1]
        setLastDoc(lastSnippet.createdAt)
      }
    } catch (err) {
      console.error('Error loading snippets:', err)
      setError('Failed to load snippets. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load initial snippets
  useEffect(() => {
    loadSnippets(1)
  }, [])

  // Handle snippet card click
  const handleSnippetClick = (snippet) => {
    navigate(`/snippets/${snippet.id}`)
  }

  // Handle copy success
  const handleCopySuccess = (copiedText) => {
    setCopyMessage('Code copied to clipboard!')
    setTimeout(() => setCopyMessage(''), 3000)
  }

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && hasNextPage && lastDoc) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      loadSnippets(nextPage, lastDoc)
    }
  }

  // Handle retry
  const handleRetry = () => {
    setCurrentPage(1)
    setSnippets([])
    setAllSnippets([])
    setLastDoc(null)
    loadSnippets(1)
  }

  // Handle tag filter changes
  const handleTagsChange = (newSelectedTags) => {
    setSelectedTags(newSelectedTags)
  }

  // Filter snippets based on selected tags
  const getFilteredSnippets = () => {
    if (selectedTags.length === 0) {
      return snippets // No filter, return all displayed snippets
    }

    // Filter from all snippets when tags are selected
    const filteredSnippets = allSnippets.filter((snippet) => {
      if (!snippet.tags || snippet.tags.length === 0) {
        return false
      }
      // Check if snippet has any of the selected tags
      return selectedTags.some((tag) => snippet.tags.includes(tag))
    })

    return filteredSnippets
  }

  const displayedSnippets = getFilteredSnippets()

  if (loading && snippets.length === 0) {
    return (
      <PageContainer>
        <div className="snippet-list-page">
          {/* Filter Controls */}
          <div className="snippet-list-controls">
            <div className="snippet-list-filters">
              <TagFilter
                selectedTags={selectedTags}
                onTagsChange={handleTagsChange}
                className="snippet-list-tag-filter"
              />
            </div>
          </div>

          {/* Loading Skeleton Grid */}
          <div className="snippet-list-grid">
            <LoadingCard variant="snippet" count={perPage} />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (error && snippets.length === 0) {
    return (
      <PageContainer>
        <div className="snippet-list-page">
          <div className="snippet-list-error">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button className="retry-button" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="snippet-list-page">
        {copyMessage && <div className="copy-message">{copyMessage}</div>}

        {/* Filter Controls */}
        <div className="snippet-list-controls">
          <div className="snippet-list-filters">
            <TagFilter
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
              className="snippet-list-tag-filter"
            />
          </div>
        </div>

        {snippets.length === 0 && !loading ? (
          <div className="snippet-list-empty">
            <h2>No snippets yet</h2>
            <button
              className="create-snippet-button"
              onClick={() => navigate('/create')}
            >
              Create First Snippet
            </button>
          </div>
        ) : displayedSnippets.length === 0 && selectedTags.length > 0 ? (
          <div className="snippet-list-empty">
            <h2>No snippets found</h2>
            <button
              className="create-snippet-button"
              onClick={() => navigate('/create')}
            >
              Create New Snippet
            </button>
          </div>
        ) : (
          <>
            <div className="snippet-list-grid">
              {displayedSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onClick={handleSnippetClick}
                  onCopy={handleCopySuccess}
                  className="snippet-list-card"
                  livePreview={true}
                />
              ))}

              {/* Show skeleton cards when loading more */}
              {loading && currentPage > 1 && (
                <LoadingCard variant="snippet" count={6} />
              )}
            </div>

            {/* Only show pagination when no filter is active */}
            {selectedTags.length === 0 && hasNextPage && (
              <div className="snippet-list-pagination">
                <LoadingButton
                  onClick={handleLoadMore}
                  loading={loading}
                  loadingText="Loading more..."
                  variant="primary"
                  size="medium"
                >
                  Load More Snippets
                </LoadingButton>
              </div>
            )}

            {selectedTags.length === 0 &&
              !hasNextPage &&
              snippets.length > 0 && (
                <div className="snippet-list-end">
                  <p>You've reached the end! 🎉</p>
                  <p>
                    <button
                      className="create-snippet-link"
                      onClick={() => navigate('/create')}
                    >
                      Create a new snippet
                    </button>{' '}
                    to add more content.
                  </p>
                </div>
              )}
          </>
        )}

        {error && snippets.length > 0 && (
          <div className="snippet-list-error-inline">
            <p>Failed to load more snippets. </p>
            <button className="retry-link" onClick={handleLoadMore}>
              Try again
            </button>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default SnippetListPage
