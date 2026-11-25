export interface ComparePlayerStats {
    id?: string
    name: string
    team: string
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