// Firebase emulator setup for integration tests
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// Test Firebase config for emulator
const testFirebaseConfig = {
  apiKey: 'demo-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: 'demo-project.firebasestorage.app',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:demo',
}

// Initialize Firebase for testing
const testApp = initializeApp(testFirebaseConfig, 'test-app')
export const testAuth = getAuth(testApp)
export const testDb = getFirestore(testApp)

// Connect to emulators
let emulatorsConnected = false

export const connectToEmulators = () => {
  if (!emulatorsConnected) {
    try {
      connectAuthEmulator(testAuth, 'http://localhost:9099', { disableWarnings: true })
      connectFirestoreEmulator(testDb, 'localhost', 8080)
      emulatorsConnected = true
      console.log('Connected to Firebase emulators for testing')
    } catch (error) {
      console.warn('Failed to connect to emulators:', error.message)
    }
  }
}

// Helper function to create test user
export const createTestUser = async (email = 'test@example.com', password = 'testpassword') => {
  try {
    const userCredential = await signInWithEmailAndPassword(testAuth, email, password)
    return userCredential.user
  } catch (error) {
    // User doesn't exist, this is expected in tests
    return null
  }
}

// Clean up function for tests
export const cleanupEmulator = async () => {
  if (testAuth.currentUser) {
    await testAuth.signOut()
  }
}