import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  validateString,
  validateHtmlContent,
  sanitizeHtml,
  validateStringArray,
  validateTimestamp,
} from '../validation.js';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
      expect(isValidEmail('123@numbers.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail(123)).toBe(false);
    });
  });

  describe('validateString', () => {
    it('should validate a valid string with default options', () => {
      const result = validateString('Hello World');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty string when required', () => {
      const result = validateString('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field is required and must be a string');
    });

    it('should reject non-string values', () => {
      const result = validateString(123);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field is required and must be a string');
    });

    it('should validate string length constraints', () => {
      const shortResult = validateString('Hi', { minLength: 5 });
      expect(shortResult.isValid).toBe(false);
      expect(shortResult.errors).toContain('Field must be at least 5 characters long');

      const longResult = validateString('This is too long', { maxLength: 10 });
      expect(longResult.isValid).toBe(false);
      expect(longResult.errors).toContain('Field must be 10 characters or less');
    });

    it('should handle optional fields', () => {
      const result = validateString(null, { required: false });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should trim whitespace for validation', () => {
      const result = validateString('  valid  ', { minLength: 5 });
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateHtmlContent', () => {
    it('should validate safe HTML content', () => {
      const result = validateHtmlContent('<div>Hello World</div>');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty HTML content', () => {
      const result = validateHtmlContent('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('HTML content is required and must be a string');
    });

    it('should reject non-string HTML content', () => {
      const result = validateHtmlContent(123);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('HTML content is required and must be a string');
    });

    it('should detect dangerous script tags', () => {
      const result = validateHtmlContent('<div>Hello</div><script>alert("xss")</script>');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('HTML content contains potentially unsafe elements');
    });

    it('should detect dangerous event handlers', () => {
      const result = validateHtmlContent('<div onclick="alert(\'xss\')">Hello</div>');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('HTML content contains potentially unsafe elements');
    });

    it('should detect javascript: URLs', () => {
      const result = validateHtmlContent('<a href="javascript:alert(\'xss\')">Click</a>');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('HTML content contains potentially unsafe elements');
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const html = '<div>Hello</div><script>alert("xss")</script><p>World</p>';
      const sanitized = sanitizeHtml(html);
      
      expect(sanitized).toBe('<div>Hello</div><p>World</p>');
      expect(sanitized).not.toContain('<script>');
    });

    it('should remove event handlers', () => {
      const html = '<div onclick="alert(\'xss\')" onmouseover="doSomething()">Hello</div>';
      const sanitized = sanitizeHtml(html);
      
      expect(sanitized).toBe('<div>Hello</div>');
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('onmouseover');
    });

    it('should remove javascript: URLs', () => {
      const html = '<a href="javascript:alert(\'xss\')">Click me</a>';
      const sanitized = sanitizeHtml(html);
      
      expect(sanitized).not.toContain('javascript:');
    });

    it('should preserve safe HTML', () => {
      const safeHtml = '<div class="container"><h1>Title</h1><p>Content</p></div>';
      const sanitized = sanitizeHtml(safeHtml);
      
      expect(sanitized).toBe(safeHtml);
    });

    it('should handle empty or invalid input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
      expect(sanitizeHtml(123)).toBe('');
    });
  });

  describe('validateStringArray', () => {
    it('should validate a valid string array', () => {
      const result = validateStringArray(['tag1', 'tag2', 'tag3']);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-array input', () => {
      const result = validateStringArray('not-an-array');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field must be an array');
    });

    it('should reject arrays with too many items', () => {
      const largeArray = Array(15).fill('tag');
      const result = validateStringArray(largeArray, { maxItems: 10 });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Array can contain at most 10 items');
    });

    it('should reject arrays with non-string items', () => {
      const result = validateStringArray(['valid', 123, 'also-valid']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('All array items must be strings');
    });

    it('should reject arrays with items that are too long', () => {
      const longString = 'a'.repeat(60);
      const result = validateStringArray(['short', longString], { maxItemLength: 50 });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Array items must be 50 characters or less');
    });

    it('should validate empty array', () => {
      const result = validateStringArray([]);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateTimestamp', () => {
    it('should validate a valid Date object', () => {
      const result = validateTimestamp(new Date());
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a Firebase Timestamp-like object', () => {
      const mockTimestamp = {
        toDate: () => new Date(),
      };
      const result = validateTimestamp(mockTimestamp);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid Date objects', () => {
      const result = validateTimestamp(new Date('invalid'));
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Timestamp must be a valid Date object or Firebase Timestamp');
    });

    it('should reject non-timestamp values', () => {
      const result = validateTimestamp('not-a-timestamp');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Timestamp must be a valid Date object or Firebase Timestamp');
    });

    it('should handle optional timestamps', () => {
      const result = validateTimestamp(null, false);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject null when required', () => {
      const result = validateTimestamp(null, true);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Timestamp is required');
    });
  });
});