import {useEffect, useState} from 'react'
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import type {Game} from '../types/game'
import type {Team} from '../types/team'
import {getTeams, getGames} from '../services/api'
import './ComparePage.css'
import '../common/PageLayout.css'

const ComparePage = () => {
    const [teams, setTeams] = useState<Team[]>([])
    const [teamAId, setTeamAId] = useState('')
    const [teamBId, setTeamBId] = useState('')
    const [games, setGames] = useState<Game[]>([])

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await getTeams()
                const gamesData = await getGames()

                setGames(gamesData)
                setTeams(data)

                if (data.length > 0) {
                    setTeamAId(data[0].id)
                }

                if (data.length > 1) {
                    setTeamBId(data[1].id)
                }
            } catch (error) {
                console.error(error)
            }
        }

        void fetchTeams()
    }, []);

    const getTeamSummary = (teamId: string) => {
        const completedGames = games.filter(
            (game) =>
                game.status === 'completed' &&
                (game.home_team_id === teamId || game.away_team_id === teamId),
        )

        const pointsFor = completedGames.reduce((total, game) => {
            if (game.home_team_id === teamId) {
                return total + (game.home_score || 0)
            }

            return total + (game.away_score || 0)
        }, 0)

        const pointsAgainst = completedGames.reduce((total, game) => {
            if (game.home_team_id === teamId) {
                return total + (game.away_score || 0)
            }

            return total + (game.home_score || 0)
        }, 0)

        const wins = completedGames.filter((game) => {
            const teamScore =
                game.home_team_id === teamId ? game.home_score : game.away_score

            const opponentScore =
                game.home_team_id === teamId ? game.away_score : game.home_score

            return (teamScore || 0) > (opponentScore || 0)
        }).length

        const losses = completedGames.filter((game) => {
            const teamScore =
                game.home_team_id === teamId ? game.home_score : game.away_score

            const opponentScore =
                game.home_team_id === teamId ? game.away_score : game.home_score

            return (teamScore || 0) < (opponentScore || 0)
        }).length

        const averagePointsFor =
            completedGames.length > 0
                ? Number((pointsFor / completedGames.length).toFixed(2))
                : 0

        const averagePointsAgainst =
            completedGames.length > 0
                ? Number((pointsAgainst / completedGames.length).toFixed(2))
                : 0

        const pointDifferential = pointsFor - pointsAgainst

        return {
            gamesPlayed: completedGames.length,
            wins,
            losses,
            pointsFor,
            pointsAgainst,
            averagePointsFor,
            averagePointsAgainst,
            pointDifferential,
        }
    }

    const teamASummary = getTeamSummary(teamAId)
    const teamBSummary = getTeamSummary(teamBId)

    const teamAName =
        teams.find((team) => team.id === teamAId)?.name || 'Team A'

    const teamBName =
        teams.find((team) => team.id === teamBId)?.name || 'Team B'

    const formatPointDifferential = (value: number) => {
        if (value > 0) {
            return `+${value}`
        }

        return String(value)
    }


    return (
        <div>
            <PageHeader
                title='Compare Teams'
                subtitle='Compare statistics between teams'
            />

            <SectionCard title='Comparison'>
                <div className='form-row'>
                    <div className='form-group'>
                        <label>Home Team</label>
                        <select
                            className='form-select'
                            value={teamAId}
                            onChange={(event) => setTeamAId(event.target.value)}
                        >
                            {teams.map((team) => (
                                <option
                                    key={team.id}
                                    value={team.id}
                                    disabled={team.id === teamBId}
                                >
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='form-group'>
                        <label>Away Team</label>
                        <select
                            className='form-select'
                            value={teamBId}
                            onChange={(event) => setTeamBId(event.target.value)}
                        >
                            {teams.map((team) => (
                                <option
                                    key={team.id}
                                    value={team.id}
                                    disabled={team.id === teamAId}
                                >
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='table-wrapper compare-table-wrapper'>
                        <table className='data-table'>
                            <thead>
                            <tr>
                                <th>Metric</th>
                                <th>{teamAName}</th>
                                <th>{teamBName}</th>
                            </tr>
                            </thead>

                            <tbody>
                            <tr>
                                <td>Games played</td>
                                <td>{teamASummary.gamesPlayed}</td>
                                <td>{teamBSummary.gamesPlayed}</td>
                            </tr>
                            <tr>
                                <td>Points for</td>
                                <td>{teamASummary.pointsFor}</td>
                                <td>{teamBSummary.pointsFor}</td>
                            </tr>
                            <tr>
                                <td>Points against</td>
                                <td>{teamASummary.pointsAgainst}</td>
                                <td>{teamBSummary.pointsAgainst}</td>
                            </tr>
                            <tr>
                                <td>Wins</td>
                                <td>{teamASummary.wins}</td>
                                <td>{teamBSummary.wins}</td>
                            </tr>
                            <tr>
                                <td>Losses</td>
                                <td>{teamASummary.losses}</td>
                                <td>{teamBSummary.losses}</td>
                            </tr>
                            <tr>
                                <td>Average points for</td>
                                <td>{teamASummary.averagePointsFor}</td>
                                <td>{teamBSummary.averagePointsFor}</td>
                            </tr>
                            <tr>
                                <td>Average points against</td>
                                <td>{teamASummary.averagePointsAgainst}</td>
                                <td>{teamBSummary.averagePointsAgainst}</td>
                            </tr>
                            <tr>
                                <td>Point differential</td>
                                <td>{formatPointDifferential(teamASummary.pointDifferential)}</td>
                                <td>{formatPointDifferential(teamBSummary.pointDifferential)}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className='compare-mobile-list'>
                        <div className='compare-mobile-card'>
                            <h3>{teamAName}</h3>

                            <p><span>Games played</span><strong>{teamASummary.gamesPlayed}</strong></p>
                            <p><span>Points for</span><strong>{teamASummary.pointsFor}</strong></p>
                            <p><span>Points against</span><strong>{teamASummary.pointsAgainst}</strong></p>
                            <p><span>Wins</span><strong>{teamASummary.wins}</strong></p>
                            <p><span>Losses</span><strong>{teamASummary.losses}</strong></p>
                            <p><span>Average points for</span><strong>{teamASummary.averagePointsFor}</strong></p>
                            <p><span>Average points against</span><strong>{teamASummary.averagePointsAgainst}</strong></p>
                            <p><span>Point differential</span><strong>{formatPointDifferential(teamASummary.pointDifferential)}</strong></p>
                        </div>

                        <div className='compare-mobile-card'>
                            <h3>{teamBName}</h3>

                            <p><span>Games played</span><strong>{teamBSummary.gamesPlayed}</strong></p>
                            <p><span>Points for</span><strong>{teamBSummary.pointsFor}</strong></p>
                            <p><span>Points against</span><strong>{teamBSummary.pointsAgainst}</strong></p>
                            <p><span>Wins</span><strong>{teamBSummary.wins}</strong></p>
                            <p><span>Losses</span><strong>{teamBSummary.losses}</strong></p>
                            <p><span>Average points for</span><strong>{teamBSummary.averagePointsFor}</strong></p>
                            <p><span>Average points against</span><strong>{teamBSummary.averagePointsAgainst}</strong></p>
                            <p><span>Point differential</span><strong>{formatPointDifferential(teamBSummary.pointDifferential)}</strong></p>
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
    )
}

export default ComparePage