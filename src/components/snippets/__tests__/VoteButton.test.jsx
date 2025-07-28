import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import VoteButton from '../VoteButton';
import { useAuth } from '../../../contexts/AuthContext';
import { toggleVote, getUserVote, listenToSnippet } from '../../../services/firestoreService';
import { Vote } from '../../../models';

// Mock the dependencies
vi.mock('../../../contexts/AuthContext');
vi.mock('../../../services/firestoreService');
vi.mock('../../../models');

describe('VoteButton', () => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
  };

  const mockSnippet = {
    id: 'snippet123',
    voteCount: 5,
  };

  const mockUseAuth = vi.mocked(useAuth);
  const mockToggleVote = vi.mocked(toggleVote);
  const mockGetUserVote = vi.mocked(getUserVote);
  const mockListenToSnippet = vi.mocked(listenToSnippet);
  const mockVote = vi.mocked(Vote);

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    mockGetUserVote.mockResolvedValue(null);
    mockListenToSnippet.mockImplementation((snippetId, callback) => {
      // Simulate initial call
      callback({ id: snippetId, voteCount: 5 });
      // Return unsubscribe function
      return vi.fn();
    });

    mockVote.mockImplementation((data) => ({
      ...data,
      validate: () => ({ isValid: true, errors: [] }),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders vote button with initial vote count', () => {
      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={mockSnippet.voteCount} 
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={0}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('vote-button', 'custom-class');
    });

    it('shows correct aria-label for unvoted state', () => {
      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Upvote snippet (current count: 5)');
    });

    it('shows correct title for unauthenticated user', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Please log in to vote');
    });
  });

  describe('Authentication State', () => {
    it('disables button when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('enables button when user is authenticated', () => {
      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('User Vote Status', () => {
    it('checks user vote status on mount', async () => {
      mockGetUserVote.mockResolvedValue({ id: 'vote123', userId: mockUser.id, snippetId: mockSnippet.id });

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      await waitFor(() => {
        expect(mockGetUserVote).toHaveBeenCalledWith(mockUser.id, mockSnippet.id);
      });

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('voted');
      });
    });

    it('does not check vote status when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      expect(mockGetUserVote).not.toHaveBeenCalled();
    });

    it('updates vote status when user changes', async () => {
      const { rerender } = render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      // Change user
      const newUser = { id: 'user456', email: 'new@example.com' };
      mockUseAuth.mockReturnValue({
        user: newUser,
        isAuthenticated: true,
      });

      rerender(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      await waitFor(() => {
        expect(mockGetUserVote).toHaveBeenCalledWith(newUser.id, mockSnippet.id);
      });
    });
  });

  describe('Real-time Updates', () => {
    it('sets up real-time listener on mount', () => {
      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      expect(mockListenToSnippet).toHaveBeenCalledWith(
        mockSnippet.id,
        expect.any(Function)
      );
    });

    it('updates vote count from real-time listener', async () => {
      mockListenToSnippet.mockImplementation((snippetId, callback) => {
        // Simulate real-time update
        setTimeout(() => {
          callback({ id: snippetId, voteCount: 10 });
        }, 100);
        return vi.fn();
      });

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument();
      });
    });

    it('calls onVoteChange callback when vote count changes', async () => {
      const onVoteChange = vi.fn();
      
      mockListenToSnippet.mockImplementation((snippetId, callback) => {
        setTimeout(() => {
          callback({ id: snippetId, voteCount: 8 });
        }, 100);
        return vi.fn();
      });

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5}
          onVoteChange={onVoteChange}
        />
      );

      await waitFor(() => {
        expect(onVoteChange).toHaveBeenCalledWith(8);
      });
    });

    it('cleans up listener on unmount', () => {
      const unsubscribe = vi.fn();
      mockListenToSnippet.mockReturnValue(unsubscribe);

      const { unmount } = render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Voting Functionality', () => {
    it('creates vote when user clicks and has not voted', async () => {
      mockToggleVote.mockResolvedValue({ action: 'added', voteId: 'vote123' });

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockVote).toHaveBeenCalledWith({
          id: `${mockUser.id}_${mockSnippet.id}`,
          snippetId: mockSnippet.id,
          userId: mockUser.id,
        });
      });

      expect(mockToggleVote).toHaveBeenCalled();
    });

    it('removes vote when user clicks and has already voted', async () => {
      mockGetUserVote.mockResolvedValue({ id: 'vote123', userId: mockUser.id, snippetId: mockSnippet.id });
      mockToggleVote.mockResolvedValue({ action: 'removed', voteId: 'vote123' });

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      // Wait for initial vote check
      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('voted');
      });

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockToggleVote).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(button).not.toHaveClass('voted');
      });
    });

    it('shows loading state during vote operation', async () => {
      let resolveToggleVote;
      mockToggleVote.mockReturnValue(
        new Promise((resolve) => {
          resolveToggleVote = resolve;
        })
      );

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveClass('loading');
        expect(button).toBeDisabled();
      });

      // Resolve the promise
      resolveToggleVote({ action: 'added', voteId: 'vote123' });

      await waitFor(() => {
        expect(button).not.toHaveClass('loading');
        expect(button).not.toBeDisabled();
      });
    });

    it('does not vote when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      const button = screen.getByRole('button');
      
      // Button should be disabled for unauthenticated users
      expect(button).toBeDisabled();
      
      // Click event should not trigger vote
      fireEvent.click(button);
      expect(mockToggleVote).not.toHaveBeenCalled();
    });

    it('shows error when user information is not available', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: true,
      });

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('User information not available')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when vote operation fails', async () => {
      mockToggleVote.mockRejectedValue(new Error('Network error'));

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Failed to update vote. Please try again.')).toBeInTheDocument();
      });
    });

    it('allows user to dismiss error message', async () => {
      mockToggleVote.mockRejectedValue(new Error('Network error'));

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Failed to update vote. Please try again.')).toBeInTheDocument();
      });

      const dismissButton = screen.getByLabelText('Dismiss error');
      fireEvent.click(dismissButton);

      expect(screen.queryByText('Failed to update vote. Please try again.')).not.toBeInTheDocument();
    });

    it('handles getUserVote errors gracefully', async () => {
      mockGetUserVote.mockRejectedValue(new Error('Database error'));

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      // Should not crash and should default to not voted
      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).not.toHaveClass('voted');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('title');
    });

    it('updates ARIA label when vote state changes', async () => {
      mockGetUserVote.mockResolvedValue({ id: 'vote123', userId: mockUser.id, snippetId: mockSnippet.id });

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Remove vote (current count: 5)');
      });
    });

    it('error message has proper role', async () => {
      mockToggleVote.mockRejectedValue(new Error('Network error'));

      render(
        <VoteButton 
          snippetId={mockSnippet.id} 
          initialVoteCount={5} 
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});