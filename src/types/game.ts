export interface Game {
    id: string
    season_id: string
    home_team_id: string
    away_team_id: string
    home_team_name: string
    away_team_name: string
    status: string
    game_date: string
    location: string | null
    video_url: string | null
    is_friendly: boolean
    home_score: number | null
    away_score: number | null
}