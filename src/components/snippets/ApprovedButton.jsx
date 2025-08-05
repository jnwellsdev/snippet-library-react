import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { toggleSnippetApproval } from '../../services/approvalService'
import './ApprovedButton.css'

const adminEmails = ['jessenwells@gmail.com']

export const ApprovedButton = ({ snippetId, initialApproved = false, className = '' }) => {
	const { user } = useAuth()
	const [approved, setApproved] = useState(initialApproved)
	const [loading, setLoading] = useState(false)

	// Check if current user is an admin
	const isAdmin = user && adminEmails.includes(user.email)

	// For non-admin users: only show if approved (as disabled indicator)
	if (!isAdmin && !approved) {
		return null
	}

	const handleToggleApproval = async (event) => {
		event.stopPropagation() // Prevent card click

		// Only allow admin users to toggle
		if (!isAdmin || loading) return

		try {
			setLoading(true)
			const newApprovedStatus = !approved
			await toggleSnippetApproval(snippetId, newApprovedStatus)
			setApproved(newApprovedStatus)
		} catch (error) {
			console.error('Failed to toggle approval:', error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className={`approved-button ${className}`}>
			<button
				className={`approved-btn ${approved ? 'approved-btn-approved' : 'approved-btn-pending'} ${loading ? 'approved-btn-loading' : ''}`}
				onClick={handleToggleApproval}
				disabled={!isAdmin || loading}
				title={!isAdmin ? 'Approved by admin' : approved ? 'Approved - Click to unapprove' : 'Click to approve'}
			>
				{approved ? (
					// Checked circle icon
					<svg width='18' height='18' viewBox='0 0 15 15' fill='none'>
						<path
							d='M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z'
							fill='currentColor'
							fillRule='evenodd'
							clipRule='evenodd'
						/>
					</svg>
				) : (
					// Blank circle icon
					<svg width='18' height='18' viewBox='0 0 15 15' fill='none'>
						<path
							d='M0.877075 7.49991C0.877075 3.84222 3.84222 0.877075 7.49991 0.877075C11.1576 0.877075 14.1227 3.84222 14.1227 7.49991C14.1227 11.1576 11.1576 14.1227 7.49991 14.1227C3.84222 14.1227 0.877075 11.1576 0.877075 7.49991ZM7.49991 1.82708C4.36689 1.82708 1.82708 4.36689 1.82708 7.49991C1.82708 10.6329 4.36689 13.1727 7.49991 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49991C13.1727 4.36689 10.6329 1.82708 7.49991 1.82708Z'
							fill='currentColor'
							fillRule='evenodd'
							clipRule='evenodd'
						/>
					</svg>
				)}

				<span className='approved-text'>{approved ? 'Approved' : 'Approve'}</span>
			</button>
		</div>
	)
}

export default ApprovedButton
