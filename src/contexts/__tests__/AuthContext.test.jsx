import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'

// Mock the auth service functions
vi.mock('../../services/authService', () => ({
  sendMagicLink: vi.fn(),
  signInWithMagicLink: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(),
  isSignInLink: vi.fn(),
  getStoredEmailForSignIn: vi.fn(),
}))

import { AuthProvider, useAuth } from '../AuthContext'
import {
  sendMagicLink,
  signInWithMagicLink,
  signOut,
  onAuthStateChange,
  isSignInLink,
  getStoredEmailForSignIn,
} from '../../services/authService'

// Test component to access auth context
const TestComponent = () => {
  const { user, loading, error, login, logout, clearError, isAuthenticated } = useAuth()
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      <button onClick={() => login('test@example.com')} data-testid="login-btn">
        Login
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
      <button onClick={clearError} data-testid="clear-error-btn">
        Clear Error
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    onAuthStateChange.mockImplementation((callback) => {
      // Simulate initial auth state (no user)
      setTimeout(() => callback(null), 0)
      return vi.fn() // unsubscribe function
    })
    isSignInLink.mockReturnValue(false)
    getStoredEmailForSignIn.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })

  it('should provide initial auth state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Initially loading should be true
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated')

    // Wait for auth state to be set
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })
  })

  it('should handle user authentication', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' }
    
    onAuthStateChange.mockImplementation((callback) => {
      // Simulate user authentication
      setTimeout(() => callback(mockUser), 0)
      return vi.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })
  })

  it('should handle login with magic link', async () => {
    sendMagicLink.mockResolvedValue({ success: true })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })

    await act(async () => {
      screen.getByTestId('login-btn').click()
    })

    expect(sendMagicLink).toHaveBeenCalledWith('test@example.com')
  })

  it('should handle login errors', async () => {
    const error = new Error('Invalid email')
    sendMagicLink.mockRejectedValue(error)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })

    // The login function will be called and should handle the error internally
    await act(async () => {
      screen.getByTestId('login-btn').click()
      // Wait a bit for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 10))
    })

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid email')
    })
  })

  it('should handle logout', async () => {
    signOut.mockResolvedValue()

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })

    await act(async () => {
      screen.getByTestId('logout-btn').click()
    })

    expect(signOut).toHaveBeenCalled()
  })

  it('should clear errors', async () => {
    const error = new Error('Test error')
    sendMagicLink.mockRejectedValue(error)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })

    // Trigger error - the login function will handle the error internally
    await act(async () => {
      screen.getByTestId('login-btn').click()
      // Wait a bit for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 10))
    })

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Test error')
    })

    // Clear error
    await act(async () => {
      screen.getByTestId('clear-error-btn').click()
    })

    expect(screen.getByTestId('error')).toHaveTextContent('No error')
  })

  it('should handle sign-in link on mount', async () => {
    signInWithMagicLink.mockResolvedValue({ uid: '123', email: 'test@example.com' })
    
    isSignInLink.mockReturnValue(true)
    getStoredEmailForSignIn.mockReturnValue('test@example.com')

    // Mock window.history.replaceState
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(signInWithMagicLink).toHaveBeenCalledWith('test@example.com', window.location.href)
      expect(replaceStateSpy).toHaveBeenCalled()
    })

    replaceStateSpy.mockRestore()
  })
})