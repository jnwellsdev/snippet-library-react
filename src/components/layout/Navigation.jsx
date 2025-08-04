import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import UserProfile from '../auth/UserProfile'
import './Navigation.css'

function Navigation() {
	const { user, isAuthenticated } = useAuth()
	const location = useLocation()

	const isActiveRoute = (path) => {
		if (path === '/') return location.pathname === '/'
		return location.pathname.startsWith(path)
	}

	return (
		<nav className='navigation'>
			<div className='navigation__container'>
				<div className='navigation__brand'>
					<Link to='/' className='navigation__brand-link'>
						<div className='title'>
							<h3>Snippet Library</h3>
						</div>
					</Link>
				</div>

				<div className='navigation__links'>
					<Link to='/snippets' className={`navigation__link ${isActiveRoute('/snippets') ? 'navigation__link--active' : ''}`}>
						Browse Snippets
					</Link>
					{isAuthenticated && (
						<Link to='/create' className={`navigation__link navigation__link--primary ${isActiveRoute('/create') ? 'navigation__link--active' : ''}`}>
							Create Snippet
						</Link>
					)}
				</div>

				<div className='navigation__auth'>
					{isAuthenticated ? (
						<UserProfile />
					) : (
						<Link to='/login' className='navigation__login-btn'>
							Sign In
						</Link>
					)}
				</div>
			</div>
		</nav>
	)
}

export default Navigation
