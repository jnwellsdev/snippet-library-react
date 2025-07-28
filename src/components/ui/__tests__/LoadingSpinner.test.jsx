import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toBeInTheDocument()
    
    const spinnerElement = spinner.querySelector('.loading-spinner')
    expect(spinnerElement).toHaveClass('loading-spinner--medium')
    expect(spinnerElement).toHaveClass('loading-spinner--primary')
  })

  it('renders with custom size', () => {
    render(<LoadingSpinner size="large" />)
    
    const spinner = screen.getByTestId('loading-spinner')
    const spinnerElement = spinner.querySelector('.loading-spinner')
    expect(spinnerElement).toHaveClass('loading-spinner--large')
  })

  it('renders with custom color', () => {
    render(<LoadingSpinner color="secondary" />)
    
    const spinner = screen.getByTestId('loading-spinner')
    const spinnerElement = spinner.querySelector('.loading-spinner')
    expect(spinnerElement).toHaveClass('loading-spinner--secondary')
  })

  it('renders with text', () => {
    const text = 'Loading data...'
    render(<LoadingSpinner text={text} />)
    
    expect(screen.getByTestId('loading-text')).toHaveTextContent(text)
  })

  it('renders inline when specified', () => {
    render(<LoadingSpinner inline />)
    
    const container = screen.getByTestId('loading-spinner')
    expect(container).toHaveClass('loading-spinner-container--inline')
    
    const spinnerElement = container.querySelector('.loading-spinner')
    expect(spinnerElement).toHaveClass('loading-spinner--inline')
  })

  it('applies custom className', () => {
    const customClass = 'custom-spinner'
    render(<LoadingSpinner className={customClass} />)
    
    const spinner = screen.getByTestId('loading-spinner')
    const spinnerElement = spinner.querySelector('.loading-spinner')
    expect(spinnerElement).toHaveClass(customClass)
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByTestId('loading-spinner')
    const spinnerElement = spinner.querySelector('.loading-spinner')
    
    expect(spinnerElement).toHaveAttribute('role', 'status')
    expect(spinnerElement).toHaveAttribute('aria-label', 'Loading')
    expect(screen.getByText('Loading...')).toHaveClass('sr-only')
  })

  it('renders with all size variants', () => {
    const sizes = ['small', 'medium', 'large']
    
    sizes.forEach(size => {
      const { unmount } = render(<LoadingSpinner size={size} />)
      
      const spinner = screen.getByTestId('loading-spinner')
      const spinnerElement = spinner.querySelector('.loading-spinner')
      expect(spinnerElement).toHaveClass(`loading-spinner--${size}`)
      
      unmount()
    })
  })

  it('renders with all color variants', () => {
    const colors = ['primary', 'secondary', 'white', 'success', 'warning', 'error']
    
    colors.forEach(color => {
      const { unmount } = render(<LoadingSpinner color={color} />)
      
      const spinner = screen.getByTestId('loading-spinner')
      const spinnerElement = spinner.querySelector('.loading-spinner')
      expect(spinnerElement).toHaveClass(`loading-spinner--${color}`)
      
      unmount()
    })
  })
})