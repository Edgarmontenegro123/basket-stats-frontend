import {useEffect, useMemo, useState} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import PageHeader from '../../common/PageHeader.tsx'
import SectionCard from '../../common/SectionCard.tsx'
import BasketballLoader from '../../common/BasketballLoader.tsx'
import {normaliseText} from '../../helpers/normaliseText.ts'
import {buildPlayerNameCandidates} from '../../helpers/playerHelpers.ts'
import {formatDateToDDMMYYYY} from '../../helpers/formatDate.ts'
import {
    getTeams,
    getGames,
    getPlayers,
    getPlayerSummaryByName,
    getPlayerStatsByGameId,
} from '../../../services/api.ts'
import type {Game} from '../../../types/game.ts'
import type {Team} from '../../../types/team.ts'
import type {Player, PlayerSummary, PlayerStats} from '../../../types/player.ts'
import type {
    CompareMode,
    ComputedPlayerMetrics,
    PlayerSlot,
} from '../../../types/compare.ts'
import '../../common/PageLayout.css'
import './ComparePage.css'

const findMatchingTeamId = (teams: Team[], query: string | null): string => {
    if (!query) return ''
    const normQuery = normaliseText(query)
    const match = teams.find((t) => {
        const normName = normaliseText(t.name)
        const normShort = normaliseText(t.short_name || '')
        return (
            normName === normQuery ||
            normName.includes(normQuery) ||
            normQuery.includes(normName) ||
            (normShort !== '' && (normShort === normQuery || normShort.includes(normQuery)))
        )
    })
    return match ? match.id : ''
}

const findMatchingPlayerId = (players: Player[], query: string): string => {
    const normQuery = normaliseText(query)
    if (!normQuery) return ''
    const tokens = normQuery.split(' ').filter((t) => t.length > 1)

    const exact = players.find((p) => {
        const full1 = normaliseText(`${p.first_name} ${p.last_name}`)
        const full2 = normaliseText(`${p.last_name} ${p.first_name}`)
        return full1 === normQuery || full2 === normQuery
    })
    if (exact) return exact.id

    const byTokens = players.find((p) => {
        const combined = normaliseText(`${p.first_name} ${p.last_name}`)
        return tokens.length > 0 && tokens.every((token) => combined.includes(token))
    })
    return byTokens ? byTokens.id : ''
}

const formatPlayerFullName = (player: Player): string =>
    `${player.last_name} ${player.first_name}`.trim()

const getInitials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || '?'

const round1 = (n: number): number => Number(n.toFixed(1))

const PlayerAvatar = ({
                          name,
                          photoUrl,
                          size = 'md',
                      }: {
    name: string
    photoUrl?: string | null
    size?: 'sm' | 'md'
}) => {
    const [imgError, setImgError] = useState(false)

    if (photoUrl && !imgError) {
        return (
            <img
                src={photoUrl}
                alt={name}
                className={`compare-avatar compare-avatar--${size}`}
                onError={() => setImgError(true)}
            />
        )
    }

    return (
        <span className={`compare-avatar compare-avatar--fallback compare-avatar--${size}`} aria-hidden='true'>
            {getInitials(name)}
        </span>
    )
}

const TeamBadge = ({team}: {team?: Team}) => {
    const [imgError, setImgError] = useState(false)
    const label = team?.short_name || getInitials(team?.name || 'TM')

    if (team?.logo_url && !imgError) {
        return (
            <img
                src={team.logo_url}
                alt={team.name}
                className='compare-team-logo'
                onError={() => setImgError(true)}
            />
        )
    }

    return (
        <span className='compare-team-logo compare-team-logo--fallback' aria-hidden='true'>
            {label}
        </span>
    )
}

const ComparePage = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [teams, setTeams] = useState<Team[]>([])
    const [games, setGames] = useState<Game[]>([])
    const [players, setPlayers] = useState<Player[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [mode, setMode] = useState<CompareMode>('teams')

    const [teamAId, setTeamAId] = useState('')
    const [teamBId, setTeamBId] = useState('')

    const [playerSlots, setPlayerSlots] = useState<PlayerSlot[]>([])
    const [selectedGameFilterId, setSelectedGameFilterId] = useState<string>('')
    const [playerMetricsMap, setPlayerMetricsMap] = useState<Record<string, ComputedPlayerMetrics>>({})
    const [isLoadingPlayerStats, setIsLoadingPlayerStats] = useState(false)

    useEffect(() => {
        const loadInitialData = async() => {
            try {
                const [teamsData, gamesData, playersData]: [Team[], Game[], Player[]] = await Promise.all([
                    getTeams(),
                    getGames(),
                    getPlayers(),
                ])

                setTeams(teamsData)
                setGames(gamesData)
                setPlayers(playersData)

                const queryMode = searchParams.get('mode')
                const queryPlayersRaw = searchParams.get('players')
                const queryTeam1 = searchParams.get('team1')
                const queryTeam2 = searchParams.get('team2')
                const queryGameId = searchParams.get('gameId') || ''

                const matchedA = findMatchingTeamId(teamsData, queryTeam1)
                const matchedB = findMatchingTeamId(teamsData, queryTeam2)

                const resolvedTeamA = matchedA || (teamsData[0]?.id ?? '')
                const resolvedTeamB =
                    matchedB && matchedB !== resolvedTeamA
                        ? matchedB
                        : (teamsData.find((t: Team) => t.id !== resolvedTeamA)?.id ?? '')

                setTeamAId(resolvedTeamA)
                setTeamBId(resolvedTeamB)

                const requestedPlayerNames = queryPlayersRaw
                    ? queryPlayersRaw.split(',').map((s) => s.trim()).filter(Boolean)
                    : []

                const initialSlots: PlayerSlot[] = []
                requestedPlayerNames.forEach((name, idx) => {
                    const matchedId = findMatchingPlayerId(playersData, name)
                    if (matchedId && !initialSlots.some((s) => s.playerId === matchedId)) {
                        initialSlots.push({
                            slotId: `slot-${idx}-${matchedId}`,
                            teamFilterId: '',
                            playerId: matchedId,
                        })
                    }
                })

                while (initialSlots.length < 2 && playersData.length > initialSlots.length) {
                    const nextPlayer = playersData.find(
                        (p: Player) => !initialSlots.some((s) => s.playerId === p.id)
                    )
                    if (!nextPlayer) break
                    initialSlots.push({
                        slotId: `slot-default-${initialSlots.length}-${nextPlayer.id}`,
                        teamFilterId: '',
                        playerId: nextPlayer.id,
                    })
                }

                setPlayerSlots(initialSlots)
                setSelectedGameFilterId(queryGameId)

                if (queryMode === 'players' || requestedPlayerNames.length > 0) {
                    setMode('players')
                } else {
                    setMode('teams')
                }
            } catch (error) {
                console.error('Error loading compare data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        void loadInitialData()
    }, [searchParams])

    const teamNameById = useMemo(() => {
        const map: Record<string, string> = {}
        teams.forEach((t) => {
            map[t.id] = t.name
        })
        return map
    }, [teams])

    const activePlayerIds = useMemo(
        () => Array.from(new Set(playerSlots.map((s) => s.playerId).filter(Boolean))),
        [playerSlots]
    )

    useEffect(() => {
        if (mode !== 'players' || activePlayerIds.length === 0 || players.length === 0) {
            return
        }

        let isMounted = true

        const fetchMetrics = async() => {
            setIsLoadingPlayerStats(true)
            try {
                const nextMap: Record<string, ComputedPlayerMetrics> = {}

                if (selectedGameFilterId) {
                    const gameStats = (await getPlayerStatsByGameId(selectedGameFilterId)) as PlayerStats[]
                    const validGameStats = Array.isArray(gameStats) ? gameStats : []

                    for (const pid of activePlayerIds) {
                        const playerObj = players.find((p) => p.id === pid)
                        if (!playerObj) continue

                        const fullName = formatPlayerFullName(playerObj)
                        const tokens = normaliseText(fullName).split(' ').filter((t) => t.length > 1)

                        const statRow = validGameStats.find((row) => {
                            const rowName = normaliseText(row.player_name || '')
                            return tokens.every((token) => rowName.includes(token))
                        })

                        nextMap[pid] = {
                            playerId: pid,
                            displayName: fullName,
                            teamName: teamNameById[playerObj.team_id] || 'No Team',
                            photoUrl: playerObj.photo_url,
                            jerseyNumber: playerObj.number,
                            didNotPlayGame: !statRow,
                            gamesPlayed: statRow ? 1 : 0,
                            avgPoints: statRow ? Number(statRow.points || 0) : 0,
                            avgRebounds: statRow ? Number(statRow.rebounds || 0) : 0,
                            avgAssists: statRow ? Number(statRow.assists || 0) : 0,
                            avgSteals: statRow ? Number(statRow.steals || 0) : 0,
                            avgBlocks: statRow ? Number(statRow.blocks || 0) : 0,
                            avgTurnovers: statRow ? Number(statRow.turnovers || 0) : 0,
                            totalPoints: statRow ? Number(statRow.points || 0) : 0,
                        }
                    }
                } else {
                    await Promise.all(
                        activePlayerIds.map(async(pid) => {
                            const playerObj = players.find((p) => p.id === pid)
                            if (!playerObj) return

                            const fullName = formatPlayerFullName(playerObj)
                            const altName = `${playerObj.first_name} ${playerObj.last_name}`.trim()
                            const candidates = Array.from(
                                new Set([
                                    ...buildPlayerNameCandidates(fullName),
                                    ...buildPlayerNameCandidates(altName),
                                ])
                            )

                            let summary: PlayerSummary | undefined
                            for (const candidate of candidates) {
                                try {
                                    const res = (await getPlayerSummaryByName(candidate)) as PlayerSummary
                                    if (res && (res.player_name || Number(res.games_played) > 0 || res.average_points !== undefined)) {
                                        summary = res
                                        break
                                    }
                                } catch (err) {
                                    console.warn(`Player summary candidate lookup failed for '${candidate}':`, err)
                                }
                            }

                            nextMap[pid] = {
                                playerId: pid,
                                displayName: summary?.player_name || fullName,
                                teamName: summary?.team_name || teamNameById[playerObj.team_id] || 'No Team',
                                photoUrl: playerObj.photo_url,
                                jerseyNumber: playerObj.number,
                                didNotPlayGame: false,
                                gamesPlayed: Number(summary?.games_played || 0),
                                avgPoints: round1(Number(summary?.average_points || 0)),
                                avgRebounds: round1(Number(summary?.average_rebounds || 0)),
                                avgAssists: round1(Number(summary?.average_assists || 0)),
                                avgSteals: round1(Number(summary?.average_steals || 0)),
                                avgBlocks: round1(Number(summary?.average_blocks || 0)),
                                avgTurnovers: round1(Number(summary?.average_turnovers || 0)),
                                totalPoints: Number(summary?.total_points || 0),
                            }
                        })
                    )
                }

                if (isMounted) {
                    setPlayerMetricsMap(nextMap)
                }
            } catch (err) {
                console.error('Error fetching player comparison stats:', err)
            } finally {
                if (isMounted) {
                    setIsLoadingPlayerStats(false)
                }
            }
        }

        void fetchMetrics()

        return () => {
            isMounted = false
        }
    }, [mode, activePlayerIds, selectedGameFilterId, players, teamNameById])

    const handleSlotTeamChange = (slotId: string, newTeamId: string) => {
        setPlayerSlots((prev) =>
            prev.map((slot) => {
                if (slot.slotId !== slotId) return slot
                const filteredPlayers = newTeamId
                    ? players.filter((p) => p.team_id === newTeamId)
                    : players
                const stillValid = filteredPlayers.some((p) => p.id === slot.playerId)
                const fallbackPlayer = filteredPlayers.find(
                    (p) => !prev.some((other) => other.slotId !== slotId && other.playerId === p.id)
                ) || filteredPlayers[0]

                return {
                    ...slot,
                    teamFilterId: newTeamId,
                    playerId: stillValid ? slot.playerId : (fallbackPlayer?.id || ''),
                }
            })
        )
    }

    const handleSlotPlayerChange = (slotId: string, newPlayerId: string) => {
        setPlayerSlots((prev) =>
            prev.map((slot) => (slot.slotId === slotId ? {...slot, playerId: newPlayerId} : slot))
        )
    }

    const handleAddPlayerSlot = () => {
        if (playerSlots.length >= 4) return
        const unusedPlayer = players.find(
            (p) => !playerSlots.some((slot) => slot.playerId === p.id)
        )
        if (!unusedPlayer) return

        setPlayerSlots((prev) => [
            ...prev,
            {
                slotId: `slot-${Date.now()}`,
                teamFilterId: '',
                playerId: unusedPlayer.id,
            },
        ])
    }

    const handleRemovePlayerSlot = (slotId: string) => {
        if (playerSlots.length <= 2) return
        setPlayerSlots((prev) => prev.filter((slot) => slot.slotId !== slotId))
    }

    const getTeamSummary = (teamId: string) => {
        const completedGames = games.filter(
            (game) =>
                game.status === 'completed' &&
                (game.home_team_id === teamId || game.away_team_id === teamId),
        )

        const pointsFor = completedGames.reduce((total, game) => {
            return total + (game.home_team_id === teamId ? (game.home_score || 0) : (game.away_score || 0))
        }, 0)

        const pointsAgainst = completedGames.reduce((total, game) => {
            return total + (game.home_team_id === teamId ? (game.away_score || 0) : (game.home_score || 0))
        }, 0)

        const wins = completedGames.filter((game) => {
            const teamScore = game.home_team_id === teamId ? game.home_score : game.away_score
            const opponentScore = game.home_team_id === teamId ? game.away_score : game.home_score
            return (teamScore || 0) > (opponentScore || 0)
        }).length

        const losses = completedGames.filter((game) => {
            const teamScore = game.home_team_id === teamId ? game.home_score : game.away_score
            const opponentScore = game.home_team_id === teamId ? game.away_score : game.home_score
            return (teamScore || 0) < (opponentScore || 0)
        }).length

        const averagePointsFor =
            completedGames.length > 0
                ? Number((pointsFor / completedGames.length).toFixed(2))
                : 0

        const averagePointsAgainst =
            completedGames.length > 0
                ? Number((pointsAgainst / completedGames.length).toFixed(2))
                : 0

        const pointDifferential = pointsFor - pointsAgainst

        return {
            gamesPlayed: completedGames.length,
            wins,
            losses,
            pointsFor,
            pointsAgainst,
            averagePointsFor,
            averagePointsAgainst,
            pointDifferential,
        }
    }

    const teamASummary = getTeamSummary(teamAId)
    const teamBSummary = getTeamSummary(teamBId)
    const teamAObj = teams.find((team) => team.id === teamAId)
    const teamBObj = teams.find((team) => team.id === teamBId)
    const teamAName = teamAObj?.name || 'Team A'
    const teamBName = teamBObj?.name || 'Team B'

    const formatPointDifferential = (value: number) => (value > 0 ? `+${value}` : String(value))

    const completedGamesList = useMemo(
        () => games.filter((g) => g.status === 'completed'),
        [games]
    )

    const comparedPlayersMetrics = activePlayerIds
        .map((id) => playerMetricsMap[id])
        .filter((m): m is ComputedPlayerMetrics => Boolean(m))

    const playerMetricRows: Array<{
        label: string
        getValue: (m: ComputedPlayerMetrics) => number
        lowerIsBetter?: boolean
    }> = [
        {label: 'Games played', getValue: (m) => m.gamesPlayed},
        {label: selectedGameFilterId ? 'Points' : 'Average points (PPG)', getValue: (m) => m.avgPoints},
        ...(selectedGameFilterId ? [] : [{label: 'Total points', getValue: (m: ComputedPlayerMetrics) => m.totalPoints}]),
        {label: selectedGameFilterId ? 'Rebounds' : 'Average rebounds (RPG)', getValue: (m) => m.avgRebounds},
        {label: selectedGameFilterId ? 'Assists' : 'Average assists (APG)', getValue: (m) => m.avgAssists},
        {label: selectedGameFilterId ? 'Steals' : 'Average steals (SPG)', getValue: (m) => m.avgSteals},
        {label: selectedGameFilterId ? 'Blocks' : 'Average blocks (BPG)', getValue: (m) => m.avgBlocks},
        {label: selectedGameFilterId ? 'Turnovers' : 'Average turnovers (TOV)', getValue: (m) => m.avgTurnovers, lowerIsBetter: true},
    ]

    if (isLoading) {
        return (
            <div className='loading-overlay'>
                <div className='loading-box'>
                    <BasketballLoader />
                    <p>Loading comparison data...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title={mode === 'players' ? 'Compare Players' : 'Compare Teams'}
                subtitle=''
                showBack
            />

            <div className='compare-mode-tabs'>
                <button
                    type='button'
                    className={`compare-mode-tab ${mode === 'players' ? 'active' : ''}`}
                    onClick={() => setMode('players')}
                >
                    Compare Players
                </button>
                <button
                    type='button'
                    className={`compare-mode-tab ${mode === 'teams' ? 'active' : ''}`}
                    onClick={() => setMode('teams')}
                >
                    Compare Teams
                </button>
            </div>

            {mode === 'teams' ? (
                <SectionCard title=''>
                    <div className='form-row'>
                        <div className='form-group'>
                            <label>Home Team</label>
                            <select
                                className='form-select'
                                value={teamAId}
                                onChange={(event) => setTeamAId(event.target.value)}
                            >
                                {teams.map((team) => (
                                    <option
                                        key={team.id}
                                        value={team.id}
                                        disabled={team.id === teamBId}
                                    >
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='form-group'>
                            <label>Away Team</label>
                            <select
                                className='form-select'
                                value={teamBId}
                                onChange={(event) => setTeamBId(event.target.value)}
                            >
                                {teams.map((team) => (
                                    <option
                                        key={team.id}
                                        value={team.id}
                                        disabled={team.id === teamAId}
                                    >
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='table-wrapper compare-table-wrapper'>
                            <table className='data-table'>
                                <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>
                                        <div className='compare-entity-header'>
                                            <TeamBadge team={teamAObj} />
                                            <button
                                                type='button'
                                                className='compare-team-link'
                                                onClick={() => navigate(`/teams/${teamAId}`)}
                                            >
                                                {teamAName}
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className='compare-entity-header'>
                                            <TeamBadge team={teamBObj} />
                                            <button
                                                type='button'
                                                className='compare-team-link'
                                                onClick={() => navigate(`/teams/${teamBId}`)}
                                            >
                                                {teamBName}
                                            </button>
                                        </div>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>Games played</td>
                                    <td>{teamASummary.gamesPlayed}</td>
                                    <td>{teamBSummary.gamesPlayed}</td>
                                </tr>
                                <tr>
                                    <td>Points for</td>
                                    <td>{teamASummary.pointsFor}</td>
                                    <td>{teamBSummary.pointsFor}</td>
                                </tr>
                                <tr>
                                    <td>Points against</td>
                                    <td>{teamASummary.pointsAgainst}</td>
                                    <td>{teamBSummary.pointsAgainst}</td>
                                </tr>
                                <tr>
                                    <td>Wins</td>
                                    <td>{teamASummary.wins}</td>
                                    <td>{teamBSummary.wins}</td>
                                </tr>
                                <tr>
                                    <td>Losses</td>
                                    <td>{teamASummary.losses}</td>
                                    <td>{teamBSummary.losses}</td>
                                </tr>
                                <tr>
                                    <td>Average points for</td>
                                    <td>{teamASummary.averagePointsFor}</td>
                                    <td>{teamBSummary.averagePointsFor}</td>
                                </tr>
                                <tr>
                                    <td>Average points against</td>
                                    <td>{teamASummary.averagePointsAgainst}</td>
                                    <td>{teamBSummary.averagePointsAgainst}</td>
                                </tr>
                                <tr>
                                    <td>Point differential</td>
                                    <td>{formatPointDifferential(teamASummary.pointDifferential)}</td>
                                    <td>{formatPointDifferential(teamBSummary.pointDifferential)}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className='compare-mobile-list'>
                            <div className='compare-mobile-card'>
                                <h3>
                                    <button
                                        type='button'
                                        className='compare-team-link'
                                        onClick={() => navigate(`/teams/${teamAId}`)}
                                    >
                                        {teamAName}
                                    </button>
                                </h3>
                                <p><span>Games played</span><strong>{teamASummary.gamesPlayed}</strong></p>
                                <p><span>Points for</span><strong>{teamASummary.pointsFor}</strong></p>
                                <p><span>Points against</span><strong>{teamASummary.pointsAgainst}</strong></p>
                                <p><span>Wins</span><strong>{teamASummary.wins}</strong></p>
                                <p><span>Losses</span><strong>{teamASummary.losses}</strong></p>
                                <p><span>Average points for</span><strong>{teamASummary.averagePointsFor}</strong></p>
                                <p><span>Average points against</span><strong>{teamASummary.averagePointsAgainst}</strong></p>
                                <p><span>Point differential</span><strong>{formatPointDifferential(teamASummary.pointDifferential)}</strong></p>
                            </div>
                            <div className='compare-mobile-card'>
                                <h3>
                                    <button
                                        type='button'
                                        className='compare-team-link'
                                        onClick={() => navigate(`/teams/${teamBId}`)}
                                    >
                                        {teamBName}
                                    </button>
                                </h3>
                                <p><span>Games played</span><strong>{teamBSummary.gamesPlayed}</strong></p>
                                <p><span>Points for</span><strong>{teamBSummary.pointsFor}</strong></p>
                                <p><span>Points against</span><strong>{teamBSummary.pointsAgainst}</strong></p>
                                <p><span>Wins</span><strong>{teamBSummary.wins}</strong></p>
                                <p><span>Losses</span><strong>{teamBSummary.losses}</strong></p>
                                <p><span>Average points for</span><strong>{teamBSummary.averagePointsFor}</strong></p>
                                <p><span>Average points against</span><strong>{teamBSummary.averagePointsAgainst}</strong></p>
                                <p><span>Point differential</span><strong>{formatPointDifferential(teamBSummary.pointDifferential)}</strong></p>
                            </div>
                        </div>
                    </div>
                </SectionCard>
            ) : (
                <SectionCard title=''>
                    <div className='compare-players-toolbar'>
                        <div className='form-group compare-game-filter'>
                            <label>Filter by Game / Scope</label>
                            <select
                                className='form-select'
                                value={selectedGameFilterId}
                                onChange={(e) => setSelectedGameFilterId(e.target.value)}
                            >
                                <option value=''>Season Averages (All Games)</option>
                                {completedGamesList.map((g) => {
                                    const home = teamNameById[g.home_team_id] || 'Home'
                                    const away = teamNameById[g.away_team_id] || 'Away'
                                    const dateLabel = formatDateToDDMMYYYY(g.game_date)
                                    return (
                                        <option key={g.id} value={g.id}>
                                            {dateLabel ? `${dateLabel} · ` : ''}{home} vs {away}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>

                        {playerSlots.length < 4 && (
                            <button
                                type='button'
                                className='compare-add-player-btn'
                                onClick={handleAddPlayerSlot}
                            >
                                + Add Player ({playerSlots.length}/4)
                            </button>
                        )}
                    </div>

                    <div className='compare-player-slots-grid'>
                        {playerSlots.map((slot, index) => {
                            const availablePlayers = slot.teamFilterId
                                ? players.filter((p) => p.team_id === slot.teamFilterId)
                                : players
                            const selectedPlayerObj = players.find((p) => p.id === slot.playerId)

                            return (
                                <div key={slot.slotId} className='compare-player-slot-card'>
                                    <div className='compare-slot-header'>
                                        <div className='compare-slot-identity'>
                                            {selectedPlayerObj && (
                                                <PlayerAvatar
                                                    name={formatPlayerFullName(selectedPlayerObj)}
                                                    photoUrl={selectedPlayerObj.photo_url}
                                                    size='sm'
                                                />
                                            )}
                                            <span>
                                                Player {index + 1}
                                                {selectedPlayerObj?.number !== undefined ? ` · #${selectedPlayerObj.number}` : ''}
                                            </span>
                                        </div>
                                        {playerSlots.length > 2 && (
                                            <button
                                                type='button'
                                                className='compare-remove-slot-btn'
                                                onClick={() => handleRemovePlayerSlot(slot.slotId)}
                                                aria-label='Remove player'
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    <div className='form-group'>
                                        <label>Team Filter</label>
                                        <select
                                            className='form-select'
                                            value={slot.teamFilterId}
                                            onChange={(e) => handleSlotTeamChange(slot.slotId, e.target.value)}
                                        >
                                            <option value=''>All Teams</option>
                                            {teams.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className='form-group'>
                                        <label>Player</label>
                                        <select
                                            className='form-select'
                                            value={slot.playerId}
                                            onChange={(e) => handleSlotPlayerChange(slot.slotId, e.target.value)}
                                        >
                                            {availablePlayers.map((p) => (
                                                <option
                                                    key={p.id}
                                                    value={p.id}
                                                    disabled={playerSlots.some(
                                                        (other) => other.slotId !== slot.slotId && other.playerId === p.id
                                                    )}
                                                >
                                                    {formatPlayerFullName(p)} ({teamNameById[p.team_id] || 'No Team'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {isLoadingPlayerStats ? (
                        <div className='compare-players-loading'>
                            <BasketballLoader />
                            <p>Loading player stats...</p>
                        </div>
                    ) : (
                        <div className='table-wrapper compare-table-wrapper compare-players-table-wrapper'>
                            <table className='data-table'>
                                <thead>
                                <tr>
                                    <th>Metric</th>
                                    {comparedPlayersMetrics.map((m) => (
                                        <th key={m.playerId}>
                                            <div className='compare-entity-header'>
                                                <PlayerAvatar
                                                    name={m.displayName}
                                                    photoUrl={m.photoUrl}
                                                    size='md'
                                                />
                                                <div>
                                                    <button
                                                        type='button'
                                                        className='compare-team-link'
                                                        onClick={() => navigate(`/players/${m.playerId}`)}
                                                    >
                                                        {m.displayName}
                                                    </button>
                                                    <div className='compare-th-sub'>
                                                        {m.teamName}
                                                        {m.jerseyNumber !== undefined ? ` · #${m.jerseyNumber}` : ''}
                                                    </div>
                                                    {m.didNotPlayGame && (
                                                        <span className='compare-dnp-badge'>DNP · No jugó</span>
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {playerMetricRows.map((row) => {
                                    const activeParticipants = comparedPlayersMetrics.filter((m) => !m.didNotPlayGame)
                                    const values = activeParticipants.map((m) => row.getValue(m))
                                    const bestValue = values.length > 0
                                        ? (row.lowerIsBetter ? Math.min(...values) : Math.max(...values))
                                        : null

                                    return (
                                        <tr key={row.label}>
                                            <td>{row.label}</td>
                                            {comparedPlayersMetrics.map((m) => {
                                                if (m.didNotPlayGame) {
                                                    return (
                                                        <td key={m.playerId} className='compare-dnp-cell'>
                                                            —
                                                        </td>
                                                    )
                                                }
                                                const val = row.getValue(m)
                                                const isBest = activeParticipants.length > 1 && bestValue !== null && val === bestValue && val > 0
                                                return (
                                                    <td
                                                        key={m.playerId}
                                                        className={isBest ? 'compare-best-stat' : ''}
                                                    >
                                                        {val}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>
            )}
        </div>
    )
}

export default ComparePage