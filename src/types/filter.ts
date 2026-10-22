export interface DateRangeFilter {
    startDate?: string
    endDate?: string
}

export interface AnalyticsFilters {
    seasonId?: string
    teamId?: string
    gameId?: string
    playerIds?: string[]
    dateRange?: DateRangeFilter
}