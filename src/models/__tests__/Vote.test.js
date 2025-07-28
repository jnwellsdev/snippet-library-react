import { describe, it, expect } from 'vitest';
import { Vote } from '../Vote.js';

describe('Vote Model', () => {
  const validVoteData = {
    id: 'vote123',
    snippetId: 'snippet123',
    userId: 'user123',
    createdAt: new Date(),
  };

  describe('constructor', () => {
    it('should create a Vote instance with all properties', () => {
      const vote = new Vote(validVoteData);
      
      expect(vote.id).toBe(validVoteData.id);
      expect(vote.snippetId).toBe(validVoteData.snippetId);
      expect(vote.userId).toBe(validVoteData.userId);
      expect(vote.createdAt).toBe(validVoteData.createdAt);
    });

    it('should create a Vote instance with default values', () => {
      const minimalData = {
        id: 'vote123',
        snippetId: 'snippet123',
        userId: 'user123',
      };
      
      const vote = new Vote(minimalData);
      
      expect(vote.id).toBe(minimalData.id);
      expect(vote.snippetId).toBe(minimalData.snippetId);
      expect(vote.userId).toBe(minimalData.userId);
      expect(vote.createdAt).toBeNull();
    });
  });

  describe('fromFirestore', () => {
    it('should create Vote instance from Firestore data', () => {
      const firestoreData = {
        snippetId: 'snippet123',
        userId: 'user123',
        createdAt: new Date(),
      };
      
      const vote = Vote.fromFirestore('vote123', firestoreData);
      
      expect(vote.id).toBe('vote123');
      expect(vote.snippetId).toBe(firestoreData.snippetId);
      expect(vote.userId).toBe(firestoreData.userId);
      expect(vote.createdAt).toBe(firestoreData.createdAt);
    });
  });

  describe('toFirestore', () => {
    it('should convert Vote instance to Firestore data', () => {
      const vote = new Vote(validVoteData);
      const firestoreData = vote.toFirestore();
      
      expect(firestoreData).toEqual({
        snippetId: validVoteData.snippetId,
        userId: validVoteData.userId,
        createdAt: validVoteData.createdAt,
      });
      expect(firestoreData.id).toBeUndefined();
    });
  });

  describe('validate', () => {
    it('should validate a valid vote', () => {
      const vote = new Vote(validVoteData);
      const validation = vote.validate();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject missing snippet ID', () => {
      const vote = new Vote({
        ...validVoteData,
        snippetId: '',
      });
      const validation = vote.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Snippet ID is required and must be a string');
    });

    it('should reject non-string snippet ID', () => {
      const vote = new Vote({
        ...validVoteData,
        snippetId: 123,
      });
      const validation = vote.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Snippet ID is required and must be a string');
    });

    it('should reject missing user ID', () => {
      const vote = new Vote({
        ...validVoteData,
        userId: '',
      });
      const validation = vote.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('User ID is required and must be a string');
    });

    it('should reject non-string user ID', () => {
      const vote = new Vote({
        ...validVoteData,
        userId: 123,
      });
      const validation = vote.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('User ID is required and must be a string');
    });
  });

  describe('getCompositeId', () => {
    it('should generate composite ID from user and snippet IDs', () => {
      const vote = new Vote(validVoteData);
      const compositeId = vote.getCompositeId();
      
      expect(compositeId).toBe('user123_snippet123');
    });

    it('should handle empty IDs', () => {
      const vote = new Vote({
        id: 'vote123',
        snippetId: '',
        userId: '',
      });
      const compositeId = vote.getCompositeId();
      
      expect(compositeId).toBe('_');
    });
  });
});