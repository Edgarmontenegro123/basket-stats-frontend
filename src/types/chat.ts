export interface ChatMessage {
    id: string
    sender: 'user' | 'bot'
    text: string
    timestamp: Date
    genUiData?: unknown
}

export interface AIGatewayResponse {
    text: string
    genUiData?: unknown
}

export interface AIFunctionDeclaration {
    name: string
    description: string
    parameters?: Record<string, unknown>
}