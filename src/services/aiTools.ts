import {getGames, getTeams, getTopScorers, getPlayerRankings, getPlayerSummaryByName} from './api'

const normalizeText = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

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
                return {games, teams, topScorers: scorers}
            }
            case 'getGames':
                return await getGames()
            case 'getTeams':
                return await getTeams()
            case 'getTeamStats': {
                const rawSearch = typeof args?.teamName === 'string' ? args.teamName : ''
                const searchName = normalizeText(rawSearch)

                const [games, teams, scorers] = await Promise.all([
                    getGames(),
                    getTeams(),
                    getTopScorers(20)
                ])

                const matchingTeam = teams.find((t: {name: string, short_name?: string}) => {
                    const normName = normalizeText(t.name)
                    const normShort = normalizeText(t.short_name || '')
                    return normName.includes(searchName) || normShort.includes(searchName) || searchName.includes(normName)
                })

                if (!matchingTeam) {
                    return {team: null, message: 'Team not found', availableTeams: teams.map((t: {name: string}) => t.name)}
                }

                const teamGames = games.filter((g: {home_team?: string, away_team?: string, home_team_id?: string, away_team_id?: string}) =>
                    g.home_team_id === matchingTeam.id ||
                    g.away_team_id === matchingTeam.id ||
                    (g.home_team && normalizeText(g.home_team).includes(searchName)) ||
                    (g.away_team && normalizeText(g.away_team).includes(searchName))
                )

                return {
                    team: {
                        name: matchingTeam.name,
                        shortName: matchingTeam.short_name
                    },
                    gamesCount: teamGames.length,
                    games: teamGames,
                    topPlayers: scorers
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
                return await getPlayerSummaryByName(rawName.trim())
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