import {getGames, getTeams, getTopScorers, getPlayerRankings, getPlayerSummaryByName, getPlayerStatsByGameId} from './api'
import type {Team} from '../types/team'
import type {TeamGame, TopScorer, GamePlayerStat} from '../types/ai'
import type {PlayerSummary} from '../types/ai'

const normalizeText = (text: unknown) =>
    typeof text === 'string' ? text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() : ''

export const aiFunctionDeclarations = [
    {
        name: 'getMatchSummary',
        description: 'Retrieves complete match data including recent games, team information, and top scorers in a single request.'
    },
    {
        name: 'getGames',
        description: 'Retrieves the list of basketball games with scores, status, and teams.'
    },
    {
        name: 'getTeams',
        description: 'Retrieves the list of registered basketball teams.'
    },
    {
        name: 'getTeamStats',
        description: 'Retrieves team info, recent games, or roster stats for a specific TEAM (e.g. Almendra, Capitan el Espacio). Use this when the user asks about a TEAM summary or team stats.',
        parameters: {
            type: 'OBJECT',
            properties: {
                teamName: {
                    type: 'STRING',
                    description: 'The name or short name of the team'
                }
            },
            required: ['teamName']
        }
    },
    {
        name: 'getTopScorers',
        description: 'Retrieves top player stats rankings. Category can be strictly: points, rebounds, assists, or steals. Always use this when asked for leaders in points, steals, or rebounds.',
        parameters: {
            type: 'OBJECT',
            properties: {
                limit: {
                    type: 'NUMBER',
                    description: 'Number of players to return (default 5)'
                },
                category: {
                    type: 'STRING',
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
            type: 'OBJECT',
            properties: {
                playerName: {
                    type: 'STRING',
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
            type: 'OBJECT',
            properties: {
                player1Name: {
                    type: 'STRING',
                    description: 'The full name of the first player'
                },
                player2Name: {
                    type: 'STRING',
                    description: 'The full name of the second player'
                },
                teamQuery: {
                    type: 'STRING',
                    description: 'The exact matchup or team name mentioned by the user (e.g. almendra vs pegasos)'
                },
                matchContext: {
                    type: 'STRING',
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

                const latestGame = games && games.length > 0 ? games[0] : null
                let matchCardData = null

                if (latestGame) {
                    let formattedTopPlayers: Array<{ name: string; points: number }> = []
                    try {
                        const gamePlayers = (await getPlayerStatsByGameId(latestGame.id)) as GamePlayerStat[]
                        formattedTopPlayers = (Array.isArray(gamePlayers) ? gamePlayers : []).slice(0, 5).map((p) => ({
                            name: p.player_name || p.name || 'Jugador',
                            points: p.points ?? p.pts ?? 0
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
                            date: latestGame.date,
                            topPlayers: formattedTopPlayers
                        }
                    }
                }

                return {
                    result: 'Match summary retrieved successfully',
                    games,
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
                const searchName = normalizeText(rawSearch)

                const [games, teams, scorers] = await Promise.all([
                    await getGames() as unknown as TeamGame[],
                    await getTeams() as unknown as Team[],
                    await getTopScorers(20) as unknown as TopScorer[]
                ])

                const matchingTeam = teams.find((t) => {
                    const normName = normalizeText(t.name)
                    const normShort = normalizeText(t.short_name || '')
                    return normName.includes(searchName) || normShort.includes(searchName) || searchName.includes(normName)
                })

                if (!matchingTeam) {
                    return {team: null, message: 'Team not found', availableTeams: teams.map((t) => t.name)}
                }

                const teamGames = games.filter((g) =>
                    g.home_team_id === matchingTeam.id ||
                    g.away_team_id === matchingTeam.id ||
                    (g.home_team && normalizeText(g.home_team).includes(searchName)) ||
                    (g.away_team && normalizeText(g.away_team).includes(searchName))
                )

                const latestTeamGame = teamGames && teamGames.length > 0 ? teamGames[0] : null
                let matchCardData = null

                if (latestTeamGame) {
                    let formattedTopPlayers: Array<{ name: string; points: number }> = []
                    try {
                        const gamePlayers = (await getPlayerStatsByGameId(latestTeamGame.id)) as GamePlayerStat[]

                        const filteredGamePlayers = Array.isArray(gamePlayers) ? gamePlayers.filter((p) => {
                            const pTeam = normalizeText(p.team_name || p.team || '')
                            return pTeam.includes(searchName) || searchName.includes(pTeam)
                        }) : []

                        const pool = filteredGamePlayers.length > 0 ? filteredGamePlayers : (Array.isArray(gamePlayers) ? gamePlayers : [])

                        formattedTopPlayers = pool.slice(0, 5).map((p) => ({
                            name: p.player_name || p.name || 'Jugador',
                            points: p.points ?? p.pts ?? 0
                        }))
                    } catch {
                        formattedTopPlayers = (scorers || []).slice(0, 5).map((s) => ({
                            name: s.player_name || s.name || 'Jugador',
                            points: s.average_points ?? s.total_points ?? s.points ?? 0
                        }))
                    }

                    matchCardData = {
                        type: 'match-card' as const,
                        data: {
                            gameId: latestTeamGame.id,
                            homeTeam: latestTeamGame.home_team_name || latestTeamGame.home_team || 'Local',
                            awayTeam: latestTeamGame.away_team_name || latestTeamGame.away_team || 'Visitante',
                            homeScore: latestTeamGame.home_score ?? 0,
                            awayScore: latestTeamGame.away_score ?? 0,
                            date: latestTeamGame.date,
                            topPlayers: formattedTopPlayers
                        }
                    }
                }

                return {
                    team: {
                        name: matchingTeam.name,
                        shortName: matchingTeam.short_name
                    },
                    gamesCount: teamGames.length,
                    games: teamGames,
                    topPlayers: scorers,
                    genUiData: matchCardData
                }
            }
            case 'getTopScorers': {
                const limit = typeof args?.limit === 'number' ? args.limit : 5
                const rawCat = typeof args?.category === 'string' ? normalizeText(args.category) : 'points'

                let category = 'points'
                if (rawCat.includes('robo') || rawCat.includes('steal')) category = 'steals'
                else if (rawCat.includes('rebot') || rawCat.includes('rebound')) category = 'rebounds'
                else if (rawCat.includes('asist') || rawCat.includes('assist')) category = 'assists'

                return await getPlayerRankings(category, limit)
            }
            case 'getPlayerSummary': {
                const rawName = typeof args?.playerName === 'string' ? args.playerName : ''
                const player = (await getPlayerSummaryByName(rawName.trim())) as PlayerSummary | null

                if (!player || player.error || !player.player_name) {
                    return {result: 'Player not found', genUiData: null}
                }

                const name = player.player_name
                const team = player.team_name || ''
                const points = player.average_points ?? player.total_points ?? 0
                const rebounds = player.average_rebounds ?? player.total_rebounds ?? 0
                const assists = player.average_assists ?? player.total_assists ?? 0
                const steals = player.average_steals ?? player.total_steals ?? 0

                return {
                    result: `Player found: ${name}. Team: ${team}. Points: ${points}, Rebounds: ${rebounds}, Assists: ${assists}, Steals: ${steals}`,
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
                const rawMatchContext = typeof args?.matchContext === 'string' ? normalizeText(args.matchContext) : ''

                if (!rawP1 || !rawP2) {
                    return {result: 'Por favor, proporciona dos nombres de jugadores válidos para comparar.', genUiData: null}
                }

                try {
                    const games = (await getGames()) as TeamGame[]
                    let targetGames: TeamGame[] = games

                    // Si hay una consulta de equipo/enfrentamiento, filtramos estrictamente esos partidos
                    if (rawTeamSearch) {
                        const searchLower = normalizeText(rawTeamSearch)
                        const queryTokens = searchLower.split(/\s+vs\s+|\s+v\s+|\s+contra\s+|\s+y\s+/)

                        targetGames = games.filter(g => {
                            const home = normalizeText(g.home_team_name || g.home_team || '')
                            const away = normalizeText(g.away_team_name || g.away_team || '')
                            return queryTokens.some(token => {
                                const t = token.trim()
                                return t.length > 2 && (home.includes(t) || away.includes(t))
                            })
                        })
                    }

                    // Ordenar cronológicamente los partidos por fecha
                    if (targetGames.length > 0) {
                        targetGames.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
                    }

                    // Manejo del contexto temporal (último, primero, etc.)
                    if (targetGames.length > 1) {
                        if (rawMatchContext.includes('ultimo') || rawMatchContext.includes('recent') || rawMatchContext.includes('reciente')) {
                            // Nos quedamos solo con el más reciente (el último del array ordenado ascendentemente es el final)
                            targetGames = [targetGames[targetGames.length - 1]]
                        } else if (rawMatchContext.includes('primero') || rawMatchContext.includes('primer') || rawMatchContext.includes('oldest')) {
                            // Nos quedamos solo con el primero registrado
                            targetGames = [targetGames[0]]
                        } else if (rawMatchContext) {
                            const matchFiltered = targetGames.filter(g => {
                                const gDate = normalizeText(g.date || '')
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

                    const p1Tokens = normalizeText(rawP1).split(' ').filter(t => t.length > 1)
                    const p2Tokens = normalizeText(rawP2).split(' ').filter(t => t.length > 1)

                    for (const game of targetGames) {
                        try {
                            const gamePlayers = (await getPlayerStatsByGameId(game.id)) as GamePlayerStat[]
                            if (!Array.isArray(gamePlayers)) continue

                            const foundP1 = gamePlayers.find(p => {
                                const pName = normalizeText(p.player_name || p.name || '')
                                return p1Tokens.some(token => pName.includes(token))
                            })

                            const foundP2 = gamePlayers.find(p => {
                                const pName = normalizeText(p.player_name || p.name || '')
                                return p2Tokens.some(token => pName.includes(token))
                            })

                            // Para evitar mezclar partidos donde uno jugó y el otro no dentro del mismo filtro de enfrentamiento:
                            // Solo sumamos si ambos participaron, o acumulamos sus presencias de forma independiente en los partidos filtrados.
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
                        await getPlayerSummaryByName(rawP1.trim()) as PlayerSummary,
                        await getPlayerSummaryByName(rawP2.trim()) as PlayerSummary
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

                    let statusMessage = 'Comparación generada correctamente.'
                    if (!p1Exists) statusMessage = `Aviso: No se encontró al jugador "${rawP1}", por lo que sus datos no están disponibles.`
                    if (!p2Exists) statusMessage = `Aviso: No se encontró al jugador "${rawP2}", por lo que sus datos no están disponibles.`

                    const comparisonData = {
                        type: 'compare-card' as const,
                        data: {
                            player1: {
                                name: p1Exists ? (p1MatchesCount > 0 ? p1ActualName : (p1Fallback?.player_name || rawP1)) : `${rawP1} (No encontrado)`,
                                team: p1Team || p1Fallback?.team_name || 'Sin equipo',
                                points: p1Exists ? finalP1Points : 0,
                                rebounds: p1Exists ? finalP1Rebounds : 0,
                                assists: p1Exists ? finalP1Assists : 0,
                                steals: p1Exists ? finalP1Steals : 0,
                                photoUrl: p1Fallback?.photo_url || '',
                                teamBadgeUrl: p1Fallback?.team_badge_url || ''
                            },
                            player2: {
                                name: p2Exists ? (p2MatchesCount > 0 ? p2ActualName : (p2Fallback?.player_name || rawP2)) : `${rawP2} (No encontrado)`,
                                team: p2Team || p2Fallback?.team_name || 'Sin equipo',
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