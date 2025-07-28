import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ErrorBoundary from '../ErrorBoundary'

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
  vi.restoreAllMocks()
})

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage)
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  describe('Normal Operation', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('does not show error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('catches JavaScript errors and displays fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()
    })

    it('displays custom error message when provided', () => {
      const customMessage = 'Custom error message for testing'
      
      render(
        <ErrorBoundary message={customMessage}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(customMessage)).toBeInTheDocument()
      expect(screen.queryByText(/An unexpected error occurred/)).not.toBeInTheDocument()
    })

    it('calls onError callback when error occurs', () => {
      const onError = vi.fn()
      
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} errorMessage="Callback test error" />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Callback test error'
        }),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
    })

    it('shows error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Development error" />
        </ErrorBoundary>
      )

      expect(screen.getByText('Error Details (Development)')).toBeInTheDocument()
      
      process.env.NODE_ENV = originalEnv
    })

    it('hides error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument()
      
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('User Interactions', () => {
    it('calls onRetry when Try Again button is clicked', () => {
      const onRetry = vi.fn()
      
      render(
        <ErrorBoundary onRetry={onRetry}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(retryButton)

      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('resets error state when Try Again button is clicked', () => {
      const TestComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true)
        
        return (
          <ErrorBoundary onRetry={() => setShouldThrow(false)}>
            <ThrowError shouldThrow={shouldThrow} />
          </ErrorBoundary>
        )
      }

      render(<TestComponent />)

      // Initially shows error
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(retryButton)

      // Should show success content
      expect(screen.getByText('No error')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('reloads page when Reload Page button is clicked', () => {
      // Mock window.location.reload
      const mockReload = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      })

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const reloadButton = screen.getByRole('button', { name: /reload page/i })
      fireEvent.click(reloadButton)

      expect(mockReload).toHaveBeenCalledTimes(1)
    })
  })

  describe('Custom Fallback', () => {
    it('renders custom fallback UI when provided', () => {
      const customFallback = (error, retry) => (
        <div>
          <h1>Custom Error UI</h1>
          <p>Error: {error?.message || 'Unknown error'}</p>
          <button onClick={retry}>Custom Retry</button>
        </div>
      )

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} errorMessage="Custom fallback test" />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom Error UI')).toBeInTheDocument()
      expect(screen.getByText('Error: Custom fallback test')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /custom retry/i })).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('passes retry function to custom fallback', () => {
      const TestComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true)
        
        const customFallback = (error, retry) => (
          <button onClick={() => { retry(); setShouldThrow(false); }}>
            Custom Retry Button
          </button>
        )

        return (
          <ErrorBoundary fallback={customFallback}>
            <ThrowError shouldThrow={shouldThrow} />
          </ErrorBoundary>
        )
      }

      render(<TestComponent />)

      const customRetryButton = screen.getByRole('button', { name: /custom retry button/i })
      fireEvent.click(customRetryButton)

      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Check for proper button labels
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()
    })

    it('has proper heading structure', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument()
    })
  })

  describe('CSS Classes', () => {
    it('applies correct CSS classes', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(document.querySelector('.error-boundary')).toBeInTheDocument()
      expect(document.querySelector('.error-boundary-card')).toBeInTheDocument()
      expect(document.querySelector('.error-boundary-icon')).toBeInTheDocument()
      expect(document.querySelector('.error-boundary-title')).toBeInTheDocument()
      expect(document.querySelector('.error-boundary-message')).toBeInTheDocument()
      expect(document.querySelector('.error-boundary-actions')).toBeInTheDocument()
    })
  })
})