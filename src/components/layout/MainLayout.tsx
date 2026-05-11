import { NavLink, Outlet } from 'react-router-dom'
import './MainLayout.css'

export const MainLayout = () => {
    return (
        <div className='layout'>

            {/* Sidebar */}
            <aside className='sidebar'>
                <div className='sidebar-brand'>
                    <h2 className='sedebar-title'>Basket Stats</h2>
                    <p className='sedebar-subtitle'>Analytics dashboard</p>
                </div>

                <nav className='nav'>
                    <NavLink
                        to='/dashboard'
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to='/teams'
                        className={({ isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Teams
                    </NavLink>
                    <NavLink
                        to='/games'
                        className={({ isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Games
                    </NavLink>
                    <NavLink
                        to='/seasons'
                        className={({ isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Seasons
                    </NavLink>
                    <NavLink
                        to='/upload-stats'
                        className={({ isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Upload
                    </NavLink>
                    <NavLink
                        to='/rankings'
                        className={({ isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Rankings
                    </NavLink>
                    <NavLink
                        to='/compare'
                        className={({ isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Compare
                    </NavLink>
                </nav>
            </aside>

            {/* Content */}
            <div className='content-shell'>
                <main className='content'>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}