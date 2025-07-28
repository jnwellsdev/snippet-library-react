import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  voteOnSnippet,
  hasUserVoted,
  getVotesForSnippet,
  getVoteCount,
  getUserVoteForSnippet,
} from '../voteService';
import { toggleVote, getUserVote, getSnippetVotes } from '../firestoreService';
import { Vote } from '../../models';

// Mock dependencies
vi.mock('../firestoreService');
vi.mock('../../models');

describe('voteService', () => {
  const mockUserId = 'user123';
  const mockSnippetId = 'snippet123';
  const mockVoteId = `${mockUserId}_${mockSnippetId}`;

  const mockToggleVote = vi.mocked(toggleVote);
  const mockGetUserVote = vi.mocked(getUserVote);
  const mockGetSnippetVotes = vi.mocked(getSnippetVotes);
  const mockVote = vi.mocked(Vote);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for Vote constructor
    mockVote.mockImplementation((data) => ({
      ...data,
      validate: () => ({ isValid: true, errors: [] }),
    }));
  });

  describe('voteOnSnippet', () => {
    it('creates a vote and calls toggleVote', async () => {
      const mockResult = { action: 'added', voteId: mockVoteId };
      mockToggleVote.mockResolvedValue(mockResult);

      const result = await voteOnSnippet(mockUserId, mockSnippetId);

      expect(mockVote).toHaveBeenCalledWith({
        id: mockVoteId,
        snippetId: mockSnippetId,
        userId: mockUserId,
      });

      expect(mockToggleVote).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockVoteId,
          snippetId: mockSnippetId,
          userId: mockUserId,
        })
      );

      expect(result).toEqual(mockResult);
    });

    it('throws error when userId is missing', async () => {
      await expect(voteOnSnippet(null, mockSnippetId)).rejects.toThrow(
        'User ID and Snippet ID are required'
      );
    });

    it('throws error when snippetId is missing', async () => {
      await expect(voteOnSnippet(mockUserId, null)).rejects.toThrow(
        'User ID and Snippet ID are required'
      );
    });

    it('throws error when both userId and snippetId are missing', async () => {
      await expect(voteOnSnippet(null, null)).rejects.toThrow(
        'User ID and Snippet ID are required'
      );
    });

    it('propagates errors from toggleVote', async () => {
      const error = new Error('Database error');
      mockToggleVote.mockRejectedValue(error);

      await expect(voteOnSnippet(mockUserId, mockSnippetId)).rejects.toThrow('Database error');
    });
  });

  describe('hasUserVoted', () => {
    it('returns true when user has voted', async () => {
      const mockVoteData = { id: mockVoteId, userId: mockUserId, snippetId: mockSnippetId };
      mockGetUserVote.mockResolvedValue(mockVoteData);

      const result = await hasUserVoted(mockUserId, mockSnippetId);

      expect(mockGetUserVote).toHaveBeenCalledWith(mockUserId, mockSnippetId);
      expect(result).toBe(true);
    });

    it('returns false when user has not voted', async () => {
      mockGetUserVote.mockResolvedValue(null);

      const result = await hasUserVoted(mockUserId, mockSnippetId);

      expect(mockGetUserVote).toHaveBeenCalledWith(mockUserId, mockSnippetId);
      expect(result).toBe(false);
    });

    it('returns false when userId is missing', async () => {
      const result = await hasUserVoted(null, mockSnippetId);

      expect(mockGetUserVote).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('returns false when snippetId is missing', async () => {
      const result = await hasUserVoted(mockUserId, null);

      expect(mockGetUserVote).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('returns false when both userId and snippetId are missing', async () => {
      const result = await hasUserVoted(null, null);

      expect(mockGetUserVote).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('returns false and logs error when getUserVote fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetUserVote.mockRejectedValue(new Error('Database error'));

      const result = await hasUserVoted(mockUserId, mockSnippetId);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error checking user vote:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('getVotesForSnippet', () => {
    it('returns votes for a snippet', async () => {
      const mockVotes = [
        { id: 'vote1', userId: 'user1', snippetId: mockSnippetId },
        { id: 'vote2', userId: 'user2', snippetId: mockSnippetId },
      ];
      mockGetSnippetVotes.mockResolvedValue(mockVotes);

      const result = await getVotesForSnippet(mockSnippetId);

      expect(mockGetSnippetVotes).toHaveBeenCalledWith(mockSnippetId);
      expect(result).toEqual(mockVotes);
    });

    it('throws error when snippetId is missing', async () => {
      await expect(getVotesForSnippet(null)).rejects.toThrow(
        'Snippet ID is required'
      );
    });

    it('throws error when snippetId is empty string', async () => {
      await expect(getVotesForSnippet('')).rejects.toThrow(
        'Snippet ID is required'
      );
    });

    it('propagates errors from getSnippetVotes', async () => {
      const error = new Error('Database error');
      mockGetSnippetVotes.mockRejectedValue(error);

      await expect(getVotesForSnippet(mockSnippetId)).rejects.toThrow('Database error');
    });
  });

  describe('getVoteCount', () => {
    it('returns vote count for a snippet', async () => {
      const mockVotes = [
        { id: 'vote1', userId: 'user1', snippetId: mockSnippetId },
        { id: 'vote2', userId: 'user2', snippetId: mockSnippetId },
        { id: 'vote3', userId: 'user3', snippetId: mockSnippetId },
      ];
      mockGetSnippetVotes.mockResolvedValue(mockVotes);

      const result = await getVoteCount(mockSnippetId);

      expect(mockGetSnippetVotes).toHaveBeenCalledWith(mockSnippetId);
      expect(result).toBe(3);
    });

    it('returns 0 when no votes exist', async () => {
      mockGetSnippetVotes.mockResolvedValue([]);

      const result = await getVoteCount(mockSnippetId);

      expect(result).toBe(0);
    });

    it('returns 0 and logs error when getSnippetVotes fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetSnippetVotes.mockRejectedValue(new Error('Database error'));

      const result = await getVoteCount(mockSnippetId);

      expect(result).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('Error getting vote count:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('getUserVoteForSnippet', () => {
    it('returns user vote when it exists', async () => {
      const mockVoteData = { id: mockVoteId, userId: mockUserId, snippetId: mockSnippetId };
      mockGetUserVote.mockResolvedValue(mockVoteData);

      const result = await getUserVoteForSnippet(mockUserId, mockSnippetId);

      expect(mockGetUserVote).toHaveBeenCalledWith(mockUserId, mockSnippetId);
      expect(result).toEqual(mockVoteData);
    });

    it('returns null when user has not voted', async () => {
      mockGetUserVote.mockResolvedValue(null);

      const result = await getUserVoteForSnippet(mockUserId, mockSnippetId);

      expect(mockGetUserVote).toHaveBeenCalledWith(mockUserId, mockSnippetId);
      expect(result).toBe(null);
    });

    it('returns null when userId is missing', async () => {
      const result = await getUserVoteForSnippet(null, mockSnippetId);

      expect(mockGetUserVote).not.toHaveBeenCalled();
      expect(result).toBe(null);
    });

    it('returns null when snippetId is missing', async () => {
      const result = await getUserVoteForSnippet(mockUserId, null);

      expect(mockGetUserVote).not.toHaveBeenCalled();
      expect(result).toBe(null);
    });

    it('returns null when both userId and snippetId are missing', async () => {
      const result = await getUserVoteForSnippet(null, null);

      expect(mockGetUserVote).not.toHaveBeenCalled();
      expect(result).toBe(null);
    });

    it('propagates errors from getUserVote', async () => {
      const error = new Error('Database error');
      mockGetUserVote.mockRejectedValue(error);

      await expect(getUserVoteForSnippet(mockUserId, mockSnippetId)).rejects.toThrow('Database error');
    });
  });
});