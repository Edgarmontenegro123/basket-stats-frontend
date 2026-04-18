import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage  from '../components/pages/DashboardPage'
import TeamsPage from '../components/pages/TeamsPage'
import GamesPage from '../components/pages/GamesPage'
import UploadStatsPage from '../components/pages/UploadStatsPage'
import RankingsPage from '../components/pages/RankingsPage'
import ComparePage from '../components/pages/ComparePage'

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Navigate to='/dashboard' replace />} />
                <Route path='/dashboard' element={<DashboardPage />} />
                <Route path='/teams' element={<TeamsPage />} />
                <Route path='/games' element={<GamesPage />} />
                <Route path='/upload-stats' element={<UploadStatsPage />} />
                <Route path='/rankings' element={<RankingsPage />} />
                <Route path='/compare' element={<ComparePage />} />
            </Routes>
        </BrowserRouter>
    )
}