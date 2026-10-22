import {getGames, getTeams, getTopScorers} from './api'

export const aiFunctionDeclarations = [
    {
        name: 'getGames',
        description: 'Retrieves the complete list of basketball games, including status, scores, home and away teams, and dates.'
    },
    {
        name: 'getTeams',
        description: 'Retrieves the list of all registered basketball teams in the management system.'
    },
    {
        name: 'getTopScorers',
        description: 'Retrieves the top basketball scorers or player rankings based on points, rebounds, or assists.'
    }
]

export const executeAITool = async(functionName: string, args?: Record<string, unknown>) => {
    try {
        switch (functionName) {
            case 'getGames':
                return await getGames()
            case 'getTeams':
                return await getTeams()
            case 'getTopScorers': {
                const limit = typeof args?.limit === 'number' ? args.limit : 5
                return await getTopScorers(limit)
            }
            default:
                return {error: `Function ${functionName} not found`}
        }
    } catch (error) {
        console.error(`Error executing tool ${functionName}:`, error)
        return {error: 'Failed to fetch data from backend services'}
    }
}