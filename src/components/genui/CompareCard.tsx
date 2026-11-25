import {useState} from 'react'
import {getPlayerStatsByGameId} from '../../services/api'
import {normaliseText} from '../helpers/normaliseText'
import type {CompareCardData, CompareCardProps} from '../../types/compare'
import type {GamePlayerStat} from '../../types/ai'
import './CompareCard.css'

interface ActiveComparisonStats {
    p1Id?: string
    p2Id?: string
    p1DidNotPlay?: boolean
    p2DidNotPlay?: boolean
    p1Points: number
    p1Rebounds: number
    p1Assists: number
    p1Steals: number
    p2Points: number
    p2Rebounds: number
    p2Assists: number
    p2Steals: number
}

const roundStat = (value: number): number => Number(value.toFixed(1))

const getInitials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || '?'

const buildDefaultStats = (data: CompareCardData, includePlayerIds = false): ActiveComparisonStats => ({
    p1Id: includePlayerIds ? data.player1.id : undefined,
    p2Id: includePlayerIds ? data.player2.id : undefined,
    p1DidNotPlay: false,
    p2DidNotPlay: false,
    p1Points: data.player1.points,
    p1Rebounds: data.player1.rebounds ?? 0,
    p1Assists: data.player1.assists ?? 0,
    p1Steals: data.player1.steals ?? 0,
    p2Points: data.player2.points,
    p2Rebounds: data.player2.rebounds ?? 0,
    p2Assists: data.player2.assists ?? 0,
    p2Steals: data.player2.steals ?? 0
})

const getNameTokens = (name: string): string[] =>
    normaliseText(name).split(' ').filter((t) => t.length > 1)

const findPlayersInGame = (
    gamePlayers: GamePlayerStat[],
    p1Tokens: string[],
    p2Tokens: string[]
): {foundP1?: GamePlayerStat; foundP2?: GamePlayerStat} => {
    const validPlayers = Array.isArray(gamePlayers) ? gamePlayers : []
    const matchByTokens = (tokens: string[]) => {
        if (tokens.length === 0) return undefined
        const strict = validPlayers.find((p) => {
            const pName = normaliseText(p.player_name || p.name || '')
            return tokens.every((token) => pName.includes(token))
        })
        if (strict) return strict

        return validPlayers.find((p) => {
            const pTokens = normaliseText(p.player_name || p.name || '').split(' ').filter(Boolean)
            return tokens.some((t) => t.length >= 4 && pTokens.includes(t))
        })
    }

    return {
        foundP1: matchByTokens(p1Tokens),
        foundP2: matchByTokens(p2Tokens)
    }
}

const PlayerVisualIdentity = ({
                                  name,
                                  team,
                                  number,
                                  photoUrl,
                                  teamBadgeUrl,
                                  didNotPlay
                              }: {
    name: string
    team: string
    number?: number
    photoUrl?: string
    teamBadgeUrl?: string
    didNotPlay?: boolean
}) => {
    const [avatarErr, setAvatarErr] = useState(false)
    const [badgeErr, setBadgeErr] = useState(false)

    return (
        <div className='chat-compare-player'>
            <div className='chat-compare-avatar-wrap'>
                {photoUrl && !avatarErr ? (
                    <img
                        src={photoUrl}
                        alt={name}
                        className='chat-compare-avatar'
                        onError={() => setAvatarErr(true)}
                    />
                ) : (
                    <div className='chat-compare-avatar chat-compare-avatar--fallback'>
                        {getInitials(name)}
                    </div>
                )}
                {number !== undefined && (
                    <span className='chat-compare-jersey-pill'>#{number}</span>
                )}
            </div>

            <span className='chat-compare-name'>{name}</span>

            <div className='chat-compare-team-row'>
                {teamBadgeUrl && !badgeErr ? (
                    <img
                        src={teamBadgeUrl}
                        alt={team}
                        className='chat-compare-team-badge'
                        onError={() => setBadgeErr(true)}
                    />
                ) : (
                    <span className='chat-compare-team-badge chat-compare-team-badge--fallback'>
                        {getInitials(team || 'TM')}
                    </span>
                )}
                <span className='chat-compare-team'>{team}</span>
            </div>

            {didNotPlay && (
                <span className='chat-compare-dnp-badge'>DNP · No jugó</span>
            )}
        </div>
    )
}

export const CompareCard = ({data, onNavigateToAnalytics}: CompareCardProps) => {
    const [selectedMode, setSelectedMode] = useState<string>(data.gameId || '')
    const [activeStats, setActiveStats] = useState<ActiveComparisonStats>(() => buildDefaultStats(data, true))
    const [isLoadingGame, setIsLoadingGame] = useState(false)

    const availableGames = data.availableGames || []
    const hasHeadToHeadMultiple = availableGames.length > 1
    const isSpecificGameSelected = Boolean(selectedMode && selectedMode !== 'head-to-head')

    const handleSelectionChange = async(newValue: string) => {
        setSelectedMode(newValue)

        if (!newValue) {
            setActiveStats(buildDefaultStats(data, false))
            return
        }

        const p1Tokens = getNameTokens(data.player1.name)
        const p2Tokens = getNameTokens(data.player2.name)

        if (newValue === 'head-to-head') {
            try {
                setIsLoadingGame(true)
                const allMatchStats = await Promise.all(
                    availableGames.map((g) => getPlayerStatsByGameId(g.id) as Promise<GamePlayerStat[]>)
                )

                const totals = {
                    p1: {games: 0, pts: 0, reb: 0, ast: 0, stl: 0},
                    p2: {games: 0, pts: 0, reb: 0, ast: 0, stl: 0}
                }

                for (const gamePlayers of allMatchStats) {
                    const {foundP1, foundP2} = findPlayersInGame(gamePlayers, p1Tokens, p2Tokens)

                    if (foundP1) {
                        totals.p1.games += 1
                        totals.p1.pts += Number(foundP1.points ?? foundP1.pts ?? 0)
                        totals.p1.reb += Number(foundP1.rebounds ?? foundP1.reb ?? 0)
                        totals.p1.ast += Number(foundP1.assists ?? foundP1.ast ?? 0)
                        totals.p1.stl += Number(foundP1.steals ?? foundP1.stl ?? 0)
                    }

                    if (foundP2) {
                        totals.p2.games += 1
                        totals.p2.pts += Number(foundP2.points ?? foundP2.pts ?? 0)
                        totals.p2.reb += Number(foundP2.rebounds ?? foundP2.reb ?? 0)
                        totals.p2.ast += Number(foundP2.assists ?? foundP2.ast ?? 0)
                        totals.p2.stl += Number(foundP2.steals ?? foundP2.stl ?? 0)
                    }
                }

                setActiveStats({
                    p1Id: undefined,
                    p2Id: undefined,
                    p1DidNotPlay: totals.p1.games === 0,
                    p2DidNotPlay: totals.p2.games === 0,
                    p1Points: totals.p1.games > 0 ? roundStat(totals.p1.pts / totals.p1.games) : 0,
                    p1Rebounds: totals.p1.games > 0 ? roundStat(totals.p1.reb / totals.p1.games) : 0,
                    p1Assists: totals.p1.games > 0 ? roundStat(totals.p1.ast / totals.p1.games) : 0,
                    p1Steals: totals.p1.games > 0 ? roundStat(totals.p1.stl / totals.p1.games) : 0,
                    p2Points: totals.p2.games > 0 ? roundStat(totals.p2.pts / totals.p2.games) : 0,
                    p2Rebounds: totals.p2.games > 0 ? roundStat(totals.p2.reb / totals.p2.games) : 0,
                    p2Assists: totals.p2.games > 0 ? roundStat(totals.p2.ast / totals.p2.games) : 0,
                    p2Steals: totals.p2.games > 0 ? roundStat(totals.p2.stl / totals.p2.games) : 0
                })
            } catch (err) {
                console.error('Error computing head-to-head averages:', err)
            } finally {
                setIsLoadingGame(false)
            }
            return
        }

        try {
            setIsLoadingGame(true)
            const gamePlayers = (await getPlayerStatsByGameId(newValue)) as GamePlayerStat[]
            const {foundP1, foundP2} = findPlayersInGame(gamePlayers, p1Tokens, p2Tokens)

            setActiveStats({
                p1Id: foundP1?.id ? String(foundP1.id) : undefined,
                p2Id: foundP2?.id ? String(foundP2.id) : undefined,
                p1DidNotPlay: !foundP1,
                p2DidNotPlay: !foundP2,
                p1Points: Number(foundP1?.points ?? foundP1?.pts ?? 0),
                p1Rebounds: Number(foundP1?.rebounds ?? foundP1?.reb ?? 0),
                p1Assists: Number(foundP1?.assists ?? foundP1?.ast ?? 0),
                p1Steals: Number(foundP1?.steals ?? foundP1?.stl ?? 0),
                p2Points: Number(foundP2?.points ?? foundP2?.pts ?? 0),
                p2Rebounds: Number(foundP2?.rebounds ?? foundP2?.reb ?? 0),
                p2Assists: Number(foundP2?.assists ?? foundP2?.ast ?? 0),
                p2Steals: Number(foundP2?.steals ?? foundP2?.stl ?? 0)
            })
        } catch (err) {
            console.error('Error loading game stats for comparison:', err)
        } finally {
            setIsLoadingGame(false)
        }
    }

    const handleAnalyticsClick = () => {
        if (!onNavigateToAnalytics) return

        if (isSpecificGameSelected) {
            const playerIds = [activeStats.p1Id, activeStats.p2Id].filter(
                (id): id is string => Boolean(id && id.trim() !== '')
            )
            onNavigateToAnalytics(selectedMode, playerIds.length > 0 ? playerIds : undefined)
            return
        }

        const playerNames = [data.player1.name, data.player2.name].filter(
            (name): name is string => Boolean(name && name.trim() !== '')
        )
        onNavigateToAnalytics(undefined, playerNames)
    }

    const headerTitle = selectedMode === 'head-to-head'
        ? `Promedio Cara a Cara (${availableGames.length})`
        : isSpecificGameSelected
            ? 'Comparación en Partido'
            : 'Comparación General'

    const formatCell = (val: number, dnp?: boolean) => {
        if (isLoadingGame) return '...'
        if (dnp) return '—'
        return val
    }

    return (
        <div className='chat-compare-card'>
            <div className='chat-compare-header'>
                <span className='chat-compare-title'>{headerTitle}</span>
            </div>

            {availableGames.length > 0 && (
                <div className='chat-compare-game-selector'>
                    <label className='chat-compare-select-label' htmlFor={`compare-game-select-${data.comparisonId || 'default'}`}>
                        📅 Ver por partido ({availableGames.length} disponible{availableGames.length > 1 ? 's' : ''}):
                    </label>
                    <select
                        id={`compare-game-select-${data.comparisonId || 'default'}`}
                        className='chat-compare-select'
                        value={selectedMode}
                        onChange={(e) => void handleSelectionChange(e.target.value)}
                        disabled={isLoadingGame}
                    >
                        <option value=''>📊 Promedios generales de temporada</option>
                        {hasHeadToHeadMultiple && (
                            <option value='head-to-head'>
                                🤝 Promedio cara a cara ({availableGames.length} partidos)
                            </option>
                        )}
                        {availableGames.map((game) => (
                            <option key={game.id} value={game.id}>
                                🏀 {game.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className='chat-compare-body'>
                <PlayerVisualIdentity
                    name={data.player1.name}
                    team={data.player1.team}
                    number={data.player1.number}
                    photoUrl={data.player1.photoUrl}
                    teamBadgeUrl={data.player1.teamBadgeUrl}
                    didNotPlay={activeStats.p1DidNotPlay}
                />
                <div className='chat-compare-vs'>VS</div>
                <PlayerVisualIdentity
                    name={data.player2.name}
                    team={data.player2.team}
                    number={data.player2.number}
                    photoUrl={data.player2.photoUrl}
                    teamBadgeUrl={data.player2.teamBadgeUrl}
                    didNotPlay={activeStats.p2DidNotPlay}
                />
            </div>

            <div className='chat-compare-stats-table'>
                <div className='chat-stat-row'>
                    <span>{formatCell(activeStats.p1Points, activeStats.p1DidNotPlay)}</span>
                    <strong>PTS</strong>
                    <span>{formatCell(activeStats.p2Points, activeStats.p2DidNotPlay)}</span>
                </div>
                <div className='chat-stat-row'>
                    <span>{formatCell(activeStats.p1Rebounds, activeStats.p1DidNotPlay)}</span>
                    <strong>REB</strong>
                    <span>{formatCell(activeStats.p2Rebounds, activeStats.p2DidNotPlay)}</span>
                </div>
                <div className='chat-stat-row'>
                    <span>{formatCell(activeStats.p1Assists, activeStats.p1DidNotPlay)}</span>
                    <strong>AST</strong>
                    <span>{formatCell(activeStats.p2Assists, activeStats.p2DidNotPlay)}</span>
                </div>
                <div className='chat-stat-row'>
                    <span>{formatCell(activeStats.p1Steals, activeStats.p1DidNotPlay)}</span>
                    <strong>STL</strong>
                    <span>{formatCell(activeStats.p2Steals, activeStats.p2DidNotPlay)}</span>
                </div>
            </div>

            {onNavigateToAnalytics && (
                <div className='chat-match-actions'>
                    <button
                        type='button'
                        className='chat-match-analytics-btn'
                        onClick={handleAnalyticsClick}
                        disabled={isLoadingGame}
                    >
                        {isSpecificGameSelected ? 'Ver analíticas del partido 📊' : 'Ir a comparador general ⚖️'}
                    </button>
                </div>
            )}
        </div>
    )
}