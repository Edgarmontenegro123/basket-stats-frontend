export interface TeamStat {
    id: string
    game_id: string
    team_name: string
    points: number
    rebounds: number
    assists: number
    turnovers: number
    steals: number
    blocks: number
}

export interface TeamAnalyticsSummary  {
    gamesWithStats: number
    averagePoints: number
    averageRebounds: number
    averageAssists: number
    averageSteals: number
    averageBlocks: number
    averageTurnovers: number
}