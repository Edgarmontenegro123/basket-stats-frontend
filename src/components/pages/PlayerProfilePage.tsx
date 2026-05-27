import {useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {getPlayerById, getTeams, getPlayerSummaryByName} from '../services/api'
import type {Player, PlayerSummary} from '../types/player'
import type {Team} from '../types/team'
import './PlayerProfilePage.css'

export const PlayerProfilePage = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const [player, setPlayer] = useState<Player | null>(null)
    const [playerSummary, setPlayerSummary] = useState<PlayerSummary | null>(null)
    const [team, setTeam] = useState<Team | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchPlayer = async () => {
            if (!id) {
                return
            }

            try {
                setIsLoading(true)
                setError('')

                const [playerData, teamsData] = await Promise.all([
                    getPlayerById(id),
                    getTeams(),
                ])

                const fullName = `${playerData.first_name} ${playerData.last_name}`
                const reversedFullName = `${playerData.last_name} ${playerData.first_name}`

                const summaryData = await getPlayerSummaryByName(fullName)
                || await getPlayerSummaryByName(reversedFullName)

                setPlayerSummary(summaryData)

                const playerTeam = teamsData.find(
                    (team: Team) => team.id === playerData.team_id,
                )

                setPlayer(playerData)
                setTeam(playerTeam || null)
            } catch {
                setError('Could not load player.')
            } finally {
                setIsLoading(false)
            }
        }

        void fetchPlayer()
    }, [id])

    if (isLoading) {
        return (
            <div className='loading-overlay'>
                <div className='loading-box'>
                    <div className='loading-spinner' />
                    <p>Loading player...</p>
                </div>
            </div>
        )
    }

    if (error || !player) {
        return <p>{error || 'Player not found.'}</p>
    }

    const formatBirthDate = (birthDate?: string | null) => {
        if (!birthDate) {
            return '-'
        }

        return new Date(birthDate).toLocaleDateString('en-GB')
    }

    return (
        <div className='player-profile-page'>
            <button
                type='button'
                className='back-button'
                onClick={() => navigate('/players')}
            >
                ← Back to Players
            </button>

            <section className='player-profile-card'>
                {player.photo_url ? (
                    <img
                        src={player.photo_url}
                        alt={player.first_name}
                        className='player-profile-avatar'
                    />
                ) : (
                    <div className='player-profile-avatar-placeholder'>
                        {player.first_name.charAt(0)}
                    </div>
                )}

                <div className='player-profile-main'>
                    <p className='player-profile-team'>
                        {team?.name || 'Unknown team'}
                    </p>

                    <h1>
                        {player.first_name} {player.last_name}
                    </h1>

                    <div className='player-profile-badges'>
                        <span>#{player.number}</span>
                        <span>{player.position || 'No position'}</span>
                    </div>
                </div>
            </section>

                <section className='player-details-grid'>
                    <div className='player-detail-card'>
                        <span>Height</span>
                        <strong>{player.height_cm ? `${player.height_cm} cm` : '-'}</strong>
                    </div>

                    <div className='player-detail-card'>
                        <span>Weight</span>
                        <strong>{player.weight_kg ? `${player.weight_kg} kg` : '-'}</strong>
                    </div>

                    <div className='player-detail-card'>
                        <span>Birth date</span>
                        <strong>{formatBirthDate(player.birth_date)}</strong>
                    </div>
                </section>
            {playerSummary && (
                <section className='player-details-grid'>
                    <div className='player-detail-card'>
                        <span>Games played</span>
                        <strong>{playerSummary.games_played}</strong>
                    </div>

                    <div className='player-detail-card'>
                        <span>AVG points</span>
                        <strong>{playerSummary.average_points}</strong>
                    </div>

                    <div className='player-detail-card'>
                        <span>AVG rebounds</span>
                        <strong>{playerSummary.average_rebounds}</strong>
                    </div>

                    <div className='player-detail-card'>
                        <span>AVG assists</span>
                        <strong>{playerSummary.average_assists}</strong>
                    </div>
                </section>
            )}
            {!playerSummary && (
                <section className='player-details-grid'>
                <div className='player-detail-card'>
                <span>Analytics</span>
                <strong>No processed stats yet.</strong>
                </div>
                </section>
                )}
        </div>
    )
}