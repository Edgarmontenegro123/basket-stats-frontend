import { useEffect, useState } from 'react'
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import GameModal from '../games/GameModal'
import '../common/PageLayout.css'
import './TeamsPage.css'

import {
    createGame,
    deleteGame,
    getGames,
    getSeasons,
    getTeams,
    updateGame,
} from '../services/api'

import type { Team } from '../types/team'
import type { Season } from '../types/season'
import type { Game } from '../types/game'

const GamesPage = () => {
    const [teams, setTeams] = useState<Team[]>([])
    const [seasons, setSeasons] = useState<Season[]>([])
    const [games, setGames] = useState<Game[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [gameToEdit, setGameToEdit] = useState<Game | null>(null)

    const loadData = async () => {
        const [teamsData, seasonsData, gamesData] = await Promise.all([
            getTeams(),
            getSeasons(),
            getGames(),
        ])

        setTeams(teamsData)
        setSeasons(seasonsData)
        setGames(gamesData)
    }

    useEffect(() => {
        const fetchData = async () => {
            await loadData()
        }

        void fetchData()
    }, [])

    const handleSubmitGame = async (
        seasonId: string,
        homeTeamId: string,
        awayTeamId: string,
    ) => {
        try {
            if (gameToEdit) {
                await updateGame(
                    gameToEdit.id,
                    seasonId,
                    homeTeamId,
                    awayTeamId,
                )
            } else {
                await createGame(seasonId, homeTeamId, awayTeamId)
            }

            setGameToEdit(null)
            setIsModalOpen(false)
            await loadData()
        } catch (error) {
            console.error(error)
        }
    }

    const handleOpenCreateModal = () => {
        setGameToEdit(null)
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (game: Game) => {
        setGameToEdit(game)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setGameToEdit(null)
        setIsModalOpen(false)
    }

    const handleDeleteGame = async (gameId: string) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this game?',
        )

        if (!confirmed) return

        try {
            await deleteGame(gameId)
            await loadData()
        } catch (error) {
            console.error(error)
        }
    }

    const getTeamName = (teamId: string) => {
        return teams.find((team) => team.id === teamId)?.name || 'Unknown team'
    }

    const getSeasonName = (selectedSeasonId: string) => {
        return (
            seasons.find((season) => season.id === selectedSeasonId)?.name ||
            'Unknown season'
        )
    }

    return (
        <div>
            <PageHeader
                title='Games'
                subtitle='Track and manage your matches'
            />

            <SectionCard
                title='Games'
                actionLabel='New game'
                onAction={handleOpenCreateModal}
            >
                {games.length === 0 ? (
                    <p>No games recorded yet.</p>
                ) : (
                    <ul className='data-list'>
                        {games.map((game) => (
                            <li
                                className='data-list__item'
                                key={game.id}
                            >
                                <div>
                                    <strong>
                                        {getTeamName(game.home_team_id)} vs{' '}
                                        {getTeamName(game.away_team_id)}
                                    </strong>

                                    <div>
                                        Season: {getSeasonName(game.season_id)}
                                    </div>

                                    <div>Status: {game.status}</div>
                                </div>

                                <div className='data-list__actions'>
                                    <button
                                        type='button'
                                        className='secondary-button'
                                        onClick={() => handleOpenEditModal(game)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type='button'
                                        className='danger-button'
                                        onClick={() =>
                                            handleDeleteGame(game.id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionCard>

            <GameModal
                key={isModalOpen ? gameToEdit?.id ?? 'new' : 'closed'}
                isOpen={isModalOpen}
                teams={teams}
                seasons={seasons}
                gameToEdit={gameToEdit}
                onClose={handleCloseModal}
                onSubmit={handleSubmitGame}
            />
        </div>
    )
}

export default GamesPage