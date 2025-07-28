// Integration tests for Firebase configuration and deployment setup
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'

describe('Firebase Deployment Configuration', () => {
  describe('Configuration Files', () => {
    it('should have firebase.json configuration file', () => {
      expect(existsSync('firebase.json')).toBe(true)
      
      const firebaseConfig = JSON.parse(readFileSync('firebase.json', 'utf8'))
      
      // Check hosting configuration
      expect(firebaseConfig.hosting).toBeDefined()
      expect(firebaseConfig.hosting.public).toBe('dist')
      expect(firebaseConfig.hosting.rewrites).toBeDefined()
      expect(firebaseConfig.hosting.rewrites[0].source).toBe('**')
      expect(firebaseConfig.hosting.rewrites[0].destination).toBe('/index.html')
      
      // Check firestore configuration
      expect(firebaseConfig.firestore).toBeDefined()
      expect(firebaseConfig.firestore.rules).toBe('firestore.rules')
      expect(firebaseConfig.firestore.indexes).toBe('firestore.indexes.json')
      
      // Check emulator configuration
      expect(firebaseConfig.emulators).toBeDefined()
      expect(firebaseConfig.emulators.auth.port).toBe(9099)
      expect(firebaseConfig.emulators.firestore.port).toBe(8080)
    })

    it('should have firestore security rules file', () => {
      expect(existsSync('firestore.rules')).toBe(true)
      
      const rulesContent = readFileSync('firestore.rules', 'utf8')
      
      // Check that rules contain essential security patterns
      expect(rulesContent).toContain('rules_version = \'2\'')
      expect(rulesContent).toContain('service cloud.firestore')
      expect(rulesContent).toContain('match /users/{userId}')
      expect(rulesContent).toContain('match /snippets/{snippetId}')
      expect(rulesContent).toContain('match /votes/{voteId}')
      expect(rulesContent).toContain('request.auth != null')
    })

    it('should have firestore indexes configuration', () => {
      expect(existsSync('firestore.indexes.json')).toBe(true)
      
      const indexesConfig = JSON.parse(readFileSync('firestore.indexes.json', 'utf8'))
      
      expect(indexesConfig.indexes).toBeDefined()
      expect(Array.isArray(indexesConfig.indexes)).toBe(true)
      
      // Check for essential indexes
      const snippetIndexes = indexesConfig.indexes.filter(index => 
        index.collectionGroup === 'snippets'
      )
      expect(snippetIndexes.length).toBeGreaterThan(0)
      
      const voteIndexes = indexesConfig.indexes.filter(index => 
        index.collectionGroup === 'votes'
      )
      expect(voteIndexes.length).toBeGreaterThan(0)
    })
  })

  describe('Environment Configuration', () => {
    it('should have environment example file', () => {
      expect(existsSync('.env.example')).toBe(true)
      
      const envExample = readFileSync('.env.example', 'utf8')
      
      // Check for required environment variables
      expect(envExample).toContain('VITE_FIREBASE_API_KEY')
      expect(envExample).toContain('VITE_FIREBASE_AUTH_DOMAIN')
      expect(envExample).toContain('VITE_FIREBASE_PROJECT_ID')
      expect(envExample).toContain('VITE_FIREBASE_STORAGE_BUCKET')
      expect(envExample).toContain('VITE_FIREBASE_MESSAGING_SENDER_ID')
      expect(envExample).toContain('VITE_FIREBASE_APP_ID')
      expect(envExample).toContain('VITE_USE_FIREBASE_EMULATOR')
    })

    it('should have local development environment file', () => {
      expect(existsSync('.env.local')).toBe(true)
      
      const envLocal = readFileSync('.env.local', 'utf8')
      
      // Check for emulator configuration
      expect(envLocal).toContain('VITE_USE_FIREBASE_EMULATOR=true')
      expect(envLocal).toContain('demo-project')
    })
  })

  describe('Deployment Scripts', () => {
    it('should have deployment script', () => {
      expect(existsSync('scripts/deploy.js')).toBe(true)
      
      const deployScript = readFileSync('scripts/deploy.js', 'utf8')
      
      // Check for essential deployment functionality
      expect(deployScript).toContain('checkEnvironment')
      expect(deployScript).toContain('firebase deploy')
      expect(deployScript).toContain('npm run build')
    })

    it('should have package.json scripts for deployment', () => {
      expect(existsSync('package.json')).toBe(true)
      
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
      
      // Check for deployment scripts
      expect(packageJson.scripts.deploy).toBeDefined()
      expect(packageJson.scripts['deploy:hosting']).toBeDefined()
      expect(packageJson.scripts['deploy:rules']).toBeDefined()
      expect(packageJson.scripts['deploy:indexes']).toBeDefined()
      
      // Check for emulator scripts
      expect(packageJson.scripts['emulators:start']).toBeDefined()
      expect(packageJson.scripts['test:emulator']).toBeDefined()
    })
  })

  describe('Firebase Configuration Validation', () => {
    it('should validate Firebase configuration structure', () => {
      // Check Firebase configuration file structure
      const firebaseConfigContent = readFileSync('src/services/firebase.js', 'utf8')
      
      // Check that Firebase is properly configured
      expect(firebaseConfigContent).toContain('initializeApp')
      expect(firebaseConfigContent).toContain('getAuth')
      expect(firebaseConfigContent).toContain('getFirestore')
      expect(firebaseConfigContent).toContain('firebaseConfig')
      expect(firebaseConfigContent).toContain('export const auth')
      expect(firebaseConfigContent).toContain('export const db')
    })

    it('should have proper environment variable validation', () => {
      const firebaseConfig = readFileSync('src/services/firebase.js', 'utf8')
      
      // Check for environment variable validation
      expect(firebaseConfig).toContain('requiredConfig')
      expect(firebaseConfig).toContain('missingConfig')
      expect(firebaseConfig).toContain('Missing required Firebase configuration')
    })
  })

  describe('Security Rules Validation', () => {
    it('should have comprehensive user collection rules', () => {
      const rulesContent = readFileSync('firestore.rules', 'utf8')
      
      // Check user collection security
      expect(rulesContent).toContain('match /users/{userId}')
      expect(rulesContent).toContain('request.auth.uid == userId')
    })

    it('should have proper snippet collection rules', () => {
      const rulesContent = readFileSync('firestore.rules', 'utf8')
      
      // Check snippet collection security
      expect(rulesContent).toContain('match /snippets/{snippetId}')
      expect(rulesContent).toContain('allow read: if true') // Public read
      expect(rulesContent).toContain('allow create: if request.auth != null')
    })

    it('should have vote collection security rules', () => {
      const rulesContent = readFileSync('firestore.rules', 'utf8')
      
      // Check vote collection security
      expect(rulesContent).toContain('match /votes/{voteId}')
      expect(rulesContent).toContain('request.auth.uid == request.resource.data.userId')
    })
  })
})