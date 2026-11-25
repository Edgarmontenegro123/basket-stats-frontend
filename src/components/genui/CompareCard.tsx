import {useState} from 'react'
import {getPlayerStatsByGameId} from '../../services/api'
import {normaliseText} from '../helpers/normaliseText'
import type {CompareCardData, CompareCardProps} from '../../types/compare'
import type {GamePlayerStat} from '../../types/ai'
import './CompareCard.css'

interface ActiveComparisonStats {
    p1Id?: string
    p2Id?: string
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

const buildDefaultStats = (data: CompareCardData, includePlayerIds = false): ActiveComparisonStats => ({
    p1Id: includePlayerIds ? data.player1.id : undefined,
    p2Id: includePlayerIds ? data.player2.id : undefined,
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
                <div className='chat-compare-player'>
                    <span className='chat-compare-name'>{data.player1.name}</span>
                    <span className='chat-compare-team'>{data.player1.team}</span>
                </div>
                <div className='chat-compare-vs'>VS</div>
                <div className='chat-compare-player'>
                    <span className='chat-compare-name'>{data.player2.name}</span>
                    <span className='chat-compare-team'>{data.player2.team}</span>
                </div>
            </div>

            <div className='chat-compare-stats-table'>
                <div className='chat-stat-row'>
                    <span>{isLoadingGame ? '...' : activeStats.p1Points}</span>
                    <strong>PTS</strong>
                    <span>{isLoadingGame ? '...' : activeStats.p2Points}</span>
                </div>
                <div className='chat-stat-row'>
                    <span>{isLoadingGame ? '...' : activeStats.p1Rebounds}</span>
                    <strong>REB</strong>
                    <span>{isLoadingGame ? '...' : activeStats.p2Rebounds}</span>
                </div>
                <div className='chat-stat-row'>
                    <span>{isLoadingGame ? '...' : activeStats.p1Assists}</span>
                    <strong>AST</strong>
                    <span>{isLoadingGame ? '...' : activeStats.p2Assists}</span>
                </div>
                <div className='chat-stat-row'>
                    <span>{isLoadingGame ? '...' : activeStats.p1Steals}</span>
                    <strong>STL</strong>
                    <span>{isLoadingGame ? '...' : activeStats.p2Steals}</span>
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