import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import NetworkError from '../NetworkError'

describe('NetworkError', () => {
  describe('Basic Rendering', () => {
    it('renders default network error message', () => {
      render(<NetworkError />)
      
      expect(screen.getByText('Connection Problem')).toBeInTheDocument()
      expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('renders custom message when provided', () => {
      const customMessage = 'Custom network error message'
      render(<NetworkError message={customMessage} />)
      
      expect(screen.getByText(customMessage)).toBeInTheDocument()
      expect(screen.queryByText(/Unable to connect to the server/)).not.toBeInTheDocument()
    })

    it('shows help text', () => {
      render(<NetworkError />)
      
      expect(screen.getByText(/If the problem persists/)).toBeInTheDocument()
    })

    it('displays network and warning icons', () => {
      render(<NetworkError />)
      
      expect(document.querySelector('.network-error-icon-large')).toBeInTheDocument()
      expect(document.querySelector('.network-error-warning')).toBeInTheDocument()
    })
  })

  describe('Default Variant', () => {
    it('renders in card format by default', () => {
      render(<NetworkError />)
      
      expect(document.querySelector('.network-error')).toBeInTheDocument()
      expect(document.querySelector('.network-error-card')).toBeInTheDocument()
      expect(screen.getByText('Connection Problem')).toBeInTheDocument()
    })

    it('shows Try Again button with icon', () => {
      render(<NetworkError />)
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toBeInTheDocument()
      expect(tryAgainButton.querySelector('svg')).toBeInTheDocument() // Icon
    })
  })

  describe('Inline Variant', () => {
    it('renders inline variant correctly', () => {
      render(<NetworkError variant="inline" />)
      
      expect(document.querySelector('.network-error-inline')).toBeInTheDocument()
      expect(screen.queryByText('Connection Problem')).not.toBeInTheDocument() // No heading in inline
    })

    it('shows shorter message in inline variant', () => {
      render(<NetworkError variant="inline" />)
      
      expect(screen.getByText('Connection error')).toBeInTheDocument()
    })

    it('shows custom message in inline variant', () => {
      render(<NetworkError variant="inline" message="Custom inline message" />)
      
      expect(screen.getByText('Custom inline message')).toBeInTheDocument()
    })

    it('has retry button in inline variant', () => {
      render(<NetworkError variant="inline" />)
      
      const retryButton = screen.getByRole('button')
      expect(retryButton).toBeInTheDocument()
      expect(retryButton.querySelector('svg')).toBeInTheDocument() // Icon only
    })

    it('has proper role attribute in inline variant', () => {
      render(<NetworkError variant="inline" />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('Retry Functionality', () => {
    it('calls onRetry when Try Again button is clicked', () => {
      const onRetry = vi.fn()
      render(<NetworkError onRetry={onRetry} />)
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(tryAgainButton)
      
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('calls onRetry in inline variant', () => {
      const onRetry = vi.fn()
      render(<NetworkError variant="inline" onRetry={onRetry} />)
      
      const retryButton = screen.getByRole('button')
      fireEvent.click(retryButton)
      
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('reloads page when no onRetry provided', () => {
      // Mock window.location.reload
      const mockReload = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      })

      render(<NetworkError />)
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(tryAgainButton)
      
      expect(mockReload).toHaveBeenCalledTimes(1)
    })

    it('reloads page in inline variant when no onRetry provided', () => {
      // Mock window.location.reload
      const mockReload = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      })

      render(<NetworkError variant="inline" />)
      
      const retryButton = screen.getByRole('button')
      fireEvent.click(retryButton)
      
      expect(mockReload).toHaveBeenCalledTimes(1)
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<NetworkError className="custom-network-error" />)
      
      expect(document.querySelector('.custom-network-error')).toBeInTheDocument()
    })

    it('combines custom className with variant styles', () => {
      render(<NetworkError variant="inline" className="custom-network-error" />)
      
      expect(document.querySelector('.custom-network-error')).toBeInTheDocument()
      expect(document.querySelector('.network-error-inline')).toBeInTheDocument()
    })
  })

  describe('CSS Classes', () => {
    it('applies correct CSS classes for default variant', () => {
      render(<NetworkError />)
      
      expect(document.querySelector('.network-error')).toBeInTheDocument()
      expect(document.querySelector('.network-error-card')).toBeInTheDocument()
      expect(document.querySelector('.network-error-icon-wrapper')).toBeInTheDocument()
      expect(document.querySelector('.network-error-icon-large')).toBeInTheDocument()
      expect(document.querySelector('.network-error-warning')).toBeInTheDocument()
      expect(document.querySelector('.network-error-title')).toBeInTheDocument()
      expect(document.querySelector('.network-error-message')).toBeInTheDocument()
      expect(document.querySelector('.network-error-actions')).toBeInTheDocument()
      expect(document.querySelector('.network-error-retry-button')).toBeInTheDocument()
      expect(document.querySelector('.network-error-help')).toBeInTheDocument()
    })

    it('applies correct CSS classes for inline variant', () => {
      render(<NetworkError variant="inline" />)
      
      expect(document.querySelector('.network-error-inline')).toBeInTheDocument()
      expect(document.querySelector('.network-error-icon')).toBeInTheDocument()
      expect(document.querySelector('.network-error-text')).toBeInTheDocument()
      expect(document.querySelector('.network-error-retry')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper button labels', () => {
      render(<NetworkError />)
      
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('has proper heading structure', () => {
      render(<NetworkError />)
      
      expect(screen.getByRole('heading', { name: /connection problem/i })).toBeInTheDocument()
    })

    it('has proper alert role in inline variant', () => {
      render(<NetworkError variant="inline" />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('Icon Animation', () => {
    it('applies animation class to large icon', () => {
      render(<NetworkError />)
      
      const largeIcon = document.querySelector('.network-error-icon-large')
      expect(largeIcon).toBeInTheDocument()
      // Animation is applied via CSS, so we just check the class exists
    })
  })
})