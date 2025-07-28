/**
 * Data transformation utilities for the HTML snippet sharing application
 */

/**
 * Transform Firebase Timestamp to JavaScript Date
 * @param {*} timestamp - Firebase Timestamp or Date object
 * @returns {Date|null}
 */
export const timestampToDate = (timestamp) => {
  if (!timestamp) return null;
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  return null;
};

/**
 * Transform Date to Firebase Timestamp (for Firestore operations)
 * @param {Date} date
 * @returns {*} Firebase Timestamp or null
 */
export const dateToTimestamp = (date) => {
  if (!date || !(date instanceof Date)) return null;
  
  // This will be replaced with actual Firebase Timestamp in the service layer
  // For now, return the date as-is for testing
  return date;
};

/**
 * Format date for display
 * @param {Date|*} timestamp - Date object or Firebase Timestamp
 * @param {Object} options - Formatting options
 * @returns {string}
 */
export const formatDate = (timestamp, options = {}) => {
  const date = timestampToDate(timestamp);
  if (!date) return 'Unknown date';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return date.toLocaleDateString('en-US', formatOptions);
  } catch (error) {
    return date.toISOString().split('T')[0]; // Fallback to ISO date
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|*} timestamp - Date object or Firebase Timestamp
 * @returns {string}
 */
export const formatRelativeTime = (timestamp) => {
  const date = timestampToDate(timestamp);
  if (!date) return 'Unknown time';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' });
  }
};

/**
 * Normalize snippet data for consistent processing
 * @param {Object} snippetData - Raw snippet data
 * @returns {Object} Normalized snippet data
 */
export const normalizeSnippetData = (snippetData) => {
  return {
    id: snippetData.id || null,
    title: (snippetData.title || '').trim(),
    htmlContent: snippetData.htmlContent || '',
    authorId: snippetData.authorId || '',
    authorEmail: snippetData.authorEmail || '',
    createdAt: snippetData.createdAt || null,
    updatedAt: snippetData.updatedAt || null,
    voteCount: Number(snippetData.voteCount) || 0,
    tags: Array.isArray(snippetData.tags) ? snippetData.tags : [],
  };
};

/**
 * Normalize user data for consistent processing
 * @param {Object} userData - Raw user data
 * @returns {Object} Normalized user data
 */
export const normalizeUserData = (userData) => {
  return {
    id: userData.id || null,
    email: (userData.email || '').toLowerCase().trim(),
    displayName: userData.displayName ? userData.displayName.trim() : null,
    createdAt: userData.createdAt || null,
    lastLoginAt: userData.lastLoginAt || null,
  };
};

/**
 * Normalize vote data for consistent processing
 * @param {Object} voteData - Raw vote data
 * @returns {Object} Normalized vote data
 */
export const normalizeVoteData = (voteData) => {
  return {
    id: voteData.id || null,
    snippetId: voteData.snippetId || '',
    userId: voteData.userId || '',
    createdAt: voteData.createdAt || null,
  };
};

/**
 * Extract display name from email
 * @param {string} email
 * @returns {string}
 */
export const getDisplayNameFromEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Anonymous';
  
  const localPart = email.split('@')[0];
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
};

/**
 * Truncate text to specified length
 * @param {string} text
 * @param {number} maxLength
 * @param {string} suffix
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  const truncateLength = maxLength - suffix.length;
  return text.substring(0, truncateLength) + suffix;
};

/**
 * Convert text to title case
 * @param {string} text - Text to convert
 * @returns {string} Title cased text
 */
export const toTitleCase = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format tags to title case
 * @param {Array<string>} tags - Array of tag strings
 * @returns {Array<string>} Array of title cased tags
 */
export const formatTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  
  return tags
    .filter(tag => tag && typeof tag === 'string')
    .map(tag => toTitleCase(tag.trim()))
    .filter(tag => tag.length > 0);
};