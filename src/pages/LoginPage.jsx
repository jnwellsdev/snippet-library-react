import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// Portfolio mode: Removed unused imports

const LoginPage = () => {
	const navigate = useNavigate()

	useEffect(() => {
		// Portfolio mode: Always redirect to home since user is always "authenticated"
		navigate('/', { replace: true })
	}, [navigate])

	// Portfolio mode: Always redirect, so never show login form
	return null
}

export default LoginPage
