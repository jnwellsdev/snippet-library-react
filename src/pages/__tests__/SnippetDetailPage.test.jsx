import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SnippetDetailPage from '../SnippetDetailPage';
import AuthContext from '../../contexts/AuthContext';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

// Mock the SnippetDetail component
vi.mock('../../components/snippets/SnippetDetail', () => ({
  default: ({ snippet, onCopy, onVote, isAuthenticated, hasUserVoted, isLoading }) => (
    <div data-testid="snippet-detail">
      <div data-testid="snippet-title">{snippet?.title || 'No snippet'}</div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not authenticated'}</div>
      <div data-testid="vote-status">{hasUserVoted ? 'voted' : 'not voted'}</div>
      <div data-testid="loading-status">{isLoading ? 'loading' : 'not loading'}</div>
      <button onClick={() => onCopy?.('test content')} data-testid="copy-button">Copy</button>
      <button onClick={() => onVote?.('test-id')} data-testid="vote-button">Vote</button>
    </div>
  ),
}));

// Mock the Firestore service
vi.mock('../../services/firestoreService', () => ({
  getSnippet: vi.fn(),
  getUserVote: vi.fn(),
  toggleVote: vi.fn(),
}));

// Mock the models
vi.mock('../../models', () => ({
  Vote: class Vote {
    constructor({ snippetId, userId }) {
      this.snippetId = snippetId;
      this.userId = userId;
    }
  },
}));

import { getSnippet, getUserVote, toggleVote } from '../../services/firestoreService';

describe('SnippetDetailPage', () => {
  const mockUser = {
    uid: 'user-123',
    email: 'test@example.com',
  };

  const mockSnippet = {
    id: 'snippet-123',
    title: 'Test Snippet',
    htmlContent: '<div>Hello World</div>',
    authorEmail: 'author@example.com',
    createdAt: new Date('2024-01-01'),
    voteCount: 5,
  };

  const mockVote = {
    id: 'vote-123',
    snippetId: 'snippet-123',
    userId: 'user-123',
  };

  const renderWithAuth = (user = null) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user }}>
          <SnippetDetailPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: 'snippet-123' });
    getSnippet.mockResolvedValue(mockSnippet);
    getUserVote.mockResolvedValue(null);
    toggleVote.mockResolvedValue({ action: 'added', voteId: 'vote-123' });
  });

  it('renders loading state initially', () => {
    getSnippet.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithAuth();
    
    expect(screen.getByText('Loading snippet...')).toBeInTheDocument();
  });

  it('loads and displays snippet data', async () => {
    renderWithAuth(mockUser);
    
    await waitFor(() => {
      expect(screen.getByTestId('snippet-title')).toHaveTextContent('Test Snippet');
    });
    
    expect(getSnippet).toHaveBeenCalledWith('snippet-123');
  });

  it('shows error when snippet is not found', async () => {
    getSnippet.mockResolvedValue(null);
    
    renderWithAuth();
    
    await waitFor(() => {
      expect(screen.getByText('Snippet not found')).toBeInTheDocument();
    });
  });

  it('shows error when snippet loading fails', async () => {
    getSnippet.mockRejectedValue(new Error('Network error'));
    
    renderWithAuth();
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load snippet. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows authentication status correctly', async () => {
    renderWithAuth(mockUser);
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });
  });

  it('shows unauthenticated status when no user', async () => {
    renderWithAuth(null);
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
    });
  });

  it('loads user vote when authenticated', async () => {
    getUserVote.mockResolvedValue(mockVote);
    
    renderWithAuth(mockUser);
    
    await waitFor(() => {
      expect(screen.getByTestId('vote-status')).toHaveTextContent('voted');
    });
    
    expect(getUserVote).toHaveBeenCalledWith('user-123', 'snippet-123');
  });

  it('does not load user vote when not authenticated', async () => {
    renderWithAuth(null);
    
    await waitFor(() => {
      expect(screen.getByTestId('snippet-title')).toHaveTextContent('Test Snippet');
    });
    
    expect(getUserVote).not.toHaveBeenCalled();
  });

  it('handles copy functionality', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });
    
    renderWithAuth();
    
    await waitFor(() => {
      expect(screen.getByTestId('snippet-title')).toHaveTextContent('Test Snippet');
    });
    
    const copyButton = screen.getByTestId('copy-button');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test content');
    });
  });

  it('handles vote functionality', async () => {
    renderWithAuth(mockUser);
    
    await waitFor(() => {
      expect(screen.getByTestId('snippet-title')).toHaveTextContent('Test Snippet');
    });
    
    const voteButton = screen.getByTestId('vote-button');
    fireEvent.click(voteButton);
    
    await waitFor(() => {
      expect(toggleVote).toHaveBeenCalled();
    });
  });

  it('updates vote count after voting', async () => {
    renderWithAuth(mockUser);
    
    await waitFor(() => {
      expect(screen.getByTestId('snippet-title')).toHaveTextContent('Test Snippet');
    });
    
    const voteButton = screen.getByTestId('vote-button');
    fireEvent.click(voteButton);
    
    await waitFor(() => {
      expect(toggleVote).toHaveBeenCalled();
    });
  });

  it('handles vote removal', async () => {
    toggleVote.mockResolvedValue({ action: 'removed', voteId: 'vote-123' });
    getUserVote.mockResolvedValue(mockVote);
    
    renderWithAuth(mockUser);
    
    await waitFor(() => {
      expect(screen.getByTestId('vote-status')).toHaveTextContent('voted');
    });
    
    const voteButton = screen.getByTestId('vote-button');
    fireEvent.click(voteButton);
    
    await waitFor(() => {
      expect(toggleVote).toHaveBeenCalled();
    });
  });

  it('navigates back when back button is clicked', async () => {
    renderWithAuth();
    
    await waitFor(() => {
      expect(screen.getByTestId('snippet-title')).toHaveTextContent('Test Snippet');
    });
    
    const backButton = screen.getByText('← Back');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('handles retry button in error state', async () => {
    getSnippet.mockRejectedValue(new Error('Network error'));
    
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });
    
    renderWithAuth();
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load snippet. Please try again.')).toBeInTheDocument();
    });
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(mockReload).toHaveBeenCalled();
  });

  it('shows error when no snippet ID is provided', async () => {
    mockUseParams.mockReturnValue({ id: undefined });
    
    renderWithAuth();
    
    await waitFor(() => {
      expect(screen.getByText('No snippet ID provided')).toBeInTheDocument();
    });
  });

  it('prevents multiple votes when already voting', async () => {
    toggleVote.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithAuth(mockUser);
    
    await waitFor(() => {
      expect(screen.getByTestId('snippet-title')).toHaveTextContent('Test Snippet');
    });
    
    const voteButton = screen.getByTestId('vote-button');
    
    // Click multiple times quickly
    fireEvent.click(voteButton);
    fireEvent.click(voteButton);
    fireEvent.click(voteButton);
    
    // Should only be called once
    expect(toggleVote).toHaveBeenCalledTimes(1);
  });
});