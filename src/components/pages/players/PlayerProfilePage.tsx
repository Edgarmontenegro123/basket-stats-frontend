import {useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import { getPlayerPositionLabel } from '../../helpers/playerHelpers'
import {getPlayerById, getTeams, getPlayerSummaryByName} from '../../services/api'
import type {Player, PlayerSummary} from '../../types/player'
import type {Team} from '../../types/team'
import BasketballLoader from '../../common/BasketballLoader'
import './PlayerProfilePage.css'
import '../../layout/MainLayout.css'

    const PlayerProfilePage = () => {
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
                setError('Could not load player. The server may be waking up. Please try again in a few seconds.')
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
                    <BasketballLoader/>
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
                    {team ? (
                        <button
                            type='button'
                            className='player-profile-team-link'
                            onClick={() => navigate(`/teams/${team.id}`)}
                        >
                            {team.name}
                        </button>
                    ) : (
                        <p className='player-profile-team'>
                            Unknown team
                        </p>
                    )}

                    <h1>
                        {player.first_name} {player.last_name}
                    </h1>

                    <div className='player-profile-badges'>
                        <span>#{player.number}</span>
                        <span>{getPlayerPositionLabel(player.position)}</span>
                    </div>
                </div>
            </section>

            <section>
                <h2 className='player-section-title'>Personal Details</h2>

                <div className='player-details-grid'>
                    <div className='player-detail-card'>
                        <span>Height</span>
                        <strong>
                            {player.height_cm ? `${player.height_cm} cm` : '-'}
                        </strong>
                    </div>

                    <div className='player-detail-card'>
                        <span>Weight</span>
                        <strong>
                            {player.weight_kg ? `${player.weight_kg} kg` : '-'}
                        </strong>
                    </div>

                    <div className='player-detail-card'>
                        <span>Birth date</span>
                        <strong>{formatBirthDate(player.birth_date)}</strong>
                    </div>
                </div>
            </section>

            <section>
                <h2 className='player-section-title'>Performance Summary</h2>

                {playerSummary ? (
                    <div className='player-performance-layout'>
                        <div>
                            <h3 className='player-section-subtitle'>Overview</h3>

                            <div className='player-details-grid'>
                                <div className='player-detail-card'>
                                    <span>Games played</span>
                                    <strong>{playerSummary.games_played}</strong>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className='player-section-subtitle'>Totals</h3>

                            <div className='player-details-grid'>
                                <div className='player-detail-card'>
                                    <span>Total points</span>
                                    <strong>{playerSummary.total_points}</strong>
                                </div>

                                <div className='player-detail-card'>
                                    <span>Total rebounds</span>
                                    <strong>{playerSummary.total_rebounds}</strong>
                                </div>

                                <div className='player-detail-card'>
                                    <span>Total assists</span>
                                    <strong>{playerSummary.total_assists}</strong>
                                </div>

                                <div className='player-detail-card'>
                                    <span>Steals</span>
                                    <strong>{playerSummary.total_steals}</strong>
                                </div>

                                <div className='player-detail-card'>
                                    <span>Blocks</span>
                                    <strong>{playerSummary.total_blocks}</strong>
                                </div>

                                <div className='player-detail-card'>
                                    <span>Turnovers</span>
                                    <strong>{playerSummary.total_turnovers}</strong>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className='player-section-subtitle'>Averages</h3>

                            <div className='player-details-grid'>
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

                                <div className='player-detail-card'>
                                    <span>AVG steals</span>
                                    <strong>{playerSummary.average_steals}</strong>
                                </div>

                                <div className='player-detail-card'>
                                    <span>AVG blocks</span>
                                    <strong>{playerSummary.average_blocks}</strong>
                                </div>

                                <div className='player-detail-card'>
                                    <span>AVG turnovers</span>
                                    <strong>{playerSummary.average_turnovers}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='player-empty-analytics'>
                        <span>Analytics</span>
                        <strong>No processed stats yet.</strong>
                        <p>
                            Upload and process game stats to generate this player summary.
                        </p>
                    </div>
                )}
            </section>
        </div>
    )
}

export default PlayerProfilePage