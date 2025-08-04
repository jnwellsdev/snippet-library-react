
import { toggleVote, getUserVote, getSnippetVotes } from './firestoreService';
import { Vote } from '../models';

// Vote on a snippet (toggle)
export const voteOnSnippet = async (userId, snippetId) => {
  if (!userId || !snippetId) {
    throw new Error('User ID and Snippet ID are required');
  }

  const vote = new Vote({
    id: `${userId}_${snippetId}`,
    snippetId,
    userId,
  });

  return await toggleVote(vote);
};

// Check if user voted

export const hasUserVoted = async (userId, snippetId) => {
  if (!userId || !snippetId) {
    return false;
  }

  try {
    const vote = await getUserVote(userId, snippetId);
    return !!vote;
  } catch (error) {
    console.error('Error checking user vote:', error);
    return false;
  }
};

 // Get all votes 
 
export const getVotesForSnippet = async (snippetId) => {
  if (!snippetId) {
    throw new Error('Snippet ID is required');
  }

  return await getSnippetVotes(snippetId);
};

// Get vote count 
export const getVoteCount = async (snippetId) => {
  try {
    const votes = await getVotesForSnippet(snippetId);
    return votes.length;
  } catch (error) {
    console.error('Error getting vote count:', error);
    return 0;
  }
};

// Get user's vote 
export const getUserVoteForSnippet = async (userId, snippetId) => {
  if (!userId || !snippetId) {
    return null;
  }

  return await getUserVote(userId, snippetId);
};