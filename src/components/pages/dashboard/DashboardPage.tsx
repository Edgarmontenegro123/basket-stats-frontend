import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import type {AggregatedPlayerRanking} from '../../types/player'
import PageHeader from '../../common/PageHeader'
import SectionCard from '../../common/SectionCard'
import TopScorersChart from '../../common/TopScorersChart'
import GamesStatusChart from '../../common/GamesStatusChart'
import type {Game} from '../../types/game'
import type {RankingStat} from '../../types/ranking'
import {
    getTeams,
    getGames,
    getAggregatedPlayerRankings,
} from '../../services/api'

import BasketballLoader from '../../common/BasketballLoader'
import './DashboardPage.css'

const rankingStats: {label: string; value: RankingStat}[] = [
    {label: 'Points', value: 'points'},
    {label: 'Rebounds', value: 'rebounds'},
    {label: 'Assists', value: 'assists'},
    {label: 'Steals', value: 'steals'},
    {label: 'Blocks', value: 'blocks'},
]

const DashboardPage = () => {
    const navigate = useNavigate()
    const [teamsCount, setTeamsCount] = useState<number>(0)
    const [gamesCount, setGamesCount] = useState<number>(0)
    const [completedGamesCount, setCompletedGamesCount] = useState<number>(0)
    const [scheduledGamesCount, setScheduledGamesCount] = useState<number>(0)
    const [recentGames, setRecentGames] = useState<Game[]>([])
    const [lastCompletedGame, setLastCompletedGame] = useState<Game | null>(null)
    const [topScorers, setTopScorers] = useState<AggregatedPlayerRanking[]>([])
    const [selectedRankingStat, setSelectedRankingStat] = useState<RankingStat>('points')
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

                if (completedGames.length > 0) {
                    setLastCompletedGame(completedGames[0])
                }

                const scorers = await getAggregatedPlayerRankings(selectedRankingStat, 10)

                const uniqueScorers = scorers
                    .filter((player: AggregatedPlayerRanking,
                             index: number,
                             array: AggregatedPlayerRanking[],) => (
                        index === array.findIndex((item: AggregatedPlayerRanking) => (
                            item.player_name === player.player_name && item.team_name === player.team_name
                        ))
                    ))
                    .slice(0, 5)

                setTopScorers(uniqueScorers)
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
    }, [selectedRankingStat])

    if (isLoading) {
        return (
            <div className='loading-overlay'>
                <div className='loading-box'>
                    <BasketballLoader />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='dashboard-page'>
            <PageHeader
                title=''
            />
            {/* Botones de acción rápida sin scroll lateral */}
            <section className='dashboard-quick-actions'>
                <button type='button' className='action-btn secondary' onClick={() => navigate('/games')}>
                    📊 Games
                </button>
                <button type='button' className='action-btn secondary' onClick={() => navigate('/rankings')}>
                    🏆 Rankings
                </button>
                <button type='button' className='action-btn secondary' onClick={() => navigate('/analytics')}>
                    📈 Analytics
                </button>
            </section>

            {/* Tarjeta del último partido en ancho completo */}
            {lastCompletedGame && (
                <section className='last-game-card'>
                    <span className='last-game-badge'>LAST MATCH RESULT</span>
                    <div className='last-game-matchup'>
                        <div className='team-side'>
                            <span className='team-name'>{lastCompletedGame.home_team_name}</span>
                            <span className='score'>{lastCompletedGame.home_score ?? '-'}</span>
                        </div>
                        <span className='vs-divider'>VS</span>
                        <div className='team-side'>
                            <span className='score'>{lastCompletedGame.away_score ?? '-'}</span>
                            <span className='team-name'>{lastCompletedGame.away_team_name}</span>
                        </div>
                    </div>
                    <p className='last-game-date'>
                        Played on {new Date(lastCompletedGame.game_date).toLocaleDateString()}
                    </p>
                </section>
            )}

            {/* Métricas en formato píldora ajustadas a grilla mobile */}
            <section className='dashboard-metrics-pills'>
                <div className='metric-pill'><span>Teams</span><strong>{teamsCount}</strong></div>
                <div className='metric-pill'><span>Games</span><strong>{gamesCount}</strong></div>
                <div className='metric-pill'><span>Done</span><strong>{completedGamesCount}</strong></div>
                <div className='metric-pill'><span>Scheduled</span><strong>{scheduledGamesCount}</strong></div>
            </section>

            <section className='dashboard-page__grid'>
                <SectionCard title='Games Overview'>
                    <GamesStatusChart
                        completed={completedGamesCount}
                        scheduled={scheduledGamesCount}
                    />
                    {recentGames.length === 0 ? (
                        <p>No games registered yet.</p>
                    ) : (
                        <ul className='dashboard-list'>
                            {recentGames.map((game) => (
                                <li key={game.id} className='dashboard-list__item'>
                                    <div className='dashboard-list__match'>
                                        <span>{game.home_team_name}</span>
                                        <strong>{game.home_score !== null ? game.home_score : '-'} - {game.away_score !== null ? game.away_score : '-'}</strong>
                                        <span>{game.away_team_name}</span>
                                    </div>
                                    <small className='dashboard-list__meta'>
                                        {new Date(game.game_date).toLocaleDateString()} · {game.status}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>
                <SectionCard title='Top Players'>
                    <div className='dashboard-ranking-tabs'>
                        {rankingStats.map((stat) => (
                            <button
                                key={stat.value}
                                type='button'
                                className={`dashboard-ranking-tabs__button ${selectedRankingStat === stat.value ? 'active' : ''}`}
                                onClick={() => setSelectedRankingStat(stat.value)}
                            >
                                {stat.label}
                            </button>
                        ))}
                    </div>
                    {topScorers.length === 0 ? (
                        <p>No player stats available yet.</p>
                    ) : (
                        <>
                            <TopScorersChart players={topScorers} />
                            <ul className='dashboard-list'>
                                {topScorers.map((player, index) => (
                                    <li
                                        className='dashboard-list__item'
                                        key={`${player.player_name}-${player.team_name}-${selectedRankingStat}-${index}`}
                                    >
                                        <div className='dashboard-list__player-header'>
                                            <span className='dashboard-list__player'>{player.player_name}</span>
                                            <span className='dashboard-list__team'>{player.team_name}</span>
                                        </div>
                                        <small className='dashboard-list__stats'>
                                            {player.total} total · {player.average} AVG · {player.games_played} games
                                        </small>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </SectionCard>
            </section>
        </div>
    )
}

export default DashboardPage