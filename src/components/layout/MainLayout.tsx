import { Link, Outlet } from 'react-router-dom'

export const MainLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>

            {/* Sidebar */}
            <aside style={{ width: '220px', padding: '20px', background: '#020617' }}>
                <h2>Basket Stats</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link to='/dashboard'>Dashboard</Link>
                    <Link to='/teams'>Teams</Link>
                    <Link to='/games'>Games</Link>
                    <Link to='/upload-stats'>Upload</Link>
                    <Link to='/rankings'>Rankings</Link>
                    <Link to='/compare'>Compare</Link>
                </nav>
            </aside>

            {/* Content */}
            <main style={{ flex: 1, padding: '20px' }}>
                <Outlet />
            </main>
        </div>
    )
}