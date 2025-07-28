/**
 * User model for the HTML snippet sharing application
 */

export class User {
  constructor({ id, email, displayName = null, createdAt = null, lastLoginAt = null }) {
    this.id = id;
    this.email = email;
    this.displayName = displayName;
    this.createdAt = createdAt;
    this.lastLoginAt = lastLoginAt;
  }

  /**
   * Create a User instance from Firestore document data
   * @param {string} id - Document ID
   * @param {Object} data - Firestore document data
   * @returns {User}
   */
  static fromFirestore(id, data) {
    return new User({
      id,
      email: data.email,
      displayName: data.displayName || null,
      createdAt: data.createdAt,
      lastLoginAt: data.lastLoginAt,
    });
  }

  /**
   * Convert User instance to Firestore document data
   * @returns {Object}
   */
  toFirestore() {
    return {
      email: this.email,
      displayName: this.displayName,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt,
    };
  }

  /**
   * Validate user data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = [];

    if (!this.email || typeof this.email !== 'string') {
      errors.push('Email is required and must be a string');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Email must be a valid email address');
    }

    if (this.displayName !== null && typeof this.displayName !== 'string') {
      errors.push('Display name must be a string or null');
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
}