import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Navigation from '../Navigation'
import { useAuth } from '../../../contexts/AuthContext'

// Mock the useAuth hook
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

// Mock UserProfile component
vi.mock('../../auth/UserProfile', () => ({
  default: function MockUserProfile() {
    return <div data-testid="user-profile">User Profile</div>
  }
}))

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter })
}

describe('Navigation', () => {
  const mockAuthenticatedUser = {
    user: { uid: 'test-uid', email: 'test@example.com' },
    isAuthenticated: true,
    loading: false,
    error: null
  }

  const mockUnauthenticatedUser = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders brand link', () => {
    useAuth.mockReturnValue(mockUnauthenticatedUser)
    renderWithRouter(<Navigation />)
    
    const brandLink = screen.getByRole('link', { name: /html snippets/i })
    expect(brandLink).toBeInTheDocument()
    expect(brandLink).toHaveAttribute('href', '/')
  })

  it('renders navigation links', () => {
    useAuth.mockReturnValue(mockUnauthenticatedUser)
    renderWithRouter(<Navigation />)
    
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse/i })).toBeInTheDocument()
  })

  it('shows create link when authenticated', () => {
    useAuth.mockReturnValue(mockAuthenticatedUser)
    renderWithRouter(<Navigation />)
    
    expect(screen.getByRole('link', { name: /create/i })).toBeInTheDocument()
  })

  it('hides create link when not authenticated', () => {
    useAuth.mockReturnValue(mockUnauthenticatedUser)
    renderWithRouter(<Navigation />)
    
    expect(screen.queryByRole('link', { name: /create/i })).not.toBeInTheDocument()
  })

  it('shows user profile when authenticated', () => {
    useAuth.mockReturnValue(mockAuthenticatedUser)
    renderWithRouter(<Navigation />)
    
    expect(screen.getByTestId('user-profile')).toBeInTheDocument()
  })

  it('shows sign in link when not authenticated', () => {
    useAuth.mockReturnValue(mockUnauthenticatedUser)
    renderWithRouter(<Navigation />)
    
    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/login')
  })

  it('highlights active route - home', () => {
    useAuth.mockReturnValue(mockUnauthenticatedUser)
    renderWithRouter(<Navigation />)
    
    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toHaveClass('navigation__link--active')
  })

  it('renders navigation links without active state by default', () => {
    useAuth.mockReturnValue(mockUnauthenticatedUser)
    renderWithRouter(<Navigation />)
    
    const browseLink = screen.getByRole('link', { name: /browse/i })
    expect(browseLink).toHaveClass('navigation__link')
    expect(browseLink).not.toHaveClass('navigation__link--active')
  })

  it('shows create link with primary styling when authenticated', () => {
    useAuth.mockReturnValue(mockAuthenticatedUser)
    renderWithRouter(<Navigation />)
    
    const createLink = screen.getByRole('link', { name: /create/i })
    expect(createLink).toHaveClass('navigation__link--primary')
  })

  it('has proper navigation structure', () => {
    useAuth.mockReturnValue(mockUnauthenticatedUser)
    renderWithRouter(<Navigation />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('navigation')
    
    // Should have brand, links, and auth sections
    expect(screen.getByRole('link', { name: /html snippets/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })

  it('applies correct CSS classes to links', () => {
    useAuth.mockReturnValue(mockAuthenticatedUser)
    renderWithRouter(<Navigation />)
    
    const homeLink = screen.getByRole('link', { name: /home/i })
    const createLink = screen.getByRole('link', { name: /create/i })
    
    expect(homeLink).toHaveClass('navigation__link')
    expect(createLink).toHaveClass('navigation__link', 'navigation__link--primary')
  })
})