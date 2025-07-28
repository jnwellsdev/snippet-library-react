import { render, screen } from '@testing-library/react'
import PageContainer from '../PageContainer'

describe('PageContainer', () => {
  it('renders children correctly', () => {
    render(
      <PageContainer>
        <div data-testid="test-content">Test Content</div>
      </PageContainer>
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('applies default CSS classes', () => {
    render(
      <PageContainer>
        <div>Content</div>
      </PageContainer>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass(
      'page-container',
      'page-container--max-width-default',
      'page-container--padding-default'
    )
  })

  it('applies custom className', () => {
    render(
      <PageContainer className="custom-class">
        <div>Content</div>
      </PageContainer>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('applies narrow max-width variant', () => {
    render(
      <PageContainer maxWidth="narrow">
        <div>Content</div>
      </PageContainer>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('page-container--max-width-narrow')
  })

  it('applies wide max-width variant', () => {
    render(
      <PageContainer maxWidth="wide">
        <div>Content</div>
      </PageContainer>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('page-container--max-width-wide')
  })

  it('applies full max-width variant', () => {
    render(
      <PageContainer maxWidth="full">
        <div>Content</div>
      </PageContainer>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('page-container--max-width-full')
  })

  it('applies compact padding variant', () => {
    render(
      <PageContainer padding="compact">
        <div>Content</div>
      </PageContainer>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('page-container--padding-compact')
  })

  it('applies spacious padding variant', () => {
    render(
      <PageContainer padding="spacious">
        <div>Content</div>
      </PageContainer>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('page-container--padding-spacious')
  })

  it('applies none padding variant', () => {
    render(
      <PageContainer padding="none">
        <div>Content</div>
      </PageContainer>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('page-container--padding-none')
  })

  it('combines multiple props correctly', () => {
    render(
      <PageContainer 
        maxWidth="narrow" 
        padding="compact" 
        className="custom-class"
      >
        <div>Content</div>
      </PageContainer>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass(
      'page-container',
      'page-container--max-width-narrow',
      'page-container--padding-compact',
      'custom-class'
    )
  })

  it('filters out empty className', () => {
    render(
      <PageContainer className="">
        <div>Content</div>
      </PageContainer>
    )

    const container = screen.getByText('Content').parentElement
    expect(container.className).not.toContain('""')
  })
})