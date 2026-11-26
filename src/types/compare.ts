export interface ComparePlayerStats {
    id?: string
    name: string
    team: string
    number?: number
    points: number
    rebounds?: number
    assists?: number
    steals?: number
    photoUrl?: string
    teamBadgeUrl?: string
}

export interface CompareGameOption {
    id: string
    label: string
    date: string
}

export interface CompareCardData {
    player1: ComparePlayerStats
    player2: ComparePlayerStats
    comparisonId?: string
    gameId?: string
    availableGames?: CompareGameOption[]
}

export interface CompareCardProps {
    data: CompareCardData
    onNavigateToAnalytics?: (gameId?: string, playerIds?: string[]) => void
}

export interface ActiveComparisonStats {
    p1Id?: string
    p2Id?: string
    p1DidNotPlay?: boolean
    p2DidNotPlay?: boolean
    p1Points: number
    p1Rebounds: number
    p1Assists: number
    p1Steals: number
    p2Points: number
    p2Rebounds: number
    p2Assists: number
    p2Steals: number
}