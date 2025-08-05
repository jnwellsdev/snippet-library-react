import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const COLLECTIONS = {
  SNIPPETS: 'snippets'
}

/**
 * Toggle snippet approval status
 * @param {string} snippetId - The ID of the snippet to toggle approval for
 * @param {boolean} approved - The new approval status
 * @returns {Promise<{approved: boolean}>}
 */
export const toggleSnippetApproval = async (snippetId, approved) => {
  try {
    const snippetRef = doc(db, COLLECTIONS.SNIPPETS, snippetId)
    
    await updateDoc(snippetRef, {
      approved: approved,
      updatedAt: serverTimestamp(),
    })

    return { approved }
  } catch (error) {
    console.error('Error updating snippet approval:', error)
    throw new Error('Failed to update approval status')
  }
}
