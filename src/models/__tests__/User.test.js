import { describe, it, expect } from 'vitest';
import { User } from '../User.js';

describe('User Model', () => {
  const validUserData = {
    id: 'user123',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };

  describe('constructor', () => {
    it('should create a User instance with all properties', () => {
      const user = new User(validUserData);
      
      expect(user.id).toBe(validUserData.id);
      expect(user.email).toBe(validUserData.email);
      expect(user.displayName).toBe(validUserData.displayName);
      expect(user.createdAt).toBe(validUserData.createdAt);
      expect(user.lastLoginAt).toBe(validUserData.lastLoginAt);
    });

    it('should create a User instance with default values', () => {
      const minimalData = {
        id: 'user123',
        email: 'test@example.com',
      };
      
      const user = new User(minimalData);
      
      expect(user.id).toBe(minimalData.id);
      expect(user.email).toBe(minimalData.email);
      expect(user.displayName).toBeNull();
      expect(user.createdAt).toBeNull();
      expect(user.lastLoginAt).toBeNull();
    });
  });

  describe('fromFirestore', () => {
    it('should create User instance from Firestore data', () => {
      const firestoreData = {
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      
      const user = User.fromFirestore('user123', firestoreData);
      
      expect(user.id).toBe('user123');
      expect(user.email).toBe(firestoreData.email);
      expect(user.displayName).toBe(firestoreData.displayName);
      expect(user.createdAt).toBe(firestoreData.createdAt);
      expect(user.lastLoginAt).toBe(firestoreData.lastLoginAt);
    });

    it('should handle missing displayName in Firestore data', () => {
      const firestoreData = {
        email: 'test@example.com',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      
      const user = User.fromFirestore('user123', firestoreData);
      
      expect(user.displayName).toBeNull();
    });
  });

  describe('toFirestore', () => {
    it('should convert User instance to Firestore data', () => {
      const user = new User(validUserData);
      const firestoreData = user.toFirestore();
      
      expect(firestoreData).toEqual({
        email: validUserData.email,
        displayName: validUserData.displayName,
        createdAt: validUserData.createdAt,
        lastLoginAt: validUserData.lastLoginAt,
      });
      expect(firestoreData.id).toBeUndefined();
    });
  });

  describe('validate', () => {
    it('should validate a valid user', () => {
      const user = new User(validUserData);
      const validation = user.validate();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject missing email', () => {
      const user = new User({ id: 'user123' });
      const validation = user.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Email is required and must be a string');
    });

    it('should reject invalid email format', () => {
      const user = new User({
        id: 'user123',
        email: 'invalid-email',
      });
      const validation = user.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Email must be a valid email address');
    });

    it('should reject non-string email', () => {
      const user = new User({
        id: 'user123',
        email: 123,
      });
      const validation = user.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Email is required and must be a string');
    });

    it('should reject non-string displayName', () => {
      const user = new User({
        id: 'user123',
        email: 'test@example.com',
        displayName: 123,
      });
      const validation = user.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Display name must be a string or null');
    });

    it('should accept null displayName', () => {
      const user = new User({
        id: 'user123',
        email: 'test@example.com',
        displayName: null,
      });
      const validation = user.validate();
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      const user = new User(validUserData);
      
      expect(user.isValidEmail('test@example.com')).toBe(true);
      expect(user.isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(user.isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      const user = new User(validUserData);
      
      expect(user.isValidEmail('invalid-email')).toBe(false);
      expect(user.isValidEmail('@example.com')).toBe(false);
      expect(user.isValidEmail('user@')).toBe(false);
      expect(user.isValidEmail('user@domain')).toBe(false);
      expect(user.isValidEmail('')).toBe(false);
    });
  });
});