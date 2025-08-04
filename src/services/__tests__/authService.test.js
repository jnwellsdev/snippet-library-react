import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  sendSignInLinkToEmail: vi.fn(),
  signInWithEmailLink: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
}))

// Mock the firebase module
vi.mock('../firebase', () => ({
  auth: {
    currentUser: null,
  },
}))

import {
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  isSignInWithEmailLink,
} from 'firebase/auth'

import {
  sendMagicLink,
  signInWithMagicLink,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  isSignInLink,
  getStoredEmailForSignIn,
} from '../authService'

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sendMagicLink', () => {
    it('should send magic link successfully', async () => {
      const email = 'test@example.com'
      sendSignInLinkToEmail.mockResolvedValue()

      const result = await sendMagicLink(email)

      expect(sendSignInLinkToEmail).toHaveBeenCalledWith(
        expect.any(Object),
        email,
        expect.objectContaining({
          handleCodeInApp: true
        })
      )
      expect(localStorage.setItem).toHaveBeenCalledWith('emailForSignIn', email)
      expect(result).toEqual({ success: true })
    })

    it('should handle errors when sending magic link', async () => {
      const email = 'test@example.com'
      const error = { code: 'auth/invalid-email' }
      sendSignInLinkToEmail.mockRejectedValue(error)

      await expect(sendMagicLink(email)).rejects.toThrow('Please enter a valid email address')
      expect(localStorage.setItem).not.toHaveBeenCalled()
    })

    it('should handle network errors', async () => {
      const email = 'test@example.com'
      const error = { code: 'auth/network-request-failed' }
      sendSignInLinkToEmail.mockRejectedValue(error)

      await expect(sendMagicLink(email)).rejects.toThrow('Network error. Please check your connection')
    })
  })

  describe('signInWithMagicLink', () => {
    it('should sign in with magic link successfully', async () => {
      const email = 'test@example.com'
      const emailLink = 'http://localhost:3000?apiKey=test&oobCode=test'
      const mockUser = { uid: '123', email }

      isSignInWithEmailLink.mockReturnValue(true)
      signInWithEmailLink.mockResolvedValue({ user: mockUser })

      const result = await signInWithMagicLink(email, emailLink)

      expect(isSignInWithEmailLink).toHaveBeenCalledWith(expect.any(Object), emailLink)
      expect(signInWithEmailLink).toHaveBeenCalledWith(expect.any(Object), email, emailLink)
      expect(localStorage.removeItem).toHaveBeenCalledWith('emailForSignIn')
      expect(result).toBe(mockUser)
    })

    it('should throw error for invalid sign-in link', async () => {
      const email = 'test@example.com'
      const emailLink = 'http://localhost:3000'

      isSignInWithEmailLink.mockReturnValue(false)

      await expect(signInWithMagicLink(email, emailLink)).rejects.toThrow('Invalid sign-in link')
      expect(signInWithEmailLink).not.toHaveBeenCalled()
    })

    it('should handle expired action code error', async () => {
      const email = 'test@example.com'
      const emailLink = 'http://localhost:3000?apiKey=test&oobCode=expired'
      const error = { code: 'auth/expired-action-code' }

      isSignInWithEmailLink.mockReturnValue(true)
      signInWithEmailLink.mockRejectedValue(error)

      await expect(signInWithMagicLink(email, emailLink)).rejects.toThrow('Sign-in link has expired. Please request a new one')
    })
  })

  describe('isSignInLink', () => {
    it('should return true for valid sign-in link', () => {
      isSignInWithEmailLink.mockReturnValue(true)

      const result = isSignInLink()

      expect(isSignInWithEmailLink).toHaveBeenCalledWith(expect.any(Object), window.location.href)
      expect(result).toBe(true)
    })

    it('should return false for invalid sign-in link', () => {
      isSignInWithEmailLink.mockReturnValue(false)

      const result = isSignInLink()

      expect(result).toBe(false)
    })
  })

  describe('getStoredEmailForSignIn', () => {
    it('should return stored email', () => {
      const email = 'test@example.com'
      localStorage.getItem.mockReturnValue(email)

      const result = getStoredEmailForSignIn()

      expect(localStorage.getItem).toHaveBeenCalledWith('emailForSignIn')
      expect(result).toBe(email)
    })

    it('should return null when no email stored', () => {
      localStorage.getItem.mockReturnValue(null)

      const result = getStoredEmailForSignIn()

      expect(result).toBe(null)
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      firebaseSignOut.mockResolvedValue()

      await signOut()

      expect(firebaseSignOut).toHaveBeenCalledWith(expect.any(Object))
      expect(localStorage.removeItem).toHaveBeenCalledWith('emailForSignIn')
    })

    it('should handle sign out errors', async () => {
      const error = new Error('Sign out failed')
      firebaseSignOut.mockRejectedValue(error)

      await expect(signOut()).rejects.toThrow('Failed to sign out')
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' }
      
      // We need to dynamically import and mock the auth object
      const { auth } = await import('../firebase')
      auth.currentUser = mockUser

      const result = getCurrentUser()

      expect(result).toBe(mockUser)
    })

    it('should return null when no user', async () => {
      const { auth } = await import('../firebase')
      auth.currentUser = null

      const result = getCurrentUser()

      expect(result).toBe(null)
    })
  })

  describe('onAuthStateChange', () => {
    it('should set up auth state listener', () => {
      const callback = vi.fn()
      const unsubscribe = vi.fn()
      onAuthStateChanged.mockReturnValue(unsubscribe)

      const result = onAuthStateChange(callback)

      expect(onAuthStateChanged).toHaveBeenCalledWith(expect.any(Object), callback)
      expect(result).toBe(unsubscribe)
    })
  })
})