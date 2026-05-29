import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import BasketballLoader from '../../common/BasketballLoader.tsx'
import {getTeamById} from '../../services/api.ts'
import type {Team} from '../../types/team.ts'
import './TeamProfilePage.css'

const TeamProfilePage = () => {
    const {id} = useParams()

    const [team, setTeam] = useState<Team | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchTeam = async () => {
            if (!id) {
                setError('Team ID is missing.')
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError('')

                const teamData = await getTeamById(id)
                setTeam(teamData)
            } catch (error) {
                console.error(error)
                setError('Could not load team profile.')
            } finally {
                setIsLoading(false)
            }
        }

        void fetchTeam()
    }, [id])

    if (isLoading) {
        return (
            <div className='loading-overlay'>
                <div className='loading-box'>
                    <BasketballLoader />
                    <p>Loading team profile...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='team-profile-page'>
                <section className='team-profile-header'>
                    <span className='team-profile-eyebrow'>Team Profile</span>
                    <h1>Error</h1>
                    <p>{error}</p>
                </section>
            </div>
        )
    }

    if (!team) {
        return (
            <div className='team-profile-page'>
                <section className='team-profile-header'>
                    <span className='team-profile-eyebrow'>Team Profile</span>
                    <h1>Team not found</h1>
                    <p>No team data available.</p>
                </section>
            </div>
        )
    }

    return (
        <div className='team-profile-page'>
            <section className='team-profile-header'>
                <span className='team-profile-eyebrow'>Team Profile</span>

                <h1>{team.name}</h1>

                <p>
                    {team.short_name
                        ? `Short name: ${team.short_name}`
                        : 'No short name available'}
                </p>
            </section>
        </div>
    )
}

export default TeamProfilePage