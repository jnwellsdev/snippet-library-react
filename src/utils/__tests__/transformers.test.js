import { describe, it, expect, vi } from 'vitest';
import {
  timestampToDate,
  dateToTimestamp,
  formatDate,
  formatRelativeTime,
  normalizeSnippetData,
  normalizeUserData,
  normalizeVoteData,
  getDisplayNameFromEmail,
  truncateText,
  toTitleCase,
  formatTags,
} from '../transformers.js';

describe('Transformer Utilities', () => {
  describe('timestampToDate', () => {
    it('should return Date object as-is', () => {
      const date = new Date('2023-01-01');
      const result = timestampToDate(date);
      
      expect(result).toBe(date);
    });

    it('should convert Firebase Timestamp to Date', () => {
      const mockTimestamp = {
        toDate: () => new Date('2023-01-01'),
      };
      const result = timestampToDate(mockTimestamp);
      
      expect(result).toEqual(new Date('2023-01-01'));
    });

    it('should return null for invalid input', () => {
      expect(timestampToDate(null)).toBeNull();
      expect(timestampToDate(undefined)).toBeNull();
      expect(timestampToDate('invalid')).toBeNull();
      expect(timestampToDate(123)).toBeNull();
    });
  });

  describe('dateToTimestamp', () => {
    it('should return Date object for valid Date', () => {
      const date = new Date('2023-01-01');
      const result = dateToTimestamp(date);
      
      expect(result).toBe(date);
    });

    it('should return null for invalid input', () => {
      expect(dateToTimestamp(null)).toBeNull();
      expect(dateToTimestamp(undefined)).toBeNull();
      expect(dateToTimestamp('invalid')).toBeNull();
      expect(dateToTimestamp(123)).toBeNull();
    });
  });

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date('2023-01-15T10:30:00');
      const result = formatDate(date);
      
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2023');
    });

    it('should format Firebase Timestamp', () => {
      const mockTimestamp = {
        toDate: () => new Date('2023-01-15T10:30:00'),
      };
      const result = formatDate(mockTimestamp);
      
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2023');
    });

    it('should return default message for invalid input', () => {
      expect(formatDate(null)).toBe('Unknown date');
      expect(formatDate(undefined)).toBe('Unknown date');
      expect(formatDate('invalid')).toBe('Unknown date');
    });

    it('should use custom formatting options', () => {
      const date = new Date('2023-01-15T10:30:00');
      const result = formatDate(date, { year: '2-digit', month: 'numeric' });
      
      expect(result).toContain('23');
      expect(result).toContain('1');
    });

    it('should fallback to ISO date on formatting error', () => {
      const date = new Date('2023-01-15T10:30:00');
      
      // Mock toLocaleDateString to throw an error
      const originalToLocaleDateString = date.toLocaleDateString;
      date.toLocaleDateString = vi.fn(() => {
        throw new Error('Formatting error');
      });
      
      const result = formatDate(date);
      
      expect(result).toBe('2023-01-15');
      
      // Restore original method
      date.toLocaleDateString = originalToLocaleDateString;
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // Mock current time to 2023-01-15T12:00:00
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-01-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "Just now" for recent timestamps', () => {
      const recentDate = new Date('2023-01-15T11:59:30'); // 30 seconds ago
      const result = formatRelativeTime(recentDate);
      
      expect(result).toBe('Just now');
    });

    it('should return minutes for timestamps within an hour', () => {
      const minutesAgo = new Date('2023-01-15T11:45:00'); // 15 minutes ago
      const result = formatRelativeTime(minutesAgo);
      
      expect(result).toBe('15 minutes ago');
    });

    it('should return singular minute', () => {
      const oneMinuteAgo = new Date('2023-01-15T11:59:00'); // 1 minute ago
      const result = formatRelativeTime(oneMinuteAgo);
      
      expect(result).toBe('1 minute ago');
    });

    it('should return hours for timestamps within a day', () => {
      const hoursAgo = new Date('2023-01-15T09:00:00'); // 3 hours ago
      const result = formatRelativeTime(hoursAgo);
      
      expect(result).toBe('3 hours ago');
    });

    it('should return days for timestamps within a week', () => {
      const daysAgo = new Date('2023-01-13T12:00:00'); // 2 days ago
      const result = formatRelativeTime(daysAgo);
      
      expect(result).toBe('2 days ago');
    });

    it('should return formatted date for older timestamps', () => {
      const weekAgo = new Date('2023-01-01T12:00:00'); // 2 weeks ago
      const result = formatRelativeTime(weekAgo);
      
      expect(result).toContain('Jan');
      expect(result).toContain('1');
      expect(result).toContain('2023');
    });

    it('should handle Firebase Timestamp', () => {
      const mockTimestamp = {
        toDate: () => new Date('2023-01-15T11:45:00'),
      };
      const result = formatRelativeTime(mockTimestamp);
      
      expect(result).toBe('15 minutes ago');
    });

    it('should return default message for invalid input', () => {
      expect(formatRelativeTime(null)).toBe('Unknown time');
      expect(formatRelativeTime(undefined)).toBe('Unknown time');
    });
  });

  describe('normalizeSnippetData', () => {
    it('should normalize complete snippet data', () => {
      const rawData = {
        id: 'snippet123',
        title: '  Test Snippet  ',
        htmlContent: '<div>Hello</div>',
        authorId: 'user123',
        authorEmail: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        voteCount: '5',
        tags: ['html', 'test'],
      };
      
      const normalized = normalizeSnippetData(rawData);
      
      expect(normalized.id).toBe('snippet123');
      expect(normalized.title).toBe('Test Snippet');
      expect(normalized.voteCount).toBe(5);
      expect(normalized.tags).toEqual(['html', 'test']);
    });

    it('should handle missing optional fields', () => {
      const rawData = {
        title: 'Test',
        htmlContent: '<div>Hello</div>',
        authorId: 'user123',
        authorEmail: 'test@example.com',
      };
      
      const normalized = normalizeSnippetData(rawData);
      
      expect(normalized.id).toBeNull();
      expect(normalized.createdAt).toBeNull();
      expect(normalized.updatedAt).toBeNull();
      expect(normalized.voteCount).toBe(0);
      expect(normalized.tags).toEqual([]);
    });

    it('should handle invalid vote count', () => {
      const rawData = {
        title: 'Test',
        htmlContent: '<div>Hello</div>',
        authorId: 'user123',
        authorEmail: 'test@example.com',
        voteCount: 'invalid',
      };
      
      const normalized = normalizeSnippetData(rawData);
      
      expect(normalized.voteCount).toBe(0);
    });

    it('should handle non-array tags', () => {
      const rawData = {
        title: 'Test',
        htmlContent: '<div>Hello</div>',
        authorId: 'user123',
        authorEmail: 'test@example.com',
        tags: 'not-an-array',
      };
      
      const normalized = normalizeSnippetData(rawData);
      
      expect(normalized.tags).toEqual([]);
    });
  });

  describe('normalizeUserData', () => {
    it('should normalize complete user data', () => {
      const rawData = {
        id: 'user123',
        email: '  TEST@EXAMPLE.COM  ',
        displayName: '  Test User  ',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      
      const normalized = normalizeUserData(rawData);
      
      expect(normalized.id).toBe('user123');
      expect(normalized.email).toBe('test@example.com');
      expect(normalized.displayName).toBe('Test User');
    });

    it('should handle missing optional fields', () => {
      const rawData = {
        email: 'test@example.com',
      };
      
      const normalized = normalizeUserData(rawData);
      
      expect(normalized.id).toBeNull();
      expect(normalized.displayName).toBeNull();
      expect(normalized.createdAt).toBeNull();
      expect(normalized.lastLoginAt).toBeNull();
    });

    it('should handle empty displayName', () => {
      const rawData = {
        email: 'test@example.com',
        displayName: '',
      };
      
      const normalized = normalizeUserData(rawData);
      
      expect(normalized.displayName).toBeNull();
    });
  });

  describe('normalizeVoteData', () => {
    it('should normalize complete vote data', () => {
      const rawData = {
        id: 'vote123',
        snippetId: 'snippet123',
        userId: 'user123',
        createdAt: new Date(),
      };
      
      const normalized = normalizeVoteData(rawData);
      
      expect(normalized).toEqual(rawData);
    });

    it('should handle missing optional fields', () => {
      const rawData = {
        snippetId: 'snippet123',
        userId: 'user123',
      };
      
      const normalized = normalizeVoteData(rawData);
      
      expect(normalized.id).toBeNull();
      expect(normalized.createdAt).toBeNull();
    });
  });

  describe('getDisplayNameFromEmail', () => {
    it('should extract display name from email', () => {
      expect(getDisplayNameFromEmail('john.doe@example.com')).toBe('John.doe');
      expect(getDisplayNameFromEmail('test@example.com')).toBe('Test');
      expect(getDisplayNameFromEmail('user123@domain.org')).toBe('User123');
    });

    it('should handle invalid input', () => {
      expect(getDisplayNameFromEmail('')).toBe('Anonymous');
      expect(getDisplayNameFromEmail(null)).toBe('Anonymous');
      expect(getDisplayNameFromEmail(undefined)).toBe('Anonymous');
      expect(getDisplayNameFromEmail(123)).toBe('Anonymous');
    });

    it('should handle email without @ symbol', () => {
      expect(getDisplayNameFromEmail('invalid-email')).toBe('Invalid-email');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const result = truncateText(longText, 20);
      
      expect(result).toBe('This is a very lo...');
      expect(result.length).toBe(20);
    });

    it('should return original text if within limit', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);
      
      expect(result).toBe(shortText);
    });

    it('should use custom suffix', () => {
      const longText = 'This is a long text';
      const result = truncateText(longText, 15, ' [more]');
      
      expect(result).toBe('This is  [more]');
    });

    it('should handle invalid input', () => {
      expect(truncateText(null)).toBe('');
      expect(truncateText(undefined)).toBe('');
      expect(truncateText(123)).toBe('');
      expect(truncateText('')).toBe('');
    });

    it('should handle edge case where maxLength equals suffix length', () => {
      const result = truncateText('Hello World', 3, '...');
      
      expect(result).toBe('...');
    });
  });

  describe('toTitleCase', () => {
    it('should convert simple text to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
    });

    it('should handle mixed case input', () => {
      expect(toTitleCase('hElLo WoRlD')).toBe('Hello World');
    });

    it('should handle single words', () => {
      expect(toTitleCase('javascript')).toBe('Javascript');
    });

    it('should handle empty strings', () => {
      expect(toTitleCase('')).toBe('');
    });

    it('should handle null/undefined input', () => {
      expect(toTitleCase(null)).toBe('');
      expect(toTitleCase(undefined)).toBe('');
    });

    it('should handle non-string input', () => {
      expect(toTitleCase(123)).toBe('');
    });

    it('should handle multiple spaces', () => {
      expect(toTitleCase('hello  world')).toBe('Hello  World');
    });

    it('should handle hyphenated words', () => {
      expect(toTitleCase('front-end development')).toBe('Front-end Development');
    });
  });

  describe('formatTags', () => {
    it('should format array of tags to title case', () => {
      const tags = ['javascript', 'react', 'html css'];
      const expected = ['Javascript', 'React', 'Html Css'];
      expect(formatTags(tags)).toEqual(expected);
    });

    it('should filter out empty strings', () => {
      const tags = ['javascript', '', 'react', '   ', 'html'];
      const expected = ['Javascript', 'React', 'Html'];
      expect(formatTags(tags)).toEqual(expected);
    });

    it('should trim whitespace', () => {
      const tags = ['  javascript  ', 'react ', ' html'];
      const expected = ['Javascript', 'React', 'Html'];
      expect(formatTags(tags)).toEqual(expected);
    });

    it('should handle non-array input', () => {
      expect(formatTags(null)).toEqual([]);
      expect(formatTags(undefined)).toEqual([]);
      expect(formatTags('not an array')).toEqual([]);
    });

    it('should filter out non-string elements', () => {
      const tags = ['javascript', 123, 'react', null, 'html'];
      const expected = ['Javascript', 'React', 'Html'];
      expect(formatTags(tags)).toEqual(expected);
    });

    it('should handle mixed case and preserve multiple words', () => {
      const tags = ['front-end development', 'WEB dEsIgN', 'user experience'];
      const expected = ['Front-end Development', 'Web Design', 'User Experience'];
      expect(formatTags(tags)).toEqual(expected);
    });
  });
});