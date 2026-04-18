import { Link, Outlet } from 'react-router-dom'
import './MainLayout.css'

export const MainLayout = () => {
    return (
        <div className='layout'>

            {/* Sidebar */}
            <aside className='sidebar'>
                <h2 className='sedebar-title'>Basket Stats</h2>
                <nav className='nav'>
                    <Link to='/dashboard'>Dashboard</Link>
                    <Link to='/teams'>Teams</Link>
                    <Link to='/games'>Games</Link>
                    <Link to='/upload-stats'>Upload</Link>
                    <Link to='/rankings'>Rankings</Link>
                    <Link to='/compare'>Compare</Link>
                </nav>
            </aside>

            {/* Content */}
            <main className='content'>
                <Outlet />
            </main>
        </div>
    )
}