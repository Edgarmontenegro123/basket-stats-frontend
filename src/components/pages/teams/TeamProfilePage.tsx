import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import BasketballLoader from '../../common/BasketballLoader'
import {getPlayersByTeam, getTeamById} from '../../services/api'
import type {Player} from '../../types/player'
import type {Team} from '../../types/team'
import './TeamProfilePage.css'

const TeamProfilePage = () => {
    const {id} = useParams()
    const navigate = useNavigate()

    const [team, setTeam] = useState<Team | null>(null)
    const [players, setPlayers] = useState<Player[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchTeamProfile = async () => {
            if (!id) {
                setError('Team ID is missing.')
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError('')

                const [teamData, playersData] = await Promise.all([
                    getTeamById(id),
                    getPlayersByTeam(id)
                ])

                setTeam(teamData)
                setPlayers(playersData)
            } catch (error) {
                console.error(error)
                setError('Could not load team profile.')
            } finally {
                setIsLoading(false)
            }
        }

        void fetchTeamProfile()
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
            <section className='team-profile-section'>
                <div className='team-profile-section__header'>
                    <div>
                        <span className='team-profile-eyebrow'>Roster</span>
                        <h2>Players</h2>
                    </div>

                    <span className='team-profile-count'>
                        {players.length} players
                    </span>
                </div>

                {players.length === 0 ? (
                    <p className='team-profile-empty'>
                        No players registered for this team yet.
                    </p>
                ) : (
                    <div className='team-roster-list'>
                        {players.map((player) => (
                            <article
                                key={player.id}
                                className='team-roster-card'
                                onClick={() => navigate(`/players/${player.id}`)}
                            >
                                {player.photo_url ? (
                                    <img
                                        src={player.photo_url}
                                        alt={`${player.first_name} ${player.last_name}`}
                                        className='team-roster-avatar'
                                    />
                                ) : (
                                    <div className='team-roster-avatar-placeholder'>
                                        {player.first_name.charAt(0)}
                                    </div>
                                )}

                                <div>
                                    <h3>
                                        {player.first_name} {player.last_name}
                                    </h3>

                                    <p>
                                        #{player.number}
                                        {' · '}
                                        {player.position || 'No position'}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default TeamProfilePage