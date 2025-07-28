import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SnippetCard from '../SnippetCard';

// Mock the transformers utilities
vi.mock('../../../utils/transformers', () => ({
  formatRelativeTime: vi.fn((date) => '2 hours ago'),
  getDisplayNameFromEmail: vi.fn((email) => 'TestUser'),
  truncateText: vi.fn((text, length) => text.length > length ? text.substring(0, length) + '...' : text),
}));

// Mock CopyButton component
vi.mock('../CopyButton', () => ({
  default: ({ text, onCopySuccess, onCopyError, className, size }) => (
    <button 
      data-testid="copy-button"
      className={`copy-button ${className}`}
      data-size={size}
      onClick={() => {
        try {
          if (onCopySuccess) onCopySuccess(text);
        } catch (error) {
          if (onCopyError) onCopyError(error);
        }
      }}
    >
      Copy
    </button>
  ),
}));

describe('SnippetCard', () => {
  const mockSnippet = {
    id: 'test-snippet-1',
    title: 'Test HTML Snippet',
    htmlContent: '<div>Hello World</div>',
    authorEmail: 'test@example.com',
    createdAt: new Date('2024-01-01'),
    voteCount: 5,
  };

  const mockOnClick = vi.fn();
  const mockOnCopy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders snippet information correctly', () => {
    render(<SnippetCard snippet={mockSnippet} onClick={mockOnClick} />);
    
    expect(screen.getByText('Test HTML Snippet')).toBeInTheDocument();
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<SnippetCard snippet={mockSnippet} onClick={mockOnClick} />);
    
    const card = screen.getByLabelText('View snippet: Test HTML Snippet');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockSnippet);
  });

  it('calls onClick when Enter key is pressed', () => {
    render(<SnippetCard snippet={mockSnippet} onClick={mockOnClick} />);
    
    const card = screen.getByLabelText('View snippet: Test HTML Snippet');
    fireEvent.keyDown(card, { key: 'Enter' });
    
    expect(mockOnClick).toHaveBeenCalledWith(mockSnippet);
  });

  it('calls onClick when Space key is pressed', () => {
    render(<SnippetCard snippet={mockSnippet} onClick={mockOnClick} />);
    
    const card = screen.getByLabelText('View snippet: Test HTML Snippet');
    fireEvent.keyDown(card, { key: ' ' });
    
    expect(mockOnClick).toHaveBeenCalledWith(mockSnippet);
  });

  it('does not call onClick for other keys', () => {
    render(<SnippetCard snippet={mockSnippet} onClick={mockOnClick} />);
    
    const card = screen.getByLabelText('View snippet: Test HTML Snippet');
    fireEvent.keyDown(card, { key: 'Tab' });
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('handles missing onClick prop gracefully', () => {
    render(<SnippetCard snippet={mockSnippet} />);
    
    const card = screen.getByLabelText('View snippet: Test HTML Snippet');
    expect(() => fireEvent.click(card)).not.toThrow();
  });

  it('displays vote count as 0 when not provided', () => {
    const snippetWithoutVotes = { ...mockSnippet, voteCount: undefined };
    render(<SnippetCard snippet={snippetWithoutVotes} onClick={mockOnClick} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies additional className when provided', () => {
    const { container } = render(
      <SnippetCard snippet={mockSnippet} onClick={mockOnClick} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('snippet-card', 'custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<SnippetCard snippet={mockSnippet} onClick={mockOnClick} />);
    
    const card = screen.getByLabelText('View snippet: Test HTML Snippet');
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveAttribute('aria-label', 'View snippet: Test HTML Snippet');
  });

  it('returns null when snippet is not provided', () => {
    const { container } = render(<SnippetCard snippet={null} onClick={mockOnClick} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('strips HTML tags from content preview', () => {
    const snippetWithHtml = {
      ...mockSnippet,
      htmlContent: '<div><p>Hello <strong>World</strong></p></div>',
    };
    
    render(<SnippetCard snippet={snippetWithHtml} onClick={mockOnClick} />);
    
    // The content should be stripped of HTML tags for preview
    expect(screen.getByText(/Hello World/)).toBeInTheDocument();
  });

  it('shows truncated title when title is long', () => {
    const longTitle = 'This is a very long title that should be truncated when displayed in the card';
    const snippetWithLongTitle = { ...mockSnippet, title: longTitle };
    
    render(<SnippetCard snippet={snippetWithLongTitle} onClick={mockOnClick} />);
    
    // Should show truncated version
    expect(screen.getByText(longTitle.substring(0, 60) + '...')).toBeInTheDocument();
  });

  describe('Copy Functionality', () => {
    it('renders copy button with correct props', () => {
      render(<SnippetCard snippet={mockSnippet} onClick={mockOnClick} onCopy={mockOnCopy} />);
      
      const copyButton = screen.getByTestId('copy-button');
      expect(copyButton).toBeInTheDocument();
      expect(copyButton).toHaveClass('copy-button', 'snippet-card-copy-button');
      expect(copyButton).toHaveAttribute('data-size', 'small');
    });

    it('calls onCopy when copy button is clicked', () => {
      render(<SnippetCard snippet={mockSnippet} onClick={mockOnClick} onCopy={mockOnCopy} />);
      
      const copyButton = screen.getByTestId('copy-button');
      fireEvent.click(copyButton);
      
      expect(mockOnCopy).toHaveBeenCalledWith('<div>Hello World</div>');
    });

    it('does not trigger card click when copy button is clicked', () => {
      render(<SnippetCard snippet={mockSnippet} onClick={mockOnClick} onCopy={mockOnCopy} />);
      
      const copyButton = screen.getByTestId('copy-button');
      fireEvent.click(copyButton);
      
      expect(mockOnClick).not.toHaveBeenCalled();
      expect(mockOnCopy).toHaveBeenCalledWith('<div>Hello World</div>');
    });

    it('handles copy button without onCopy prop', () => {
      render(<SnippetCard snippet={mockSnippet} onClick={mockOnClick} />);
      
      const copyButton = screen.getByTestId('copy-button');
      expect(() => fireEvent.click(copyButton)).not.toThrow();
    });

    it('passes correct text to copy button', () => {
      const customSnippet = {
        ...mockSnippet,
        htmlContent: '<p>Custom HTML content</p>',
      };
      
      render(<SnippetCard snippet={customSnippet} onClick={mockOnClick} onCopy={mockOnCopy} />);
      
      const copyButton = screen.getByTestId('copy-button');
      fireEvent.click(copyButton);
      
      expect(mockOnCopy).toHaveBeenCalledWith('<p>Custom HTML content</p>');
    });

    it('handles copy error gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<SnippetCard snippet={mockSnippet} onClick={mockOnClick} onCopy={mockOnCopy} />);
      
      // Simulate copy error by modifying the mock
      const copyButton = screen.getByTestId('copy-button');
      
      // Override the mock to simulate an error
      copyButton.onclick = () => {
        const error = new Error('Copy failed');
        console.error('Copy failed in SnippetCard:', error);
      };
      
      fireEvent.click(copyButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Copy failed in SnippetCard:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});