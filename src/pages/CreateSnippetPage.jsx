import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { createSnippet } from '../services/firestoreService'
import { Snippet } from '../models/Snippet'
import { SnippetForm, PageContainer, LoadingButton } from '../components'
import './CreateSnippetPage.css'

const CreateSnippetPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    if (!user) {
      setError('You must be logged in to create a snippet')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create new snippet instance
      const snippet = new Snippet({
        title: formData.title.trim(),
        htmlContent: formData.htmlContent.trim(),
        authorId: user.uid,
        authorEmail: user.email,
        voteCount: 0,
        tags: formData.tags || [],
      })

      // Save to Firestore
      const snippetId = await createSnippet(snippet)

      // Navigate to the created snippet
      navigate(`/snippets/${snippetId}`)
    } catch (err) {
      console.error('Error creating snippet:', err)
      setError(err.message || 'Failed to create snippet. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer maxWidth="narrow">
      <div className="create-snippet-page">
        <div className="page-header"></div>

        {error && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
              <button
                className="error-dismiss"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="form-container">
          <SnippetForm onSubmit={handleSubmit} loading={loading} />

          <div className="form-footer"></div>
        </div>
      </div>
    </PageContainer>
  )
}

export default CreateSnippetPage
