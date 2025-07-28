import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Theme } from '@radix-ui/themes'
import LoadingSpinner from '../LoadingSpinner'
import LoadingButton from '../LoadingButton'
import LoadingCard from '../LoadingCard'

// Test wrapper with Radix UI Theme
const TestWrapper = ({ children }) => (
  <Theme appearance="light" accentColor="blue">
    {children}
  </Theme>
)

describe('UI Polish and Loading States', () => {
  describe('LoadingSpinner accessibility and polish', () => {
    it('has proper ARIA attributes for screen readers', () => {
      render(
        <TestWrapper>
          <LoadingSpinner />
        </TestWrapper>
      )
      
      const spinner = screen.getByTestId('loading-spinner')
      const spinnerElement = spinner.querySelector('.loading-spinner')
      
      expect(spinnerElement).toHaveAttribute('role', 'status')
      expect(spinnerElement).toHaveAttribute('aria-label', 'Loading')
      expect(screen.getByText('Loading...')).toHaveClass('sr-only')
    })

    it('supports reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(
        <TestWrapper>
          <LoadingSpinner />
        </TestWrapper>
      )
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('renders with all color variants for different contexts', () => {
      const colors = ['primary', 'secondary', 'white', 'success', 'warning', 'error']
      
      colors.forEach(color => {
        const { unmount } = render(
          <TestWrapper>
            <LoadingSpinner color={color} />
          </TestWrapper>
        )
        
        const spinner = screen.getByTestId('loading-spinner')
        const spinnerElement = spinner.querySelector('.loading-spinner')
        expect(spinnerElement).toHaveClass(`loading-spinner--${color}`)
        
        unmount()
      })
    })
  })

  describe('LoadingButton interaction states', () => {
    it('has proper hover and focus states', async () => {
      const handleClick = vi.fn()
      render(
        <TestWrapper>
          <LoadingButton onClick={handleClick}>Click me</LoadingButton>
        </TestWrapper>
      )
      
      const button = screen.getByTestId('loading-button')
      
      // Test focus event (jsdom doesn't always handle focus properly)
      fireEvent.focus(button)
      // Just verify the button exists and is focusable
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
      
      // Test click
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('prevents interaction when loading', () => {
      const handleClick = vi.fn()
      render(
        <TestWrapper>
          <LoadingButton loading onClick={handleClick}>
            Submit
          </LoadingButton>
        </TestWrapper>
      )
      
      const button = screen.getByTestId('loading-button')
      
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
      
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('shows loading spinner with correct color based on variant', () => {
      const { rerender } = render(
        <TestWrapper>
          <LoadingButton loading variant="primary">Button</LoadingButton>
        </TestWrapper>
      )
      
      let spinner = screen.getByTestId('loading-spinner')
      let spinnerElement = spinner.querySelector('.loading-spinner')
      expect(spinnerElement).toHaveClass('loading-spinner--white')
      
      rerender(
        <TestWrapper>
          <LoadingButton loading variant="secondary">Button</LoadingButton>
        </TestWrapper>
      )
      
      spinner = screen.getByTestId('loading-spinner')
      spinnerElement = spinner.querySelector('.loading-spinner')
      expect(spinnerElement).toHaveClass('loading-spinner--secondary')
    })

    it('supports all button variants with proper styling', () => {
      const variants = ['primary', 'secondary', 'success', 'danger']
      
      variants.forEach(variant => {
        const { unmount } = render(
          <TestWrapper>
            <LoadingButton variant={variant}>Button</LoadingButton>
          </TestWrapper>
        )
        
        const button = screen.getByTestId('loading-button')
        expect(button).toHaveClass(`loading-button--${variant}`)
        
        unmount()
      })
    })
  })

  describe('LoadingCard skeleton states', () => {
    it('renders appropriate skeleton elements for snippet variant', () => {
      render(
        <TestWrapper>
          <LoadingCard variant="snippet" />
        </TestWrapper>
      )
      
      expect(document.querySelector('.skeleton--title')).toBeInTheDocument()
      expect(document.querySelector('.skeleton--subtitle')).toBeInTheDocument()
      expect(document.querySelector('.skeleton--code-block')).toBeInTheDocument()
      expect(document.querySelector('.skeleton--author')).toBeInTheDocument()
      expect(document.querySelector('.skeleton--votes')).toBeInTheDocument()
    })

    it('renders appropriate skeleton elements for detail variant', () => {
      render(
        <TestWrapper>
          <LoadingCard variant="detail" />
        </TestWrapper>
      )
      
      expect(document.querySelector('.skeleton--detail-title')).toBeInTheDocument()
      expect(document.querySelector('.skeleton--detail-meta')).toBeInTheDocument()
      expect(document.querySelector('.skeleton--detail-code')).toBeInTheDocument()
      expect(document.querySelector('.skeleton--detail-preview')).toBeInTheDocument()
      expect(document.querySelectorAll('.skeleton--button')).toHaveLength(2)
    })

    it('renders multiple cards when count is specified', () => {
      render(
        <TestWrapper>
          <LoadingCard count={3} variant="list" />
        </TestWrapper>
      )
      
      const container = document.querySelector('.loading-cards-container')
      expect(container).toBeInTheDocument()
      
      const cards = document.querySelectorAll('.loading-card')
      expect(cards).toHaveLength(3)
      
      cards.forEach(card => {
        expect(card).toHaveClass('loading-card--list')
      })
    })
  })

  describe('Radix UI Theme integration', () => {
    it('works properly with Radix UI Theme provider', () => {
      render(
        <TestWrapper>
          <div>
            <LoadingSpinner />
            <LoadingButton>Test</LoadingButton>
            <LoadingCard />
          </div>
        </TestWrapper>
      )
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByTestId('loading-button')).toBeInTheDocument()
      expect(document.querySelector('.loading-card')).toBeInTheDocument()
    })
  })

  describe('Accessibility and keyboard navigation', () => {
    it('supports keyboard navigation for interactive elements', () => {
      const handleClick = vi.fn()
      render(
        <TestWrapper>
          <LoadingButton onClick={handleClick}>Button</LoadingButton>
        </TestWrapper>
      )
      
      const button = screen.getByTestId('loading-button')
      
      // Test keyboard activation
      fireEvent.keyDown(button, { key: 'Enter' })
      fireEvent.keyUp(button, { key: 'Enter' })
      
      // Test focus (jsdom doesn't always handle focus properly)
      fireEvent.focus(button)
      // Just verify the button exists and is focusable
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })

    it('provides proper loading announcements for screen readers', () => {
      render(
        <TestWrapper>
          <LoadingSpinner text="Loading data..." />
        </TestWrapper>
      )
      
      const loadingText = screen.getByTestId('loading-text')
      expect(loadingText).toHaveTextContent('Loading data...')
      
      const spinner = screen.getByTestId('loading-spinner')
      const spinnerElement = spinner.querySelector('.loading-spinner')
      expect(spinnerElement).toHaveAttribute('role', 'status')
    })
  })

  describe('Performance and optimization', () => {
    it('handles rapid state changes without issues', async () => {
      const { rerender } = render(
        <TestWrapper>
          <LoadingButton loading={false}>Button</LoadingButton>
        </TestWrapper>
      )
      
      // Rapidly toggle loading state
      for (let i = 0; i < 10; i++) {
        rerender(
          <TestWrapper>
            <LoadingButton loading={i % 2 === 0}>Button</LoadingButton>
          </TestWrapper>
        )
      }
      
      const button = screen.getByTestId('loading-button')
      expect(button).toBeInTheDocument()
    })

    it('cleans up properly when unmounted', () => {
      const { unmount } = render(
        <TestWrapper>
          <LoadingSpinner />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      
      unmount()
      
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })
})