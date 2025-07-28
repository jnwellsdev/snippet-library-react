import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { Theme } from '@radix-ui/themes'
import AuthGuard from '../AuthGuard'
import AuthContext from '../../../contexts/AuthContext'

// Mock the auth service
vi.mock('../../../services/authService', () => ({
  sendMagicLink: vi.fn(),
  signInWithMagicLink: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(() => () => {}),
  isSignInLink: vi.fn(() => false),
  getStoredEmailForSignIn: vi.fn(() => null),
}))

// Mock Firebase auth
vi.mock('../../../services/firebase', () => ({
  auth: {}
}))

// Mock react-router-dom Navigate component
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to, state, replace }) => {
      mockNavigate(to, state, replace)
      return <div data-testid="navigate">Redirecting to {to}</div>
    },
    useLocation: () => ({ pathname: '/protected' })
  }
})

const renderWithProviders = (component, authState = {}) => {
  const mockAuthValue = {
    user: null,
    loading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
    isAuthenticated: false,
    ...authState
  }

  // Create a mock context provider
  const MockAuthProvider = ({ children }) => {
    return (
      <AuthContext.Provider value={mockAuthValue}>
        {children}
      </AuthContext.Provider>
    )
  }

  return render(
    <Theme>
      <BrowserRouter>
        <MockAuthProvider>
          {component}
        </MockAuthProvider>
      </BrowserRouter>
    </Theme>
  )
}

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  it('shows loading spinner when authentication is loading', () => {
    renderWithProviders(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
      { user: null, loading: true }
    )
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    renderWithProviders(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
      { user: null, loading: false }
    )
    
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to custom fallback when specified', () => {
    renderWithProviders(
      <AuthGuard fallback="/custom-login">
        <div>Protected Content</div>
      </AuthGuard>,
      { user: null, loading: false }
    )
    
    expect(screen.getByText('Redirecting to /custom-login')).toBeInTheDocument()
  })

  it('renders protected content when user is authenticated', () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    
    renderWithProviders(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
      { user: mockUser, loading: false, isAuthenticated: true }
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })
})