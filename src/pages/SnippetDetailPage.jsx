import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  SnippetDetail,
  PageContainer,
  LoadingCard,
  LoadingButton,
} from '../components'
import {
  getSnippet,
  updateSnippet,
  deleteSnippet,
} from '../services/firestoreService'
import './SnippetDetailPage.css'

/**
 * SnippetDetailPage component for displaying individual snippet details
 */
const SnippetDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [snippet, setSnippet] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load snippet data
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
        setIsLoading(false)
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
    try {
      // Only send the fields that should be updated to Firestore
      const updateData = {
        title: updatedSnippet.title,
        htmlContent: updatedSnippet.htmlContent,
        tags: updatedSnippet.tags || [], // Ensure tags is always an array
      }

      await updateSnippet(snippet.id, updateData)

      // Update local state to reflect changes
      setSnippet({
        ...snippet,
        ...updateData,
        updatedAt: new Date().toISOString(), // Update local timestamp
      })

      console.log('Snippet updated successfully')
    } catch (error) {
      console.error('Error updating snippet:', error)
      throw error // Re-throw so the component can handle the error
    }
  }

  const handleDelete = async (snippetId) => {
    try {
      await deleteSnippet(snippetId)
      console.log('Snippet deleted successfully')

      // Navigate back to the snippets list after successful deletion
      navigate('/snippets')
    } catch (error) {
      console.error('Error deleting snippet:', error)
      throw error // Re-throw so the component can handle the error
    }
  }

  const handleBackClick = () => {
    navigate(-1)
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="snippet-detail-page">
          <div className="snippet-detail-container">
            <div className="snippet-detail-navigation">
              <LoadingButton variant="secondary" disabled>
                ← Back
              </LoadingButton>
            </div>
            <LoadingCard variant="detail" />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="snippet-detail-page">
          <div className="snippet-detail-container">
            <div className="snippet-detail-error">
              <h2>Error</h2>
              <p>{error}</p>
              <div className="error-actions">
                <LoadingButton variant="secondary" onClick={handleBackClick}>
                  Go Back
                </LoadingButton>
                <LoadingButton
                  variant="primary"
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
      <div className="snippet-detail-page">
        <div className="snippet-detail-container">
          <div className="snippet-detail-navigation">
            <LoadingButton variant="secondary" onClick={handleBackClick}>
              ← Back
            </LoadingButton>
          </div>

          <SnippetDetail
            snippet={snippet}
            onCopy={handleCopy}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            className="snippet-detail-main"
          />
        </div>
      </div>
    </PageContainer>
  )
}

export default SnippetDetailPage
