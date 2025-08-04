import {
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  isSignInWithEmailLink,
} from 'firebase/auth'
import { auth } from './firebase'
import { logError, createError, ERROR_TYPES } from '../utils/errorHandling'

const actionCodeSettings = {
  url: window.location.origin,
  handleCodeInApp: true
}

// Send magic link to user's email
export const sendMagicLink = async (email) => {
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    // store email in localStorage
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

// Complete sign-in with magic link
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
    
    const enhancedError = createError(
      getAuthErrorMessage(error.code),
      error.code,
      ERROR_TYPES.AUTHENTICATION,
      { originalError: error, email }
    )
    throw enhancedError
  }
}

// Check if current URL is a sign-in link
export const isSignInLink = () => {
  return isSignInWithEmailLink(auth, window.location.href)
}

// Get stored email for sign-in completion
export const getStoredEmailForSignIn = () => {
  return localStorage.getItem('emailForSignIn')
}

// Sign out current user
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

// Get current authenticated user
export const getCurrentUser = () => {
  return auth.currentUser
}

// Listen to authentication state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Convert Firebase auth error codes to user-friendly messages
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
    case 'invalid-sign-in-link':
      return 'Invalid sign-in link'
    default:
      return 'An error occurred during authentication'
  }
}
