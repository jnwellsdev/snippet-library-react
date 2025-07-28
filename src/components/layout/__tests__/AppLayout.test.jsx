import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import AppLayout from '../AppLayout'

// Mock the Navigation component
vi.mock('../Navigation', () => ({
  default: function MockNavigation() {
    return <nav data-testid="navigation">Mock Navigation</nav>
  }
}))

// Mock Firebase services to prevent errors in AuthProvider
vi.mock('../../../services/authService', () => ({
  sendMagicLink: vi.fn(),
  signInWithMagicLink: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(() => vi.fn()), // Return unsubscribe function
  isSignInLink: vi.fn(() => false),
  getStoredEmailForSignIn: vi.fn()
}))

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter })
}

describe('AppLayout', () => {
  it('renders navigation and main content area', () => {
    renderWithRouter(
      <AppLayout>
        <div data-testid="test-content">Test Content</div>
      </AppLayout>
    )

    expect(screen.getByTestId('navigation')).toBeInTheDocument()
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders with correct CSS classes', () => {
    renderWithRouter(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    )

    const layout = screen.getByRole('main').parentElement
    expect(layout).toHaveClass('app-layout')
    expect(screen.getByRole('main')).toHaveClass('app-layout__main')
  })

  it('renders children when provided', () => {
    renderWithRouter(
      <AppLayout>
        <div data-testid="child-content">Child Content</div>
      </AppLayout>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    renderWithRouter(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    )

    // Should have navigation and main elements
    expect(screen.getByTestId('navigation')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})