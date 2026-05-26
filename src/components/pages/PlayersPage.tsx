import * as React from 'react'
import { useEffect, useState } from 'react'
import { createPlayer, getPlayers, updatePlayer,deletePlayer,getTeams } from '../services/api'
import type { CreatePlayerPayload, Player } from '../types/player'
import type { Team } from '../types/team'
import './PlayersPage.css'

export const PlayersPage = () => {
    const [players, setPlayers] = useState<Player[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

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
            const [playersData, teamsData] = await Promise.all([
                getPlayers(),
                getTeams(),
            ])

            setPlayers(playersData)
            setTeams(teamsData)
        }

        void fetchData()
    }, [])

    const handleCreatePlayer = async (e: React.BaseSyntheticEvent) => {
        e.preventDefault()

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

    const handleDeletePlayer = async (id: string) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this player?',
        )

        if (!confirmDelete) {
            return
        }

        await deletePlayer(id)

        const updatedPlayers = await getPlayers()
        setPlayers(updatedPlayers)
    }

    return (
        <div className='players-page'>
            <div className='players-header'>
                <div>
                    <h1>Players</h1>
                    <p className='players-subtitle'>
                        Manage team rosters and player information.
                    </p>
                </div>
                <button
                    className='players-add-button'
                    onClick={() => setShowForm(true)}
                >
                    Add Player
                </button>
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
                                setForm({ ...form, team_id: e.target.value })
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
                                setForm({ ...form, first_name: e.target.value })
                            }
                        />

                        <input
                            type='text'
                            placeholder='Last name'
                            value={form.last_name}
                            onChange={(e) =>
                                setForm({ ...form, last_name: e.target.value })
                            }
                        />

                        <input
                            type='number'
                            placeholder='Number'
                            value={form.number}
                            onChange={(e) =>
                                setForm({ ...form, number: Number(e.target.value) })
                            }
                        />

                        <button type='button' onClick={() => setShowForm(false)}>
                            Cancel
                        </button>

                        <button type='submit'>
                            Save Player
                        </button>
                    </form>
                </div>
            )}

            <div className='players-card'>
                <div className='table-wrapper'>
                    <table className='players-table'>
                        <thead>
                        <tr>
                            <th>Number</th>
                            <th>Player</th>
                            <th>Team</th>
                            <th>Position</th>
                            <th>Height</th>
                            <th>Weight</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {players.map((player) => {
                            const team = teams.find(
                                (team) => team.id === player.team_id,
                            )

                            return (
                                <tr key={player.id}>
                                    <td>{player.number}</td>
                                    <td>
                                        {player.first_name} {player.last_name}
                                    </td>
                                    <td>{team?.name || 'Unknown team'}</td>
                                    <td>{player.position || '-'}</td>
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
                                    <td>
                                        <button
                                            className='players-edit-button'
                                            onClick={() => handleEditPlayer(player)}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className='players-delete-button'
                                            onClick={() => handleDeletePlayer(player.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}