import { Routes, Route } from 'react-router-dom'
import AuthGuard from '../components/auth/AuthGuard'
import { 
  LandingPage,
  LoginPage, 
  SnippetListPage,
  CreateSnippetPage,
  SnippetDetailPage 
} from '../pages'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/snippets" element={<SnippetListPage />} />
      <Route path="/snippets/:id" element={<SnippetDetailPage />} />
      <Route path="/create" element={
        <AuthGuard>
          <CreateSnippetPage />
        </AuthGuard>
      } />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}

export default AppRoutes
