import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Theme } from '@radix-ui/themes'
import LoginForm from '../LoginForm'
import { AuthProvider } from '../../../contexts/AuthContext'

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
  auth: {},
}))

const renderWithProviders = (component) => {
  return render(
    <Theme>
      <AuthProvider>{component}</AuthProvider>
    </Theme>
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form with email input and submit button', () => {
    renderWithProviders(<LoginForm />)

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(
      screen.getByText('Enter your email to receive a magic link')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Send Magic Link' })
    ).toBeInTheDocument()
  })

  it('validates email input is required', async () => {
    renderWithProviders(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: 'Send Magic Link' })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when email is entered', async () => {
    renderWithProviders(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send Magic Link' })

    fireEvent.change(emailInput, { target: { value: 'test@dealeron.com' } })

    expect(submitButton).not.toBeDisabled()
  })

  it('shows success message after sending magic link', async () => {
    const { sendMagicLink } = await import('../../../services/authService')
    sendMagicLink.mockResolvedValue({ success: true })

    renderWithProviders(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send Magic Link' })

    fireEvent.change(emailInput, { target: { value: 'test@dealeron.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument()
      expect(screen.getByText(/We've sent a magic link to/)).toBeInTheDocument()
      expect(screen.getByText('test@dealeron.com')).toBeInTheDocument()
    })
  })

  it('calls onSuccess callback after successful magic link send', async () => {
    const { sendMagicLink } = await import('../../../services/authService')
    sendMagicLink.mockResolvedValue({ success: true })

    const onSuccess = vi.fn()
    renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send Magic Link' })

    fireEvent.change(emailInput, { target: { value: 'test@dealeron.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('allows sending another link after success', async () => {
    const { sendMagicLink } = await import('../../../services/authService')
    sendMagicLink.mockResolvedValue({ success: true })

    renderWithProviders(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send Magic Link' })

    fireEvent.change(emailInput, { target: { value: 'test@dealeron.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument()
    })

    const sendAnotherButton = screen.getByRole('button', {
      name: 'Send Another Link',
    })
    fireEvent.click(sendAnotherButton)

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('')
  })

  it('shows loading state while sending magic link', async () => {
    const { sendMagicLink } = await import('../../../services/authService')
    sendMagicLink.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    renderWithProviders(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send Magic Link' })

    fireEvent.change(emailInput, { target: { value: 'test@dealeron.com' } })
    fireEvent.click(submitButton)

    expect(
      screen.getByRole('button', { name: 'Loading Sending...' })
    ).toBeInTheDocument()
    expect(emailInput).toBeDisabled()
  })

  it('shows error for non-dealeron.com email addresses', async () => {
    const { sendMagicLink } = await import('../../../services/authService')
    sendMagicLink.mockRejectedValue(
      new Error('Access restricted to @dealeron.com email addresses only')
    )

    renderWithProviders(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send Magic Link' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(
          'Access restricted to @dealeron.com email addresses only'
        )
      ).toBeInTheDocument()
    })
  })
})
