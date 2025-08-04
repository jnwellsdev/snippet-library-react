export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate string field with length constraints
export const validateString = (value, options = {}) => {
  const { minLength = 1, maxLength = Infinity, required = true } = options;
  const errors = [];

  if (required && (!value || typeof value !== 'string')) {
    errors.push('Field is required and must be a string');
    return { isValid: false, errors };
  }

  if (!required && (value === null || value === undefined)) {
    return { isValid: true, errors: [] };
  }

  if (typeof value !== 'string') {
    errors.push('Field must be a string');
    return { isValid: false, errors };
  }

  const trimmedValue = value.trim();
  
  if (required && trimmedValue.length === 0) {
    errors.push('Field cannot be empty');
  }

  if (trimmedValue.length < minLength) {
    errors.push(`Field must be at least ${minLength} characters long`);
  }

  if (trimmedValue.length > maxLength) {
    errors.push(`Field must be ${maxLength} characters or less`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate HTML content with script safety checks for authenticated users
export const validateHtmlContent = (htmlContent) => {
  const errors = [];

  if (!htmlContent || typeof htmlContent !== 'string') {
    errors.push('HTML content is required and must be a string');
    return { isValid: false, errors };
  }

  const trimmedContent = htmlContent.trim();
  
  if (trimmedContent.length === 0) {
    errors.push('HTML content cannot be empty');
  }

  // Check for potentially dangerous content (but allow script tags for authenticated users)
  const dangerousPatterns = [
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  // Check for unsafe script patterns that could affect the global scope
  const unsafeScriptPatterns = [
    /document\s*\.\s*(write|createElement|appendChild|insertBefore|removeChild)/gi,
    /window\s*\.\s*(location|open|close|alert|confirm)/gi,
    /eval\s*\(/gi,
    /<script[^>]*src\s*=/gi, // External script sources
    /fetch\s*\(/gi,
    /XMLHttpRequest/gi,
    /localStorage|sessionStorage/gi,
    /parent\s*\./gi,
    /top\s*\./gi,
  ];
  
  const hasUnsafeScript = unsafeScriptPatterns.some(pattern => 
    pattern.test(htmlContent)
  );

  if (hasUnsafeScript) {
    errors.push('Script content contains unsafe operations. Only DOM queries and manipulation within the snippet container are allowed.');
  }

  const hasDangerousContent = dangerousPatterns.some(pattern => 
    pattern.test(htmlContent)
  );

  if (hasDangerousContent) {
    errors.push('HTML content contains potentially unsafe elements');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Sanitize HTML content by removing dangerous elements (but preserve script tags for authenticated users)
export const sanitizeHtml = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  // Remove dangerous inline event handlers and javascript: URLs, but keep script tags
  return htmlContent
    .replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s*on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+>/g, '>');
};

// Validate array of strings (for tags)
export const validateStringArray = (array, options = {}) => {
  const { maxItems = 10, maxItemLength = 50 } = options;
  const errors = [];

  if (!Array.isArray(array)) {
    errors.push('Field must be an array');
    return { isValid: false, errors };
  }

  if (array.length > maxItems) {
    errors.push(`Array can contain at most ${maxItems} items`);
  }

  const invalidItems = array.filter(item => typeof item !== 'string');
  if (invalidItems.length > 0) {
    errors.push('All array items must be strings');
  }

  const longItems = array.filter(item => 
    typeof item === 'string' && item.length > maxItemLength
  );
  if (longItems.length > 0) {
    errors.push(`Array items must be ${maxItemLength} characters or less`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate Firebase Timestamp or Date object
export const validateTimestamp = (timestamp, required = false) => {
  const errors = [];

  if (!required && (timestamp === null || timestamp === undefined)) {
    return { isValid: true, errors: [] };
  }

  if (required && (timestamp === null || timestamp === undefined)) {
    errors.push('Timestamp is required');
    return { isValid: false, errors };
  }

  // Check if it's a valid Date object or Firebase Timestamp
  const isValidDate = timestamp instanceof Date && !isNaN(timestamp.getTime());
  const isFirebaseTimestamp = timestamp && typeof timestamp.toDate === 'function';

  if (!isValidDate && !isFirebaseTimestamp) {
    errors.push('Timestamp must be a valid Date object or Firebase Timestamp');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};