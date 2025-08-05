import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import SyntaxHighlighter from './SyntaxHighlighter'
import SnippetPreview from './SnippetPreview'
import CopyButton from './CopyButton'
import VoteButton from './VoteButton'
import ApprovedButton from './ApprovedButton'
import { formatDate, getDisplayNameFromEmail, toTitleCase } from '../../utils/transformers'
import './SnippetDetail.css'

const SnippetDetail = ({ snippet, onCopy, onUpdate, onDelete, className = '', initialTab = 'preview' }) => {
	const { user } = useAuth()
	const [activeTab, setActiveTab] = useState(initialTab)
	const [isEditing, setIsEditing] = useState(false)
	const [editedContent, setEditedContent] = useState(snippet?.htmlContent || '')
	const [editedTitle, setEditedTitle] = useState(snippet?.title || '')
	const [editedTags, setEditedTags] = useState(snippet?.tags || [])
	const [tagInput, setTagInput] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const [isDeleteConfirming, setIsDeleteConfirming] = useState(false)

	// Check if current user is the author
	const isAuthor = user && snippet && (user.uid === snippet.authorId || user.email === snippet.authorEmail)

	if (!snippet) {
		return (
			<div className={`snippet-detail empty ${className}`}>
				<div className='snippet-detail-placeholder'>
					<p>Snippet not found</p>
				</div>
			</div>
		)
	}

	const handleCopySuccess = (copiedText) => {
		if (onCopy) {
			onCopy(copiedText)
		}
	}

	const handleCopyError = (error) => {
		console.error('Copy failed in SnippetDetail:', error)
	}

	const handleEdit = () => {
		setEditedContent(snippet.htmlContent)
		setEditedTitle(snippet.title)
		setEditedTags(snippet.tags || [])
		setIsEditing(true)
		setActiveTab('code')
	}

	const handleCancelEdit = () => {
		setEditedContent(snippet.htmlContent)
		setEditedTitle(snippet.title)
		setEditedTags(snippet.tags || [])
		setTagInput('')
		setIsEditing(false)
	}

	const handleSave = async () => {
		if (!editedContent.trim() || !editedTitle.trim()) {
			alert('Title and content cannot be empty')
			return
		}

		setIsSaving(true)
		try {
			const updatedSnippet = {
				...snippet,
				title: editedTitle.trim(),
				htmlContent: editedContent.trim(),
				tags: editedTags || [],
			}
			if (onUpdate) {
				await onUpdate(updatedSnippet)
			}
			setIsEditing(false)
		} catch (error) {
			console.error('Error saving snippet:', error)
			alert('Failed to save snippet. Please try again.')
		} finally {
			setIsSaving(false)
		}
	}

	const handleDelete = async () => {
		if (!isDeleteConfirming) {
			setIsDeleteConfirming(true)
			// Reset confirmation
			setTimeout(() => setIsDeleteConfirming(false), 3000)
			return
		}

		// confirm delete
		try {
			if (onDelete) {
				await onDelete(snippet.id)
			}
		} catch (error) {
			console.error('Error deleting snippet:', error)
			alert('Failed to delete snippet. Please try again.')
		} finally {
			setIsDeleteConfirming(false)
		}
	}

	// Tags
	const handleAddTag = () => {
		const trimmedTag = tagInput.trim()
		if (trimmedTag) {
			const titleCaseTag = toTitleCase(trimmedTag)
			if (!editedTags.includes(titleCaseTag) && editedTags.length < 10) {
				setEditedTags((prev) => [...prev, titleCaseTag])
				setTagInput('')
			}
		}
	}

	const handleRemoveTag = (tagToRemove) => {
		setEditedTags((prev) => prev.filter((tag) => tag !== tagToRemove))
	}

	const handleTagInputKeyPress = (e) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleAddTag()
		}
	}

	const authorName = getDisplayNameFromEmail(snippet.authorEmail)
	const formattedDate = formatDate(snippet.createdAt)

	return (
		<div className={`snippet-detail ${className}`}>
			<div className='snippet-detail-header'>
				<div className='snippet-detail-title-section'>
					{isEditing ? (
						<>
							<input type='text' value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className='snippet-detail-title-input' placeholder='Enter snippet title...' />
							<div className='snippet-detail-tags-edit'>
								<div className='tags-input-container'>
									<input type='text' value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={handleTagInputKeyPress} placeholder='Add a tag and press Enter...' className='snippet-detail-tag-input' maxLength={50} />
									<button type='button' onClick={handleAddTag} className='add-tag-button' disabled={!tagInput.trim() || editedTags.length >= 10}>
										Add
									</button>
								</div>
								{editedTags.length > 0 && (
									<div className='tags-display'>
										{editedTags.map((tag, index) => (
											<span key={index} className='tag-chip'>
												{tag}
												<button type='button' onClick={() => handleRemoveTag(tag)} className='tag-remove' aria-label={`Remove ${tag} tag`}>
													×
												</button>
											</span>
										))}
									</div>
								)}

								<div className='tags-help'>{editedTags.length}/10 tags</div>
							</div>
						</>
					) : (
						<h1 className='snippet-detail-title'>{snippet.title}</h1>
					)}
					<div className='snippet-detail-meta'>
						<span className='snippet-detail-author'>
							by <strong>{authorName}</strong>
						</span>
						{snippet.tags && snippet.tags.length > 0 && (
							<>
								<span className='snippet-detail-separator'>•</span>
								<span className='snippet-detail-tags-display'>{snippet.tags.join(' ')}</span>
							</>
						)}
						<span className='snippet-detail-separator'>•</span>
						<span className='snippet-detail-date'>{formattedDate}</span>
					</div>
				</div>

				<div className='snippet-detail-actions'>
					<ApprovedButton snippetId={snippet.id} initialApproved={snippet.approved || false} className='snippet-detail-approved-button' />
					<VoteButton snippetId={snippet.id} initialVoteCount={snippet.voteCount || 0} className='snippet-detail-vote-button' />

					<CopyButton text={isEditing ? editedContent : snippet.htmlContent} size='medium' onCopySuccess={handleCopySuccess} onCopyError={handleCopyError} className='snippet-detail-copy-button' />
				</div>
			</div>

			<div className='snippet-detail-content'>
				<div className='snippet-detail-tabs'>
					<div className='tabs-left'>
						<button className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>
							Live Preview
						</button>
						<button className={`tab-button ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>
							HTML Code
						</button>
					</div>

					<div className='tabs-right'>
						{isEditing ? (
							<div className='edit-actions'>
								<button onClick={handleSave} disabled={isSaving} className='tab-button btn-save'>
									{isSaving ? 'Saving...' : 'Save'}
								</button>
								<button onClick={handleCancelEdit} disabled={isSaving} className='tab-button btn-cancel'>
									Cancel
								</button>
							</div>
						) : (
							isAuthor && (
								<div className='author-actions'>
									<button onClick={handleDelete} className={`tab-button btn-delete ${isDeleteConfirming ? 'confirming' : ''}`} title={isDeleteConfirming ? 'Click again to confirm deletion' : 'Delete this snippet'}>
										{isDeleteConfirming ? 'Confirm Delete' : 'Delete'}
									</button>
									<button onClick={handleEdit} className='tab-button' title='Edit this snippet'>
										Edit
									</button>
								</div>
							)
						)}
					</div>
				</div>

				<div className='snippet-detail-tab-content'>
					{activeTab === 'preview' && (
						<div className='tab-panel'>
							<SnippetPreview htmlContent={isEditing ? editedContent : snippet.htmlContent} height={400} className='snippet-detail-preview' />
						</div>
					)}

					{activeTab === 'code' && (
						<div className='tab-panel'>
							<div className='snippet-detail-code'>
								{isEditing ? (
									<textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className='snippet-detail-editor' placeholder='Enter your HTML code here...' rows={Math.max(20, editedContent.split('\n').length + 2)} />
								) : (
									<SyntaxHighlighter code={snippet.htmlContent} language='markup' className='snippet-detail-syntax' />
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default SnippetDetail
