import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer, SnippetForm } from '../components'
import { useAuth } from '../contexts/AuthContext'
import './CreateSnippetPage.css'

const CreateSnippetPage = () => {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const { user } = useAuth()
	const navigate = useNavigate()
	const handleSubmit = async (formData) => {
		// Portfolio mode: Simulate success without actually creating snippet
		setLoading(true)
		setError(null)

		try {
			// Simulate API call delay
			await new Promise((resolve) => setTimeout(resolve, 1000))

			// Show success by navigating to snippets list
			// In a real app, this would be the created snippet page
			navigate('/snippets', { replace: true })
		} catch (err) {
			// This won't actually happen in portfolio mode, but keeping for UI consistency
			console.error('Error creating snippet:', err)
			setError(err.message || 'Failed to create snippet. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<PageContainer maxWidth='narrow'>
			<div className='create-snippet-page'>
				<div className='page-header'></div>

				{error && (
					<div className='error-banner'>
						<div className='error-content'>
							<span className='error-icon'>⚠️</span>
							<span className='error-text'>{error}</span>
							<button
								className='error-dismiss'
								onClick={() => setError(null)}
								aria-label='Dismiss error'
							>
								×
							</button>
						</div>
					</div>
				)}

				<div className='form-container'>
					<SnippetForm onSubmit={handleSubmit} loading={loading} />

					<div className='form-footer'></div>
				</div>
			</div>
		</PageContainer>
	)
}

export default CreateSnippetPage
