import { useEffect, useState } from 'react'
import PageHeader from '../../common/PageHeader'
import SectionCard from '../../common/SectionCard'
import SeasonModal from './SeasonModal'
import BasketballLoader from '../../common/BasketballLoader'
import ConfirmModal from '../../common/ConfirmModal'
import {
    getTeams,
    getSeasons,
    createSeason,
    updateSeason,
    deleteSeason,
} from '../../services/api'
import type { Team } from '../../types/team'
import type { Season } from '../../types/season'
import '../teams/TeamsPage.css'
import '../../common/PageLayout.css'



const SeasonsPage = () => {
    const [teams, setTeams] = useState<Team[]>([])
    const [seasons, setSeasons] = useState<Season[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [seasonToEdit, setSeasonToEdit] = useState<Season | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [seasonToDelete, setSeasonToDelete] = useState<Season | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const teamsData = await getTeams()
                const seasonsData = await getSeasons()

                setTeams(teamsData)
                setSeasons(seasonsData)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        void fetchData()
    }, [])

    const handleSubmitSeason = async (teamId: string, name: string) => {
        const trimmedName = name.trim()

        if (trimmedName.length < 2) {
            alert('Season name must contain at least 2 characters')
            return
        }

        if (trimmedName.length > 40) {
            alert('Season name must contain a maximum of 40 characters')
            return
        }

        try {
            if (seasonToEdit) {
                const updatedSeason = await updateSeason(
                    seasonToEdit.id,
                    teamId,
                    trimmedName,
                )

                setSeasons((prev) =>
                    prev.map((season) =>
                        season.id === updatedSeason.id ? updatedSeason : season,
                    ),
                )
            } else {
                const newSeason = await createSeason(teamId, trimmedName)
                setSeasons((prev) => [...prev, newSeason])
            }

            setSeasonToEdit(null)
            setIsModalOpen(false)
        } catch (error) {
            console.error(error)
        }
    }

    const handleOpenCreateModal = () => {
        setSeasonToEdit(null)
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (season: Season) => {
        setSeasonToEdit(season)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setSeasonToEdit(null)
        setIsModalOpen(false)
    }

    const handleConfirmDeleteSeason = async () => {
        if (!seasonToDelete) return

        await deleteSeason(seasonToDelete.id)

        setSeasons((prev) =>
            prev.filter((season) => season.id !== seasonToDelete.id),
        )

        setSeasonToDelete(null)
    }

    if (isLoading) {
        return (
            <div className='loading-overlay'>
                <div className='loading-box'>
                    <BasketballLoader />
                    <p>Loading seasons...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title='Seasons'
                subtitle='Manage seasons by team'
            />
            <SectionCard
                title='Seasons'
                actionLabel='New season'
                onAction={handleOpenCreateModal}
            >
                {seasons.length === 0 ? (
                    <p>No seasons available yet.</p>
                ) : (
                    <ul className='data-list'>
                        {seasons.map((season) => {
                            const team = teams.find(
                                (team) => team.id === season.team_id,
                            )

                            return (
                                <li
                                    key={season.id}
                                    className='data-list__item'
                                >
                                    <span>
                                        {season.name} -{' '}
                                        {team ? team.name : 'Unknown Team'}
                                    </span>
                                    <div className='data-list__actions'>
                                        <button
                                            type='button'
                                            className='secondary-button'
                                            onClick={() =>
                                                handleOpenEditModal(season)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type='button'
                                            className='danger-button'
                                            onClick={() => setSeasonToDelete(season)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </SectionCard>
            <SeasonModal
                key={isModalOpen ? seasonToEdit?.id ?? 'new' : 'closed'}
                isOpen={isModalOpen}
                teams={teams}
                seasonToEdit={seasonToEdit}
                onClose={handleCloseModal}
                onSubmit={handleSubmitSeason}
            />
            <ConfirmModal
                isOpen={!!seasonToDelete}
                title='Delete season'
                message={`Are you sure you want to delete ${seasonToDelete?.name}?`}
                confirmLabel='Delete'
                cancelLabel='Cancel'
                onConfirm={handleConfirmDeleteSeason}
                onCancel={() => setSeasonToDelete(null)}
            />
        </div>
    )
}

export default SeasonsPage