import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import useErrorHandler from '../useErrorHandler'
import * as errorHandling from '../../utils/errorHandling'

// Mock the error handling utilities
vi.mock('../../utils/errorHandling', () => ({
  categorizeError: vi.fn(),
  getUserFriendlyMessage: vi.fn(),
  isRetryableError: vi.fn(),
  logError: vi.fn(),
  ERROR_TYPES: {
    NETWORK: 'network',
    AUTHENTICATION: 'authentication',
    PERMISSION: 'permission',
    VALIDATION: 'validation',
    NOT_FOUND: 'not_found',
    RATE_LIMIT: 'rate_limit',
    UNKNOWN: 'unknown'
  }
}))

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up default mock implementations
    errorHandling.categorizeError.mockReturnValue(errorHandling.ERROR_TYPES.UNKNOWN)
    errorHandling.getUserFriendlyMessage.mockReturnValue('An error occurred')
    errorHandling.isRetryableError.mockReturnValue(true)
  })

  describe('Initial State', () => {
    it('initializes with no error state', () => {
      const { result } = renderHook(() => useErrorHandler())

      expect(result.current.error).toBeNull()
      expect(result.current.errorType).toBeNull()
      expect(result.current.errorMessage).toBeNull()
      expect(result.current.hasError).toBe(false)
      expect(result.current.isRetrying).toBe(false)
      expect(result.current.isRetryable).toBe(false)
    })

    it('accepts context parameter', () => {
      const { result } = renderHook(() => useErrorHandler('test-context'))

      // Context is used internally, so we test it through error handling
      act(() => {
        result.current.handleError(new Error('Test error'))
      })

      expect(errorHandling.logError).toHaveBeenCalledWith(
        expect.any(Error),
        'test-context',
        {}
      )
    })
  })

  describe('handleError', () => {
    it('sets error state and logs error by default', () => {
      const { result } = renderHook(() => useErrorHandler('test-context'))
      const testError = new Error('Test error')

      act(() => {
        result.current.handleError(testError)
      })

      expect(result.current.error).toBe(testError)
      expect(result.current.hasError).toBe(true)
      expect(errorHandling.logError).toHaveBeenCalledWith(
        testError,
        'test-context',
        {}
      )
    })

    it('does not log error when logError option is false', () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Test error')

      act(() => {
        result.current.handleError(testError, { logError: false })
      })

      expect(errorHandling.logError).not.toHaveBeenCalled()
    })

    it('does not set error when setError option is false', () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Test error')

      act(() => {
        result.current.handleError(testError, { setError: false })
      })

      expect(result.current.error).toBeNull()
      expect(result.current.hasError).toBe(false)
    })

    it('passes additional data to logError', () => {
      const { result } = renderHook(() => useErrorHandler('test-context'))
      const testError = new Error('Test error')
      const additionalData = { userId: '123' }

      act(() => {
        result.current.handleError(testError, { additionalData })
      })

      expect(errorHandling.logError).toHaveBeenCalledWith(
        testError,
        'test-context',
        additionalData
      )
    })
  })

  describe('clearError', () => {
    it('clears error state', () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Test error')

      // Set error first
      act(() => {
        result.current.handleError(testError)
      })

      expect(result.current.hasError).toBe(true)

      // Clear error
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.hasError).toBe(false)
    })
  })

  describe('execute', () => {
    it('executes function successfully', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const testFunction = vi.fn().mockResolvedValue('success')

      let executeResult
      await act(async () => {
        executeResult = await result.current.execute(testFunction)
      })

      expect(executeResult).toBe('success')
      expect(testFunction).toHaveBeenCalledTimes(1)
      expect(result.current.hasError).toBe(false)
    })

    it('handles function errors', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Test error')
      const testFunction = vi.fn().mockRejectedValue(testError)

      await act(async () => {
        try {
          await result.current.execute(testFunction)
        } catch (error) {
          expect(error).toBe(testError)
        }
      })

      expect(result.current.error).toBe(testError)
      expect(result.current.hasError).toBe(true)
    })

    it('clears error on start by default', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Initial error')

      // Set initial error
      act(() => {
        result.current.handleError(testError)
      })

      expect(result.current.hasError).toBe(true)

      // Execute function (should clear error)
      await act(async () => {
        await result.current.execute(() => Promise.resolve('success'))
      })

      expect(result.current.hasError).toBe(false)
    })

    it('does not clear error on start when clearErrorOnStart is false', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Initial error')

      // Set initial error
      act(() => {
        result.current.handleError(testError)
      })

      expect(result.current.hasError).toBe(true)

      // Execute function without clearing error
      await act(async () => {
        await result.current.execute(
          () => Promise.resolve('success'),
          { clearErrorOnStart: false }
        )
      })

      expect(result.current.hasError).toBe(true)
      expect(result.current.error).toBe(testError)
    })
  })

  describe('retry', () => {
    it('executes function successfully on retry', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const testFunction = vi.fn().mockResolvedValue('success')

      let retryResult
      await act(async () => {
        retryResult = await result.current.retry(testFunction)
      })

      expect(retryResult).toBe('success')
      expect(testFunction).toHaveBeenCalledTimes(1)
      expect(result.current.isRetrying).toBe(false)
    })

    it('sets isRetrying state during retry', async () => {
      const { result } = renderHook(() => useErrorHandler())
      let resolveFunction
      const testFunction = vi.fn(() => new Promise(resolve => {
        resolveFunction = resolve
      }))

      // Start retry
      act(() => {
        result.current.retry(testFunction)
      })

      expect(result.current.isRetrying).toBe(true)

      // Complete retry
      await act(async () => {
        resolveFunction('success')
      })

      expect(result.current.isRetrying).toBe(false)
    })

    it('handles retry errors', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Retry error')
      const testFunction = vi.fn().mockRejectedValue(testError)

      await act(async () => {
        try {
          await result.current.retry(testFunction)
        } catch (error) {
          expect(error).toBe(testError)
        }
      })

      expect(result.current.error).toBe(testError)
      expect(result.current.isRetrying).toBe(false)
    })

    it('clears error on retry by default', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const initialError = new Error('Initial error')

      // Set initial error
      act(() => {
        result.current.handleError(initialError)
      })

      expect(result.current.hasError).toBe(true)

      // Retry (should clear error)
      await act(async () => {
        await result.current.retry(() => Promise.resolve('success'))
      })

      expect(result.current.hasError).toBe(false)
    })

    it('does not clear error on retry when clearErrorOnRetry is false', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const initialError = new Error('Initial error')

      // Set initial error
      act(() => {
        result.current.handleError(initialError)
      })

      expect(result.current.hasError).toBe(true)

      // Retry without clearing error
      await act(async () => {
        await result.current.retry(
          () => Promise.resolve('success'),
          { clearErrorOnRetry: false }
        )
      })

      expect(result.current.hasError).toBe(true)
      expect(result.current.error).toBe(initialError)
    })
  })

  describe('Derived State', () => {
    it('computes errorType correctly', () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Test error')

      errorHandling.categorizeError.mockReturnValue(errorHandling.ERROR_TYPES.NETWORK)

      act(() => {
        result.current.handleError(testError)
      })

      expect(result.current.errorType).toBe(errorHandling.ERROR_TYPES.NETWORK)
      expect(errorHandling.categorizeError).toHaveBeenCalledWith(testError)
    })

    it('computes errorMessage correctly', () => {
      const { result } = renderHook(() => useErrorHandler('test-context'))
      const testError = new Error('Test error')

      errorHandling.getUserFriendlyMessage.mockReturnValue('User friendly message')

      act(() => {
        result.current.handleError(testError)
      })

      expect(result.current.errorMessage).toBe('User friendly message')
      expect(errorHandling.getUserFriendlyMessage).toHaveBeenCalledWith(testError, 'test-context')
    })

    it('computes isRetryable correctly', () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Test error')

      errorHandling.isRetryableError.mockReturnValue(true)

      act(() => {
        result.current.handleError(testError)
      })

      expect(result.current.isRetryable).toBe(true)
      expect(errorHandling.isRetryableError).toHaveBeenCalledWith(testError)
    })

    it('returns null values when no error', () => {
      const { result } = renderHook(() => useErrorHandler())

      expect(result.current.errorType).toBeNull()
      expect(result.current.errorMessage).toBeNull()
      expect(result.current.isRetryable).toBe(false)
    })
  })

  describe('Memoization', () => {
    it('memoizes functions correctly', () => {
      const { result, rerender } = renderHook(() => useErrorHandler('test-context'))

      const initialHandleError = result.current.handleError
      const initialClearError = result.current.clearError
      const initialRetry = result.current.retry
      const initialExecute = result.current.execute

      rerender()

      expect(result.current.handleError).toBe(initialHandleError)
      expect(result.current.clearError).toBe(initialClearError)
      expect(result.current.retry).toBe(initialRetry)
      expect(result.current.execute).toBe(initialExecute)
    })
  })
})