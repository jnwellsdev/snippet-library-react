import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getTopSnippets } from '../services/firestoreService'
import { SnippetCard, PageContainer, LoadingCard, LoadingButton } from '../components'
import './LandingPage.css'

const LandingPage = () => {
	const [topSnippets, setTopSnippets] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const { isAuthenticated } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		const fetchTopSnippets = async () => {
			try {
				setLoading(true)
				setError(null)
				const snippets = await getTopSnippets(6)
				setTopSnippets(snippets)
			} catch (err) {
				console.error('Error fetching top snippets:', err)
				setError('Failed to load top snippets')
			} finally {
				setLoading(false)
			}
		}

		fetchTopSnippets()
	}, [])

	const handleCreateSnippet = () => {
		if (isAuthenticated) {
			navigate('/create')
		} else {
			navigate('/login')
		}
	}

	const handleSnippetClick = (snippet) => {
		navigate(`/snippets/${snippet.id}`)
	}

	if (loading) {
		return (
			<PageContainer>
				<div className='landing-page'>
					<div class='snippet-list-title'>Top Snippets</div>
					<div className='featured-snippets-section'>
						<div className='snippets-grid'>
							<LoadingCard variant='snippet' count={4} />
						</div>
					</div>
				</div>
			</PageContainer>
		)
	}

	return (
		<PageContainer>
			<div className='landing-page'>
				<div class='snippet-list-title'>Top Snippets</div>

				<div className='featured-snippets-section'>
					{error && (
						<div className='error-message' data-testid='error-message'>
							{error}
						</div>
					)}

					{topSnippets.length === 0 && !error ? (
						<div className='empty-state' data-testid='empty-state'>
							<LoadingButton variant='secondary' size='medium' onClick={handleCreateSnippet}>
								Create the First Snippet
							</LoadingButton>
						</div>
					) : !error ? (
						<div className='snippets-grid' data-testid='snippets-grid'>
							{topSnippets.map((snippet) => (
								<SnippetCard key={snippet.id} snippet={snippet} onClick={handleSnippetClick} showVoteCount={true} livePreview={true} />
							))}
						</div>
					) : null}
				</div>
			</div>
			{topSnippets.length > 0 && (
				<div className='view-all-link'>
					<Link to='/snippets' className='link'>
						View All Snippets
					</Link>
				</div>
			)}
		</PageContainer>
	)
}

export default LandingPage
