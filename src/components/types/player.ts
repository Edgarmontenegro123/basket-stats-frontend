export interface PlayerStats {
    id: string
    game_id: string
    team_name: string
    player_number: string
    player_name: string
    points: number
    rebounds: number
    assists: number
    minutes: string
    turnovers: number
    steals: number
    blocks: number
    created_at: string
    updated_at: string
}

export interface AggregatedPlayerRanking {
    player_name: string
    team_name: string
    games_played: number
    total: number
    average: number
}

export interface Player {
    id: string
    team_id: string
    first_name: string
    last_name: string
    number: number
    position?: string | null
    height_cm?: number | null
    weight_kg?: number | null
    birth_date?: string | null
    photo_url?: string | null
    created_at?: string
    updated_at?: string
}

export interface PlayerSummary {
    player_name: string
    team_name: string
    games_played: string
    total_points: string
    total_rebounds: string
    total_assists: string
    total_turnovers: string
    total_steals: string
    total_blocks: string
    average_points: string
    average_rebounds: string
    average_assists: string
    average_turnovers: string
    average_steals: string
    average_blocks: string
}

export type CreatePlayerPayload = Omit<
    Player,
    'id' | 'created_at' | 'updated_at'
>