/**
 * Snippet model for the HTML snippet sharing application
 */

export class Snippet {
  constructor({
    id,
    title,
    htmlContent,
    authorId,
    authorEmail,
    createdAt = null,
    updatedAt = null,
    voteCount = 0,
    tags = [],
  }) {
    this.id = id;
    this.title = title;
    this.htmlContent = htmlContent;
    this.authorId = authorId;
    this.authorEmail = authorEmail;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.voteCount = voteCount;
    this.tags = tags;
  }

  /**
   * Create a Snippet instance from Firestore document data
   * @param {string} id - Document ID
   * @param {Object} data - Firestore document data
   * @returns {Snippet}
   */
  static fromFirestore(id, data) {
    return new Snippet({
      id,
      title: data.title,
      htmlContent: data.htmlContent,
      authorId: data.authorId,
      authorEmail: data.authorEmail,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      voteCount: data.voteCount || 0,
      tags: data.tags || [],
    });
  }

  /**
   * Convert Snippet instance to Firestore document data
   * @returns {Object}
   */
  toFirestore() {
    return {
      title: this.title,
      htmlContent: this.htmlContent,
      authorId: this.authorId,
      authorEmail: this.authorEmail,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      voteCount: this.voteCount,
      tags: this.tags,
    };
  }

  /**
   * Validate snippet data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = [];

    if (!this.title || typeof this.title !== 'string') {
      errors.push('Title is required and must be a string');
    } else if (this.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (this.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }

    if (!this.htmlContent || typeof this.htmlContent !== 'string') {
      errors.push('HTML content is required and must be a string');
    } else if (this.htmlContent.trim().length === 0) {
      errors.push('HTML content cannot be empty');
    }

    if (!this.authorId || typeof this.authorId !== 'string') {
      errors.push('Author ID is required and must be a string');
    }

    if (!this.authorEmail || typeof this.authorEmail !== 'string') {
      errors.push('Author email is required and must be a string');
    } else if (!this.isValidEmail(this.authorEmail)) {
      errors.push('Author email must be a valid email address');
    }

    if (typeof this.voteCount !== 'number') {
      errors.push('Vote count must be a number');
    }

    if (!Array.isArray(this.tags)) {
      errors.push('Tags must be an array');
    } else if (this.tags.some(tag => typeof tag !== 'string')) {
      errors.push('All tags must be strings');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if email format is valid
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize HTML content to prevent XSS
   * @returns {string} Sanitized HTML content
   */
  getSanitizedHtml() {
    // Basic HTML sanitization - remove script tags and event handlers
    return this.htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/\s*on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+>/g, '>');
  }
}