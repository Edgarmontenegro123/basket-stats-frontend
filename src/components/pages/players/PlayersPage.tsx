import * as React from 'react'
import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {canManagePlayers} from '../../../auth/permissions'
import BasketballLoader from '../../common/BasketballLoader'
import ConfirmModal from '../../common/ConfirmModal'
import {getPlayerPositionAbbreviation, getPlayerPositionLabel} from '../../helpers/playerHelpers'
import type {Team} from '../../types/team'
import type {CreatePlayerPayload, Player} from '../../types/player'
import {
    createPlayer,
    getPlayers,
    updatePlayer,
    deletePlayer,
    getTeams} from '../../services/api'
import './PlayersPage.css'


    const PlayersPage = () => {
    const [players, setPlayers] = useState<Player[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTeamId, setSelectedTeamId] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)

    const navigate = useNavigate()

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
        const fetchData = async () => {
            try {
                setIsLoading(true)
                setError('')

                const [playersData, teamsData] = await Promise.all([
                    getPlayers(),
                    getTeams(),
                ])

                setPlayers(playersData)
                setTeams(teamsData)
            } catch {
                setError('Could not load players data.')
            } finally {
                setIsLoading(false)
            }
        }

        void fetchData()
    }, [])

    const handleCreatePlayer = async (e: React.BaseSyntheticEvent) => {
        e.preventDefault()

        const heightCm = form.height_cm
        const weightKg = form.weight_kg

        const hasHeight = heightCm !== undefined && heightCm !== null
        const hasWeight = weightKg !== undefined && weightKg !== null

        if (!form.team_id) {
            alert('Please select a team.')
            return
        }
        if (form.first_name.trim().length < 2) {
            alert('First name must contain at least 2 characters.')
            return
        }
        if (form.last_name.trim().length < 2) {
            alert('Last name must contain at least 2 characters.')
            return
        }
        if (!form.birth_date) {
            alert('Birth date is required.')
            return
        }
        if (form.number < 0 || form.number > 99) {
            alert('Player number must be between 0 and 99.')
            return
        }
        if (!form.position) {
            alert('Please select a position.')
            return
        }
        if (hasHeight && (heightCm < 120 || heightCm > 250)) {
            alert('Height must be between 120 and 250 cm.')
            return
        }
        if (hasWeight && (weightKg < 30 || weightKg > 200)) {
            alert('Weight must be between 30 and 200 kg.')
            return
        }
        if (editingPlayer) {
            await updatePlayer(editingPlayer.id, form)
        } else {
            await createPlayer(form)
        }

        const updatedPlayers = await getPlayers()
        setPlayers(updatedPlayers)

        setForm({
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

        setEditingPlayer(null)
        setShowForm(false)
    }

    const handleEditPlayer = (player: Player) => {
        setEditingPlayer(player)

        setForm({
            team_id: player.team_id,
            first_name: player.first_name,
            last_name: player.last_name,
            number: player.number,
            position: player.position || '',
            height_cm: player.height_cm || undefined,
            weight_kg: player.weight_kg || undefined,
            birth_date: player.birth_date || '',
            photo_url: player.photo_url || '',
        })

        setShowForm(true)
    }

        const handleConfirmDeletePlayer = async () => {
            if (!playerToDelete) {
                return
            }

            try {
                await deletePlayer(playerToDelete.id)

                const updatedPlayers = await getPlayers()
                setPlayers(updatedPlayers)

                setPlayerToDelete(null)
            } catch (error) {
                console.error(error)
            }
        }

    const filteredPlayers = players.filter((player) => {
        const fullName = `${player.first_name} ${player.last_name}`.toLowerCase()
        const matchesSearch = fullName.includes(searchTerm.toLowerCase())

        const matchesTeam = selectedTeamId
            ? player.team_id === selectedTeamId
            : true

        return matchesSearch && matchesTeam
    })

    return (
        <div className='players-page'>
            <div className='players-header'>
                <div>
                    <h1>Players</h1>
                    <p className='players-subtitle'>
                        Manage team rosters and player information.
                    </p>
                </div>
                {canEditPlayers && (
                    <button
                        className='players-add-button'
                        onClick={() => {
                            setEditingPlayer(null)
                            setForm({
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
                            setShowForm(true)
                        }}
                    >
                        Add Player
                    </button>
                )}
            </div>
            <div className='players-summary'>
                <div className='summary-card'>
                    <h3>{players.length}</h3>
                    <p>Total players</p>
                </div>
                <div className='summary-card'>
                    <h3>{teams.length}</h3>
                    <p>Total teams</p>
                </div>
            </div>
            {showForm && (
                <div className='players-form-card'>
                    <h2>{editingPlayer ? 'Edit Player' : 'Add Player'}</h2>
                    <form onSubmit={handleCreatePlayer}>
                        <select
                            value={form.team_id}
                            onChange={(e) =>
                                setForm({...form, team_id: e.target.value})
                            }
                        >
                            <option value=''>Select team</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
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
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                className='players-form-submit'
                            >
                                Save Player
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {error && (
                <div className='players-error'>
                    {error}
                </div>
            )}
            {isLoading ? (
                <div className='loading-overlay'>
                    <div className='loading-box'>
                        <BasketballLoader/>
                        <p>Loading players...</p>
                    </div>
                </div>
            ) : (
                <div className='players-card'>
                    <div className='players-toolbar'>
                        <input
                            type='text'
                            placeholder='Search player...'
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className='players-search'
                        />
                        <select
                            value={selectedTeamId}
                            onChange={(event) => setSelectedTeamId(event.target.value)}
                            className='players-filter'
                        >
                            <option value=''>All teams</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='table-wrapper'>
                        <table className='players-table'>
                            <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Number</th>
                                <th>Player</th>
                                <th>Team</th>
                                <th>Position</th>
                                <th>Height</th>
                                <th>Weight</th>
                                {canEditPlayers && (<th>Actions</th>)}
                            </tr>
                            </thead>
                            <tbody>
                            {filteredPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan={canEditPlayers ? 8 : 7}>
                                        No players found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPlayers.map((player) => {
                                    const team = teams.find(
                                        (team) => team.id === player.team_id,
                                    )
                                    return (
                                        <tr
                                            key={player.id}
                                            className='player-row'
                                            onClick={() => navigate(`/players/${player.id}`)}
                                        >
                                            <td>
                                                {player.photo_url ? (
                                                    <img
                                                        src={player.photo_url}
                                                        alt={player.first_name}
                                                        className='player-avatar'
                                                    />
                                                ) : (
                                                    <div className='player-avatar-placeholder'>
                                                        {player.first_name.charAt(0)}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{player.number}</td>
                                            <td>
                                                {player.first_name} {player.last_name}
                                            </td>
                                            <td>{team?.name || 'Unknown team'}</td>
                                            <td title={getPlayerPositionLabel(player.position)}>
                                                {getPlayerPositionAbbreviation(player.position)}
                                            </td>
                                            <td>
                                                {player.height_cm
                                                    ? `${player.height_cm} cm`
                                                    : '-'}
                                            </td>
                                            <td>
                                                {player.weight_kg
                                                    ? `${player.weight_kg} kg`
                                                    : '-'}
                                            </td>
                                            {canEditPlayers && (
                                                <td>
                                                    <div className='players-actions'>
                                                        <button
                                                            className='players-edit-button'
                                                            onClick={(event) => {
                                                                event.stopPropagation()
                                                                handleEditPlayer(player)
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className='players-delete-button'
                                                            onClick={(event) => {
                                                                event.stopPropagation()
                                                                setPlayerToDelete(player)
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })
                            )}
                            </tbody>
                        </table>
                        <div className='players-mobile-list'>
                            {filteredPlayers.map((player) => {
                                const team = teams.find(
                                    (team) => team.id === player.team_id,
                                )
                                return (
                                    <div
                                        key={player.id}
                                        className='player-mobile-card'
                                        onClick={() => navigate(`/players/${player.id}`)}
                                    >
                                        <div className='player-mobile-header'>
                                            {player.photo_url ? (
                                                <img
                                                    src={player.photo_url}
                                                    alt={player.first_name}
                                                    className='player-avatar'
                                                />
                                            ) : (
                                                <div className='player-avatar-placeholder'>
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
                                                    {getPlayerPositionLabel(player.position)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='player-mobile-info'>
                                            <p>
                                                <strong>Team:</strong>
                                                {' '}
                                                {team?.name || 'Unknown team'}
                                            </p>
                                            <p>
                                                <strong>Height:</strong>
                                                {' '}
                                                {player.height_cm
                                                    ? `${player.height_cm} cm`
                                                    : '-'}
                                            </p>
                                            <p>
                                                <strong>Weight:</strong>
                                                {' '}
                                                {player.weight_kg
                                                    ? `${player.weight_kg} kg`
                                                    : '-'}
                                            </p>
                                        </div>
                                        {canEditPlayers && (
                                            <div className='player-mobile-actions'>
                                                <button
                                                    className='players-edit-button'
                                                    onClick={(event) => {
                                                        event.stopPropagation()
                                                        handleEditPlayer(player)
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className='players-delete-button'
                                                    onClick={(event) => {
                                                        event.stopPropagation()
                                                        setPlayerToDelete(player)
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={!!playerToDelete}
                title='Delete player'
                message={`Are you sure you want to delete ${playerToDelete?.first_name} ${playerToDelete?.last_name}?`}
                confirmLabel='Delete'
                cancelLabel='Cancel'
                onConfirm={handleConfirmDeletePlayer}
                onCancel={() => setPlayerToDelete(null)}
            />
        </div>
    )
}

export default PlayersPage