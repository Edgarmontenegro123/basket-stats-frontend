import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import LoginPage from '../components/pages/login/LoginPage'
import ProtectedRoute from './ProtectedRoute'
import RegisterPage from '../components/pages/register/RegisterPage'
import { canUploadStats } from '../auth/permissions'
import MainLayout from '../components/layout/MainLayout'
import DashboardPage from '../components/pages/dashboard/DashboardPage'
import TeamsPage from '../components/pages/teams/TeamsPage'
import TeamProfilePage from '../components/pages/teams/TeamProfilePage'
import GamesPage from '../components/pages/games/GamesPage'
import UploadStatsPage from '../components/pages/uploads/UploadStatsPage'
import RankingsPage from '../components/pages/rankings/RankingsPage'
import ComparePage from '../components/pages/compare/ComparePage'
import SeasonsPage from '../components/pages/seasons/SeasonsPage'
import GameAnalyticsPage from '../components/pages/games/GameAnalyticsPage'
import PlayersPage from '../components/pages/players/PlayersPage'
import PlayerProfilePage from '../components/pages/players/PlayerProfilePage'

export const AppRouter = () => {
    const getCurrentUser = () => {
        const storedUser = localStorage.getItem('basket_stats_user')

        if (!storedUser) {
            return null
        }
        try {
            return JSON.parse(storedUser)
        } catch {
            localStorage.removeItem('basket_stats_user')
            return null
        }
    }

    const currentUser = getCurrentUser()

    const uploadStatsElement = canUploadStats(currentUser?.role)
        ? <UploadStatsPage />
        : <Navigate to='/dashboard' replace />

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={<LoginPage/>}/>
                <Route path='/register' element={<RegisterPage/>}/>

                <Route element={<ProtectedRoute/>}>

                    <Route path='/' element={<Navigate to='/dashboard' replace/>}/>
                    <Route element={<MainLayout/>}>
                        <Route path='/dashboard' element={<DashboardPage/>}/>
                        <Route path='/teams' element={<TeamsPage/>}/>
                        <Route path='/teams/:id' element={<TeamProfilePage/>}/>
                        <Route path='/players' element={<PlayersPage/>}/>
                        <Route path='/players/:id' element={<PlayerProfilePage/>}/>
                        <Route path='/games' element={<GamesPage/>}/>
                        <Route path='/upload-stats' element={uploadStatsElement}/>
                        <Route path='/rankings' element={<RankingsPage/>}/>
                        <Route path='/compare' element={<ComparePage/>}/>
                        <Route path='/seasons' element={<SeasonsPage/>}/>
                        <Route path='/analytics' element={<GameAnalyticsPage/>}/>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}