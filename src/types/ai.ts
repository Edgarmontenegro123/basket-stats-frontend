export interface TeamGame {
    id: string
    home_team_id?: string
    away_team_id?: string
    home_team?: string
    away_team?: string
    home_team_name?: string
    away_team_name?: string
    home_score?: number
    away_score?: number
    date?: string
}

export interface TopScorer {
    player_name?: string
    name?: string
    team_name?: string
    team?: string
    average_points?: number
    total_points?: number
    points?: number
}

export interface GamePlayerStat {
    player_name?: string
    name?: string
    team_name?: string
    team?: string
    points?: number
    pts?: number
    rebounds?: number
    reb?: number
    assists?: number
    ast?: number
    steals?: number
    stl?: number
}