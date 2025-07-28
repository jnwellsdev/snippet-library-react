import {
  formatRelativeTime,
  getDisplayNameFromEmail,
  truncateText,
} from '../../utils/transformers'
import CopyButton from './CopyButton'
import VoteButton from './VoteButton'
import ApprovedButton from './ApprovedButton'
import SnippetPreview from './SnippetPreview'
import './SnippetCard.css'

/**
 * SnippetCard component for displaying snippet information in list views
 * @param {Object} props
 * @param {Object} props.snippet - Snippet object with id, title, htmlContent, authorEmail, createdAt, voteCount
 * @param {Function} props.onClick - Click handler for the card
 * @param {Function} props.onCopy - Copy button click handler
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.livePreview - Whether to show live HTML preview instead of text preview
 * @param {boolean} props.showVoteCount - Whether to show vote count (for backward compatibility)
 */
const SnippetCard = ({
  snippet,
  onClick,
  onCopy,
  className = '',
  livePreview = false,
  showVoteCount = true,
}) => {
  if (!snippet) {
    return null
  }

  const handleClick = (event) => {
    // Don't trigger card click if copy button or vote button was clicked
    if (
      event.target.closest('.copy-button') ||
      event.target.closest('.vote-button')
    ) {
      return
    }

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
    console.error('Copy failed in SnippetCard:', error)
  }

  const authorName = getDisplayNameFromEmail(snippet.authorEmail)
  const formattedDate = formatRelativeTime(snippet.createdAt)
  const truncatedTitle = truncateText(snippet.title, 60)
  const truncatedContent = truncateText(
    snippet.htmlContent.replace(/<[^>]*>/g, ''),
    120
  )

  return (
    <div
      className={`snippet-card ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View snippet: ${snippet.title}`}
    >
      <div className="snippet-card-header">
        <h3 className="snippet-card-title" title={snippet.title}>
          {truncatedTitle}
        </h3>
        <div className="snippet-card-actions">
          <ApprovedButton
            snippetId={snippet.id}
            className="snippet-card-approved"
          />
          <VoteButton
            snippetId={snippet.id}
            initialVoteCount={snippet.voteCount || 0}
            className="snippet-card-vote-button"
          />
          <CopyButton
            text={snippet.htmlContent}
            size="small"
            onCopySuccess={handleCopySuccess}
            onCopyError={handleCopyError}
            className="snippet-card-copy-button"
          />
        </div>
      </div>

      <div className="snippet-card-content">
        {livePreview ? (
          <SnippetPreview
            htmlContent={snippet.htmlContent}
            height={120}
            className="snippet-card-preview-component"
          />
        ) : (
          <p className="snippet-card-preview" title={snippet.htmlContent}>
            {truncatedContent}
          </p>
        )}
      </div>

      <div className="snippet-card-footer">
        <div className="snippet-card-author">
          <span className="author-label">by</span>
          <span className="author-name">{authorName}</span>
        </div>
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="snippet-card-tags">{snippet.tags.join(' ')}</div>
        )}
        <div className="snippet-card-date">{formattedDate}</div>
      </div>
    </div>
  )
}

export default SnippetCard
