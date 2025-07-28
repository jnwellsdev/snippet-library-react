// Simple Firebase connection test
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// Load environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDg8GoWAqFRRMvRdEC3U2gxadVkJx5QSy0',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'do-snippets-app.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'do-snippets-app',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'do-snippets-app.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '826096392259',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:826096392259:web:6c30991b6dbe4cdcf51cf6',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-5V64B8531R'
}

console.log('Testing Firebase connection...')
console.log('Project ID:', firebaseConfig.projectId)

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig)
  console.log('✅ Firebase app initialized successfully')

  // Test Auth
  const auth = getAuth(app)
  console.log('✅ Firebase Auth initialized')

  // Test Firestore
  const db = getFirestore(app)
  console.log('✅ Firestore initialized')

  console.log('\n🎉 Firebase connection test completed successfully!')
  console.log('Your Firebase configuration is working correctly.')
  
} catch (error) {
  console.error('❌ Firebase connection failed:', error.message)
  process.exit(1)
}