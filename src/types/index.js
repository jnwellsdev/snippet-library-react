// Type definitions and constants for the application

// User model structure
export const UserModel = {
  id: '',
  email: '',
  displayName: '',
  createdAt: null,
  lastLoginAt: null,
}

// Snippet model structure
export const SnippetModel = {
  id: '',
  title: '',
  htmlContent: '',
  authorId: '',
  authorEmail: '',
  createdAt: null,
  updatedAt: null,
  voteCount: 0,
  tags: [],
}

// Vote model structure
export const VoteModel = {
  id: '',
  snippetId: '',
  userId: '',
  createdAt: null,
}

// Application constants
export const ROUTES = {
  HOME: '/',
  SNIPPETS: '/snippets',
  SNIPPET_DETAIL: '/snippets/:id',
  CREATE: '/create',
  LOGIN: '/login',
}

export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  SNIPPETS: 'snippets',
  VOTES: 'votes',
}
