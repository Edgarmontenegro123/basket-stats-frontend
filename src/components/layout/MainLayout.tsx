import {useEffect, useState} from 'react'
import {NavLink, Outlet, useNavigate} from 'react-router-dom'
import {canUploadStats} from '../../auth/permissions'
import ConfirmModal from '../common/ConfirmModal'
import logo from '../../assets/logo.png'
import './MainLayout.css'

const MainLayout = () => {
    const navigate = useNavigate()
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)

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

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)

    }

    const storedUser = localStorage.getItem('basket_stats_user')
    const currentUser = storedUser ? JSON.parse(storedUser) : null

    const handleLogout = () => {
        localStorage.removeItem('basket_stats_token')
        localStorage.removeItem('basket_stats_user')
        setIsLogoutModalOpen(false)

        navigate('/login')
    }

    return (
        <div className='layout'>
            <header className='mobile-header'>
                <div className='mobile-brand'>
                    <img src={logo} alt='Basket Stats logo' className='mobile-logo' />
                    <span className='mobile-title'>Basket Stats</span>
                </div>
                <button
                    className='hamburger-button'
                    onClick={toggleMobileMenu}
                    aria-label='Toggle navigation menu'
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </header>
            {isMobileMenuOpen && (
                <div className='sidebar-overlay' onClick={closeMobileMenu} />
            )}
            <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className='sidebar-brand'>
                    <div className='sidebar-logo-wrapper'>
                        <img
                            src={logo}
                            alt='Basket Stats logo'
                            className='sidebar-logo'
                        />
                    </div>
                    <div>
                        <h2 className='sidebar-title'>Basket Stats</h2>
                        <p className='sidebar-subtitle'>Analytics dashboard</p>
                    </div>
                </div>
                <div className='sidebar-actions'>

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
                </div>
                <nav className='nav'>
                    <NavLink
                        to='/dashboard'
                        onClick={closeMobileMenu}
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to='/teams'
                        onClick={closeMobileMenu}
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Teams
                    </NavLink>
                    <NavLink
                        to='/players'
                        onClick={closeMobileMenu}
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Players
                    </NavLink>
                    <NavLink
                        to='/games'
                        onClick={closeMobileMenu}
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Games
                    </NavLink>
                    <NavLink
                        to='/analytics'
                        onClick={closeMobileMenu}
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Analytics
                    </NavLink>
                    <NavLink
                        to='/seasons'
                        onClick={closeMobileMenu}
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Seasons
                    </NavLink>
                    {canUploadStats(currentUser?.role) && (
                        <NavLink to='/upload-stats'
                                 onClick={closeMobileMenu}
                                 className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            Upload
                        </NavLink>
                    )}
                    <NavLink
                        to='/rankings'
                        onClick={closeMobileMenu}
                        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        Rankings
                    </NavLink>
                    <NavLink
                        to='/compare'
                        onClick={closeMobileMenu}
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