import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
    const token = localStorage.getItem('basket_stats_token')
    const storedUser = localStorage.getItem('basket_stats_user')

    if (!token || !storedUser) {
        localStorage.removeItem('basket_stats_token')
        localStorage.removeItem('basket_stats_user')

        return <Navigate to='/login' replace />
    }

    try {
        JSON.parse(storedUser)
    } catch {
        localStorage.removeItem('basket_stats_token')
        localStorage.removeItem('basket_stats_user')

        return <Navigate to='/login' replace />
    }

    return <Outlet />
}

export default ProtectedRoute