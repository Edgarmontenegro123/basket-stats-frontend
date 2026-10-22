export interface Season {
    id: string
    name: string
    team_id: string
    year?: number
    start_date?: string
    end_date?: string
    is_active?: boolean
}