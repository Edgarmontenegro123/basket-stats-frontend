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
            <div className='players-header'>
                <div>
                    <h1>Players</h1>
                    <p className='players-subtitle'>
                        Manage team rosters and player information.
                    </p>
                </div>
                <button className='players-add-button'>
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