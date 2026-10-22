import {getTeamStatsByGameId} from './api.ts'
import type {Game} from '../types/game.ts'
import type {TeamStat, TeamAnalyticsSummary} from '../types/analytics.ts'

const buildTeamAnalyticsSummary = async (
    teamName: string,
    games: Game[],
): Promise<TeamAnalyticsSummary | null> => {
    const completedGames = games.filter(
        (game) => game.status === 'completed',
    )

    if (completedGames.length === 0) {
        return null
    }

    const results = await Promise.allSettled(
        completedGames.map((game) => getTeamStatsByGameId(game.id)),
    )

    const teamStats = results.flatMap((result) => {
        if (result.status !== 'fulfilled') {
            return []
        }

        const stats = result.value as TeamStat[]

        return stats.filter(
            (stat) =>
                stat.team_name.toLowerCase() === teamName.toLowerCase(),
        )
    })

    if (teamStats.length === 0) {
        return null
    }

    const totals = teamStats.reduce(
        (acc, stat) => ({
            points: acc.points + stat.points,
            rebounds: acc.rebounds + stat.rebounds,
            assists: acc.assists + stat.assists,
            steals: acc.steals + stat.steals,
            blocks: acc.blocks + stat.blocks,
            turnovers: acc.turnovers + stat.turnovers,
        }),
        {
            points: 0,
            rebounds: 0,
            assists: 0,
            steals: 0,
            blocks: 0,
            turnovers: 0,
        },
    )

    return {
        gamesWithStats: teamStats.length,
        averagePoints: Math.round(totals.points / teamStats.length),
        averageRebounds: Math.round(totals.rebounds / teamStats.length),
        averageAssists: Math.round(totals.assists / teamStats.length),
        averageSteals: Math.round(totals.steals / teamStats.length),
        averageBlocks: Math.round(totals.blocks / teamStats.length),
        averageTurnovers: Math.round(totals.turnovers / teamStats.length),
    }
}

export default buildTeamAnalyticsSummary