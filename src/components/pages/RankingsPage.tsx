import { useEffect, useState } from 'react'
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import BasketballLoader from '../common/BasketballLoader'
import {
    getAggregatedPlayerRankings,
    getGames,
    getTeams,
    getPlayerStatsByGameId,
} from '../services/api'
import type { PlayerStats, AggregatedPlayerRanking } from '../types/player'
import type { Game } from '../types/game'
import type { Team } from '../types/team'
import './RankingsPage.css'
import '../common/PageLayout.css'

const rankingStats = [
    { value: 'points', label: 'Points' },
    { value: 'rebounds', label: 'Rebounds' },
    { value: 'assists', label: 'Assists' },
    { value: 'steals', label: 'Steals' },
    { value: 'blocks', label: 'Blocks' },
] as const

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
    const [errorMessage, setErrorMessage] = useState('')
    const [games, setGames] = useState<Game[]>([])
    const [selectedGameId, setSelectedGameId] = useState('')
    const [teams, setTeams] = useState<Team[]>([])
    const [selectedTeamName, setSelectedTeamName] = useState('')
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [isLoadingRankings, setIsLoadingRankings] = useState(false)

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                setIsLoadingRankings(true)
                setErrorMessage('')
                setPlayers([])

                if (rankingMode === 'single-game' && !selectedGameId) {
                    setPlayers([])
                    return
                }

                const data =
                    rankingMode === 'single-game'
                    ? await getPlayerStatsByGameId(selectedGameId)
                    : await getAggregatedPlayerRankings(selectedStat)

                const filteredData =
                    rankingMode === 'aggregated' && selectedTeamName
                        ? (data as AggregatedPlayerRanking[]).filter(
                            (player) => player.team_name === selectedTeamName,
                        )
                        : data

                setPlayers(filteredData)
            } catch (error) {
                console.error(error)
                setErrorMessage('Could not load rankings. Please try again.')
            } finally {
                setIsLoadingRankings(false)
            }
        }

        void fetchRankings()
    }, [selectedStat, rankingMode, selectedGameId, selectedTeamName])

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsInitialLoading(true)

                const [gamesData, teamsData] = await Promise.all([
                    getGames(),
                    getTeams(),
                ])

                setGames(gamesData)
                setTeams(teamsData)

                if (gamesData.length > 0) {
                    setSelectedGameId(gamesData[0].id)
                }

                if (teamsData.length > 0) {
                    setSelectedTeamName(teamsData[0].name)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsInitialLoading(false)
            }
        }

        void fetchInitialData()
    }, [])

    const getRankClassName = (index: number) => {
        if (index === 0) return 'ranking-row ranking-row--gold'
        if (index === 1) return 'ranking-row ranking-row--silver'
        if (index === 2) return 'ranking-row ranking-row--bronze'

        return 'ranking-row'
    }

    const getEmptyStateMessage = () => {
        if (rankingMode === 'single-game' && games.length === 0) {
            return 'No games available yet.'
        }

        if (rankingMode === 'single-game' && selectedGameId) {
            return 'No stats processed for this game yet.'
        }

        if (rankingMode === 'aggregated' && teams.length === 0) {
            return 'No teams available yet.'
        }

        if (rankingMode === 'aggregated' && selectedTeamName) {
            return 'No aggregated stats available for this team yet.'
        }

        return 'No rankings available yet.'
    }

    if (isInitialLoading) {
        return (
            <div className='loading-overlay'>
                <div className='loading-box'>
                    <BasketballLoader />
                    <p>Loading rankings...</p>
                </div>
            </div>
        )
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

                {rankingMode === 'aggregated' && (
                    <div className='rankings-filter'>
                        <label htmlFor='team-select'>Team</label>

                        <select
                            id='team-select'
                            value={selectedTeamName}
                            onChange={(event) => setSelectedTeamName(event.target.value)}
                        >
                            {teams.map((team) => (
                                <option key={team.id} value={team.name}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className='rankings-tabs'>
                    {rankingStats.map((stat) => (
                        <button
                            key={stat.value}
                            className={
                                selectedStat === stat.value
                                    ? 'rankings-tab rankings-tab--active'
                                    : 'rankings-tab'
                            }
                            onClick={() => setSelectedStat(stat.value)}
                        >
                            {stat.label}
                        </button>
                    ))}
                </div>

                {isLoadingRankings && (
                    <p className='rankings-state'>Loading rankings...</p>
                )}

                {errorMessage && (
                    <p className='rankings-state rankings-state--error'>
                        {errorMessage}
                    </p>
                )}

                {!isLoadingRankings && !errorMessage && players.length === 0 && (
                    <p className='rankings-state'>
                        {getEmptyStateMessage()}
                    </p>
                )}

                {players.length > 0 && (
                    <>
                        <div className='table-wrapper rankings-table-wrapper'>
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
                                    ? (players as PlayerStats[])
                                        .sort((a, b) => b[selectedStat] - a[selectedStat])
                                        .map((player, index) => (
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
                        <div className='rankings-mobile-list'>
                            {rankingMode === 'single-game'
                                ? (players as PlayerStats[])
                                    .sort((a, b) => b[selectedStat] - a[selectedStat])
                                    .map((player, index) => (
                                        <div
                                            key={player.id}
                                            className='ranking-mobile-card'
                                        >
                                            <div className='ranking-mobile-header'>
                                <span className='ranking-mobile-position'>
                                    #{index + 1}
                                </span>

                                                <div>
                                                    <h3>{player.player_name}</h3>
                                                    <p>{player.team_name}</p>
                                                </div>
                                            </div>

                                            <div className='ranking-mobile-stat'>
                                                <span>{selectedStat.toUpperCase()}</span>
                                                <strong>{player[selectedStat]}</strong>
                                            </div>
                                        </div>
                                    ))
                                : (players as AggregatedPlayerRanking[]).map((player, index) => (
                                    <div
                                        key={`${player.player_name}-${player.team_name}`}
                                        className='ranking-mobile-card'
                                    >
                                        <div className='ranking-mobile-header'>
                            <span className='ranking-mobile-position'>
                                #{index + 1}
                            </span>

                                            <div>
                                                <h3>{player.player_name}</h3>
                                                <p>{player.team_name}</p>
                                            </div>
                                        </div>

                                        <div className='ranking-mobile-stats-grid'>
                                            <div>
                                                <span>Total</span>
                                                <strong>{player.total}</strong>
                                            </div>

                                            <div>
                                                <span>AVG</span>
                                                <strong>{player.average}</strong>
                                            </div>

                                            <div>
                                                <span>Games</span>
                                                <strong>{player.games_played}</strong>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </>
                )}
            </SectionCard>
        </div>
    )
}

export default RankingsPage