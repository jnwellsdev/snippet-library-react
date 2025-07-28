import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import './AppLayout.css'

/**
 * Main application layout wrapper with consistent header navigation
 * Provides the overall structure for all pages in the application
 */
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navigation />
      <main className="app-layout__main">
        {children || <Outlet />}
      </main>
    </div>
  )
}

export default AppLayout