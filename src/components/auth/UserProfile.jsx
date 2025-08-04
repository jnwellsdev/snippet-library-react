import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import * as Avatar from '@radix-ui/react-avatar'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button, Text, Flex } from '@radix-ui/themes'
import './UserProfile.css'

const UserProfile = () => {
	const { user, logout } = useAuth()
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const navigate = useNavigate()

	const handleLogout = async () => {
		setIsLoggingOut(true)
		try {
			await logout()
			navigate('/')
		} catch (error) {
			console.error('Logout error:', error)
		} finally {
			setIsLoggingOut(false)
		}
	}

	if (!user) return null

	// Get user initial for avatar
	const getInitial = (email) => email.charAt(0).toUpperCase()

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<Button variant='ghost' className='user-profile-trigger'>
					<Avatar.Root className='user-profile-avatar'>
						<Avatar.Fallback>{getInitial(user.email)}</Avatar.Fallback>
					</Avatar.Root>
				</Button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content align='end' sideOffset={8} className='user-profile-dropdown'>
					<div className='user-profile-info'>
						<div className='user-profile-label'>Signed in as</div>
						<div className='user-profile-email'>{user.email}</div>
					</div>

					<hr className='user-profile-separator' />

					<DropdownMenu.Item asChild>
						<button className='user-profile-logout' onClick={handleLogout} disabled={isLoggingOut}>
							{isLoggingOut ? 'Signing out...' : 'Sign out'}
						</button>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}

export default UserProfile
