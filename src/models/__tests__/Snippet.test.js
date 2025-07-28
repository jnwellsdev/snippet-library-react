import { describe, it, expect } from 'vitest';
import { Snippet } from '../Snippet.js';

describe('Snippet Model', () => {
  const validSnippetData = {
    id: 'snippet123',
    title: 'Test Snippet',
    htmlContent: '<div>Hello World</div>',
    authorId: 'user123',
    authorEmail: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    voteCount: 5,
    tags: ['html', 'test'],
  };

  describe('constructor', () => {
    it('should create a Snippet instance with all properties', () => {
      const snippet = new Snippet(validSnippetData);
      
      expect(snippet.id).toBe(validSnippetData.id);
      expect(snippet.title).toBe(validSnippetData.title);
      expect(snippet.htmlContent).toBe(validSnippetData.htmlContent);
      expect(snippet.authorId).toBe(validSnippetData.authorId);
      expect(snippet.authorEmail).toBe(validSnippetData.authorEmail);
      expect(snippet.createdAt).toBe(validSnippetData.createdAt);
      expect(snippet.updatedAt).toBe(validSnippetData.updatedAt);
      expect(snippet.voteCount).toBe(validSnippetData.voteCount);
      expect(snippet.tags).toEqual(validSnippetData.tags);
    });

    it('should create a Snippet instance with default values', () => {
      const minimalData = {
        id: 'snippet123',
        title: 'Test Snippet',
        htmlContent: '<div>Hello World</div>',
        authorId: 'user123',
        authorEmail: 'test@example.com',
      };
      
      const snippet = new Snippet(minimalData);
      
      expect(snippet.voteCount).toBe(0);
      expect(snippet.tags).toEqual([]);
      expect(snippet.createdAt).toBeNull();
      expect(snippet.updatedAt).toBeNull();
    });
  });

  describe('fromFirestore', () => {
    it('should create Snippet instance from Firestore data', () => {
      const firestoreData = {
        title: 'Test Snippet',
        htmlContent: '<div>Hello World</div>',
        authorId: 'user123',
        authorEmail: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        voteCount: 5,
        tags: ['html', 'test'],
      };
      
      const snippet = Snippet.fromFirestore('snippet123', firestoreData);
      
      expect(snippet.id).toBe('snippet123');
      expect(snippet.title).toBe(firestoreData.title);
      expect(snippet.htmlContent).toBe(firestoreData.htmlContent);
      expect(snippet.voteCount).toBe(firestoreData.voteCount);
      expect(snippet.tags).toEqual(firestoreData.tags);
    });

    it('should handle missing optional fields in Firestore data', () => {
      const firestoreData = {
        title: 'Test Snippet',
        htmlContent: '<div>Hello World</div>',
        authorId: 'user123',
        authorEmail: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const snippet = Snippet.fromFirestore('snippet123', firestoreData);
      
      expect(snippet.voteCount).toBe(0);
      expect(snippet.tags).toEqual([]);
    });
  });

  describe('toFirestore', () => {
    it('should convert Snippet instance to Firestore data', () => {
      const snippet = new Snippet(validSnippetData);
      const firestoreData = snippet.toFirestore();
      
      expect(firestoreData).toEqual({
        title: validSnippetData.title,
        htmlContent: validSnippetData.htmlContent,
        authorId: validSnippetData.authorId,
        authorEmail: validSnippetData.authorEmail,
        createdAt: validSnippetData.createdAt,
        updatedAt: validSnippetData.updatedAt,
        voteCount: validSnippetData.voteCount,
        tags: validSnippetData.tags,
      });
      expect(firestoreData.id).toBeUndefined();
    });
  });

  describe('validate', () => {
    it('should validate a valid snippet', () => {
      const snippet = new Snippet(validSnippetData);
      const validation = snippet.validate();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject missing title', () => {
      const snippet = new Snippet({
        ...validSnippetData,
        title: '',
      });
      const validation = snippet.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Title is required and must be a string');
    });

    it('should reject title that is too long', () => {
      const snippet = new Snippet({
        ...validSnippetData,
        title: 'a'.repeat(201),
      });
      const validation = snippet.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Title must be 200 characters or less');
    });

    it('should reject missing HTML content', () => {
      const snippet = new Snippet({
        ...validSnippetData,
        htmlContent: '',
      });
      const validation = snippet.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('HTML content is required and must be a string');
    });

    it('should reject missing author ID', () => {
      const snippet = new Snippet({
        ...validSnippetData,
        authorId: '',
      });
      const validation = snippet.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Author ID is required and must be a string');
    });

    it('should reject invalid author email', () => {
      const snippet = new Snippet({
        ...validSnippetData,
        authorEmail: 'invalid-email',
      });
      const validation = snippet.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Author email must be a valid email address');
    });

    it('should reject non-number vote count', () => {
      const snippet = new Snippet({
        ...validSnippetData,
        voteCount: 'not-a-number',
      });
      const validation = snippet.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Vote count must be a number');
    });

    it('should reject non-array tags', () => {
      const snippet = new Snippet({
        ...validSnippetData,
        tags: 'not-an-array',
      });
      const validation = snippet.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Tags must be an array');
    });

    it('should reject non-string tags', () => {
      const snippet = new Snippet({
        ...validSnippetData,
        tags: ['valid-tag', 123, 'another-valid-tag'],
      });
      const validation = snippet.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('All tags must be strings');
    });
  });

  describe('getSanitizedHtml', () => {
    it('should remove script tags', () => {
      const snippet = new Snippet({
        ...validSnippetData,
        htmlContent: '<div>Hello</div><script>alert("xss")</script><p>World</p>',
      });
      
      const sanitized = snippet.getSanitizedHtml();
      
      expect(sanitized).toBe('<div>Hello</div><p>World</p>');
      expect(sanitized).not.toContain('<script>');
    });

    it('should remove event handlers', () => {
      const snippet = new Snippet({
        ...validSnippetData,
        htmlContent: '<div onclick="alert(\'xss\')" onmouseover="doSomething()">Hello</div>',
      });
      
      const sanitized = snippet.getSanitizedHtml();
      
      expect(sanitized).toBe('<div>Hello</div>');
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('onmouseover');
    });

    it('should remove javascript: URLs', () => {
      const snippet = new Snippet({
        ...validSnippetData,
        htmlContent: '<a href="javascript:alert(\'xss\')">Click me</a>',
      });
      
      const sanitized = snippet.getSanitizedHtml();
      
      expect(sanitized).not.toContain('javascript:');
    });

    it('should preserve safe HTML', () => {
      const safeHtml = '<div class="container"><h1>Title</h1><p>Content</p></div>';
      const snippet = new Snippet({
        ...validSnippetData,
        htmlContent: safeHtml,
      });
      
      const sanitized = snippet.getSanitizedHtml();
      
      expect(sanitized).toBe(safeHtml);
    });
  });
});