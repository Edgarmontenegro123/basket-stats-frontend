import { useEffect, useState } from 'react'
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import '../common/PageLayout.css'
import {
    createGame,
    getGames,
    getSeasons,
    getTeams
} from '../services/api'

interface Team {
    id: string
    name: string
}

interface Season {
    id: string
    name: string
}

interface Game {
    id: string
    season_id: string
    home_team_id: string
    away_team_id: string
    status: string
}

const GamesPage = () => {
    const [teams, setTeams] = useState<Team[]>([])
    const [seasons, setSeasons] = useState<Season[]>([])
    const [games, setGames] = useState<Game[]>([])

    const [seasonId, setSeasonId] = useState('')
    const [homeTeamId, setHomeTeamId] = useState('')
    const [awayTeamId, setAwayTeamId] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState('')

    const loadData = async () => {
        const [teamsData, seasonsData, gamesData] = await Promise.all([
            getTeams(),
            getSeasons(),
            getGames(),
        ])

        setTeams(teamsData)
        setSeasons(seasonsData)
        setGames(gamesData)
    }

    useEffect(() => {
        const fetchData = async () => {
            await loadData()
        }
        void fetchData()
    }, [])

    const handleCreateGame = async () => {
        setError('')

        if (!seasonId || !homeTeamId || !awayTeamId) {
            setError('Please select season, home team and away team.')
            return
        }

        if (homeTeamId === awayTeamId) {
            setError('Home team and away team must be different.')
            return
        }

        await createGame(seasonId, homeTeamId, awayTeamId)

        setSeasonId('')
        setHomeTeamId('')
        setAwayTeamId('')
        setShowForm(false)

        await loadData()
    }

    const getTeamName = (teamId: string) => {
        return teams.find((team) => team.id === teamId)?.name || 'Unknown team'
    }

    const getSeasonName = (selectedSeasonId: string) => {
        return seasons.find((season) => season.id === selectedSeasonId)?.name || 'Unknown season'
    }

    return (
        <div>
            <PageHeader
                title='Games'
                subtitle='Track and manage your matches'
            />

            <SectionCard
                title='Games'
                actionLabel='New game'
                onAction={() => setShowForm(!showForm)}
            >
                {showForm && (
                    <div className='form-row'>
                        <select
                            className='form-select'
                            value={seasonId}
                            onChange={(event) => setSeasonId(event.target.value)}
                        >
                            <option value=''>Select season</option>
                            {seasons.map((season) => (
                                <option key={season.id} value={season.id}>
                                    {season.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className='form-select'
                            value={homeTeamId}
                            onChange={(event) => setHomeTeamId(event.target.value)}
                        >
                            <option value=''>Home team</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className='form-select'
                            value={awayTeamId}
                            onChange={(event) => setAwayTeamId(event.target.value)}
                        >
                            <option value=''>Away team</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>

                        <button
                            className='primary-button'
                            onClick={handleCreateGame}
                        >
                            Create game
                        </button>
                    </div>
                )}

                {error && <p>{error}</p>}

                {games.length === 0 ? (
                    <p>No games recorded yet.</p>
                ) : (
                    <div className='data-list'>
                        {games.map((game) => (
                            <div className='data-list__item' key={game.id}>
                                <strong>
                                    {getTeamName(game.home_team_id)} vs {getTeamName(game.away_team_id)}
                                </strong>
                                <span>
                                    Season: {getSeasonName(game.season_id)}
                                </span>
                                <span>
                                    Status: {game.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    )
}

export default GamesPage