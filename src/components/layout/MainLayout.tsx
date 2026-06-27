import {useEffect, useState} from 'react'
import {NavLink, Outlet, useNavigate} from 'react-router-dom'
import ConfirmModal from '../common/ConfirmModal'
import logo from '../../assets/logo.png'
import './MainLayout.css'

const MainLayout = () => {
    const navigate = useNavigate()
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false)

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('basket_stats_theme') || 'dark'
    })

    useEffect(() => {
        document.body.classList.toggle('light-theme', theme === 'light')
        localStorage.setItem('basket_stats_theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark')
    }

    const storedUser = localStorage.getItem('basket_stats_user')
    const currentUser = storedUser ? JSON.parse(storedUser) : null

    const handleLogout = () => {
        localStorage.removeItem('basket_stats_token')
        localStorage.removeItem('basket_stats_user')

        navigate('/login')
    }

    return (
        <div className='layout'>
            <aside className='sidebar'>
                <div className='sidebar-brand'>
                    <img
                        src={logo}
                        alt='Basket Stats logo'
                        className='sidebar-logo'
                    />
                    <div>
                        <h2 className='sidebar-title'>Basket Stats</h2>
                        <p className='sidebar-subtitle'>Analytics dashboard</p>
                    </div>
                </div>
                <button
                    type='button'
                    className={`theme-toggle ${theme === 'light' ? 'light' : 'dark'}`}
                    onClick={toggleTheme}
                    aria-label='Toggle theme'
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    <span className='theme-toggle-icon sun'>☀️</span>
                    <span className='theme-toggle-icon moon'>🌙</span>
                    <span className='theme-toggle-thumb' />
                </button>
                <nav className='nav'>
                    <NavLink
                        to='/dashboard'
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to='/teams'
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Teams
                    </NavLink>
                    <NavLink
                        to='/players'
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Players
                    </NavLink>
                    <NavLink
                        to='/games'
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Games
                    </NavLink>
                    <NavLink
                        to='/analytics'
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Analytics
                    </NavLink>
                    <NavLink
                        to='/seasons'
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Seasons
                    </NavLink>
                    <NavLink
                        to='/upload-stats'
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Upload
                    </NavLink>
                    <NavLink
                        to='/rankings'
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Rankings
                    </NavLink>
                    <NavLink
                        to='/compare'
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Compare
                    </NavLink>
                </nav>
                {currentUser && (
                    <div className='sidebar-user-card'>
                        <div className='sidebar-user-avatar'>
                            {currentUser.email.charAt(0).toUpperCase()}
                        </div>
                        <span className='sidebar-user-email'>{currentUser.email}</span>
                    </div>
                )}
                <button
                    className='logout-button'
                    onClick={() => setIsLogoutModalOpen(true)}
                >
                    Logout
                </button>
            </aside>
            {/* Content */}
            <div className='content-shell'>
                <main className='content'>
                    <Outlet/>
                </main>
            </div>
            <ConfirmModal
                isOpen={isLogoutModalOpen}
                title='Log out'
                message='Are you sure you want to log out?'
                confirmLabel='Logout'
                cancelLabel='Cancel'
                onConfirm={handleLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
            />
        </div>
    )
}

export default MainLayout