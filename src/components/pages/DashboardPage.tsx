import {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import StatCard from '../common/StatCard'
import type {Game} from '../types/game'
import type {PlayerStats} from '../types/player'

import {
    getTeams,
    /*getSeasons,*/
    getGames,
    getTopScorers,
} from '../services/api'

import './DashboardPage.css'

const DashboardPage = () => {
    const [teamsCount, setTeamsCount] = useState<number>(0)
    /*const [seasonsCount, setSeasonsCount] = useState<number>(0)*/
    const [gamesCount, setGamesCount] = useState<number>(0)
    const [completedGamesCount, setCompletedGamesCount] = useState<number>(0)
    const [scheduledGamesCount, setScheduledGamesCount] = useState<number>(0)
    const [recentGames, setRecentGames] = useState<Game[]>([])
    const [topScorers, setTopScorers] = useState<PlayerStats[]>([])

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const teams = await getTeams()
                /*const seasons = await getSeasons()*/
                const games = await getGames()

                const completedGames = games.filter(
                    (game: Game) => game.status === 'completed',
                )

                const scheduledGames = games.filter(
                    (game: Game) => game.status === 'scheduled',
                )

                const scorers = await getTopScorers(5)
                setTopScorers(scorers)

                setTeamsCount(teams.length)
                /*setSeasonsCount(seasons.length)*/
                setGamesCount(games.length)

                setCompletedGamesCount(completedGames.length)
                setScheduledGamesCount(scheduledGames.length)

                setRecentGames(games.slice(0, 5))
            } catch (error) {
                console.error(error)
            }
        }

        void fetchDashboardData()
    }, []);

    return (
        <div className='dashboard-page'>
            <PageHeader
                title='Dashboard'
                subtitle='General overview of your basketball stats platform'
            />

            <section className='dashboard-page__stats'>
                <StatCard label='Teams' value={String(teamsCount)}/>
                <StatCard label='Games' value={String(gamesCount)}/>
                <StatCard label='Completed' value={String(completedGamesCount)}/>
                <StatCard label='Scheduled' value={String(scheduledGamesCount)}/>
            </section>

            <section className='dashboard-page__grid'>
                <SectionCard title='Current State'>
                    {recentGames.length === 0 ? (
                        <p>No games registered yet.</p>
                    ) : (
                        <ul className='dashboard-list'>
                            {recentGames.map((game) => (
                                <li key={game.id} className='dashboard-list__item'>
                    <span>
                        {game.home_team_name}
                        {' '}
                        {game.home_score !== null ? game.home_score : '-'}
                        {' - '}
                        {game.away_score !== null ? game.away_score : '-'}
                        {' '}
                        {game.away_team_name}
                    </span>
                                    <small>
                                        {new Date(game.game_date).toLocaleDateString()} · {game.status}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>

                <SectionCard title='Quick Actions'>
                    <div className='dashboard-actions'>
                        <Link to='/teams'>Manage Teams</Link>
                        <Link to='/players'>Manage Players</Link>
                        <Link to='/games'>Manage Games</Link>
                        <Link to='/upload-stats'>Upload Stats</Link>
                    </div>
                </SectionCard>

                <SectionCard title='Top Scorers'>
                    {topScorers.length === 0 ? (
                        <p>No player stats available yet.</p>
                    ) : (
                        <ul className='dashboard-list'>
                            {topScorers.map((player) => (
                                <li key={player.id} className='dashboard-list__item'>
                    <span>
                        {player.player_name} · {player.team_name}
                    </span>
                                    <small>
                                        {player.points} PTS · {player.rebounds} REB · {player.assists} AST
                                    </small>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>
            </section>
        </div>
    )
}

export default DashboardPage