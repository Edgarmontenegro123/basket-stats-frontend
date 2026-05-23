import { useEffect, useState } from 'react'
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import type { PlayerStats, AggregatedPlayerRanking } from '../types/player'
import type { Game } from '../types/game'
import {
    getPlayerRankings,
    getAggregatedPlayerRankings,
    getGames,
    /*getPlayerStatsByGameId,*/
} from '../services/api'
import './RankingsPage.css'
import '../common/PageLayout.css'

const RankingsPage = () => {
    const [players, setPlayers] = useState<PlayerStats[] | AggregatedPlayerRanking[]>([])
    const [selectedStat, setSelectedStat] = useState<
        'points' |
        'rebounds' |
        'assists' |
        'steals' |
        'blocks'
    >('points')

    const [rankingMode, setRankingMode] = useState<'single-game' | 'aggregated'>('single-game')
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [games, setGames] = useState<Game[]>([])
    const [selectedGameId, setSelectedGameId] = useState('')

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                setIsLoading(true)
                setErrorMessage('')
                setPlayers([])

                const data =
                    rankingMode === 'single-game'
                    ? await getPlayerRankings(selectedStat)
                    : await getAggregatedPlayerRankings(selectedStat)

                setPlayers(data)
            } catch (error) {
                console.error(error)
                setErrorMessage('Could not load rankings. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }

        void fetchRankings()
    }, [selectedStat, rankingMode])

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const data = await getGames()

                setGames(data)

                if (data.length > 0) {
                    setSelectedGameId(data[0].id)
                }
            } catch (error) {
                console.error(error)
            }
        }

        void fetchGames()
    }, [])


    const getRankClassName = (index: number) => {
        if (index === 0) return 'ranking-row ranking-row--gold'
        if (index === 1) return 'ranking-row ranking-row--silver'
        if (index === 2) return 'ranking-row ranking-row--bronze'

        return 'ranking-row'
    }

    return (
        <div>
            <PageHeader
                title='Rankings'
                subtitle='Top performers and statistics leaders'
            />

            <SectionCard title='Rankings'>
                <div className='rankings-tabs'>
                    <button
                        className={
                            rankingMode === 'single-game'
                                ? 'rankings-tab rankings-tab--active'
                                : 'rankings-tab'
                        }
                        onClick={() => setRankingMode('single-game')}
                    >
                        Single Game
                    </button>

                    <button
                        className={
                            rankingMode === 'aggregated'
                                ? 'rankings-tab rankings-tab--active'
                                : 'rankings-tab'
                        }
                        onClick={() => setRankingMode('aggregated')}
                    >
                        Aggregated
                    </button>
                </div>

                {rankingMode === 'single-game' && (
                    <div className='rankings-filter'>
                        <label htmlFor='game-select'>Game</label>

                        <select
                            id='game-select'
                            value={selectedGameId}
                            onChange={(event) => setSelectedGameId(event.target.value)}
                        >
                            {games.map((game) => (
                                <option key={game.id} value={game.id}>
                                    {game.home_team_name} vs {game.away_team_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className='rankings-tabs'>
                    <button
                        className={
                            selectedStat === 'points'
                                ? 'rankings-tab rankings-tab--active'
                                : 'rankings-tab'
                        }
                        onClick={() => setSelectedStat('points')}
                    >
                        Points
                    </button>

                    <button
                        className={
                            selectedStat === 'rebounds'
                                ? 'rankings-tab rankings-tab--active'
                                : 'rankings-tab'
                        }
                        onClick={() => setSelectedStat('rebounds')}
                    >
                        Rebounds
                    </button>

                    <button
                        className={
                            selectedStat === 'assists'
                                ? 'rankings-tab rankings-tab--active'
                                : 'rankings-tab'
                        }
                        onClick={() => setSelectedStat('assists')}
                    >
                        Assists
                    </button>

                    <button
                        className={
                            selectedStat === 'steals'
                                ? 'rankings-tab rankings-tab--active'
                                : 'rankings-tab'
                        }
                        onClick={() => setSelectedStat('steals')}
                    >
                        Steals
                    </button>

                    <button
                        className={
                            selectedStat === 'blocks'
                                ? 'rankings-tab rankings-tab--active'
                                : 'rankings-tab'
                        }
                        onClick={() => setSelectedStat('blocks')}
                    >
                        Blocks
                    </button>
                </div>

                {isLoading && (
                    <p className='rankings-state'>Loading rankings...</p>
                )}

                {errorMessage && (
                    <p className='rankings-state rankings-state--error'>
                        {errorMessage}
                    </p>
                )}

                {!isLoading && !errorMessage && players.length === 0 && (
                    <p className='rankings-state'>
                        No rankings available yet.
                    </p>
                )}

                {players.length > 0 && (
                    <div className='table-wrapper'>
                        <table className='data-table rankings-table'>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Player</th>
                                <th>Team</th>
                                <th>{selectedStat.toUpperCase()}</th>
                                {rankingMode === 'aggregated' && (
                                    <>
                                        <th>AVG</th>
                                        <th>Games</th>
                                    </>

                                )}
                            </tr>
                            </thead>

                            <tbody>
                            {rankingMode === 'single-game'
                                ? (players as PlayerStats[]).map((player, index) => (
                                    <tr key={player.id}
                                        className={getRankClassName(index)}
                                    >
                                        <td>{index + 1}</td>
                                        <td>{player.player_name}</td>
                                        <td>{player.team_name}</td>
                                        <td>{player[selectedStat]}</td>
                                    </tr>
                                ))
                                : (players as AggregatedPlayerRanking[]).map((player, index) => (
                                    <tr key={`${player.player_name}-${player.team_name}`}
                                        className={getRankClassName(index)}
                                    >
                                        <td>{index + 1}</td>
                                        <td>{player.player_name}</td>
                                        <td>{player.team_name}</td>
                                        <td>{player.total}</td>
                                        <td>{player.average}</td>
                                        <td>{player.games_played}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </div>
    )
}

export default RankingsPage