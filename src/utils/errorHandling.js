/**
 * Error handling utilities for the application
 */

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  PERMISSION: 'permission',
  VALIDATION: 'validation',
  NOT_FOUND: 'not_found',
  RATE_LIMIT: 'rate_limit',
  UNKNOWN: 'unknown'
}

/**
 * Categorize error based on error message or code
 * @param {Error|string} error - Error object or message
 * @returns {string} Error type
 */
export const categorizeError = (error) => {
  const message = typeof error === 'string' ? error : error?.message || ''
  const code = error?.code || ''

  // Network errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    code === 'network-request-failed'
  ) {
    return ERROR_TYPES.NETWORK
  }

  // Authentication errors
  if (
    message.includes('auth') ||
    message.includes('authentication') ||
    message.includes('unauthorized') ||
    code.startsWith('auth/')
  ) {
    return ERROR_TYPES.AUTHENTICATION
  }

  // Permission errors
  if (
    message.includes('permission') ||
    message.includes('forbidden') ||
    message.includes('access denied') ||
    code === 'permission-denied'
  ) {
    return ERROR_TYPES.PERMISSION
  }

  // Validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    code === 'invalid-argument'
  ) {
    return ERROR_TYPES.VALIDATION
  }

  // Not found errors
  if (
    message.includes('not found') ||
    message.includes('not-found') ||
    code === 'not-found'
  ) {
    return ERROR_TYPES.NOT_FOUND
  }

  // Rate limit errors
  if (
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    code === 'too-many-requests'
  ) {
    return ERROR_TYPES.RATE_LIMIT
  }

  return ERROR_TYPES.UNKNOWN
}

/**
 * Get user-friendly error message based on error type and context
 * @param {Error|string} error - Error object or message
 * @param {string} context - Context where error occurred (e.g., 'login', 'create_snippet')
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyMessage = (error, context = '') => {
  const errorType = categorizeError(error)
  const originalMessage = typeof error === 'string' ? error : error?.message || ''

  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      return 'Network error. Please check your internet connection and try again.'

    case ERROR_TYPES.AUTHENTICATION:
      if (context === 'login') {
        return 'Authentication failed. Please check your email and try again.'
      }
      return 'You need to be logged in to perform this action.'

    case ERROR_TYPES.PERMISSION:
      if (context === 'create_snippet') {
        return 'You don\'t have permission to create snippets. Please log in and try again.'
      }
      if (context === 'vote') {
        return 'You don\'t have permission to vote. Please log in and try again.'
      }
      return 'You don\'t have permission to perform this action.'

    case ERROR_TYPES.VALIDATION:
      // Return the original validation message as it's usually user-friendly
      return originalMessage || 'Please check your input and try again.'

    case ERROR_TYPES.NOT_FOUND:
      if (context === 'snippet') {
        return 'The snippet you\'re looking for could not be found.'
      }
      return 'The requested item could not be found.'

    case ERROR_TYPES.RATE_LIMIT:
      return 'Too many requests. Please wait a moment and try again.'

    case ERROR_TYPES.UNKNOWN:
    default:
      // For unknown errors, provide a generic message but include original if it's user-friendly
      if (originalMessage && originalMessage.length < 100 && !originalMessage.includes('Error:') && !originalMessage.includes('random') && !originalMessage.includes('technical details')) {
        return originalMessage
      }
      return 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Determine if an error is retryable
 * @param {Error|string} error - Error object or message
 * @returns {boolean} Whether the error is retryable
 */
export const isRetryableError = (error) => {
  const errorType = categorizeError(error)
  
  return [
    ERROR_TYPES.NETWORK,
    ERROR_TYPES.RATE_LIMIT,
    ERROR_TYPES.UNKNOWN
  ].includes(errorType)
}

/**
 * Log error with context for debugging
 * @param {Error|string} error - Error object or message
 * @param {string} context - Context where error occurred
 * @param {Object} additionalData - Additional data to log
 */
export const logError = (error, context = '', additionalData = {}) => {
  const errorType = categorizeError(error)
  const timestamp = new Date().toISOString()
  
  const logData = {
    timestamp,
    context,
    errorType,
    error: typeof error === 'string' ? error : {
      message: error.message,
      code: error.code,
      stack: error.stack
    },
    ...additionalData
  }

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', logData)
  }

  // In production, you might want to send to an error reporting service
  // Example: Sentry, LogRocket, etc.
  // if (process.env.NODE_ENV === 'production') {
  //   errorReportingService.captureError(logData)
  // }
}

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {string} type - Error type
 * @param {Object} metadata - Additional metadata
 * @returns {Error} Standardized error object
 */
export const createError = (message, code = '', type = ERROR_TYPES.UNKNOWN, metadata = {}) => {
  const error = new Error(message)
  error.code = code
  error.type = type
  error.metadata = metadata
  return error
}

/**
 * Wrap async functions with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for error logging
 * @returns {Function} Wrapped function
 */
export const withErrorHandling = (fn, context = '') => {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error, context, { args })
      throw error
    }
  }
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the function
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry if it's not a retryable error
      if (!isRetryableError(error)) {
        throw error
      }

      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}