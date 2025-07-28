import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { LoginForm, PageContainer } from '../components'
import { Flex, Text } from '@radix-ui/themes'

const LoginPage = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the intended destination from location state, default to home
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    // If user is already authenticated, redirect to intended destination
    if (user && !loading) {
      navigate(from, { replace: true })
    }
  }, [user, loading, navigate, from])

  // Don't render login form if user is already authenticated
  if (user) {
    return null
  }

  const handleLoginSuccess = () => {
    // LoginForm will handle the magic link sending
    // Actual navigation happens after email link click
  }

  return (
    <PageContainer maxWidth="narrow" padding="spacious">
      <Flex direction="column" gap="6" align="center">
        <LoginForm onSuccess={handleLoginSuccess} />
      </Flex>
    </PageContainer>
  )
}

export default LoginPage
