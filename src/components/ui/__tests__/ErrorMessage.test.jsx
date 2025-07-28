import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ErrorMessage from '../ErrorMessage'

describe('ErrorMessage', () => {
  describe('Basic Rendering', () => {
    it('renders with string error message', () => {
      render(<ErrorMessage error="Test error message" />)
      
      expect(screen.getByText('Test error message')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('renders with Error object', () => {
      const error = new Error('Error object message')
      render(<ErrorMessage error={error} />)
      
      expect(screen.getByText('Error object message')).toBeInTheDocument()
    })

    it('renders with custom message prop', () => {
      const error = new Error('Original error')
      render(<ErrorMessage error={error} message="Custom message" />)
      
      expect(screen.getByText('Custom message')).toBeInTheDocument()
      expect(screen.queryByText('Original error')).not.toBeInTheDocument()
    })

    it('renders default message when no error or message provided', () => {
      render(<ErrorMessage />)
      
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    })

    it('shows error icon by default', () => {
      render(<ErrorMessage error="Test error" />)
      
      expect(document.querySelector('.error-message-icon')).toBeInTheDocument()
    })

    it('hides error icon when showIcon is false', () => {
      render(<ErrorMessage error="Test error" showIcon={false} />)
      
      expect(document.querySelector('.error-message-icon')).not.toBeInTheDocument()
    })
  })

  describe('Error Message Processing', () => {
    it('handles network errors with user-friendly message', () => {
      const error = new Error('network request failed')
      render(<ErrorMessage error={error} />)
      
      expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument()
    })

    it('handles permission errors with user-friendly message', () => {
      const error = new Error('permission denied')
      render(<ErrorMessage error={error} />)
      
      expect(screen.getByText('You don\'t have permission to perform this action.')).toBeInTheDocument()
    })

    it('handles not-found errors with user-friendly message', () => {
      const error = new Error('document not-found')
      render(<ErrorMessage error={error} />)
      
      expect(screen.getByText('The requested item could not be found.')).toBeInTheDocument()
    })

    it('uses original message for other errors', () => {
      const error = new Error('Custom specific error message')
      render(<ErrorMessage error={error} />)
      
      expect(screen.getByText('Custom specific error message')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('applies default variant styles', () => {
      render(<ErrorMessage error="Test error" />)
      
      expect(document.querySelector('.error-message-default')).toBeInTheDocument()
    })

    it('applies inline variant styles', () => {
      render(<ErrorMessage error="Test error" variant="inline" />)
      
      expect(document.querySelector('.error-message-inline')).toBeInTheDocument()
    })

    it('applies banner variant styles', () => {
      render(<ErrorMessage error="Test error" variant="banner" />)
      
      expect(document.querySelector('.error-message-banner')).toBeInTheDocument()
    })

    it('applies card variant styles and wraps in Card component', () => {
      render(<ErrorMessage error="Test error" variant="card" />)
      
      expect(document.querySelector('.error-message-card')).toBeInTheDocument()
      expect(document.querySelector('.error-message-card-wrapper')).toBeInTheDocument()
    })
  })

  describe('Dismiss Functionality', () => {
    it('shows dismiss button by default', () => {
      render(<ErrorMessage error="Test error" onDismiss={vi.fn()} />)
      
      expect(screen.getByLabelText('Dismiss error')).toBeInTheDocument()
    })

    it('hides dismiss button when dismissible is false', () => {
      render(<ErrorMessage error="Test error" dismissible={false} onDismiss={vi.fn()} />)
      
      expect(screen.queryByLabelText('Dismiss error')).not.toBeInTheDocument()
    })

    it('calls onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn()
      render(<ErrorMessage error="Test error" onDismiss={onDismiss} />)
      
      const dismissButton = screen.getByLabelText('Dismiss error')
      fireEvent.click(dismissButton)
      
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('does not show dismiss button when onDismiss is not provided', () => {
      render(<ErrorMessage error="Test error" />)
      
      expect(screen.queryByLabelText('Dismiss error')).not.toBeInTheDocument()
    })
  })

  describe('Retry Functionality', () => {
    it('hides retry button by default', () => {
      render(<ErrorMessage error="Test error" onRetry={vi.fn()} />)
      
      expect(screen.queryByLabelText('Retry action')).not.toBeInTheDocument()
    })

    it('shows retry button when retryable is true', () => {
      render(<ErrorMessage error="Test error" retryable={true} onRetry={vi.fn()} />)
      
      expect(screen.getByLabelText('Retry action')).toBeInTheDocument()
    })

    it('calls onRetry when retry button is clicked', () => {
      const onRetry = vi.fn()
      render(<ErrorMessage error="Test error" retryable={true} onRetry={onRetry} />)
      
      const retryButton = screen.getByLabelText('Retry action')
      fireEvent.click(retryButton)
      
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('does not show retry button when onRetry is not provided', () => {
      render(<ErrorMessage error="Test error" retryable={true} />)
      
      expect(screen.queryByLabelText('Retry action')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA role and live region', () => {
      render(<ErrorMessage error="Test error" />)
      
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveAttribute('aria-live', 'polite')
    })

    it('has proper button labels', () => {
      render(
        <ErrorMessage 
          error="Test error" 
          retryable={true} 
          onRetry={vi.fn()} 
          onDismiss={vi.fn()} 
        />
      )
      
      expect(screen.getByLabelText('Retry action')).toBeInTheDocument()
      expect(screen.getByLabelText('Dismiss error')).toBeInTheDocument()
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<ErrorMessage error="Test error" className="custom-error" />)
      
      expect(document.querySelector('.custom-error')).toBeInTheDocument()
    })

    it('combines custom className with variant styles', () => {
      render(<ErrorMessage error="Test error" variant="inline" className="custom-error" />)
      
      expect(document.querySelector('.custom-error')).toBeInTheDocument()
      expect(document.querySelector('.error-message-inline')).toBeInTheDocument()
    })
  })

  describe('CSS Classes', () => {
    it('applies correct base CSS classes', () => {
      render(<ErrorMessage error="Test error" />)
      
      expect(document.querySelector('.error-message')).toBeInTheDocument()
      expect(document.querySelector('.error-message-icon')).toBeInTheDocument()
      expect(document.querySelector('.error-message-text')).toBeInTheDocument()
      expect(document.querySelector('.error-message-actions')).toBeInTheDocument()
    })

    it('applies correct action button classes', () => {
      render(
        <ErrorMessage 
          error="Test error" 
          retryable={true} 
          onRetry={vi.fn()} 
          onDismiss={vi.fn()} 
        />
      )
      
      expect(document.querySelector('.error-message-retry')).toBeInTheDocument()
      expect(document.querySelector('.error-message-dismiss')).toBeInTheDocument()
    })
  })
})