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
        <div>
            <h1>Players</h1>
            <p>Manage real players by team.</p>

            <p>Total players: {players.length}</p>
            <p>Total teams: {teams.length}</p>
        </div>
    )
}