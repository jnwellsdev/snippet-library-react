const AuthGuard = ({ children, fallback = '/login' }) => {
	// Portfolio mode: Always allow access
	return children
}

export default AuthGuard
