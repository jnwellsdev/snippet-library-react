// Component exports - will be populated as components are created in later tasks

// Authentication components (Task 4)
export { default as LoginForm } from './auth/LoginForm';
export { default as AuthGuard } from './auth/AuthGuard';
export { default as UserProfile } from './auth/UserProfile';

// Snippet components (Tasks 5-7)
export { default as SnippetCard } from './snippets/SnippetCard';
export { default as SnippetDetail } from './snippets/SnippetDetail';
export { default as SnippetForm } from './snippets/SnippetForm';
export { default as SnippetPreview } from './snippets/SnippetPreview';
export { default as SyntaxHighlighter } from './snippets/SyntaxHighlighter';
export { default as CopyButton } from './snippets/CopyButton';
export { default as VoteButton } from './snippets/VoteButton';
export { default as TagFilter } from './snippets/TagFilter';

// UI components (Tasks 8-13)
export { default as LoadingSpinner } from './ui/LoadingSpinner';
export { default as LoadingButton } from './ui/LoadingButton';
export { default as LoadingCard } from './ui/LoadingCard';

// Error handling components (Task 14)
export { default as ErrorBoundary } from './ui/ErrorBoundary';
export { default as ErrorMessage } from './ui/ErrorMessage';
export { default as NetworkError } from './ui/NetworkError';

// Layout components (Task 12)
export { default as AppLayout } from './layout/AppLayout';
export { default as Navigation } from './layout/Navigation';
export { default as PageContainer } from './layout/PageContainer';
