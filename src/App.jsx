import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import { AppLayout, ErrorBoundary } from './components'
import { AuthProvider } from './contexts/AuthContext'
import AppRoutes from './routes/AppRoutes'

function App() {
	useEffect(() => {
		document.body.classList.add('dark', 'dark-theme')
		document.body.classList.remove('light', 'light-theme')

		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual'
		}

		const originalScrollY = window.scrollY
		const lockScroll = () => window.scrollTo(0, 0)
		window.scrollTo(0, 0)
		window.addEventListener('scroll', lockScroll, { passive: false })
		const releaseScrollLock = setTimeout(() => {
			window.removeEventListener('scroll', lockScroll)
		}, 1000)

		return () => {
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
