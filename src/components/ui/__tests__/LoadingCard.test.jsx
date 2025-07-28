import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingCard from '../LoadingCard'

describe('LoadingCard', () => {
  it('renders single card by default', () => {
    render(<LoadingCard />)
    
    const card = document.querySelector('.loading-card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('loading-card--snippet')
  })

  it('renders multiple cards when count is specified', () => {
    render(<LoadingCard count={3} />)
    
    const container = document.querySelector('.loading-cards-container')
    expect(container).toBeInTheDocument()
    
    const cards = document.querySelectorAll('.loading-card')
    expect(cards).toHaveLength(3)
  })

  it('renders snippet variant correctly', () => {
    render(<LoadingCard variant="snippet" />)
    
    const card = document.querySelector('.loading-card')
    expect(card).toHaveClass('loading-card--snippet')
    
    // Check for snippet-specific skeleton elements
    expect(document.querySelector('.skeleton--title')).toBeInTheDocument()
    expect(document.querySelector('.skeleton--subtitle')).toBeInTheDocument()
    expect(document.querySelector('.skeleton--code-block')).toBeInTheDocument()
    expect(document.querySelector('.skeleton--author')).toBeInTheDocument()
    expect(document.querySelector('.skeleton--votes')).toBeInTheDocument()
  })

  it('renders list variant correctly', () => {
    render(<LoadingCard variant="list" />)
    
    const card = document.querySelector('.loading-card')
    expect(card).toHaveClass('loading-card--list')
    
    // Check for list-specific skeleton elements
    expect(document.querySelector('.skeleton--list-title')).toBeInTheDocument()
    expect(document.querySelector('.skeleton--list-content')).toBeInTheDocument()
    expect(document.querySelector('.skeleton--list-meta')).toBeInTheDocument()
  })

  it('renders detail variant correctly', () => {
    render(<LoadingCard variant="detail" />)
    
    const card = document.querySelector('.loading-card')
    expect(card).toHaveClass('loading-card--detail')
    
    // Check for detail-specific skeleton elements
    expect(document.querySelector('.skeleton--detail-title')).toBeInTheDocument()
    expect(document.querySelector('.skeleton--detail-meta')).toBeInTheDocument()
    expect(document.querySelector('.skeleton--detail-code')).toBeInTheDocument()
    expect(document.querySelector('.skeleton--detail-preview')).toBeInTheDocument()
    expect(document.querySelectorAll('.skeleton--button')).toHaveLength(2)
  })

  it('applies custom className', () => {
    const customClass = 'custom-loading-card'
    render(<LoadingCard className={customClass} />)
    
    const card = document.querySelector('.loading-card')
    expect(card).toHaveClass(customClass)
  })

  it('renders correct structure for snippet variant', () => {
    render(<LoadingCard variant="snippet" />)
    
    expect(document.querySelector('.loading-card-header')).toBeInTheDocument()
    expect(document.querySelector('.loading-card-content')).toBeInTheDocument()
    expect(document.querySelector('.loading-card-footer')).toBeInTheDocument()
  })

  it('renders correct structure for detail variant', () => {
    render(<LoadingCard variant="detail" />)
    
    expect(document.querySelector('.loading-card-detail-header')).toBeInTheDocument()
    expect(document.querySelector('.loading-card-detail-content')).toBeInTheDocument()
    expect(document.querySelector('.loading-card-detail-actions')).toBeInTheDocument()
  })

  it('all skeleton elements have proper class', () => {
    render(<LoadingCard variant="snippet" />)
    
    const skeletons = document.querySelectorAll('[class*="skeleton"]')
    skeletons.forEach(skeleton => {
      expect(skeleton.className).toMatch(/skeleton/)
    })
  })
})