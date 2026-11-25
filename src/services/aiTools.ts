import {getGames, getTeams, getTopScorers, getPlayerRankings, getPlayerSummaryByName, getPlayerStatsByGameId} from './api'
import type {Team} from '../types/team'
import type {TeamGame, TopScorer, GamePlayerStat, PlayerSummary} from '../types/ai'
import type {CompareGameOption} from '../types/compare'
import {normaliseText} from '../components/helpers/normaliseText'
import {parseGameTimestamp, formatDateToDDMMYYYY} from '../components/helpers/formatDate'
import {buildPlayerNameCandidates} from '../components/helpers/playerHelpers'

const getRawDate = (game: TeamGame): unknown => {
    const g = game as unknown as Record<string, unknown>
    return g.date ?? g.game_date ?? g.match_date ?? g.created_at ?? ''
}

interface ResolvedPlayerResult {
    player: PlayerSummary | null
    ambiguousMatches?: Array<{name: string; team: string}>
}

const resolvePlayerWithDisambiguation = async(rawName: string): Promise<ResolvedPlayerResult> => {
    const candidates = buildPlayerNameCandidates(rawName)
    for (const candidate of candidates) {
        const result = (await getPlayerSummaryByName(candidate)) as PlayerSummary | null
        if (result && !result.error && (result.player_name || result.average_points !== undefined)) {
            return {player: result}
        }
    }

    // Fallback: buscar por coincidencia de todos los tokens en la lista completa de jugadores
    const tokens = normaliseText(rawName).split(' ').filter((t) => t.length > 1)
    if (tokens.length === 0) return {player: null}

    try {
        const allRankings = (await getPlayerRankings('points', 300)) as TopScorer[]
        const list = Array.isArray(allRankings) ? allRankings : []

        const tokenMatches = list.filter((item) => {
            const fullName = normaliseText(item.player_name || item.name || '')
            return tokens.every((token) => fullName.includes(token))
        })

        if (tokenMatches.length === 1) {
            const exactName = tokenMatches[0].player_name || tokenMatches[0].name || ''
            if (exactName) {
                const fullSummary = (await getPlayerSummaryByName(exactName)) as PlayerSummary | null
                if (fullSummary && !fullSummary.error) {
                    return {player: fullSummary}
                }
            }
        }

        if (tokenMatches.length > 1) {
            const uniqueMatches = Array.from(
                new Map(
                    tokenMatches.map((m) => [
                        m.player_name || m.name || '',
                        {
                            name: m.player_name || m.name || 'Jugador',
                            team: m.team_name || 'Sin equipo'
                        }
                    ])
                ).values()
            )
            return {player: null, ambiguousMatches: uniqueMatches}
        }
    } catch {
        // Ignorar error de fallback y retornar null
    }

    return {player: null}
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
        description: 'Compares the statistical performance of two basketball players overall and across head-to-head or shared matches. ALWAYS extract the team or matchup query into teamQuery ONLY when the user explicitly mentions a match or teams (e.g., "en el partido almendra Vs pegasos" -> teamQuery: "almendra vs pegasos"). Leave teamQuery empty for overall/general comparisons.',
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
                    description: 'The exact matchup or team name mentioned by the user (e.g. almendra vs pegasos), or empty if overall comparison'
                },
                matchContext: {
                    type: 'string',
                    description: 'Specific date, round, or identifier like "ultimo" (last) if a specific game is requested'
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
                    let formattedTopPlayers: Array<{name: string; points: number}> = []
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
                    let formattedTopPlayers: Array<{name: string; points: number}> = []
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
                const resolved = await resolvePlayerWithDisambiguation(rawName)
                if (resolved.ambiguousMatches && resolved.ambiguousMatches.length > 1) {
                    const optionsList = resolved.ambiguousMatches.map((m) => `${m.name} (${m.team})`).join(', ')
                    return {
                        result: `Se encontraron varios jugadores llamados "${rawName}": ${optionsList}. Pregunta al usuario cuál de ellos desea consultar indicando nombre completo y equipo.`,
                        genUiData: null
                    }
                }
                const player = resolved.player
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
                const rawTeamSearch = typeof args?.teamQuery === 'string' ? args.teamQuery.trim() : ''
                const rawMatchContext = typeof args?.matchContext === 'string' ? normaliseText(args.matchContext) : ''
                if (!rawP1 || !rawP2) {
                    return {result: 'Por favor, proporciona dos nombres de jugadores válidos para comparar.', genUiData: null}
                }

                try {
                    const [p1Res, p2Res, rawAllGames] = await Promise.all([
                        resolvePlayerWithDisambiguation(rawP1),
                        resolvePlayerWithDisambiguation(rawP2),
                        getGames()
                    ])

                    if (p1Res.ambiguousMatches && p1Res.ambiguousMatches.length > 1) {
                        const options = p1Res.ambiguousMatches.map((m) => `**${m.name}** (${m.team})`).join(', ')
                        return {
                            result: `Se encontraron múltiples coincidencias para "${rawP1}": ${options}. Pide al usuario que aclare con cuál de ellos (y de qué equipo) desea comparar.`,
                            genUiData: null
                        }
                    }

                    if (p2Res.ambiguousMatches && p2Res.ambiguousMatches.length > 1) {
                        const options = p2Res.ambiguousMatches.map((m) => `**${m.name}** (${m.team})`).join(', ')
                        return {
                            result: `Se encontraron múltiples coincidencias para "${rawP2}": ${options}. Pide al usuario que aclare con cuál de ellos (y de qué equipo) desea comparar.`,
                            genUiData: null
                        }
                    }

                    const p1Summary = p1Res.player
                    const p2Summary = p2Res.player

                    const p1Exists = Boolean(p1Summary && (p1Summary.average_points !== undefined || p1Summary.player_name !== undefined))
                    const p2Exists = Boolean(p2Summary && (p2Summary.average_points !== undefined || p2Summary.player_name !== undefined))

                    if (!p1Exists || !p2Exists) {
                        const missingName = !p1Exists ? rawP1 : rawP2
                        return {
                            result: `No se encontró el jugador "${missingName}" en la base de datos. Informa al usuario que verifique el nombre o apellido antes de generar la comparación.`,
                            genUiData: null
                        }
                    }

                    const resolvedP1Name = p1Summary?.player_name || rawP1
                    const resolvedP2Name = p2Summary?.player_name || rawP2
                    const resolvedP1Team = p1Summary?.team_name || 'Sin equipo'
                    const resolvedP2Team = p2Summary?.team_name || 'Sin equipo'

                    const allGames = (Array.isArray(rawAllGames) ? rawAllGames : []) as TeamGame[]
                    const normTeam1 = normaliseText(resolvedP1Team)
                    const normTeam2 = normaliseText(resolvedP2Team)

                    const sharedTeamGames = allGames
                        .filter((g) => {
                            if (!normTeam1 || !normTeam2 || normTeam1 === 'sin equipo' || normTeam2 === 'sin equipo') {
                                return false
                            }
                            const home = normaliseText(g.home_team_name || g.home_team || '')
                            const away = normaliseText(g.away_team_name || g.away_team || '')
                            const p1InGame = home.includes(normTeam1) || away.includes(normTeam1)
                            const p2InGame = home.includes(normTeam2) || away.includes(normTeam2)
                            return p1InGame && p2InGame
                        })
                        .sort((a, b) => {
                            const timeDiff = parseGameTimestamp(getRawDate(b)) - parseGameTimestamp(getRawDate(a))
                            return timeDiff !== 0 ? timeDiff : String(b.id).localeCompare(String(a.id))
                        })

                    const availableGames: CompareGameOption[] = sharedTeamGames.map((g) => {
                        const homeName = g.home_team_name || g.home_team || 'Local'
                        const awayName = g.away_team_name || g.away_team || 'Visitante'
                        const formattedDate = formatDateToDDMMYYYY(String(getRawDate(g) || ''))
                        return {
                            id: String(g.id),
                            date: formattedDate,
                            label: `${formattedDate ? `${formattedDate} · ` : ''}${homeName} vs ${awayName}`
                        }
                    })

                    let preselectedGameId: string | undefined
                    let singleMatchP1: GamePlayerStat | undefined
                    let singleMatchP2: GamePlayerStat | undefined

                    const requestedSpecificMatch = Boolean(rawTeamSearch || rawMatchContext)
                    if (requestedSpecificMatch && sharedTeamGames.length > 0) {
                        const isOldest =
                            rawMatchContext.includes('primero') ||
                            rawMatchContext.includes('primer') ||
                            rawMatchContext.includes('oldest') ||
                            rawMatchContext.includes('first')

                        const chosenGame = isOldest
                            ? sharedTeamGames[sharedTeamGames.length - 1]
                            : sharedTeamGames[0]

                        preselectedGameId = String(chosenGame.id)

                        try {
                            const gamePlayers = (await getPlayerStatsByGameId(chosenGame.id)) as GamePlayerStat[]
                            const validPlayers = Array.isArray(gamePlayers) ? gamePlayers : []
                            const p1Tokens = normaliseText(resolvedP1Name).split(' ').filter((t) => t.length > 1)
                            const p2Tokens = normaliseText(resolvedP2Name).split(' ').filter((t) => t.length > 1)

                            singleMatchP1 = validPlayers.find((p) => {
                                const pName = normaliseText(p.player_name || p.name || '')
                                return p1Tokens.some((token) => pName.includes(token))
                            })
                            singleMatchP2 = validPlayers.find((p) => {
                                const pName = normaliseText(p.player_name || p.name || '')
                                return p2Tokens.some((token) => pName.includes(token))
                            })
                        } catch {
                            preselectedGameId = undefined
                        }
                    }

                    const useSingleMatchStats = Boolean(preselectedGameId && (singleMatchP1 || singleMatchP2))

                    const finalP1Points = useSingleMatchStats
                        ? Number(singleMatchP1?.points ?? singleMatchP1?.pts ?? 0)
                        : (p1Summary?.average_points ?? 0)
                    const finalP1Rebounds = useSingleMatchStats
                        ? Number(singleMatchP1?.rebounds ?? singleMatchP1?.reb ?? 0)
                        : (p1Summary?.average_rebounds ?? 0)
                    const finalP1Assists = useSingleMatchStats
                        ? Number(singleMatchP1?.assists ?? singleMatchP1?.ast ?? 0)
                        : (p1Summary?.average_assists ?? 0)
                    const finalP1Steals = useSingleMatchStats
                        ? Number(singleMatchP1?.steals ?? singleMatchP1?.stl ?? 0)
                        : (p1Summary?.average_steals ?? 0)

                    const finalP2Points = useSingleMatchStats
                        ? Number(singleMatchP2?.points ?? singleMatchP2?.pts ?? 0)
                        : (p2Summary?.average_points ?? 0)
                    const finalP2Rebounds = useSingleMatchStats
                        ? Number(singleMatchP2?.rebounds ?? singleMatchP2?.reb ?? 0)
                        : (p2Summary?.average_rebounds ?? 0)
                    const finalP2Assists = useSingleMatchStats
                        ? Number(singleMatchP2?.assists ?? singleMatchP2?.ast ?? 0)
                        : (p2Summary?.average_assists ?? 0)
                    const finalP2Steals = useSingleMatchStats
                        ? Number(singleMatchP2?.steals ?? singleMatchP2?.stl ?? 0)
                        : (p2Summary?.average_steals ?? 0)

                    const sharedNote = availableGames.length > 0
                        ? ` They also have ${availableGames.length} shared game(s) available to inspect in the card selector.`
                        : ''

                    const statusMessage = `Comparison stats (${useSingleMatchStats ? 'single match' : 'season average'}): ${resolvedP1Name} (${resolvedP1Team}) — ${finalP1Points} PTS, ${finalP1Rebounds} REB, ${finalP1Assists} AST, ${finalP1Steals} STL vs ${resolvedP2Name} (${resolvedP2Team}) — ${finalP2Points} PTS, ${finalP2Rebounds} REB, ${finalP2Assists} AST, ${finalP2Steals} STL.${sharedNote}`

                    const comparisonData = {
                        type: 'compare-card' as const,
                        data: {
                            player1: {
                                id: useSingleMatchStats && singleMatchP1?.id ? String(singleMatchP1.id) : undefined,
                                name: resolvedP1Name,
                                team: resolvedP1Team,
                                points: finalP1Points,
                                rebounds: finalP1Rebounds,
                                assists: finalP1Assists,
                                steals: finalP1Steals,
                                photoUrl: p1Summary?.photo_url || '',
                                teamBadgeUrl: p1Summary?.team_badge_url || ''
                            },
                            player2: {
                                id: useSingleMatchStats && singleMatchP2?.id ? String(singleMatchP2.id) : undefined,
                                name: resolvedP2Name,
                                team: resolvedP2Team,
                                points: finalP2Points,
                                rebounds: finalP2Rebounds,
                                assists: finalP2Assists,
                                steals: finalP2Steals,
                                photoUrl: p2Summary?.photo_url || '',
                                teamBadgeUrl: p2Summary?.team_badge_url || ''
                            },
                            comparisonId: `comp-${Date.now()}`,
                            gameId: useSingleMatchStats ? preselectedGameId : undefined,
                            availableGames
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