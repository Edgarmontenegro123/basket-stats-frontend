import {useEffect, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import BasketballLoader from '../../common/BasketballLoader'
import {
    getGames,
    getPlayerStatsByGameId,
    getTeamStatsByGameId,
} from '../../services/api'
import type { Game } from '../../types/game'
import type { PlayerStats } from '../../types/player'
import type { TeamStat } from '../../types/analytics'
import './GameAnalyticsPage.css'


const GameAnalyticsPage = () => {
    const [games, setGames] = useState<Game[]>([])
    const [selectedGameId, setSelectedGameId] = useState('')
    const [playerStats, setPlayerStats] = useState<PlayerStats[]>([])
    const [teamStats, setTeamStats] = useState<TeamStat[]>([])
    const [error, setError] = useState('')
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
    const [isLoadingGames, setIsLoadingGames] = useState(true)
    const hasLoadedAnalytics = playerStats.length > 0 || teamStats.length > 0
    const [hasTriedToLoadAnalytics, setHasTriedToLoadAnalytics] = useState(false)
    const [searchParams] = useSearchParams()
    const gameIdFromUrl = searchParams.get('gameId')

    useEffect(() => {
        const loadGames = async () => {
            try {
                const data = await getGames()
                setGames(data)

                if (gameIdFromUrl) {
                    setSelectedGameId(gameIdFromUrl)
                }
            } catch (error) {
                console.error(error);
                setError('Error loading games')
            } finally {
                setIsLoadingGames(false)
            }
        };

        void loadGames()
    }, [gameIdFromUrl])

    const handleLoadAnalytics = async () => {
        if (!selectedGameId) {
            setError('Select a game first')
            return
        }

        try {
            setError('')
            setIsLoadingAnalytics(true)
            setHasTriedToLoadAnalytics(true)
            setPlayerStats([])
            setTeamStats([])

            const [players, teams] = await Promise.all([
                getPlayerStatsByGameId(selectedGameId),
                getTeamStatsByGameId(selectedGameId)
            ])

            setPlayerStats(players)
            setTeamStats(teams)
        } catch (error) {
            console.error(error)
            setError('Error loading analytics')
        } finally {
            setIsLoadingAnalytics(false)
        }
    }

    if (isLoadingGames) {
        return (
            <div className='loading-overlay'>
                <div className='loading-box'>
                    <BasketballLoader />
                    <p>Loading analytics page...</p>
                </div>
            </div>
        )
    }

    return (
        <main className='analytics-page'>
            <header className='analytics-header'>
                <h1>Game Analytics</h1>
                <p>Review process analytics by game.</p>
            </header>
            {error && <p className='analytics-error'>{error}</p>}

            <section className='analytics-controls'>
                <label htmlFor='game'>Select game</label>
                <div className='analytics-control-row'>
                    <select
                        id='game'
                        value={selectedGameId}
                        onChange={(e) => {
                            setSelectedGameId(e.target.value)
                            setHasTriedToLoadAnalytics(false)
                            setPlayerStats([])
                            setTeamStats([])
                        }}
                    >
                        <option value=''>Select a game</option>

                        {games.map((game) => (
                            <option key={game.id} value={game.id}>
                                {game.home_team_name} vs {game.away_team_name} - {new Date(game.game_date).toLocaleDateString()}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleLoadAnalytics}
                        disabled={isLoadingAnalytics}
                    >
                        {isLoadingAnalytics ? 'Loading...' : 'Load Analytics'}
                    </button>
                </div>
            </section>

            {isLoadingAnalytics && (
                <section className='analytics-state-card'>
                    <BasketballLoader/>
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
    );
};

export default GameAnalyticsPage;