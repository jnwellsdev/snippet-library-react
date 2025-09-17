import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getUserVote, listenToSnippet } from '../../services/firestoreService'
import './VoteButton.css'

/**
 * VoteButton component for upvoting/downvoting snippets
 * @param {Object} props
 * @param {string} props.snippetId - ID of the snippet to vote on
 * @param {number} props.initialVoteCount - Initial vote count
 * @param {Function} props.onVoteChange - Callback when vote changes
 * @param {string} props.className - Additional CSS classes
 */
export const VoteButton = ({
	snippetId,
	initialVoteCount = 0,
	onVoteChange,
	className = '',
}) => {
	const { user, isAuthenticated } = useAuth()
	const [voteCount, setVoteCount] = useState(initialVoteCount)
	const [hasVoted, setHasVoted] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)

	// Check if user has already voted on this snippet
	useEffect(() => {
		const checkUserVote = async () => {
			if (!isAuthenticated || !user?.id) {
				setHasVoted(false)
				return
			}

			try {
				const userVote = await getUserVote(user.id, snippetId)
				setHasVoted(!!userVote)
			} catch (error) {
				console.error('Error checking user vote:', error)
			}
		}

		checkUserVote()
	}, [isAuthenticated, user?.id, snippetId])

	// Listen to real-time vote count updates
	useEffect(() => {
		const unsubscribe = listenToSnippet(snippetId, (snippet) => {
			if (snippet) {
				const newVoteCount = snippet.voteCount || 0
				setVoteCount(newVoteCount)

				// Notify parent component of vote change
				if (onVoteChange) {
					onVoteChange(newVoteCount)
				}
			}
		})

		return () => unsubscribe()
	}, [snippetId, onVoteChange])
	/**
	 * Handle vote button click - Portfolio mode
	 */
	const handleVote = async () => {
		// Portfolio mode: Simulate voting without actual backend calls
		setIsLoading(true)
		setError(null)

		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500))

			// Toggle local vote state and count
			const newHasVoted = !hasVoted
			setHasVoted(newHasVoted)

			// Update vote count locally
			const newVoteCount = newHasVoted ? voteCount + 1 : voteCount - 1
			setVoteCount(newVoteCount)

			// Call onVoteChange if provided
			if (onVoteChange) {
				onVoteChange(newVoteCount)
			}

			// Clear any previous errors
			setError(null)
		} catch (error) {
			console.error('Error toggling vote:', error)
			setError('Failed to update vote. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	/**
	 * Clear error message
	 */
	const clearError = () => {
		setError(null)
	}

	return (
		<div className={`vote-button ${className}`}>
			<button
				onClick={handleVote}
				disabled={isLoading || !isAuthenticated}
				className={`vote-btn ${hasVoted ? 'voted' : ''} ${
					isLoading ? 'loading' : ''
				}`}
				title={
					!isAuthenticated
						? 'Please log in to vote'
						: hasVoted
						? 'Remove vote'
						: 'Upvote this snippet'
				}
				aria-label={
					hasVoted
						? `Remove vote (current count: ${voteCount})`
						: `Upvote snippet (current count: ${voteCount})`
				}
			>
				<svg
					className='vote-icon'
					viewBox='0 0 15 15'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					width='15'
					height='15'
				>
					<path
						d='M7.22303 0.665992C7.32551 0.419604 7.67454 0.419604 7.77702 0.665992L9.41343 4.60039C9.45663 4.70426 9.55432 4.77523 9.66645 4.78422L13.914 5.12475C14.18 5.14607 14.2878 5.47802 14.0852 5.65162L10.849 8.42374C10.7636 8.49692 10.7263 8.61176 10.7524 8.72118L11.7411 12.866C11.803 13.1256 11.5206 13.3308 11.2929 13.1917L7.6564 10.9705C7.5604 10.9119 7.43965 10.9119 7.34365 10.9705L3.70718 13.1917C3.47945 13.3308 3.19708 13.1256 3.25899 12.866L4.24769 8.72118C4.2738 8.61176 4.23648 8.49692 4.15105 8.42374L0.914889 5.65162C0.712228 5.47802 0.820086 5.14607 1.08608 5.12475L5.3336 4.78422C5.44573 4.77523 5.54342 4.70426 5.58662 4.60039L7.22303 0.665992Z'
						fill='currentColor'
					></path>
				</svg>
				<span className='vote-count'>{voteCount}</span>
			</button>

			{error && (
				<div className='vote-error' role='alert'>
					<span className='error-message'>{error}</span>
					<button
						onClick={clearError}
						className='error-dismiss'
						aria-label='Dismiss error'
					>
						×
					</button>
				</div>
			)}
		</div>
	)
}

export default VoteButton
