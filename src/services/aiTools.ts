import {getGames, getTeams, getTopScorers} from './api'

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
        name: 'getTopScorers',
        description: 'Retrieves top player stats rankings for points, rebounds, or assists.'
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
            case 'getTopScorers': {
                const limit = typeof args?.limit === 'number' ? args.limit : 5
                return await getTopScorers(limit)
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