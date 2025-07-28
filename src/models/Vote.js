/**
 * Vote model for the HTML snippet sharing application
 */

export class Vote {
  constructor({ id, snippetId, userId, createdAt = null }) {
    this.id = id;
    this.snippetId = snippetId;
    this.userId = userId;
    this.createdAt = createdAt;
  }

  /**
   * Create a Vote instance from Firestore document data
   * @param {string} id - Document ID
   * @param {Object} data - Firestore document data
   * @returns {Vote}
   */
  static fromFirestore(id, data) {
    return new Vote({
      id,
      snippetId: data.snippetId,
      userId: data.userId,
      createdAt: data.createdAt,
    });
  }

  /**
   * Convert Vote instance to Firestore document data
   * @returns {Object}
   */
  toFirestore() {
    return {
      snippetId: this.snippetId,
      userId: this.userId,
      createdAt: this.createdAt,
    };
  }

  /**
   * Validate vote data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = [];

    if (!this.snippetId || typeof this.snippetId !== 'string') {
      errors.push('Snippet ID is required and must be a string');
    }

    if (!this.userId || typeof this.userId !== 'string') {
      errors.push('User ID is required and must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a composite ID for the vote document
   * @returns {string} Composite ID in format "userId_snippetId"
   */
  getCompositeId() {
    return `${this.userId}_${this.snippetId}`;
  }
}