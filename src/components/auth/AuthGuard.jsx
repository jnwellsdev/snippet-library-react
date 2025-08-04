import { useAuth } from '../../contexts/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'
import { Flex, Text } from '@radix-ui/themes'

const AuthGuard = ({ children, fallback = '/login' }) => {
	const { user, loading } = useAuth()
	const location = useLocation()

	if (loading) {
		return (
			<Flex direction='column' align='center' justify='center' gap='3' style={{ minHeight: '200px' }}>
				<Text size='3' color='gray'>
					Loading...
				</Text>
			</Flex>
		)
	}

	// user is not authenticated
	if (!user) return <Navigate to={fallback} state={{ from: location }} replace />
	// User is authenticated
	return children
}

export default AuthGuard
