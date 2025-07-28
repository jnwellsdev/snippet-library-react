import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SnippetDetail from '../SnippetDetail';

// Mock the child components
vi.mock('../SyntaxHighlighter', () => ({
  default: ({ code, language }) => (
    <div data-testid="syntax-highlighter" data-language={language}>
      {code}
    </div>
  ),
}));

vi.mock('../SnippetPreview', () => ({
  default: ({ htmlContent, height }) => (
    <div data-testid="snippet-preview" data-height={height}>
      {htmlContent}
    </div>
  ),
}));

vi.mock('../CopyButton', () => ({
  default: ({ text, onCopySuccess, onCopyError, className }) => (
    <button 
      data-testid="copy-button"
      className={className}
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

// Mock the transformers utilities
vi.mock('../../../utils/transformers', () => ({
  formatDate: vi.fn((date) => 'Jan 1, 2024, 10:00 AM'),
  getDisplayNameFromEmail: vi.fn((email) => 'TestUser'),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

describe('SnippetDetail', () => {
  const mockSnippet = {
    id: 'test-snippet-1',
    title: 'Test HTML Snippet',
    htmlContent: '<div>Hello World</div>',
    authorEmail: 'test@example.com',
    createdAt: new Date('2024-01-01'),
    voteCount: 5,
  };

  const mockOnCopy = vi.fn();
  const mockOnVote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders snippet information correctly', () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
        isAuthenticated={true}
      />
    );
    
    expect(screen.getByText('Test HTML Snippet')).toBeInTheDocument();
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByText('Jan 1, 2024, 10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows preview tab by default', () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
      />
    );
    
    expect(screen.getByTestId('snippet-preview')).toBeInTheDocument();
    expect(screen.queryByTestId('syntax-highlighter')).not.toBeInTheDocument();
  });

  it('switches to code tab when clicked', () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
      />
    );
    
    const codeTab = screen.getByText('HTML Code');
    fireEvent.click(codeTab);
    
    expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument();
    expect(screen.queryByTestId('snippet-preview')).not.toBeInTheDocument();
  });

  it('calls onCopy when copy button is clicked', async () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
      />
    );
    
    const copyButton = screen.getByTestId('copy-button');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(mockOnCopy).toHaveBeenCalledWith('<div>Hello World</div>');
    });
  });

  it('renders CopyButton with correct props', () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
      />
    );
    
    const copyButton = screen.getByTestId('copy-button');
    expect(copyButton).toBeInTheDocument();
    expect(copyButton).toHaveClass('snippet-detail-copy-button');
  });

  it('passes correct text to CopyButton', () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
      />
    );
    
    const copyButton = screen.getByTestId('copy-button');
    fireEvent.click(copyButton);
    
    expect(mockOnCopy).toHaveBeenCalledWith('<div>Hello World</div>');
  });

  it('calls onVote when vote button is clicked and user is authenticated', () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
        isAuthenticated={true}
      />
    );
    
    const voteButton = screen.getByTitle(/vote snippet/i);
    fireEvent.click(voteButton);
    
    expect(mockOnVote).toHaveBeenCalledWith('test-snippet-1');
  });

  it('does not call onVote when user is not authenticated', () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
        isAuthenticated={false}
      />
    );
    
    const voteButton = screen.getByTitle('Login to vote');
    fireEvent.click(voteButton);
    
    expect(mockOnVote).not.toHaveBeenCalled();
  });

  it('shows voted state when user has voted', () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
        isAuthenticated={true}
        hasUserVoted={true}
      />
    );
    
    const voteButton = screen.getByTitle('Remove vote');
    expect(voteButton).toHaveClass('voted');
  });

  it('disables vote button when loading', () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
        isAuthenticated={true}
        isLoading={true}
      />
    );
    
    const voteButton = screen.getByTitle(/upvote snippet/i);
    expect(voteButton).toBeDisabled();
  });

  it('renders empty state when snippet is null', () => {
    render(
      <SnippetDetail
        snippet={null}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
      />
    );
    
    expect(screen.getByText('Snippet not found')).toBeInTheDocument();
  });

  it('applies additional className when provided', () => {
    const { container } = render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('snippet-detail', 'custom-class');
  });

  it('handles copy button interactions correctly', async () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
      />
    );
    
    const copyButton = screen.getByTestId('copy-button');
    
    // Click the copy button
    fireEvent.click(copyButton);
    
    // Should call onCopy with the correct text
    expect(mockOnCopy).toHaveBeenCalledWith('<div>Hello World</div>');
  });

  it('shows correct tab button states', () => {
    render(
      <SnippetDetail
        snippet={mockSnippet}
        onCopy={mockOnCopy}
        onVote={mockOnVote}
      />
    );
    
    const previewTab = screen.getByText('Live Preview');
    const codeTab = screen.getByText('HTML Code');
    
    expect(previewTab).toHaveClass('active');
    expect(codeTab).not.toHaveClass('active');
    
    fireEvent.click(codeTab);
    
    expect(previewTab).not.toHaveClass('active');
    expect(codeTab).toHaveClass('active');
  });
});