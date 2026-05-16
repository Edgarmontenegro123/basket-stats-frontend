import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import {MainLayout} from '../components/layout/MainLayout.tsx';
import DashboardPage from '../components/pages/DashboardPage'
import TeamsPage from '../components/pages/TeamsPage'
import GamesPage from '../components/pages/GamesPage'
import UploadStatsPage from '../components/pages/UploadStatsPage'
import RankingsPage from '../components/pages/RankingsPage'
import ComparePage from '../components/pages/ComparePage'
import SeasonsPage from '../components/pages/SeasonsPage'
import GameAnalyticsPage from '../components/pages/GameAnalyticsPage'

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Navigate to='/dashboard' replace/>}/>
                <Route element={<MainLayout/>}>
                    <Route path='/dashboard' element={<DashboardPage/>}/>
                    <Route path='/teams' element={<TeamsPage/>}/>
                    <Route path='/games' element={<GamesPage/>}/>
                    <Route path='/upload-stats' element={<UploadStatsPage/>}/>
                    <Route path='/rankings' element={<RankingsPage/>}/>
                    <Route path='/compare' element={<ComparePage/>}/>
                    <Route path='/seasons' element={<SeasonsPage />} />
                    <Route path='/analytics' element={<GameAnalyticsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}