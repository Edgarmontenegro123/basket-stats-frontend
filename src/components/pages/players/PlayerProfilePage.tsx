import React, {useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {getPlayerPositionLabel} from '../../helpers/playerHelpers'
import {canManagePlayers} from '../../../auth/permissions'
import {getPlayerById, getTeams, getPlayerSummaryByName, updatePlayer} from '../../../services/api'
import type {Player, PlayerSummary, CreatePlayerPayload} from '../../../types/player'
import type {Team} from '../../../types/team'
import BasketballLoader from '../../common/BasketballLoader'
import './PlayerProfilePage.css'
import '../../layout/MainLayout.css'
import PageHeader from '../../common/PageHeader'

const PlayerProfilePage = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const [player, setPlayer] = useState<Player | null>(null)
    const [playerSummary, setPlayerSummary] = useState<PlayerSummary | null>(null)
    const [teams, setTeams] = useState<Team[]>([])
    const [team, setTeam] = useState<Team | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [showEditForm, setShowEditForm] = useState(false)

    const storedUser = localStorage.getItem('basket_stats_user')
    const currentUser = storedUser ? JSON.parse(storedUser) : null
    const canEditPlayers = canManagePlayers(currentUser?.role)

    const [form, setForm] = useState<CreatePlayerPayload>({
        team_id: '',
        first_name: '',
        last_name: '',
        number: 0,
        position: '',
        height_cm: undefined,
        weight_kg: undefined,
        birth_date: '',
        photo_url: '',
    })

    useEffect(() => {
        const fetchPlayerData = async () => {
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
                setTeams(teamsData)

                const playerTeam = teamsData.find(
                    (t: Team) => t.id === playerData.team_id,
                )

                setPlayer(playerData)
                setTeam(playerTeam || null)

                setForm({
                    team_id: playerData.team_id,
                    first_name: playerData.first_name,
                    last_name: playerData.last_name,
                    number: playerData.number,
                    position: playerData.position || '',
                    height_cm: playerData.height_cm || undefined,
                    weight_kg: playerData.weight_kg || undefined,
                    birth_date: playerData.birth_date || '',
                    photo_url: playerData.photo_url || '',
                })
            } catch {
                setError('Could not load player. The server may be waking up. Please try again in a few seconds.')
            } finally {
                setIsLoading(false)
            }
        }

        void fetchPlayerData()
    }, [id])

    const handleUpdatePlayer = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!player) return

        try {
            await updatePlayer(player.id, form)
            setShowEditForm(false)

            const playerData = await getPlayerById(player.id)
            setPlayer(playerData)
            setForm({
                team_id: playerData.team_id,
                first_name: playerData.first_name,
                last_name: playerData.last_name,
                number: playerData.number,
                position: playerData.position || '',
                height_cm: playerData.height_cm || undefined,
                weight_kg: playerData.weight_kg || undefined,
                birth_date: playerData.birth_date || '',
                photo_url: playerData.photo_url || '',
            })
        } catch {
            alert('Could not update player.')
        }
    }

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
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                <PageHeader
                    title='Player Profile'
                    subtitle=''
                    showBack
                />
                {canEditPlayers && !showEditForm && (
                    <button
                        className='players-edit-button'
                        onClick={() => setShowEditForm(true)}
                    >
                        Edit Player
                    </button>
                )}
            </div>

            {showEditForm ? (
                <section className='players-form-card' style={{marginTop: '20px'}}>
                    <h2>Edit Player</h2>
                    <form onSubmit={handleUpdatePlayer}>
                        <select
                            value={form.team_id}
                            onChange={(e) =>
                                setForm({...form, team_id: e.target.value})
                            }
                        >
                            <option value=''>Select team</option>
                            {teams.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type='text'
                            placeholder='First name'
                            value={form.first_name}
                            onChange={(e) =>
                                setForm({...form, first_name: e.target.value})
                            }
                        />
                        <input
                            type='text'
                            placeholder='Last name'
                            value={form.last_name}
                            onChange={(e) =>
                                setForm({...form, last_name: e.target.value})
                            }
                        />
                        <input
                            type='number'
                            min='0'
                            max='99'
                            placeholder='Jersey number'
                            value={form.number === 0 ? '' : form.number}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    number: e.target.value === '' ? 0 : Number(e.target.value),
                                })
                            }
                        />
                        <select
                            value={form.position || ''}
                            required
                            onChange={(e) =>
                                setForm({...form, position: e.target.value})
                            }
                        >
                            <option value=''>Select position</option>
                            <option value='PG'>Point Guard (PG)</option>
                            <option value='SG'>Shooting Guard (SG)</option>
                            <option value='SF'>Small Forward (SF)</option>
                            <option value='PF'>Power Forward (PF)</option>
                            <option value='C'>Centre (C)</option>
                        </select>
                        <input
                            type='number'
                            min='120'
                            max='250'
                            placeholder='Height cm'
                            value={form.height_cm || ''}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    height_cm: e.target.value
                                        ? Number(e.target.value)
                                        : undefined,
                                })
                            }
                        />
                        <input
                            type='number'
                            min='30'
                            max='200'
                            placeholder='Weight kg'
                            value={form.weight_kg || ''}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    weight_kg: e.target.value
                                        ? Number(e.target.value)
                                        : undefined,
                                })
                            }
                        />
                        <div className='players-form-field'>
                            <label htmlFor='birth_date'>Birth date</label>
                            <input
                                id='birth_date'
                                type='date'
                                value={form.birth_date || ''}
                                required
                                onChange={(e) =>
                                    setForm({...form, birth_date: e.target.value})
                                }
                            />
                        </div>
                        <input
                            type='text'
                            placeholder='Photo URL'
                            value={form.photo_url || ''}
                            onChange={(e) =>
                                setForm({...form, photo_url: e.target.value})
                            }
                        />
                        <div className='players-form-actions'>
                            <button
                                type='button'
                                className='players-form-cancel'
                                onClick={() => setShowEditForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                className='players-form-submit'
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </section>
            ) : (
                <>
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
                                <p>No performance summary available for this player yet.</p>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    )
}

export default PlayerProfilePage