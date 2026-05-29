import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import BasketballLoader from '../../common/BasketballLoader'
import {getGames, getPlayersByTeam, getTeamById} from '../../services/api'
import type {Game} from '../../types/game'
import type {Player} from '../../types/player'
import type {Team} from '../../types/team'
import './TeamProfilePage.css'
import '../../layout/MainLayout.css'

const TeamProfilePage = () => {
    const {id} = useParams()
    const navigate = useNavigate()

    const [team, setTeam] = useState<Team | null>(null)
    const [players, setPlayers] = useState<Player[]>([])
    const [games, setGames] = useState<Game[]>([])
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

                const [teamData, playersData, gamesData] = await Promise.all([
                    getTeamById(id),
                    getPlayersByTeam(id),
                    getGames()
                ])

                const teamGames = gamesData.filter(
                    (game: Game) =>
                        game.home_team_id === id || game.away_team_id === id,
                )

                setTeam(teamData)
                setPlayers(playersData)
                setGames(teamGames.slice(0, 5))
            } catch (error) {
                console.error(error)
                setError('Could not load team profile. The server may be waking up. Please try again in a few seconds.')
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

    const totalPlayers = players.length

    const completedGamesList = games.filter(
        (game) =>
            game.status === 'completed' &&
            game.home_score !== null &&
            game.away_score !== null,
    )

    const wins = completedGamesList.filter((game) => {
        const isHomeTeam = game.home_team_id === id
        const isAwayTeam = game.away_team_id === id

        if (isHomeTeam) {
            return Number(game.home_score) > Number(game.away_score)
        }

        if (isAwayTeam) {
            return Number(game.away_score) > Number(game.home_score)
        }

        return false
    }).length

    const losses = completedGamesList.filter((game) => {
        const isHomeTeam = game.home_team_id === id
        const isAwayTeam = game.away_team_id === id

        if (isHomeTeam) {
            return Number(game.home_score) < Number(game.away_score)
        }

        if (isAwayTeam) {
            return Number(game.away_score) < Number(game.home_score)
        }

        return false
    }).length

    const winPercentage =
        completedGamesList.length > 0
            ? Math.round((wins / completedGamesList.length) * 100)
            : 0


    return (
        <div className='team-profile-page'>
            <button
                type='button'
                className='back-button'
                onClick={() => navigate('/teams')}
            >
                ← Back to Teams
            </button>
            <section className='team-profile-header'>
                <span className='team-profile-eyebrow'>Team Profile</span>

                <h1>{team.name}</h1>

                <p>
                    {team.short_name
                        ? `Short name: ${team.short_name}`
                        : 'No short name available'}
                </p>
            </section>
            <section className='team-summary-grid'>
                <div className='team-summary-card'>
                    <span>Players</span>
                    <strong>{totalPlayers}</strong>
                </div>

                <div className='team-summary-card'>
                    <span>Wins</span>
                    <strong>{wins}</strong>
                </div>

                <div className='team-summary-card'>
                    <span>Losses</span>
                    <strong>{losses}</strong>
                </div>

                <div className='team-summary-card'>
                    <span>Win %</span>
                    <strong>{winPercentage}%</strong>
                </div>
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
            <section className='team-profile-section'>
                <div className='team-profile-section__header'>
                    <div>
                        <span className='team-profile-eyebrow'>Games</span>
                        <h2>Recent Games</h2>
                    </div>

                    <span className='team-profile-count'>
                        {games.length} games
                    </span>
                </div>

                {games.length === 0 ? (
                    <p className='team-profile-empty'>
                        No games registered for this team yet.
                    </p>
                ) : (
                    <ul className='team-games-list'>
                        {games.map((game) => (
                            <li
                                key={game.id}
                                className='team-games-item team-games-item--clickable'
                                onClick={() => navigate(`/analytics?gameId=${game.id}`)}
                            >
                                <span>
                                    {game.home_team_name}
                                    {' '}
                                    {game.home_score !== null ? game.home_score : '-'}
                                    <strong>{' vs '}</strong>
                                    {game.away_score !== null ? game.away_score : '-'}
                                    {' '}
                                    {game.away_team_name}
                                </span>

                                <small>
                                    {new Date(game.game_date).toLocaleDateString()}
                                    {' · '}
                                    {game.status}
                                </small>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}

export default TeamProfilePage