import { vi } from 'vitest'
import {
  ERROR_TYPES,
  categorizeError,
  getUserFriendlyMessage,
  isRetryableError,
  logError,
  createError,
  withErrorHandling,
  retryWithBackoff
} from '../errorHandling'

// Mock console.error for testing
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
  vi.restoreAllMocks()
})

describe('errorHandling utilities', () => {
  describe('categorizeError', () => {
    it('categorizes network errors correctly', () => {
      expect(categorizeError('network request failed')).toBe(ERROR_TYPES.NETWORK)
      expect(categorizeError('fetch error')).toBe(ERROR_TYPES.NETWORK)
      expect(categorizeError('connection timeout')).toBe(ERROR_TYPES.NETWORK)
      expect(categorizeError({ code: 'network-request-failed' })).toBe(ERROR_TYPES.NETWORK)
    })

    it('categorizes authentication errors correctly', () => {
      expect(categorizeError('auth failed')).toBe(ERROR_TYPES.AUTHENTICATION)
      expect(categorizeError('authentication required')).toBe(ERROR_TYPES.AUTHENTICATION)
      expect(categorizeError('unauthorized access')).toBe(ERROR_TYPES.AUTHENTICATION)
      expect(categorizeError({ code: 'auth/invalid-email' })).toBe(ERROR_TYPES.AUTHENTICATION)
    })

    it('categorizes permission errors correctly', () => {
      expect(categorizeError('permission denied')).toBe(ERROR_TYPES.PERMISSION)
      expect(categorizeError('forbidden access')).toBe(ERROR_TYPES.PERMISSION)
      expect(categorizeError('access denied')).toBe(ERROR_TYPES.PERMISSION)
      expect(categorizeError({ code: 'permission-denied' })).toBe(ERROR_TYPES.PERMISSION)
    })

    it('categorizes validation errors correctly', () => {
      expect(categorizeError('validation failed')).toBe(ERROR_TYPES.VALIDATION)
      expect(categorizeError('invalid input')).toBe(ERROR_TYPES.VALIDATION)
      expect(categorizeError('field is required')).toBe(ERROR_TYPES.VALIDATION)
      expect(categorizeError({ code: 'invalid-argument' })).toBe(ERROR_TYPES.VALIDATION)
    })

    it('categorizes not found errors correctly', () => {
      expect(categorizeError('not found')).toBe(ERROR_TYPES.NOT_FOUND)
      expect(categorizeError('document not-found')).toBe(ERROR_TYPES.NOT_FOUND)
      expect(categorizeError({ code: 'not-found' })).toBe(ERROR_TYPES.NOT_FOUND)
    })

    it('categorizes rate limit errors correctly', () => {
      expect(categorizeError('rate limit exceeded')).toBe(ERROR_TYPES.RATE_LIMIT)
      expect(categorizeError('too many requests')).toBe(ERROR_TYPES.RATE_LIMIT)
      expect(categorizeError({ code: 'too-many-requests' })).toBe(ERROR_TYPES.RATE_LIMIT)
    })

    it('categorizes unknown errors correctly', () => {
      expect(categorizeError('random error message')).toBe(ERROR_TYPES.UNKNOWN)
      expect(categorizeError({ message: 'unknown error' })).toBe(ERROR_TYPES.UNKNOWN)
      expect(categorizeError({})).toBe(ERROR_TYPES.UNKNOWN)
    })

    it('handles Error objects correctly', () => {
      const error = new Error('network connection failed')
      expect(categorizeError(error)).toBe(ERROR_TYPES.NETWORK)
    })
  })

  describe('getUserFriendlyMessage', () => {
    it('returns user-friendly messages for network errors', () => {
      const message = getUserFriendlyMessage('network failed')
      expect(message).toBe('Network error. Please check your internet connection and try again.')
    })

    it('returns context-specific messages for authentication errors', () => {
      const loginMessage = getUserFriendlyMessage('auth failed', 'login')
      expect(loginMessage).toBe('Authentication failed. Please check your email and try again.')

      const generalMessage = getUserFriendlyMessage('auth failed')
      expect(generalMessage).toBe('You need to be logged in to perform this action.')
    })

    it('returns context-specific messages for permission errors', () => {
      const createMessage = getUserFriendlyMessage('permission denied', 'create_snippet')
      expect(createMessage).toBe('You don\'t have permission to create snippets. Please log in and try again.')

      const voteMessage = getUserFriendlyMessage('permission denied', 'vote')
      expect(voteMessage).toBe('You don\'t have permission to vote. Please log in and try again.')

      const generalMessage = getUserFriendlyMessage('permission denied')
      expect(generalMessage).toBe('You don\'t have permission to perform this action.')
    })

    it('returns original message for validation errors', () => {
      const message = getUserFriendlyMessage('Title is required')
      expect(message).toBe('Title is required')
    })

    it('returns context-specific messages for not found errors', () => {
      const snippetMessage = getUserFriendlyMessage('not found', 'snippet')
      expect(snippetMessage).toBe('The snippet you\'re looking for could not be found.')

      const generalMessage = getUserFriendlyMessage('not found')
      expect(generalMessage).toBe('The requested item could not be found.')
    })

    it('returns user-friendly message for rate limit errors', () => {
      const message = getUserFriendlyMessage('too many requests')
      expect(message).toBe('Too many requests. Please wait a moment and try again.')
    })

    it('returns generic message for unknown errors', () => {
      const message = getUserFriendlyMessage('some random error')
      expect(message).toBe('An unexpected error occurred. Please try again.')
    })

    it('handles Error objects correctly', () => {
      const error = new Error('network connection failed')
      const message = getUserFriendlyMessage(error)
      expect(message).toBe('Network error. Please check your internet connection and try again.')
    })

    it('returns original message for short, user-friendly unknown errors', () => {
      const message = getUserFriendlyMessage('Short error')
      expect(message).toBe('Short error')
    })

    it('returns generic message for long unknown errors', () => {
      const longError = 'This is a very long error message that contains technical details and should not be shown to users'
      const message = getUserFriendlyMessage(longError)
      expect(message).toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('isRetryableError', () => {
    it('identifies retryable errors correctly', () => {
      expect(isRetryableError('network failed')).toBe(true)
      expect(isRetryableError('too many requests')).toBe(true)
      expect(isRetryableError('unknown error')).toBe(true)
    })

    it('identifies non-retryable errors correctly', () => {
      expect(isRetryableError('auth failed')).toBe(false)
      expect(isRetryableError('permission denied')).toBe(false)
      expect(isRetryableError('validation failed')).toBe(false)
      expect(isRetryableError('not found')).toBe(false)
    })
  })

  describe('logError', () => {
    it('logs error with context and additional data', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const error = new Error('Test error')
      const context = 'test-context'
      const additionalData = { userId: '123' }

      logError(error, context, additionalData)

      expect(console.error).toHaveBeenCalledWith(
        'Error logged:',
        expect.objectContaining({
          context,
          errorType: ERROR_TYPES.UNKNOWN,
          error: expect.objectContaining({
            message: 'Test error',
            stack: expect.any(String)
          }),
          userId: '123',
          timestamp: expect.any(String)
        })
      )
      
      process.env.NODE_ENV = originalEnv
    })

    it('logs string errors correctly', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      logError('String error', 'test-context')

      expect(console.error).toHaveBeenCalledWith(
        'Error logged:',
        expect.objectContaining({
          context: 'test-context',
          error: 'String error'
        })
      )
      
      process.env.NODE_ENV = originalEnv
    })

    it('only logs in development environment', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      logError('Test error')

      expect(console.error).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('createError', () => {
    it('creates standardized error object', () => {
      const error = createError('Test message', 'test-code', ERROR_TYPES.NETWORK, { extra: 'data' })

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Test message')
      expect(error.code).toBe('test-code')
      expect(error.type).toBe(ERROR_TYPES.NETWORK)
      expect(error.metadata).toEqual({ extra: 'data' })
    })

    it('creates error with default values', () => {
      const error = createError('Test message')

      expect(error.message).toBe('Test message')
      expect(error.code).toBe('')
      expect(error.type).toBe(ERROR_TYPES.UNKNOWN)
      expect(error.metadata).toEqual({})
    })
  })

  describe('withErrorHandling', () => {
    it('wraps function and logs errors', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const testError = new Error('Test error')
      const testFunction = vi.fn().mockRejectedValue(testError)
      const wrappedFunction = withErrorHandling(testFunction, 'test-context')

      await expect(wrappedFunction('arg1', 'arg2')).rejects.toThrow('Test error')

      expect(testFunction).toHaveBeenCalledWith('arg1', 'arg2')
      expect(console.error).toHaveBeenCalledWith(
        'Error logged:',
        expect.objectContaining({
          context: 'test-context',
          args: ['arg1', 'arg2']
        })
      )
      
      process.env.NODE_ENV = originalEnv
    })

    it('returns result when function succeeds', async () => {
      const testFunction = vi.fn().mockResolvedValue('success')
      const wrappedFunction = withErrorHandling(testFunction, 'test-context')

      const result = await wrappedFunction('arg1')

      expect(result).toBe('success')
      expect(testFunction).toHaveBeenCalledWith('arg1')
      expect(console.error).not.toHaveBeenCalled()
    })
  })

  describe('retryWithBackoff', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('succeeds on first attempt', async () => {
      const testFunction = vi.fn().mockResolvedValue('success')

      const result = await retryWithBackoff(testFunction)

      expect(result).toBe('success')
      expect(testFunction).toHaveBeenCalledTimes(1)
    })

    it('retries on retryable errors', async () => {
      const testFunction = vi.fn()
        .mockRejectedValueOnce(new Error('network failed'))
        .mockRejectedValueOnce(new Error('network failed'))
        .mockResolvedValue('success')

      const promise = retryWithBackoff(testFunction, 3, 100)

      // Fast-forward through the delays
      await vi.runAllTimersAsync()

      const result = await promise

      expect(result).toBe('success')
      expect(testFunction).toHaveBeenCalledTimes(3)
    })

    it('does not retry non-retryable errors', async () => {
      const testFunction = vi.fn().mockRejectedValue(new Error('auth failed'))

      await expect(retryWithBackoff(testFunction)).rejects.toThrow('auth failed')

      expect(testFunction).toHaveBeenCalledTimes(1)
    })

    it('throws last error after max retries', async () => {
      const testFunction = vi.fn().mockRejectedValue(new Error('network failed'))

      const promise = retryWithBackoff(testFunction, 2, 100)

      // Fast-forward through the delays
      await vi.runAllTimersAsync()

      await expect(promise).rejects.toThrow('network failed')

      expect(testFunction).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('uses exponential backoff delays', async () => {
      const testFunction = vi.fn()
        .mockRejectedValueOnce(new Error('network failed'))
        .mockRejectedValueOnce(new Error('network failed'))
        .mockResolvedValue('success')

      const promise = retryWithBackoff(testFunction, 2, 100)

      // First retry after 100ms
      await vi.advanceTimersByTimeAsync(100)
      expect(testFunction).toHaveBeenCalledTimes(2)

      // Second retry after 200ms (exponential backoff)
      await vi.advanceTimersByTimeAsync(200)
      expect(testFunction).toHaveBeenCalledTimes(3)

      const result = await promise
      expect(result).toBe('success')
    })
  })
})