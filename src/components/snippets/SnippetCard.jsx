import { formatRelativeTime, getDisplayNameFromEmail, truncateText } from '../../utils/transformers'
import CopyButton from './CopyButton'
import VoteButton from './VoteButton'
import ApprovedButton from './ApprovedButton'
import SnippetPreview from './SnippetPreview'
import './SnippetCard.css'

const SnippetCard = ({ snippet, onClick, onCopy, className = '', livePreview = false, showVoteCount = true }) => {
	if (!snippet) {
		return null
	}

	const handleClick = (event) => {
		// prevent card click
		if (event.target.closest('.copy-button') || event.target.closest('.vote-button')) return
		if (onClick) {
			onClick(snippet)
		}
	}

	const handleKeyDown = (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			handleClick(event)
		}
	}

	const handleCopySuccess = (copiedText) => {
		if (onCopy) {
			onCopy(copiedText)
		}
	}

	const handleCopyError = (error) => {
		console.error('Copy failed:', error)
	}
	const authorName = getDisplayNameFromEmail(snippet.authorEmail)
	const formattedDate = formatRelativeTime(snippet.createdAt)
	const truncatedTitle = truncateText(snippet.title, 60)
	const truncatedContent = truncateText(snippet.htmlContent.replace(/<[^>]*>/g, ''), 120)

	return (
		<div className={`snippet-card ${className}`} onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0} role='button' aria-label={`View snippet: ${snippet.title}`}>
			<div className='snippet-card-header'>
				<h3 className='snippet-card-title' title={snippet.title}>
					{truncatedTitle}
				</h3>
				<div className='snippet-card-actions'>
					<ApprovedButton snippetId={snippet.id} initialApproved={snippet.approved || false} className='snippet-card-approved' />
					<VoteButton snippetId={snippet.id} initialVoteCount={snippet.voteCount || 0} className='snippet-card-vote-button' />
					<CopyButton text={snippet.htmlContent} size='small' onCopySuccess={handleCopySuccess} onCopyError={handleCopyError} className='snippet-card-copy-button' />
				</div>
			</div>

			<div className='snippet-card-content'>
				{livePreview ? (
					<SnippetPreview htmlContent={snippet.htmlContent} height={180} className='snippet-card-preview-component' />
				) : (
					<p className='snippet-card-preview' title={snippet.htmlContent}>
						{truncatedContent}
					</p>
				)}
			</div>

			<div className='snippet-card-footer'>
				<div className='snippet-card-author'>
					<span className='author-label'>by</span>
					<span className='author-name'>{authorName}</span>
				</div>
				{snippet.tags && snippet.tags.length > 0 && <div className='snippet-card-tags'>{snippet.tags.join(' ')}</div>}
				<div className='snippet-card-date'>{formattedDate}</div>
			</div>
		</div>
	)
}

export default SnippetCard
