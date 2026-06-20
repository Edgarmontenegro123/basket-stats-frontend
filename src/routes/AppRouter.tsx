import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import LoginPage from '../components/pages/login/LoginPage'
import ProtectedRoute from './ProtectedRoute'
import RegisterPage from '../components/pages/register/RegisterPage'
import MainLayout from '../components/layout/MainLayout.tsx'
import DashboardPage from '../components/pages/dashboard/DashboardPage.tsx'
import TeamsPage from '../components/pages/teams/TeamsPage.tsx'
import TeamProfilePage from '../components/pages/teams/TeamProfilePage'
import GamesPage from '../components/pages/games/GamesPage.tsx'
import UploadStatsPage from '../components/pages/uploads/UploadStatsPage.tsx'
import RankingsPage from '../components/pages/rankings/RankingsPage.tsx'
import ComparePage from '../components/pages/compare/ComparePage.tsx'
import SeasonsPage from '../components/pages/seasons/SeasonsPage.tsx'
import GameAnalyticsPage from '../components/pages/games/GameAnalyticsPage.tsx'
import PlayersPage from '../components/pages/players/PlayersPage.tsx'
import PlayerProfilePage from '../components/pages/players/PlayerProfilePage.tsx'

export const AppRouter = () => {
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
                        <Route path='/upload-stats' element={<UploadStatsPage/>}/>
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