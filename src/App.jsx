import { BrowserRouter as Router } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { AppLayout, ErrorBoundary } from './components'
import AppRoutes from './routes/AppRoutes'
import './App.css'

function App() {
    // Ensure dark class is applied to body as fallback
    useEffect(() => {
        document.body.classList.add('dark', 'dark-theme')
        document.body.classList.remove('light', 'light-theme')

        return () => {
            // Cleanup if component unmounts
            document.body.classList.remove('dark', 'dark-theme')
        }
    }, [])

    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <ErrorBoundary
                        message="Something went wrong with the navigation. Please try refreshing the page."
                    >
                        <AppLayout>
                            <ErrorBoundary
                                message="There was an error loading this page. Please try again."
                            >
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