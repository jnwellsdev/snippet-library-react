// Firebase configuration and initialization

import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Validate required config
const requiredConfig = ['apiKey', 'authDomain', 'projectId']
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key])

if (missingConfig.length > 0) {
  throw new Error(`Missing required Firebase configuration: ${missingConfig.join(', ')}`)
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
  useEmulator: import.meta.env.VITE_USE_FIREBASE_EMULATOR,
  isDev: import.meta.env.DEV
})
console.log('Raw env vars:', {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? 'SET' : 'MISSING',
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID
})
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Connect to emulators in development
if (false) { // Temporarily disabled for debugging
  try {
    // Check if emulators are not already connected
    if (!auth._delegate._config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    }
    if (!db._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080)
    }
    console.log('Connected to Firebase emulators')
  } catch (error) {
    console.warn('Failed to connect to Firebase emulators:', error.message)
  }
}

export default app
