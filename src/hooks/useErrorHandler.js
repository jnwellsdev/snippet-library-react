import { useState, useCallback } from 'react'
import { 
  categorizeError, 
  getUserFriendlyMessage, 
  isRetryableError, 
  logError 
} from '../utils/errorHandling'

/**
 * Custom hook for managing error state and handling
 * @param {string} context - Context for error logging
 * @returns {Object} Error handling utilities
 */
export const useErrorHandler = (context = '') => {
  const [error, setError] = useState(null)
  const [isRetrying, setIsRetrying] = useState(false)

  /**
   * Handle an error
   * @param {Error|string} err - Error to handle
   * @param {Object} options - Options for error handling
   */
  const handleError = useCallback((err, options = {}) => {
    const { 
      logError: shouldLog = true, 
      setError: shouldSetError = true,
      additionalData = {} 
    } = options

    if (shouldLog) {
      logError(err, context, additionalData)
    }

    if (shouldSetError) {
      setError(err)
    }
  }, [context])

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Retry a function with error handling
   * @param {Function} fn - Function to retry
   * @param {Object} options - Retry options
   */
  const retry = useCallback(async (fn, options = {}) => {
    const { clearErrorOnRetry = true } = options

    if (clearErrorOnRetry) {
      clearError()
    }

    setIsRetrying(true)

    try {
      const result = await fn()
      setIsRetrying(false)
      return result
    } catch (err) {
      setIsRetrying(false)
      handleError(err)
      throw err
    }
  }, [handleError, clearError])

  /**
   * Execute a function with error handling
   * @param {Function} fn - Function to execute
   * @param {Object} options - Execution options
   */
  const execute = useCallback(async (fn, options = {}) => {
    const { clearErrorOnStart = true } = options

    if (clearErrorOnStart) {
      clearError()
    }

    try {
      return await fn()
    } catch (err) {
      handleError(err)
      throw err
    }
  }, [handleError, clearError])

  // Derived state
  const errorType = error ? categorizeError(error) : null
  const errorMessage = error ? getUserFriendlyMessage(error, context) : null
  const isRetryable = error ? isRetryableError(error) : false
  const hasError = !!error

  return {
    // State
    error,
    errorType,
    errorMessage,
    hasError,
    isRetrying,
    isRetryable,

    // Actions
    handleError,
    clearError,
    retry,
    execute
  }
}

export default useErrorHandler