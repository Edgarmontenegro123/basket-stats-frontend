import {useEffect, useState} from 'react'
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import TeamModal from '../teams/TeamModal.tsx';
import '../common/PageLayout.css'
import './TeamsPage.css'
import {getTeams, createTeam, updateTeam, deleteTeam} from '../services/api'
import type {Team} from '../types/team'


const TeamsPage = () => {
    const [teams, setTeams] = useState<Team[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [teamToEdit, setTeamToEdit] = useState<Team | null>(null)

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await getTeams()
                setTeams(data)
            } catch (error) {
                console.error(error)
            }
        }

        void fetchTeams()
    }, []);

    const handleSubmitTeam = async (name: string) => {
        const trimmedName = name.trim()

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
                team.name.toLowerCase() === name.toLowerCase() &&
                team.id !== teamToEdit?.id,
        )

        if (exists) {
            alert('Team already exists!')
            return
        }

        try {
            if (teamToEdit) {
                const updatedTeam = await updateTeam(teamToEdit.id, trimmedName)

                setTeams((prev) =>
                    prev.map((team) =>
                        team.id === updatedTeam.id ? updatedTeam : team,
                    ),
                )
            } else {
                const newTeam = await createTeam(trimmedName)
                setTeams((prev) => [...prev, newTeam])
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

    const handleDeleteTeam = async (teamId: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this team?')

        if (!confirmed) return

        try {
            await deleteTeam(teamId)

            setTeams((prev) => prev.filter((team) => team.id !== teamId))
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div>
            <PageHeader
                title='Teams'
                subtitle='Manage your teams and opponents'
            />

            <SectionCard
                title='Teams'
                actionLabel='New team'
                onAction={handleOpenCreateModal}
            >
                {teams.length === 0 ? (
                    <p>No teams available yet.</p>
                ) : (
                    <ul className='data-list'>
                        {teams.map((team) => (
                            <li
                                key={team.id}
                                className='data-list__item'
                            >
                                <span>{team.name}</span>
                                <div className='data-list__actions'>
                                    <button
                                        type='button'
                                        className='secondary-button'
                                        onClick={() => handleOpenEditModal(team)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type='button'
                                        className='danger-button'
                                        onClick={() => handleDeleteTeam(team.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionCard>
            <TeamModal
                isOpen={isModalOpen}
                teamToEdit={teamToEdit}
                onClose={handleCloseModal}
                onSubmit={handleSubmitTeam}
                />
        </div>
    )
}

export default TeamsPage