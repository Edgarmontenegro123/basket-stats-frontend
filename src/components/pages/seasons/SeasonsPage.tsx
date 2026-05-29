import { useEffect, useState } from 'react'
import PageHeader from '../../common/PageHeader.tsx'
import SectionCard from '../../common/SectionCard.tsx'
import SeasonModal from './SeasonModal.tsx'
import BasketballLoader from '../../common/BasketballLoader.tsx'
import {
    getTeams,
    getSeasons,
    createSeason,
    updateSeason,
    deleteSeason,
} from '../../services/api.ts'
import type { Team } from '../../types/team.ts'
import type { Season } from '../../types/season.ts'
import '../teams/TeamsPage.css'
import '../../common/PageLayout.css'



const SeasonsPage = () => {
    const [teams, setTeams] = useState<Team[]>([])
    const [seasons, setSeasons] = useState<Season[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [seasonToEdit, setSeasonToEdit] = useState<Season | null>(null)
    const [isLoading, setIsLoading] = useState(true)

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

    const handleDeleteSeason = async (seasonId: string) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this season?',
        )

        if (!confirmed) return

        try {
            await deleteSeason(seasonId)

            setSeasons((prev) =>
                prev.filter((season) => season.id !== seasonId),
            )
        } catch (error) {
            console.error(error)
        }
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
                                            onClick={() =>
                                                handleDeleteSeason(season.id)
                                            }
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
        </div>
    )
}

export default SeasonsPage