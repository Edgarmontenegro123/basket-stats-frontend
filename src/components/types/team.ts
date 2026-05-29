export interface Team {
    id: string
    name: string
    short_name?: string
    logo_url?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    created_at?: string
    updated_at?: string
}

export interface CreateTeamPayload {
    name: string
    logo_url?: string
}