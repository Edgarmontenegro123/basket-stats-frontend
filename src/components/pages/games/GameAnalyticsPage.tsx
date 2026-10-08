import {useEffect, useState} from 'react'
import BasketballLoader from '../../common/BasketballLoader'
import {AnalyticsFilterBar} from '../../analytics/AnalyticsFilterBar'
import {useAnalyticsFilters} from '../../hooks/useAnalyticsFilters'
import {
    getPlayerStatsByGameId,
    getTeamStatsByGameId,
} from '../../services/api'
import type {PlayerStats} from '../../types/player'
import type {TeamStat} from '../../types/analytics'
import './GameAnalyticsPage.css'

const GameAnalyticsPage = () => {
    const {filters, updateFilters, resetFilters} = useAnalyticsFilters()
    const [fetchedPlayerStats, setFetchedPlayerStats] = useState<PlayerStats[]>([])
    const [fetchedTeamStats, setFetchedTeamStats] = useState<TeamStat[]>([])
    const [error, setError] = useState('')
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
    const [hasTriedToLoadAnalytics, setHasTriedToLoadAnalytics] = useState(false)

    const selectedGameId = filters.gameId
    const selectedPlayerIds = filters.playerIds

    // 1. Team Stats
    const teamStats = selectedGameId ? fetchedTeamStats : []

    // 2. Player Stats filtradas si hay jugadores seleccionados
    const playerStats = selectedGameId
        ? fetchedPlayerStats.filter((stat) => {
            if (selectedPlayerIds && selectedPlayerIds.length > 0) {
                return selectedPlayerIds.includes(stat.id)
            }
            return true
        })
        : []

    const hasLoadedAnalytics = playerStats.length > 0 || teamStats.length > 0

    useEffect(() => {
        if (!selectedGameId) {
            return
        }

        let isMounted = true

        const loadAnalytics = async () => {
            try {
                setError('')
                setIsLoadingAnalytics(true)
                setHasTriedToLoadAnalytics(true)

                const [players, teams] = await Promise.all([
                    getPlayerStatsByGameId(selectedGameId),
                    getTeamStatsByGameId(selectedGameId),
                ])

                if (isMounted) {
                    setFetchedPlayerStats(players)
                    setFetchedTeamStats(teams)
                }
            } catch (err) {
                console.error(err)
                if (isMounted) {
                    setError('Error loading analytics')
                }
            } finally {
                if (isMounted) {
                    setIsLoadingAnalytics(false)
                }
            }
        }

        void loadAnalytics()

        return () => {
            isMounted = false
        }
    }, [selectedGameId])

    return (
        <main className='analytics-page'>
            <header className='analytics-header'>
                <h1>Game Analytics</h1>
                <p>Review process analytics by game and season filters.</p>
            </header>

            {error && <p className='analytics-error'>{error}</p>}

            {/* Componente de Filtros Visuales */}
            <AnalyticsFilterBar
                filters={filters}
                onFilterChange={updateFilters}
                onResetFilters={resetFilters}
            />

            {isLoadingAnalytics && (
                <section className='analytics-state-card'>
                    <BasketballLoader />
                    <p>Loading analytics...</p>
                </section>
            )}

            {!isLoadingAnalytics && hasTriedToLoadAnalytics && selectedGameId && !hasLoadedAnalytics && (
                <section className='analytics-state-card'>
                    <strong>No analytics available yet.</strong>
                    <p>
                        Upload and process stats for this game to see team and player analytics.
                    </p>
                </section>
            )}

            {!isLoadingAnalytics && hasLoadedAnalytics && (
                <>
                    <section className='analytics-card'>
                        <h2>Team Stats</h2>
                        <div className='table-wrapper analytics-table-wrapper'>
                            <table>
                                <thead>
                                <tr>
                                    <th>Team</th>
                                    <th>PTS</th>
                                    <th>REB</th>
                                    <th>AST</th>
                                    <th>TO</th>
                                    <th>STL</th>
                                    <th>BLK</th>
                                </tr>
                                </thead>
                                <tbody>
                                {teamStats.map((stat) => (
                                    <tr key={stat.id}>
                                        <td>{stat.team_name}</td>
                                        <td>{stat.points}</td>
                                        <td>{stat.rebounds}</td>
                                        <td>{stat.assists}</td>
                                        <td>{stat.turnovers}</td>
                                        <td>{stat.steals}</td>
                                        <td>{stat.blocks}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className='analytics-mobile-list'>
                            {teamStats.map((stat) => (
                                <div key={stat.id} className='analytics-mobile-card'>
                                    <h3>{stat.team_name}</h3>

                                    <div className='analytics-mobile-stats-grid'>
                                        <p><span>PTS</span><strong>{stat.points}</strong></p>
                                        <p><span>REB</span><strong>{stat.rebounds}</strong></p>
                                        <p><span>AST</span><strong>{stat.assists}</strong></p>
                                        <p><span>TO</span><strong>{stat.turnovers}</strong></p>
                                        <p><span>STL</span><strong>{stat.steals}</strong></p>
                                        <p><span>BLK</span><strong>{stat.blocks}</strong></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className='analytics-card'>
                        <h2>Player Stats</h2>
                        <div className='table-wrapper analytics-table-wrapper'>
                            <table>
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Player</th>
                                    <th>Team</th>
                                    <th>PTS</th>
                                    <th>REB</th>
                                    <th>AST</th>
                                    <th>TO</th>
                                    <th>STL</th>
                                    <th>BLK</th>
                                </tr>
                                </thead>
                                <tbody>
                                {playerStats.map((stat) => (
                                    <tr key={stat.id}>
                                        <td>{stat.player_number}</td>
                                        <td>{stat.player_name}</td>
                                        <td>{stat.team_name}</td>
                                        <td>{stat.points}</td>
                                        <td>{stat.rebounds}</td>
                                        <td>{stat.assists}</td>
                                        <td>{stat.turnovers}</td>
                                        <td>{stat.steals}</td>
                                        <td>{stat.blocks}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className='analytics-mobile-list'>
                            {playerStats.map((stat) => (
                                <div key={stat.id} className='analytics-mobile-card'>
                                    <h3>{stat.player_name}</h3>
                                    <p className='analytics-mobile-subtitle'>
                                        #{stat.player_number} · {stat.team_name}
                                    </p>

                                    <div className='analytics-mobile-stats-grid'>
                                        <p><span>PTS</span><strong>{stat.points}</strong></p>
                                        <p><span>REB</span><strong>{stat.rebounds}</strong></p>
                                        <p><span>AST</span><strong>{stat.assists}</strong></p>
                                        <p><span>TO</span><strong>{stat.turnovers}</strong></p>
                                        <p><span>STL</span><strong>{stat.steals}</strong></p>
                                        <p><span>BLK</span><strong>{stat.blocks}</strong></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </main>
    )
}

export default GameAnalyticsPage