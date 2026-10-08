import React, {useEffect, useState, useTransition} from 'react'
import type {AnalyticsFilters} from '../types/filter'
import type {Season} from '../types/season'
import type {Team} from '../types/team'
import type {Game} from '../types/game'
import type {Player} from '../types/player'
import {getSeasons, getTeams, getGames, getPlayersByTeam} from '../services/api'
import './AnalyticsFilterBar.css'

interface AnalyticsFilterBarProps {
    filters: AnalyticsFilters
    onFilterChange: (newFilters: Partial<AnalyticsFilters>) => void
    onResetFilters: () => void
}

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
                                                                          filters,
                                                                          onFilterChange,
                                                                          onResetFilters,
                                                                      }) => {
    const [, startTransition] = useTransition()

    const [seasons, setSeasons] = useState<Season[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [games, setGames] = useState<Game[]>([])
    const [players, setPlayers] = useState<Player[]>([])
    const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true)

    // Cargar Catálogos Iniciales (Seasons, Teams, Games)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [seasonsData, teamsData, gamesData] = await Promise.all([
                    getSeasons().catch(() => []),
                    getTeams().catch(() => []),
                    getGames().catch(() => []),
                ])
                setSeasons(seasonsData)
                setTeams(teamsData)
                setGames(gamesData)
            } catch (err) {
                console.error('Failed to load filter catalogs', err)
            } finally {
                setIsLoadingCatalogs(false)
            }
        }

        void loadInitialData()
    }, [])

    // Cargar Jugadores cuando se selecciona un Equipo (compatible con React 19)
    useEffect(() => {
        let isMounted = true

        const loadTeamPlayers = async () => {
            if (!filters.teamId) {
                return
            }

            try {
                const teamPlayers = await getPlayersByTeam(filters.teamId)
                if (isMounted) {
                    setPlayers(teamPlayers)
                }
            } catch (err) {
                console.error('Failed to load team players', err)
                if (isMounted) {
                    setPlayers([])
                }
            }
        }

        void loadTeamPlayers()

        return () => {
            isMounted = false
        }
    }, [filters.teamId])

    // Jugadores a mostrar: si no hay teamId seleccionado, lista vacía
    const displayedPlayers = filters.teamId ? players : []

    // Filtrado derivado de partidos según la temporada seleccionada
    const availableGames = filters.seasonId
        ? games.filter((g) => g.season_id === filters.seasonId)
        : games

    const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const seasonId = e.target.value || undefined
        startTransition(() => {
            onFilterChange({
                seasonId,
                gameId: undefined, // Reset de partido al cambiar de temporada
            })
        })
    }

    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const teamId = e.target.value || undefined
        startTransition(() => {
            onFilterChange({
                teamId,
                playerIds: undefined, // Reset de jugadores al cambiar de equipo
            })
        })
    }

    const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const gameId = e.target.value || undefined
        startTransition(() => {
            onFilterChange({gameId})
        })
    }

    const handleDateChange = (type: 'startDate' | 'endDate', value: string) => {
        const currentRange = filters.dateRange || {}
        startTransition(() => {
            onFilterChange({
                dateRange: {
                    ...currentRange,
                    [type]: value || undefined,
                },
            })
        })
    }

    const hasActiveFilters = Boolean(
        filters.seasonId ||
        filters.teamId ||
        filters.gameId ||
        (filters.playerIds && filters.playerIds.length > 0) ||
        filters.dateRange?.startDate ||
        filters.dateRange?.endDate
    )

    return (
        <div className='analytics-filter-bar'>
            <div className='filter-bar-header'>
                <h3 className='filter-bar-title'>Filter Analytics</h3>
                {hasActiveFilters && (
                    <button
                        type='button'
                        className='reset-filters-btn'
                        onClick={onResetFilters}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className='filter-grid'>
                {/* Selector de Temporada */}
                <div className='filter-group'>
                    <label htmlFor='season-filter'>Season / Tournament</label>
                    <select
                        id='season-filter'
                        className='filter-select'
                        value={filters.seasonId || ''}
                        onChange={handleSeasonChange}
                        disabled={isLoadingCatalogs}
                    >
                        <option value=''>All Seasons</option>
                        {seasons.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selector de Equipo */}
                <div className='filter-group'>
                    <label htmlFor='team-filter'>Team</label>
                    <select
                        id='team-filter'
                        className='filter-select'
                        value={filters.teamId || ''}
                        onChange={handleTeamChange}
                        disabled={isLoadingCatalogs}
                    >
                        <option value=''>All Teams</option>
                        {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selector de Partido */}
                <div className='filter-group'>
                    <label htmlFor='game-filter'>Game</label>
                    <select
                        id='game-filter'
                        className='filter-select'
                        value={filters.gameId || ''}
                        onChange={handleGameChange}
                        disabled={isLoadingCatalogs}
                    >
                        <option value=''>All Games</option>
                        {availableGames.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.home_team_name} vs {g.away_team_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selector de Jugador (Si hay un equipo seleccionado) */}
                {filters.teamId && (
                    <div className='filter-group'>
                        <label htmlFor='player-filter'>Player</label>
                        <select
                            id='player-filter'
                            className='filter-select'
                            value={filters.playerIds?.[0] || ''}
                            onChange={(e) => {
                                const val = e.target.value
                                startTransition(() => {
                                    onFilterChange({playerIds: val ? [val] : undefined})
                                })
                            }}
                        >
                            <option value=''>All Players</option>
                            {displayedPlayers.map((p) => (
                                <option key={p.id} value={p.id}>
                                    #{p.number} {p.first_name} {p.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Rango de Fechas */}
                <div className='filter-group'>
                    <label>Date Range</label>
                    <div className='date-range-group'>
                        <input
                            type='date'
                            className='filter-input'
                            value={filters.dateRange?.startDate || ''}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                        />
                        <input
                            type='date'
                            className='filter-input'
                            value={filters.dateRange?.endDate || ''}
                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}