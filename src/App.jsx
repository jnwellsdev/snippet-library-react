import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import { AppLayout, ErrorBoundary } from './components'
import { AuthProvider } from './contexts/AuthContext'
import AppRoutes from './routes/AppRoutes'

function App() {
	// Ensure dark class is applied to body as fallback
	useEffect(() => {
		document.body.classList.add('dark', 'dark-theme')
		document.body.classList.remove('light', 'light-theme')

		// Aggressive scroll jump prevention
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual'
		}

		// Lock scroll position during initial render
		const originalScrollY = window.scrollY
		const lockScroll = () => window.scrollTo(0, 0)

		// Ensure page starts at top and stays there during load
		window.scrollTo(0, 0)

		// Prevent scroll during initial content loading
		window.addEventListener('scroll', lockScroll, { passive: false })

		// Release scroll lock after initial render is complete
		const releaseScrollLock = setTimeout(() => {
			window.removeEventListener('scroll', lockScroll)
		}, 1000)

		return () => {
			// Cleanup if component unmounts
			document.body.classList.remove('dark', 'dark-theme')
			window.removeEventListener('scroll', lockScroll)
			clearTimeout(releaseScrollLock)
		}
	}, [])

	return (
		<ErrorBoundary>
			<AuthProvider>
				<Router>
					<ErrorBoundary message='Something went wrong with the navigation. Please try refreshing the page.'>
						<AppLayout>
							<ErrorBoundary message='There was an error loading this page. Please try again.'>
								<AppRoutes />
							</ErrorBoundary>
						</AppLayout>
					</ErrorBoundary>
				</Router>
			</AuthProvider>
		</ErrorBoundary>
	)
}

export default App
