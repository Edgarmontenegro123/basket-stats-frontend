import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import { canManageTeams } from '../../../auth/permissions'
import PageHeader from '../../common/PageHeader'
import SectionCard from '../../common/SectionCard'
import TeamModal from '../../teams/TeamModal'
import BasketballLoader from '../../common/BasketballLoader'
import {getTeams, createTeam, updateTeam, deleteTeam} from '../../services/api'
import type {Team, CreateTeamPayload} from '../../types/team'
import './TeamsPage.css'
import '../../common/PageLayout.css'
import ConfirmModal from "../../common/ConfirmModal.tsx";


const TeamsPage = () => {
    const [teams, setTeams] = useState<Team[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [teamToEdit, setTeamToEdit] = useState<Team | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)
    const [deleteError, setDeleteError] = useState('')

    const navigate = useNavigate()

    const storedUser = localStorage.getItem('basket_stats_user')
    const currentUser = storedUser ? JSON.parse(storedUser) : null
    const canEditTeams = canManageTeams(currentUser?.role)

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await getTeams()
                setTeams(data)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        void fetchTeams()
    }, []);

    const handleSubmitTeam = async (payload: CreateTeamPayload) => {
        const trimmedName = payload.name.trim()
        const trimmedLogoUrl = payload.logo_url?.trim() || ''

        if (trimmedName.length < 2) {
            alert ('Team name must contain at least 2 characters')
            return
        }

        if (trimmedName.length > 30) {
            alert ('Team name must contain a maximum 30 characters')
            return
        }

        const exists = teams.some(
            (team) =>
                team.name.toLowerCase() === trimmedName.toLowerCase() &&
                team.id !== teamToEdit?.id,
        )

        if (exists) {
            alert('Team already exists!')
            return
        }

        try {
            if (teamToEdit) {
                const updatedTeam = await updateTeam(teamToEdit.id, {
                    name: trimmedName,
                    logo_url: trimmedLogoUrl,
                })

                setTeams((prev) =>
                    prev.map((team) =>
                        team.id === updatedTeam.id ? updatedTeam : team,
                    ),
                )
            } else {
                const newTeam = await createTeam({
                    name: trimmedName,
                    logo_url: trimmedLogoUrl,
                })

                setTeams((prev) => [newTeam, ...prev])
            }

            setTeamToEdit(null)
        } catch (error) {
            console.error(error)
        }
    }

    const handleOpenCreateModal = () => {
        setTeamToEdit(null)
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (team: Team) => {
        setTeamToEdit(team)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setTeamToEdit(null)
        setIsModalOpen(false)
    }

    const handleConfirmDeleteTeam = async () => {
        if (!teamToDelete) {
            return
        }

        try {
            await deleteTeam(teamToDelete.id)

            setTeams((prev) =>
                prev.filter((team) => team.id !== teamToDelete.id),
            )

            setDeleteError('')
            setTeamToDelete(null)
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Team could not be deleted.'

            setDeleteError(message)
        }
    }

    if (isLoading) {
        return (
            <div className='loading-overlay'>
                <div className='loading-box'>
                    <BasketballLoader />
                    <p>Loading teams...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title='Teams'
                subtitle='Manage your teams and opponents'
            />

            <SectionCard
                title='Teams'
                actionLabel={canEditTeams ? 'New team' : undefined}
                onAction={canEditTeams ? handleOpenCreateModal : undefined}
            >
                {teams.length === 0 ? (
                    <p>No teams available yet.</p>
                ) : (
                    <ul className='data-list'>
                        {teams.map((team) => (
                            <li
                                key={team.id}
                                className='data-list__item team-list-item'
                                onClick={() => navigate(`/teams/${team.id}`)}
                            >
                                <div className='team-list-info'>
                                    {team.logo_url ? (
                                        <img
                                            src={team.logo_url}
                                            alt={team.name}
                                            className='team-logo'
                                        />
                                    ) : (
                                        <div className='team-logo-placeholder'>
                                            {team.name.charAt(0)}
                                        </div>
                                    )}

                                    <span>{team.name}</span>
                                </div>
                                {canEditTeams && (
                                    <div className='data-list__actions'>
                                        <button
                                            type='button'
                                            className='secondary-button'
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                handleOpenEditModal(team)
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type='button'
                                            className='danger-button'
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                setDeleteError('')
                                                setTeamToDelete(team)
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </SectionCard>
            {isModalOpen && (
                <TeamModal
                    isOpen={isModalOpen}
                    teamToEdit={teamToEdit}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitTeam}
                    />
            )}
            <ConfirmModal
                isOpen={!!teamToDelete}
                title='Delete team'
                message={
                    deleteError
                        ? deleteError
                        : `Are you sure you want to delete ${teamToDelete?.name}?`
                }
                confirmLabel='Delete'
                cancelLabel='Cancel'
                onConfirm={handleConfirmDeleteTeam}
                onCancel={() => {
                    setDeleteError('')
                    setTeamToDelete(null)
                }}
            />
        </div>
    )
}

export default TeamsPage