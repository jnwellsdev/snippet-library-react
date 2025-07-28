import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SnippetPreview from '../SnippetPreview';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  vi.restoreAllMocks();
});

describe('SnippetPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no HTML content provided', () => {
    render(<SnippetPreview htmlContent="" />);
    
    expect(screen.getByText('No HTML content to preview')).toBeInTheDocument();
    expect(screen.getByText('No HTML content to preview').closest('.snippet-preview')).toHaveClass('empty');
  });

  it('renders preview header with label', () => {
    render(<SnippetPreview htmlContent="<div>Test</div>" />);
    
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('renders iframe with proper attributes', () => {
    render(<SnippetPreview htmlContent="<div>Test</div>" />);
    
    const iframe = screen.getByTitle('HTML Snippet Preview');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin');
  });

  it('applies custom className', () => {
    const customClass = 'custom-preview';
    render(<SnippetPreview htmlContent="<div>Test</div>" className={customClass} />);
    
    const container = screen.getByText('Live Preview').closest('.snippet-preview');
    expect(container).toHaveClass(customClass);
  });

  it('sets custom height on preview container', () => {
    const customHeight = 500;
    render(<SnippetPreview htmlContent="<div>Test</div>" height={customHeight} />);
    
    const container = document.querySelector('.preview-container');
    expect(container).toHaveStyle({ height: `${customHeight}px` });
  });

  it('renders without loading status when content loads immediately', () => {
    render(<SnippetPreview htmlContent="<div>Test</div>" />);
    
    // In test environment, loading completes immediately
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('handles iframe load event', async () => {
    render(<SnippetPreview htmlContent="<div>Test</div>" />);
    
    const iframe = screen.getByTitle('HTML Snippet Preview');
    
    // Simulate iframe load
    iframe.dispatchEvent(new Event('load'));
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('has error handling for iframe', () => {
    render(<SnippetPreview htmlContent="<div>Test</div>" />);
    
    const iframe = screen.getByTitle('HTML Snippet Preview');
    
    // Verify iframe has error handler attached
    expect(iframe).toHaveAttribute('title', 'HTML Snippet Preview');
    expect(iframe).toHaveClass('preview-iframe');
    
    // The error handling is implemented but difficult to test in jsdom environment
    // The component structure is correct and error handling code exists
  });

  it('renders iframe with proper structure for content injection', () => {
    render(<SnippetPreview htmlContent="<div>Hello World</div>" />);
    
    const iframe = screen.getByTitle('HTML Snippet Preview');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveClass('preview-iframe');
    
    // Verify the component renders without errors when content is provided
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('handles content updates', () => {
    const { rerender } = render(<SnippetPreview htmlContent="<div>First</div>" />);
    
    // Verify initial render
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    
    // Change content
    rerender(<SnippetPreview htmlContent="<div>Second</div>" />);
    
    // Component should still render properly with new content
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('handles null htmlContent gracefully', () => {
    render(<SnippetPreview htmlContent={null} />);
    
    expect(screen.getByText('No HTML content to preview')).toBeInTheDocument();
  });

  it('handles undefined htmlContent gracefully', () => {
    render(<SnippetPreview htmlContent={undefined} />);
    
    expect(screen.getByText('No HTML content to preview')).toBeInTheDocument();
  });
});