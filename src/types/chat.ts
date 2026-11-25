import type {CompareCardData} from './compare'

export interface MatchTopPlayer {
    name: string
    points: number
}

export interface MatchCardData {
    gameId?: string
    homeTeam: string
    awayTeam: string
    homeScore: number
    awayScore: number
    homeBadgeUrl?: string
    awayBadgeUrl?: string
    status?: string
    date?: string
    topPlayers?: MatchTopPlayer[]
}

export interface MatchCardProps {
    data: MatchCardData
    onNavigateToAnalytics?: (gameId: string) => void
}

export interface PlayerCardData {
    id?: string
    name: string
    team?: string
    number?: number
    photoUrl?: string
    teamBadgeUrl?: string
    points: number
    rebounds: number
    assists: number
    steals: number
    matchesPlayed?: number
}

export interface PlayerCardProps {
    data: PlayerCardData
    onNavigateToPlayer?: (playerId: string) => void
}

export type GenUiPayload =
    | {type: 'player-card'; data: PlayerCardData}
    | {type: 'match-card'; data: MatchCardData}
    | {type: 'compare-card'; data: CompareCardData}

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