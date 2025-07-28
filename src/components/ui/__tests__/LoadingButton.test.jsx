import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoadingButton from '../LoadingButton'

describe('LoadingButton', () => {
  it('renders with default props', () => {
    render(<LoadingButton>Click me</LoadingButton>)
    
    const button = screen.getByTestId('loading-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
    expect(button).toHaveClass('loading-button--primary')
    expect(button).toHaveClass('loading-button--medium')
  })

  it('shows loading state', () => {
    render(
      <LoadingButton loading loadingText="Processing...">
        Submit
      </LoadingButton>
    )
    
    const button = screen.getByTestId('loading-button')
    expect(button).toHaveClass('loading-button--loading')
    expect(button).toHaveTextContent('Processing...')
    expect(button).toBeDisabled()
    
    // Should show loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('handles click events when not loading', () => {
    const handleClick = vi.fn()
    render(<LoadingButton onClick={handleClick}>Click me</LoadingButton>)
    
    const button = screen.getByTestId('loading-button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not handle click events when loading', () => {
    const handleClick = vi.fn()
    render(
      <LoadingButton loading onClick={handleClick}>
        Click me
      </LoadingButton>
    )
    
    const button = screen.getByTestId('loading-button')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders with different variants', () => {
    const variants = ['primary', 'secondary', 'success', 'danger']
    
    variants.forEach(variant => {
      const { unmount } = render(
        <LoadingButton variant={variant}>Button</LoadingButton>
      )
      
      const button = screen.getByTestId('loading-button')
      expect(button).toHaveClass(`loading-button--${variant}`)
      
      unmount()
    })
  })

  it('renders with different sizes', () => {
    const sizes = ['small', 'medium', 'large']
    
    sizes.forEach(size => {
      const { unmount } = render(
        <LoadingButton size={size}>Button</LoadingButton>
      )
      
      const button = screen.getByTestId('loading-button')
      expect(button).toHaveClass(`loading-button--${size}`)
      
      unmount()
    })
  })

  it('is disabled when disabled prop is true', () => {
    render(<LoadingButton disabled>Button</LoadingButton>)
    
    const button = screen.getByTestId('loading-button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('applies custom className', () => {
    const customClass = 'custom-button'
    render(<LoadingButton className={customClass}>Button</LoadingButton>)
    
    const button = screen.getByTestId('loading-button')
    expect(button).toHaveClass(customClass)
  })

  it('passes through additional props', () => {
    render(
      <LoadingButton data-testid="custom-button" id="my-button">
        Button
      </LoadingButton>
    )
    
    const button = screen.getByTestId('custom-button')
    expect(button).toHaveAttribute('id', 'my-button')
  })

  it('uses correct spinner color based on variant', () => {
    // Test primary variant (should use white spinner)
    const { rerender } = render(
      <LoadingButton loading variant="primary">Button</LoadingButton>
    )
    
    let spinner = screen.getByTestId('loading-spinner')
    let spinnerElement = spinner.querySelector('.loading-spinner')
    expect(spinnerElement).toHaveClass('loading-spinner--white')
    
    // Test secondary variant (should use secondary spinner)
    rerender(
      <LoadingButton loading variant="secondary">Button</LoadingButton>
    )
    
    spinner = screen.getByTestId('loading-spinner')
    spinnerElement = spinner.querySelector('.loading-spinner')
    expect(spinnerElement).toHaveClass('loading-spinner--secondary')
  })

  it('has proper button type', () => {
    render(<LoadingButton type="submit">Submit</LoadingButton>)
    
    const button = screen.getByTestId('loading-button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})