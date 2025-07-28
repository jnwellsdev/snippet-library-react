import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SyntaxHighlighter from '../SyntaxHighlighter';

// Mock Prism.js
vi.mock('prismjs', () => ({
  default: {
    highlightElement: vi.fn(),
  },
}));

vi.mock('prismjs/themes/prism.css', () => ({}));
vi.mock('prismjs/components/prism-markup', () => ({}));
vi.mock('prismjs/components/prism-css', () => ({}));
vi.mock('prismjs/components/prism-javascript', () => ({}));

import Prism from 'prismjs';

describe('SyntaxHighlighter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders code with default markup language', () => {
    const code = '<div>Hello World</div>';
    render(<SyntaxHighlighter code={code} />);

    const codeElement = screen.getByText(code);
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveClass('language-markup');
  });

  it('renders code with specified language', () => {
    const code = 'console.log("Hello");';
    render(<SyntaxHighlighter code={code} language="javascript" />);

    const codeElement = screen.getByText(code);
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveClass('language-javascript');
  });

  it('applies custom className', () => {
    const code = '<p>Test</p>';
    const customClass = 'custom-highlighter';
    render(<SyntaxHighlighter code={code} className={customClass} />);

    const container = screen.getByText(code).closest('.syntax-highlighter');
    expect(container).toHaveClass(customClass);
  });

  it('calls Prism.highlightElement on mount', () => {
    const code = '<div>Test</div>';
    render(<SyntaxHighlighter code={code} />);

    expect(Prism.highlightElement).toHaveBeenCalledTimes(1);
  });

  it('calls Prism.highlightElement when code changes', () => {
    const code1 = '<div>First</div>';
    const code2 = '<div>Second</div>';
    
    const { rerender } = render(<SyntaxHighlighter code={code1} />);
    expect(Prism.highlightElement).toHaveBeenCalledTimes(1);

    rerender(<SyntaxHighlighter code={code2} />);
    expect(Prism.highlightElement).toHaveBeenCalledTimes(2);
  });

  it('calls Prism.highlightElement when language changes', () => {
    const code = 'test code';
    
    const { rerender } = render(<SyntaxHighlighter code={code} language="markup" />);
    expect(Prism.highlightElement).toHaveBeenCalledTimes(1);

    rerender(<SyntaxHighlighter code={code} language="javascript" />);
    expect(Prism.highlightElement).toHaveBeenCalledTimes(2);
  });

  it('renders with proper HTML structure', () => {
    const code = '<span>Test</span>';
    render(<SyntaxHighlighter code={code} />);

    const container = screen.getByText(code).closest('.syntax-highlighter');
    const pre = container.querySelector('pre');
    const codeElement = container.querySelector('code');

    expect(container).toBeInTheDocument();
    expect(pre).toHaveClass('language-markup');
    expect(codeElement).toHaveClass('language-markup');
  });

  it('handles empty code gracefully', () => {
    render(<SyntaxHighlighter code="" />);
    
    const container = document.querySelector('.syntax-highlighter');
    expect(container).toBeInTheDocument();
    expect(Prism.highlightElement).toHaveBeenCalledTimes(1);
  });
});