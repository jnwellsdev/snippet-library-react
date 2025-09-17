import { createContext, useContext, useEffect, useState } from 'react'
// Portfolio mode: Auth service imports removed as they're not needed

const AuthContext = createContext()

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}

export const AuthProvider = ({ children }) => {
	// Portfolio mode: Always return a mock authenticated user
	const [user] = useState({
		id: 'user',
		uid: 'user',
		email: 'user@example.com',
		displayName: 'User',
	})
	const [loading] = useState(false)
	const [error, setError] = useState(null)

	useEffect(() => {
		// Portfolio mode: No real authentication needed
		// Just keeping this for compatibility
	}, [])
	/**
	 * Portfolio mode: Mock login function
	 * @param {string} email - User's email address
	 * @returns {Promise<{success: boolean}>}
	 */
	const login = async (email) => {
		// Portfolio mode: Always return success without actually logging in
		return { success: true }
	}

	/**
	 * Portfolio mode: Mock logout function
	 * @returns {Promise<void>}
	 */
	const logout = async () => {
		// Portfolio mode: No actual logout needed
		return Promise.resolve()
	}

	/**
	 * Clear any authentication errors
	 */
	const clearError = () => {
		setError(null)
	}

	const value = {
		user,
		loading,
		error,
		login,
		logout,
		clearError,
		isAuthenticated: !!user,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
