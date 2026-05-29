import {useEffect, useState} from 'react'
import PageHeader from '../../common/PageHeader.tsx'
import SectionCard from '../../common/SectionCard.tsx'
import StatCard from '../../common/StatCard.tsx'
import type {Game} from '../../types/game.ts'
import type {PlayerStats} from '../../types/player.ts'
import {
    getTeams,
    getGames,
    getTopScorers,
} from '../../services/api.ts'

import BasketballLoader from '../../common/BasketballLoader.tsx'
import './DashboardPage.css'

const DashboardPage = () => {
    const [teamsCount, setTeamsCount] = useState<number>(0)
    const [gamesCount, setGamesCount] = useState<number>(0)
    const [completedGamesCount, setCompletedGamesCount] = useState<number>(0)
    const [scheduledGamesCount, setScheduledGamesCount] = useState<number>(0)
    const [recentGames, setRecentGames] = useState<Game[]>([])
    const [topScorers, setTopScorers] = useState<PlayerStats[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const teams = await getTeams()
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
                setGamesCount(games.length)

                setCompletedGamesCount(completedGames.length)
                setScheduledGamesCount(scheduledGames.length)

                setRecentGames(games.slice(0, 5))
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        void fetchDashboardData()
    }, []);

    if (isLoading) {
        return (
            <div className='loading-overlay'>
                <div className='loading-box'>
                    <BasketballLoader/>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        )
    }

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
                        <strong>{' Vs '}</strong>
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