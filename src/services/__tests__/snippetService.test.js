import { vi } from 'vitest'
import { createSnippet } from '../firestoreService'
import { Snippet } from '../../models/Snippet'

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
}))

vi.mock('../firebase', () => ({
  db: {},
}))

describe('Snippet Service - createSnippet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a snippet successfully', async () => {
    const { addDoc, collection } = await import('firebase/firestore')
    const mockDocRef = { id: 'new-snippet-id' }
    vi.mocked(addDoc).mockResolvedValue(mockDocRef)
    vi.mocked(collection).mockReturnValue('mock-collection')

    const snippet = new Snippet({
      title: 'Test Snippet',
      htmlContent: '<div>Hello World</div>',
      authorId: 'user-123',
      authorEmail: 'test@example.com',
      voteCount: 0,
      tags: [],
    })

    const result = await createSnippet(snippet)

    expect(result).toBe('new-snippet-id')
    expect(vi.mocked(addDoc)).toHaveBeenCalledWith(
      'mock-collection',
      expect.objectContaining({
        title: 'Test Snippet',
        htmlContent: '<div>Hello World</div>',
        authorId: 'user-123',
        authorEmail: 'test@example.com',
        voteCount: 0,
        tags: [],
        createdAt: { _methodName: 'serverTimestamp' },
        updatedAt: { _methodName: 'serverTimestamp' },
      })
    )
  })

  it('validates snippet data before creating', async () => {
    const { addDoc } = await import('firebase/firestore')
    const invalidSnippet = new Snippet({
      title: '', // Invalid: empty title
      htmlContent: '<div>Hello World</div>',
      authorId: 'user-123',
      authorEmail: 'test@example.com',
    })

    await expect(createSnippet(invalidSnippet)).rejects.toThrow(/Invalid snippet data/)
    expect(vi.mocked(addDoc)).not.toHaveBeenCalled()
  })

  it('handles Firestore errors', async () => {
    const { addDoc, collection } = await import('firebase/firestore')
    const firestoreError = new Error('Firestore connection failed')
    vi.mocked(addDoc).mockRejectedValue(firestoreError)
    vi.mocked(collection).mockReturnValue('mock-collection')

    const snippet = new Snippet({
      title: 'Test Snippet',
      htmlContent: '<div>Hello World</div>',
      authorId: 'user-123',
      authorEmail: 'test@example.com',
      voteCount: 0,
      tags: [],
    })

    await expect(createSnippet(snippet)).rejects.toThrow(/Failed to create document/)
  })

  it('includes all required fields in Firestore document', async () => {
    const { addDoc, collection } = await import('firebase/firestore')
    const mockDocRef = { id: 'new-snippet-id' }
    vi.mocked(addDoc).mockResolvedValue(mockDocRef)
    vi.mocked(collection).mockReturnValue('mock-collection')

    const snippet = new Snippet({
      title: 'Test Snippet',
      htmlContent: '<div>Hello World</div>',
      authorId: 'user-123',
      authorEmail: 'test@example.com',
      voteCount: 5,
      tags: ['html', 'test'],
    })

    await createSnippet(snippet)

    const callArgs = vi.mocked(addDoc).mock.calls[0][1]
    expect(callArgs).toHaveProperty('title', 'Test Snippet')
    expect(callArgs).toHaveProperty('htmlContent', '<div>Hello World</div>')
    expect(callArgs).toHaveProperty('authorId', 'user-123')
    expect(callArgs).toHaveProperty('authorEmail', 'test@example.com')
    expect(callArgs).toHaveProperty('voteCount', 5)
    expect(callArgs).toHaveProperty('tags', ['html', 'test'])
    expect(callArgs).toHaveProperty('createdAt')
    expect(callArgs).toHaveProperty('updatedAt')
  })
})