#!/usr/bin/env node

// Deployment script for Firebase hosting and Firestore rules
import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
]

function checkEnvironment() {
  console.log('🔍 Checking environment variables...')
  
  const envFile = '.env'
  if (!existsSync(envFile)) {
    console.error('❌ .env file not found. Please create one based on .env.example')
    process.exit(1)
  }

  const envContent = readFileSync(envFile, 'utf8')
  const missingVars = REQUIRED_ENV_VARS.filter(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm')
    return !regex.test(envContent)
  })

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => console.error(`   - ${varName}`))
    process.exit(1)
  }

  console.log('✅ Environment variables validated')
}

function runCommand(command, description) {
  console.log(`🚀 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} completed`)
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    process.exit(1)
  }
}

function main() {
  const args = process.argv.slice(2)
  const deployType = args[0] || 'all'

  console.log('🔥 Firebase Deployment Script')
  console.log('==============================')

  checkEnvironment()

  switch (deployType) {
    case 'hosting':
      runCommand('npm run build', 'Building application')
      runCommand('firebase deploy --only hosting', 'Deploying to Firebase Hosting')
      break
    
    case 'rules':
      runCommand('firebase deploy --only firestore:rules', 'Deploying Firestore security rules')
      break
    
    case 'indexes':
      runCommand('firebase deploy --only firestore:indexes', 'Deploying Firestore indexes')
      break
    
    case 'all':
    default:
      runCommand('npm run build', 'Building application')
      runCommand('firebase deploy', 'Deploying to Firebase (hosting + rules + indexes)')
      break
  }

  console.log('🎉 Deployment completed successfully!')
}

main()