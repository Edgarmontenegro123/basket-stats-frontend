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

export interface PlayerSummary {
    player_name?: string
    team_name?: string
    photo_url?: string
    team_badge_url?: string
    average_points?: number
    average_rebounds?: number
    average_assists?: number
    average_steals?: number
    total_points?: number
    total_rebounds?: number
    total_assists?: number
    total_steals?: number
    error?: string
}