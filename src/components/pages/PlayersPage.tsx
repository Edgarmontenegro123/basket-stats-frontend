/*
import { useEffect, useState } from 'react'
import {
    createPlayer,
    deletePlayer,
    getPlayers,
    getTeams,
    updatePlayer,
} from '../services/api'
import type { CreatePlayerPayload, Player } from '../types/player'
import type { Team } from '../types/team'

export const PlayersPage = () => {
    const [players, setPlayers] = useState<Player[]>([])
    const [teams, setTeams] = useState<Team[]>([])
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

    const loadData = async () => {
        const [playersData, teamsData] = await Promise.all([
            getPlayers(),
            getTeams(),
        ])

        setPlayers(playersData)
        setTeams(teamsData)
    }

    useEffect(() => {
        loadData()
    }, [])

    return (
        <div>
            <h1>Players</h1>
            <p>Manage real players by team.</p>
        </div>
    )
}*/

import { useEffect, useState } from 'react'
import { getPlayers, getTeams } from '../services/api'
import type { Player } from '../types/player'
import type { Team } from '../types/team'
import './PlayersPage.css'

export const PlayersPage = () => {
    const [players, setPlayers] = useState<Player[]>([])
    const [teams, setTeams] = useState<Team[]>([])

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

    return (
        <div className='players-page'>
            <h1>Players</h1>
            <p>Manage real players by team.</p>

            <div className='players-summary'>
                <p>Total players: {players.length}</p>
                <p>Total teams: {teams.length}</p>
            </div>

            <table className='players-table'>
                <thead>
                <tr>
                    <th>Number</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Position</th>
                    <th>Height</th>
                    <th>Weight</th>
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
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    )
}