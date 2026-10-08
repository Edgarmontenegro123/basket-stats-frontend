import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { AnalyticsFilters } from '../types/filter'

export const useAnalyticsFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    // 1. Lectura optimizada del estado actual desde la URL Query Params
    const filters = useMemo<AnalyticsFilters>(() => {
        const seasonId = searchParams.get('seasonId') || undefined
        const teamId = searchParams.get('teamId') || undefined
        const gameId = searchParams.get('gameId') || undefined
        const playerIdsRaw = searchParams.get('playerIds')
        const playerIds = playerIdsRaw ? playerIdsRaw.split(',').filter(Boolean) : undefined

        const startDate = searchParams.get('startDate') || undefined
        const endDate = searchParams.get('endDate') || undefined
        const dateRange = (startDate || endDate) ? { startDate, endDate } : undefined

        return {
            seasonId,
            teamId,
            gameId,
            playerIds,
            dateRange,
        }
    }, [searchParams])

    // 2. Actualizador de filtros individuales o parciales
    const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
        setSearchParams((prevParams) => {
            const updated = new URLSearchParams(prevParams)

            // Temporada
            if (newFilters.seasonId !== undefined) {
                if (newFilters.seasonId) updated.set('seasonId', newFilters.seasonId)
                else updated.delete('seasonId')
            }

            // Equipo
            if (newFilters.teamId !== undefined) {
                if (newFilters.teamId) updated.set('teamId', newFilters.teamId)
                else updated.delete('teamId')
            }

            // Partido
            if (newFilters.gameId !== undefined) {
                if (newFilters.gameId) updated.set('gameId', newFilters.gameId)
                else updated.delete('gameId')
            }

            // Jugadores
            if (newFilters.playerIds !== undefined) {
                if (newFilters.playerIds && newFilters.playerIds.length > 0) {
                    updated.set('playerIds', newFilters.playerIds.join(','))
                } else {
                    updated.delete('playerIds')
                }
            }

            // Rango de fechas
            if (newFilters.dateRange !== undefined) {
                if (newFilters.dateRange.startDate) updated.set('startDate', newFilters.dateRange.startDate)
                else updated.delete('startDate')

                if (newFilters.dateRange.endDate) updated.set('endDate', newFilters.dateRange.endDate)
                else updated.delete('endDate')
            }

            return updated
        })
    }, [setSearchParams])

    // 3. Reset total de filtros
    const resetFilters = useCallback(() => {
        setSearchParams(new URLSearchParams())
    }, [setSearchParams])

    return {
        filters,
        updateFilters,
        resetFilters,
    }
}