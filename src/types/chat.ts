import type {CompareCardData} from './compare'

export interface MatchCardData {
    homeTeam: string
    awayTeam: string
    homeScore: number
    awayScore: number
    status?: string
    date?: string
}

export interface PlayerCardData {
    name: string
    team?: string
    points: number
    rebounds: number
    assists: number
    steals: number
    matchesPlayed?: number
}

export type GenUiPayload =
    | { type: 'player-card'; data: PlayerCardData & { teamBadgeUrl?: string; photoUrl?: string } }
    | { type: 'match-card'; data: MatchCardData & { gameId?: string; topPlayers?: Array<{ name: string; points: number }> } }
    | { type: 'compare-card'; data: CompareCardData }

export interface ChatMessage {
    id: string
    sender: 'user' | 'bot'
    text: string
    timestamp: Date
    genUiData?: GenUiPayload
}

export interface AIGatewayResponse {
    text: string
    genUiData?: GenUiPayload
}

export interface AIFunctionDeclaration {
    name: string
    description: string
    parameters?: Record<string, unknown>
}