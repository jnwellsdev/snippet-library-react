import { createContext, useContext, useState, useEffect } from 'react'
import {
  sendMagicLink,
  signInWithMagicLink,
  signOut,
  onAuthStateChange,
  isSignInLink,
  getStoredEmailForSignIn,
} from '../services/authService'
import { createOrUpdateUser } from '../services/firestoreService'
import { User } from '../models/User'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Create or update user document in Firestore
          const userModel = new User({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          })

          await createOrUpdateUser(userModel)

          // Set user with consistent structure (id instead of uid)
          setUser({
            ...firebaseUser,
            id: firebaseUser.uid,
          })
        } catch (error) {
          console.error('Error creating/updating user document:', error)
          setError('Failed to create user profile')
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Check if current URL is a sign-in link and handle it
    const handleSignInLink = async () => {
      if (isSignInLink()) {
        try {
          let email = getStoredEmailForSignIn()

          // If no stored email, prompt user to enter it
          if (!email) {
            email = window.prompt('Please provide your email for confirmation')
          }

          if (email) {
            await signInWithMagicLink(email, window.location.href)
            // Clear the URL parameters after successful sign-in
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            )
          }
        } catch (error) {
          console.error('Error completing sign-in:', error)
          setError(error.message)
          setLoading(false)
        }
      }
    }

    handleSignInLink()

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  /**
   * Send magic link to user's email
   * @param {string} email - User's email address
   * @returns {Promise<{success: boolean}>}
   */
  const login = async (email) => {
    try {
      setError(null)
      setLoading(true)
      const result = await sendMagicLink(email)
      setLoading(false)
      return result
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      setError(null)
      await signOut()
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  /**
   * Clear any authentication errors
   */
  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
