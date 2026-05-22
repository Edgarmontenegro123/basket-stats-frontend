import {useEffect, useState} from 'react'

import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import StatCard from '../common/StatCard'
import type {Game} from '../types/game'
import type { PlayerStats } from '../types/player'

import {
    getTeams,
    getSeasons,
    getGames,
    getTopScorers,
} from '../services/api'

import './DashboardPage.css'

const DashboardPage = () => {
    const [teamsCount, setTeamsCount] = useState<number>(0)
    const [seasonsCount, setSeasonsCount] = useState<number>(0)
    const [gamesCount, setGamesCount] = useState<number>(0)
    const [recentGames, setRecentGames] = useState<Game[]>([])
    const [topScorers, setTopScorers] = useState<PlayerStats[]>([])

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const teams = await getTeams()
                const seasons = await getSeasons()
                const games = await getGames()
                const scorers = await getTopScorers(5)
                setTopScorers(scorers)

                setTeamsCount(teams.length)
                setSeasonsCount(seasons.length)
                setGamesCount(games.length)
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
                subtitle='Resumen general del equipo'
            />

            <section className='dashboard-page__stats'>
                <StatCard label='Teams' value={String(teamsCount)}/>
                <StatCard label='Seasons' value={String(seasonsCount)}/>
                <StatCard label='Games' value={String(gamesCount)}/>
                <StatCard label='Status' value='MVP'/>
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
                        {game.home_team_name} vs {game.away_team_name}
                    </span>
                                    <small>
                                        {new Date(game.game_date).toLocaleDateString()} · {game.status}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>

                <SectionCard title='Next Step'>
                    <p>Persist data using PostgreSQL.</p>
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