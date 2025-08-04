import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import './AppLayout.css'

function AppLayout({ children }) {
	return (
		<div className='app-layout'>
			<Navigation />
			<main className='app-layout__main'>{children || <Outlet />}</main>
		</div>
	)
}

export default AppLayout
