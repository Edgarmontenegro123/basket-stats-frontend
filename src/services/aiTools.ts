import {getGames, getTeams, getTopScorers, getPlayerRankings, getPlayerSummaryByName, getPlayerStatsByGameId} from './api'
import type {Team} from '../types/team'
import type {TeamGame, TopScorer, GamePlayerStat, PlayerSummary} from '../types/ai'
import {normaliseText} from '../components/helpers/normaliseText'
import {parseGameTimestamp, formatDateToDDMMYYYY} from '../components/helpers/formatDate'
import {buildPlayerNameCandidates} from '../components/helpers/playerHelpers'

const getRawDate = (game: TeamGame): unknown => {
    const g = game as unknown as Record<string, unknown>
    return g.date ?? g.game_date ?? g.match_date ?? g.created_at ?? ''
}

const resolvePlayerSummary = async(rawName: string): Promise<PlayerSummary | null> => {
    const candidates = buildPlayerNameCandidates(rawName)
    for (const candidate of candidates) {
        const result = (await getPlayerSummaryByName(candidate)) as PlayerSummary | null
        if (result && !result.error && (result.player_name || result.average_points !== undefined)) {
            return result
        }
    }
    return null
}

export const aiFunctionDeclarations = [
    {
        name: 'getMatchSummary',
        description: 'Retrieves complete match data including recent games, team information, and top scorers in a single request.',
        parameters: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'getGames',
        description: 'Retrieves the list of basketball games with scores, status, and teams.',
        parameters: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'getTeams',
        description: 'Retrieves the list of registered basketball teams.',
        parameters: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'getTeamStats',
        description: 'Retrieves team info, recent or first games, or a specific head-to-head match between two teams (e.g. Almendra vs Pegasos). ALWAYS set matchOrder to "oldest" if the user asks for the first match ("primer partido", "first one", "first game"), or "latest" for the most recent match ("último partido", "last game").',
        parameters: {
            type: 'object',
            properties: {
                teamName: {
                    type: 'string',
                    description: 'The name or short name of the primary team (e.g. Almendra)'
                },
                opponentName: {
                    type: 'string',
                    description: 'Optional name of the opponent team if the user asks for a specific match between two teams (e.g. Pegasos)'
                },
                matchOrder: {
                    type: 'string',
                    description: 'Set to "oldest" when asking for the first game ("primer partido", "first"), or "latest" (default) for the most recent game.'
                }
            },
            required: ['teamName']
        }
    },
    {
        name: 'getTopScorers',
        description: 'Retrieves top player stats rankings. Category can be strictly: points, rebounds, assists, or steals. Always use this when asked for leaders in points, steals, or rebounds.',
        parameters: {
            type: 'object',
            properties: {
                limit: {
                    type: 'number',
                    description: 'Number of players to return (default 5)'
                },
                category: {
                    type: 'string',
                    description: 'The exact stat category: points, rebounds, assists, or steals'
                }
            },
            required: ['category']
        }
    },
    {
        name: 'getPlayerSummary',
        description: 'Retrieves detailed statistical summary for a single human PLAYER by full name (e.g. Jose Escalante, Edgar Montenegro). Do NOT use for team searches.',
        parameters: {
            type: 'object',
            properties: {
                playerName: {
                    type: 'string',
                    description: 'The full name of the player'
                }
            },
            required: ['playerName']
        }
    },
    {
        name: 'comparePlayers',
        description: 'Compares the statistical performance of two basketball players in a specific match or overall. ALWAYS extract the team or matchup query into teamQuery when the user mentions a match (e.g., "en el partido almendra Vs pegasos" -> teamQuery: "almendra vs pegasos"). If a specific date or "last match" is mentioned, extract it into matchContext.',
        parameters: {
            type: 'object',
            properties: {
                player1Name: {
                    type: 'string',
                    description: 'The full name of the first player'
                },
                player2Name: {
                    type: 'string',
                    description: 'The full name of the second player'
                },
                teamQuery: {
                    type: 'string',
                    description: 'The exact matchup or team name mentioned by the user (e.g. almendra vs pegasos)'
                },
                matchContext: {
                    type: 'string',
                    description: 'Specific date, round, or identifier like "ultimo" (last) if a specific game among the same teams is requested'
                }
            },
            required: ['player1Name', 'player2Name']
        }
    }
]

export const executeAITool = async(functionName: string, args?: Record<string, unknown>) => {
    try {
        switch (functionName) {
            case 'getMatchSummary': {
                const [games, teams, scorers] = await Promise.all([
                    getGames(),
                    getTeams(),
                    getTopScorers(10)
                ])

                const sortedGames = [...(games || [])].sort(
                    (a, b) => parseGameTimestamp(getRawDate(b)) - parseGameTimestamp(getRawDate(a))
                )
                const latestGame = sortedGames.length > 0 ? sortedGames[0] : null
                let matchCardData = null

                if (latestGame) {
                    const resolvedDate = String(getRawDate(latestGame) || '')
                    let formattedTopPlayers: Array<{ name: string; points: number }> = []
                    try {
                        const gamePlayers = (await getPlayerStatsByGameId(latestGame.id)) as GamePlayerStat[]
                        formattedTopPlayers = (Array.isArray(gamePlayers) ? gamePlayers : [])
                            .sort((a, b) => Number(b.points ?? b.pts ?? 0) - Number(a.points ?? a.pts ?? 0))
                            .slice(0, 5)
                            .map((p) => ({
                                name: p.player_name || p.name || 'Jugador',
                                points: Number(p.points ?? p.pts ?? 0)
                            }))
                    } catch {
                        formattedTopPlayers = (scorers || []).slice(0, 5).map((s: TopScorer) => ({
                            name: s.player_name || s.name || 'Jugador',
                            points: s.average_points ?? s.total_points ?? s.points ?? 0
                        }))
                    }

                    matchCardData = {
                        type: 'match-card' as const,
                        data: {
                            gameId: latestGame.id,
                            homeTeam: latestGame.home_team_name || latestGame.home_team || 'Local',
                            awayTeam: latestGame.away_team_name || latestGame.away_team || 'Visitante',
                            homeScore: latestGame.home_score ?? 0,
                            awayScore: latestGame.away_score ?? 0,
                            date: formatDateToDDMMYYYY(resolvedDate),
                            topPlayers: formattedTopPlayers
                        }
                    }
                }

                return {
                    result: 'Match summary retrieved successfully',
                    games: sortedGames,
                    teams,
                    topScorers: scorers,
                    genUiData: matchCardData
                }
            }
            case 'getGames':
                return await getGames()
            case 'getTeams':
                return await getTeams()
            case 'getTeamStats': {
                const rawSearch = typeof args?.teamName === 'string' ? args.teamName : ''
                const rawOpponent = typeof args?.opponentName === 'string' ? args.opponentName : ''
                const searchName = normaliseText(rawSearch)
                const opponentSearch = normaliseText(rawOpponent)

                const [rawGames, rawTeams, rawScorers] = await Promise.all([
                    getGames(),
                    getTeams(),
                    getTopScorers(20)
                ])

                const games = rawGames as unknown as TeamGame[]
                const teams = rawTeams as unknown as Team[]
                const scorers = rawScorers as unknown as TopScorer[]

                const matchingTeam = teams.find((t) => {
                    const normName = normaliseText(t.name)
                    const normShort = normaliseText(t.short_name || '')
                    return normName.includes(searchName) || normShort.includes(searchName) || searchName.includes(normName)
                })

                if (!matchingTeam) {
                    return {team: null, message: 'Team not found', availableTeams: teams.map((t) => t.name)}
                }

                let teamGames = games.filter((g) => {
                    const home = normaliseText(g.home_team_name || g.home_team || '')
                    const away = normaliseText(g.away_team_name || g.away_team || '')
                    return (
                        g.home_team_id === matchingTeam.id ||
                        g.away_team_id === matchingTeam.id ||
                        home.includes(searchName) ||
                        away.includes(searchName)
                    )
                })

                if (opponentSearch) {
                    const headToHeadGames = teamGames.filter((g) => {
                        const home = normaliseText(g.home_team_name || g.home_team || '')
                        const away = normaliseText(g.away_team_name || g.away_team || '')
                        return home.includes(opponentSearch) || away.includes(opponentSearch)
                    })

                    if (headToHeadGames.length > 0) {
                        teamGames = headToHeadGames
                    }
                }

                const matchOrder = typeof args?.matchOrder === 'string' ? normaliseText(args.matchOrder) : 'latest'

                teamGames.sort((a, b) => {
                    const timeA = parseGameTimestamp(getRawDate(a))
                    const timeB = parseGameTimestamp(getRawDate(b))
                    if (timeA !== timeB) return timeA - timeB
                    return String(a.id).localeCompare(String(b.id))
                })

                const isOldest = matchOrder.includes('oldest') || matchOrder.includes('primer') || matchOrder.includes('first')
                const selectedGame = teamGames.length > 0
                    ? (isOldest ? teamGames[0] : teamGames[teamGames.length - 1])
                    : null

                let matchCardData = null
                let matchSummaryText = `Team ${matchingTeam.name} has ${teamGames.length} registered game(s).`

                if (selectedGame) {
                    const homeName = selectedGame.home_team_name || selectedGame.home_team || 'Local'
                    const awayName = selectedGame.away_team_name || selectedGame.away_team || 'Visitante'
                    const homeScore = selectedGame.home_score ?? 0
                    const awayScore = selectedGame.away_score ?? 0
                    const resolvedDate = String(getRawDate(selectedGame) || '')
                    const formattedDate = formatDateToDDMMYYYY(resolvedDate)

                    let formattedTopPlayers: Array<{ name: string; points: number }> = []
                    try {
                        const gamePlayers = (await getPlayerStatsByGameId(selectedGame.id)) as GamePlayerStat[]
                        const validPlayers = Array.isArray(gamePlayers) ? gamePlayers : []

                        const filteredGamePlayers = opponentSearch
                            ? validPlayers
                            : validPlayers.filter((p) => {
                                const pTeam = normaliseText(p.team_name || p.team || '')
                                return pTeam.includes(searchName) || searchName.includes(pTeam)
                            })

                        const pool = filteredGamePlayers.length > 0 ? filteredGamePlayers : validPlayers

                        formattedTopPlayers = [...pool]
                            .sort((a, b) => Number(b.points ?? b.pts ?? 0) - Number(a.points ?? a.pts ?? 0))
                            .slice(0, 5)
                            .map((p) => ({
                                name: p.player_name || p.name || 'Jugador',
                                points: Number(p.points ?? p.pts ?? 0)
                            }))
                    } catch {
                        formattedTopPlayers = (scorers || []).slice(0, 5).map((s) => ({
                            name: s.player_name || s.name || 'Jugador',
                            points: s.average_points ?? s.total_points ?? s.points ?? 0
                        }))
                    }

                    const topScorersStr = formattedTopPlayers.map((p) => `${p.name} (${p.points} pts)`).join(', ')
                    matchSummaryText = `${isOldest ? 'First' : 'Latest'} match for ${matchingTeam.name}: ${homeName} ${homeScore} vs ${awayName} ${awayScore} (Date: ${formattedDate || 'N/A'}). Top performers: ${topScorersStr}.`

                    matchCardData = {
                        type: 'match-card' as const,
                        data: {
                            gameId: selectedGame.id,
                            homeTeam: homeName,
                            awayTeam: awayName,
                            homeScore,
                            awayScore,
                            date: formattedDate,
                            topPlayers: formattedTopPlayers
                        }
                    }
                }

                return {
                    result: matchSummaryText,
                    team: {
                        name: matchingTeam.name,
                        shortName: matchingTeam.short_name
                    },
                    gamesCount: teamGames.length,
                    genUiData: matchCardData
                }
            }
            case 'getTopScorers': {
                const limit = typeof args?.limit === 'number' ? args.limit : 5
                const rawCat = typeof args?.category === 'string' ? normaliseText(args.category) : 'points'

                let category = 'points'
                if (rawCat.includes('robo') || rawCat.includes('steal')) category = 'steals'
                else if (rawCat.includes('rebot') || rawCat.includes('rebound')) category = 'rebounds'
                else if (rawCat.includes('asist') || rawCat.includes('assist')) category = 'assists'

                return await getPlayerRankings(category, limit)
            }
            case 'getPlayerSummary': {
                const rawName = typeof args?.playerName === 'string' ? args.playerName : ''
                const player = await resolvePlayerSummary(rawName)

                if (!player || !player.player_name) {
                    return {result: `Player "${rawName}" not found in database.`, genUiData: null}
                }

                const name = player.player_name
                const team = player.team_name || ''
                const points = player.average_points ?? player.total_points ?? 0
                const rebounds = player.average_rebounds ?? player.total_rebounds ?? 0
                const assists = player.average_assists ?? player.total_assists ?? 0
                const steals = player.average_steals ?? player.total_steals ?? 0

                return {
                    result: `Player found: ${name}. Team: ${team}. Average stats — Points: ${points}, Rebounds: ${rebounds}, Assists: ${assists}, Steals: ${steals}.`,
                    genUiData: {
                        type: 'player-card',
                        data: {
                            name,
                            team,
                            points,
                            rebounds,
                            assists,
                            steals,
                            photoUrl: player.photo_url || '',
                            teamBadgeUrl: player.team_badge_url || ''
                        }
                    }
                }
            }
            case 'comparePlayers': {
                const rawP1 = typeof args?.player1Name === 'string' ? args.player1Name : ''
                const rawP2 = typeof args?.player2Name === 'string' ? args.player2Name : ''
                const rawTeamSearch = typeof args?.teamQuery === 'string' ? args.teamQuery : ''
                const rawMatchContext = typeof args?.matchContext === 'string' ? normaliseText(args.matchContext) : ''

                if (!rawP1 || !rawP2) {
                    return {result: 'Por favor, proporciona dos nombres de jugadores válidos para comparar.', genUiData: null}
                }

                try {
                    const games = (await getGames()) as TeamGame[]
                    let targetGames: TeamGame[] = games

                    if (rawTeamSearch) {
                        const searchLower = normaliseText(rawTeamSearch)
                        const queryTokens = searchLower.split(/\s+vs\s+|\s+v\s+|\s+contra\s+|\s+y\s+/)

                        targetGames = games.filter(g => {
                            const home = normaliseText(g.home_team_name || g.home_team || '')
                            const away = normaliseText(g.away_team_name || g.away_team || '')
                            return queryTokens.some(token => {
                                const t = token.trim()
                                return t.length > 2 && (home.includes(t) || away.includes(t))
                            })
                        })
                    }

                    if (targetGames.length > 0) {
                        targetGames.sort((a, b) => parseGameTimestamp(getRawDate(a)) - parseGameTimestamp(getRawDate(b)))
                    }

                    if (targetGames.length > 1) {
                        if (rawMatchContext.includes('ultimo') || rawMatchContext.includes('recent') || rawMatchContext.includes('reciente')) {
                            targetGames = [targetGames[targetGames.length - 1]]
                        } else if (rawMatchContext.includes('primero') || rawMatchContext.includes('primer') || rawMatchContext.includes('oldest') || rawMatchContext.includes('first')) {
                            targetGames = [targetGames[0]]
                        } else if (rawMatchContext) {
                            const matchFiltered = targetGames.filter(g => {
                                const gDate = normaliseText(String(getRawDate(g) || ''))
                                return gDate.includes(rawMatchContext)
                            })
                            if (matchFiltered.length > 0) {
                                targetGames = matchFiltered
                            }
                        }
                    }

                    let p1TotalPoints = 0, p1TotalRebounds = 0, p1TotalAssists = 0, p1TotalSteals = 0, p1MatchesCount = 0
                    let p2TotalPoints = 0, p2TotalRebounds = 0, p2TotalAssists = 0, p2TotalSteals = 0, p2MatchesCount = 0

                    let p1ActualName = rawP1
                    let p2ActualName = rawP2
                    let p1Team = ''
                    let p2Team = ''

                    const p1Tokens = normaliseText(rawP1).split(' ').filter(t => t.length > 1)
                    const p2Tokens = normaliseText(rawP2).split(' ').filter(t => t.length > 1)

                    for (const game of targetGames) {
                        try {
                            const gamePlayers = (await getPlayerStatsByGameId(game.id)) as GamePlayerStat[]
                            if (!Array.isArray(gamePlayers)) continue

                            const foundP1 = gamePlayers.find(p => {
                                const pName = normaliseText(p.player_name || p.name || '')
                                return p1Tokens.some(token => pName.includes(token))
                            })

                            const foundP2 = gamePlayers.find(p => {
                                const pName = normaliseText(p.player_name || p.name || '')
                                return p2Tokens.some(token => pName.includes(token))
                            })

                            if (foundP1) {
                                p1ActualName = foundP1.player_name || foundP1.name || p1ActualName
                                p1Team = foundP1.team_name || foundP1.team || p1Team
                                p1TotalPoints += Number(foundP1.points ?? foundP1.pts ?? 0)
                                p1TotalRebounds += Number(foundP1.rebounds ?? foundP1.reb ?? 0)
                                p1TotalAssists += Number(foundP1.assists ?? foundP1.ast ?? 0)
                                p1TotalSteals += Number(foundP1.steals ?? foundP1.stl ?? 0)
                                p1MatchesCount++
                            }

                            if (foundP2) {
                                p2ActualName = foundP2.player_name || foundP2.name || p2ActualName
                                p2Team = foundP2.team_name || foundP2.team || p2Team
                                p2TotalPoints += Number(foundP2.points ?? foundP2.pts ?? 0)
                                p2TotalRebounds += Number(foundP2.rebounds ?? foundP2.reb ?? 0)
                                p2TotalAssists += Number(foundP2.assists ?? foundP2.ast ?? 0)
                                p2TotalSteals += Number(foundP2.steals ?? foundP2.stl ?? 0)
                                p2MatchesCount++
                            }
                        } catch (err) {
                            console.warn(`Advertencia: No se pudieron procesar las estadísticas para el partido ID ${game.id}:`, err)
                        }
                    }

                    const [p1Fallback, p2Fallback] = await Promise.all([
                        resolvePlayerSummary(rawP1),
                        resolvePlayerSummary(rawP2)
                    ])

                    const p1Exists = p1MatchesCount > 0 || Boolean(p1Fallback && (p1Fallback.average_points !== undefined || p1Fallback.player_name !== undefined))
                    const p2Exists = p2MatchesCount > 0 || Boolean(p2Fallback && (p2Fallback.average_points !== undefined || p2Fallback.player_name !== undefined))

                    if (!p1Exists && !p2Exists) {
                        return {
                            result: `No se encontraron registros en el sistema para ninguno de los dos jugadores ingresados ("${rawP1}" y "${rawP2}").`,
                            genUiData: null
                        }
                    }

                    const isSingleMatch = targetGames.length === 1 && p1MatchesCount > 0

                    const finalP1Points = p1MatchesCount > 0 ? (isSingleMatch ? p1TotalPoints : Number((p1TotalPoints / p1MatchesCount).toFixed(1))) : (p1Fallback?.average_points ?? 0)
                    const finalP1Rebounds = p1MatchesCount > 0 ? (isSingleMatch ? p1TotalRebounds : Number((p1TotalRebounds / p1MatchesCount).toFixed(1))) : (p1Fallback?.average_rebounds ?? 0)
                    const finalP1Assists = p1MatchesCount > 0 ? (isSingleMatch ? p1TotalAssists : Number((p1TotalAssists / p1MatchesCount).toFixed(1))) : (p1Fallback?.average_assists ?? 0)
                    const finalP1Steals = p1MatchesCount > 0 ? (isSingleMatch ? p1TotalSteals : Number((p1TotalSteals / p1MatchesCount).toFixed(1))) : (p1Fallback?.average_steals ?? 0)

                    const finalP2Points = p2MatchesCount > 0 ? (isSingleMatch ? p2TotalPoints : Number((p2TotalPoints / p2MatchesCount).toFixed(1))) : (p2Fallback?.average_points ?? 0)
                    const finalP2Rebounds = p2MatchesCount > 0 ? (isSingleMatch ? p2TotalRebounds : Number((p2TotalRebounds / p2MatchesCount).toFixed(1))) : (p2Fallback?.average_rebounds ?? 0)
                    const finalP2Assists = p2MatchesCount > 0 ? (isSingleMatch ? p2TotalAssists : Number((p2TotalAssists / p2MatchesCount).toFixed(1))) : (p2Fallback?.average_assists ?? 0)
                    const finalP2Steals = p2MatchesCount > 0 ? (isSingleMatch ? p2TotalSteals : Number((p2TotalSteals / p2MatchesCount).toFixed(1))) : (p2Fallback?.average_steals ?? 0)

                    const resolvedP1Name = p1Exists ? (p1MatchesCount > 0 ? p1ActualName : (p1Fallback?.player_name || rawP1)) : `${rawP1} (No encontrado)`
                    const resolvedP2Name = p2Exists ? (p2MatchesCount > 0 ? p2ActualName : (p2Fallback?.player_name || rawP2)) : `${rawP2} (No encontrado)`
                    const resolvedP1Team = p1Team || p1Fallback?.team_name || 'Sin equipo'
                    const resolvedP2Team = p2Team || p2Fallback?.team_name || 'Sin equipo'

                    let statusMessage = `Comparison stats (${isSingleMatch ? 'single match' : 'average'}): ${resolvedP1Name} (${resolvedP1Team}) — ${finalP1Points} PTS, ${finalP1Rebounds} REB, ${finalP1Assists} AST, ${finalP1Steals} STL vs ${resolvedP2Name} (${resolvedP2Team}) — ${finalP2Points} PTS, ${finalP2Rebounds} REB, ${finalP2Assists} AST, ${finalP2Steals} STL.`
                    if (!p1Exists) statusMessage = `Notice: Player "${rawP1}" was not found in the database.`
                    if (!p2Exists) statusMessage = `Notice: Player "${rawP2}" was not found in the database.`

                    const comparisonData = {
                        type: 'compare-card' as const,
                        data: {
                            player1: {
                                name: resolvedP1Name,
                                team: resolvedP1Team,
                                points: p1Exists ? finalP1Points : 0,
                                rebounds: p1Exists ? finalP1Rebounds : 0,
                                assists: p1Exists ? finalP1Assists : 0,
                                steals: p1Exists ? finalP1Steals : 0,
                                photoUrl: p1Fallback?.photo_url || '',
                                teamBadgeUrl: p1Fallback?.team_badge_url || ''
                            },
                            player2: {
                                name: resolvedP2Name,
                                team: resolvedP2Team,
                                points: p2Exists ? finalP2Points : 0,
                                rebounds: p2Exists ? finalP2Rebounds : 0,
                                assists: p2Exists ? finalP2Assists : 0,
                                steals: p2Exists ? finalP2Steals : 0,
                                photoUrl: p2Fallback?.photo_url || '',
                                teamBadgeUrl: p2Fallback?.team_badge_url || ''
                            },
                            comparisonId: `comp-${Date.now()}`
                        }
                    }

                    return {
                        result: statusMessage,
                        genUiData: comparisonData
                    }
                } catch (err) {
                    console.error('Error in comparePlayers:', err)
                    return {result: 'Error al procesar los datos de comparación.', genUiData: null}
                }
            }
            default: {
                const [games, teams] = await Promise.all([getGames(), getTeams()])
                return {games, teams}
            }
        }
    } catch (error) {
        console.error(`Error executing tool ${functionName}:`, error)
        return {error: 'Failed to fetch data from backend services'}
    }
}