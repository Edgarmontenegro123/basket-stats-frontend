import { useEffect, useState } from 'react'
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import type { PlayerStats, AggregatedPlayerRanking } from '../types/player'
import { getPlayerRankings, getAggregatedPlayerRankings } from '../services/api'
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
                                    <th>AVG</th>
                                )}
                            </tr>
                            </thead>

                            <tbody>
                            {rankingMode === 'single-game'
                                ? (players as PlayerStats[]).map((player, index) => (
                                    <tr key={player.id}>
                                        <td>{index + 1}</td>
                                        <td>{player.player_name}</td>
                                        <td>{player.team_name}</td>
                                        <td>{player[selectedStat]}</td>
                                    </tr>
                                ))
                                : (players as AggregatedPlayerRanking[]).map((player, index) => (
                                    <tr key={`${player.player_name}-${player.team_name}`}>
                                        <td>{index + 1}</td>
                                        <td>{player.player_name}</td>
                                        <td>{player.team_name}</td>
                                        <td>{player.total}</td>
                                        <td>{player.average}</td>
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