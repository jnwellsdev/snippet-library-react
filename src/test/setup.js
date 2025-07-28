import '@testing-library/jest-dom'

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    _delegate: { _config: {} },
  })),
  connectAuthEmulator: vi.fn(),
  sendSignInLinkToEmail: vi.fn(),
  signInWithEmailLink: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  connectFirestoreEmulator: vi.fn(),
}))

// Mock the firebase service module
vi.mock('../services/firebase', () => ({
  auth: {
    currentUser: null,
    _delegate: { _config: {} },
  },
  db: {},
  default: {},
}))

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000',
    pathname: '/',
  },
  writable: true,
})

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    replaceState: vi.fn(),
  },
  writable: true,
})

// Mock window.prompt
Object.defineProperty(window, 'prompt', {
  value: vi.fn(),
  writable: true,
})