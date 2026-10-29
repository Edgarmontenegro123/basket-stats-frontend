export type GenUiComponentType = 'player-card' | 'stat-table' | 'team-card'

export interface PlayerCardData {
    name: string
    team?: string
    points: number
    rebounds: number
    assists: number
    steals: number
    matchesPlayed?: number
}

export interface StatTableItem {
    label: string
    value: number | string
    secondaryValue?: string
}

export interface StatTableData {
    title: string
    items: StatTableItem[]
}

export interface GenUiPayload {
    type: GenUiComponentType
    data: PlayerCardData | StatTableData | unknown
}

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