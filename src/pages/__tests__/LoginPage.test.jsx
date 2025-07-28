import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { Theme } from '@radix-ui/themes'
import LoginPage from '../LoginPage'
import AuthContext from '../../contexts/AuthContext'

// Mock the auth service
vi.mock('../../services/authService', () => ({
  sendMagicLink: vi.fn(),
  signInWithMagicLink: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(() => () => {}),
  isSignInLink: vi.fn(() => false),
  getStoredEmailForSignIn: vi.fn(() => null),
}))

// Mock Firebase auth
vi.mock('../../services/firebase', () => ({
  auth: {}
}))

// Mock react-router-dom hooks
const mockNavigate = vi.fn()
const mockLocation = { state: null }

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation
  }
})

const renderWithProviders = (authState = {}) => {
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
          <LoginPage />
        </MockAuthProvider>
      </BrowserRouter>
    </Theme>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    mockLocation.state = null
  })

  it('renders welcome message and login form when not authenticated', () => {
    renderWithProviders({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
      error: null
    })
    
    expect(screen.getByText('Welcome to HTML Snippets')).toBeInTheDocument()
    expect(screen.getByText('Share and discover HTML code snippets with the community')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('redirects to home when user is already authenticated', () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    
    renderWithProviders({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
      error: null
    })
    
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('redirects to intended destination from location state', () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    mockLocation.state = { from: { pathname: '/create' } }
    
    renderWithProviders({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
      error: null
    })
    
    expect(mockNavigate).toHaveBeenCalledWith('/create', { replace: true })
  })

  it('does not render login form when user is authenticated', () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    
    renderWithProviders({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
      error: null
    })
    
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
  })

  it('does not redirect when loading', () => {
    renderWithProviders({
      user: null,
      loading: true,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
      error: null
    })
    
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})