// Authentication service functions

import {
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  isSignInWithEmailLink,
} from 'firebase/auth'
import { auth } from './firebase'
import { logError, createError, ERROR_TYPES } from '../utils/errorHandling'

// Action code settings for magic link
const actionCodeSettings = {
  url: window.location.origin,
  handleCodeInApp: true,
}

/**
 * Send magic link to user's email
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
export const sendMagicLink = async (email) => {
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    // Store email in localStorage for sign-in completion
    localStorage.setItem('emailForSignIn', email)
    return { success: true }
  } catch (error) {
    logError(error, 'sendMagicLink', { email })
    const enhancedError = createError(
      getAuthErrorMessage(error.code),
      error.code,
      ERROR_TYPES.AUTHENTICATION,
      { originalError: error, email }
    )
    throw enhancedError
  }
}

/**
 * Complete sign-in with magic link
 * @param {string} email - User's email address
 * @param {string} emailLink - The sign-in link from email
 * @returns {Promise<User>}
 */
export const signInWithMagicLink = async (email, emailLink) => {
  try {
    if (!isSignInWithEmailLink(auth, emailLink)) {
      const invalidLinkError = createError(
        'Invalid sign-in link',
        'invalid-sign-in-link',
        ERROR_TYPES.AUTHENTICATION,
        { email, emailLink }
      )
      throw invalidLinkError
    }

    const result = await signInWithEmailLink(auth, email, emailLink)
    // Clear stored email
    localStorage.removeItem('emailForSignIn')
    return result.user
  } catch (error) {
    logError(error, 'signInWithMagicLink', { email })
    
    // If it's already our enhanced error, throw it as is
    if (error.type === ERROR_TYPES.AUTHENTICATION) {
      throw error
    }
    
    // Otherwise, enhance the Firebase error
    const enhancedError = createError(
      getAuthErrorMessage(error.code),
      error.code,
      ERROR_TYPES.AUTHENTICATION,
      { originalError: error, email }
    )
    throw enhancedError
  }
}

/**
 * Check if current URL is a sign-in link
 * @returns {boolean}
 */
export const isSignInLink = () => {
  return isSignInWithEmailLink(auth, window.location.href)
}

/**
 * Get stored email for sign-in completion
 * @returns {string|null}
 */
export const getStoredEmailForSignIn = () => {
  return localStorage.getItem('emailForSignIn')
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    // Clear any stored email
    localStorage.removeItem('emailForSignIn')
  } catch (error) {
    logError(error, 'signOut')
    const enhancedError = createError(
      'Failed to sign out. Please try again.',
      error.code || 'sign-out-failed',
      ERROR_TYPES.AUTHENTICATION,
      { originalError: error }
    )
    throw enhancedError
  }
}

/**
 * Get current authenticated user
 * @returns {User|null}
 */
export const getCurrentUser = () => {
  return auth.currentUser
}

/**
 * Listen to authentication state changes
 * @param {function} callback - Callback function to handle auth state changes
 * @returns {function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

/**
 * Convert Firebase auth error codes to user-friendly messages
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly error message
 */
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address'
    case 'auth/user-disabled':
      return 'This account has been disabled'
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection'
    case 'auth/invalid-action-code':
      return 'Invalid or expired sign-in link'
    case 'auth/expired-action-code':
      return 'Sign-in link has expired. Please request a new one'
    default:
      return 'An error occurred during authentication'
  }
}
