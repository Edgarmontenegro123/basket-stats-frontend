import { useState } from 'react'
import type { Team } from '../types/team'
import type { Season } from '../types/season'
import type { Game } from '../types/game'
import './GameModal.css'

type GameModalProps = {
    isOpen: boolean
    teams: Team[]
    seasons: Season[]
    gameToEdit?: Game | null
    onClose: () => void
    onSubmit: (
        seasonId: string,
        homeTeamId: string,
        awayTeamId: string,
        videoUrl: string,
    ) => Promise<void>
}

const GameModal = ({
                       isOpen,
                       teams,
                       seasons,
                       gameToEdit,
                       onClose,
                       onSubmit,
                   }: GameModalProps) => {
    const [seasonId, setSeasonId] = useState(gameToEdit?.season_id ?? '')
    const [homeTeamId, setHomeTeamId] = useState(gameToEdit?.home_team_id ?? '')
    const [awayTeamId, setAwayTeamId] = useState(gameToEdit?.away_team_id ?? '')
    const [videoUrl, setVideoUrl] = useState(gameToEdit?.video_url ?? '')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async () => {
        setError('')

        if (!seasonId || !homeTeamId || !awayTeamId) {
            setError('Please select season, home team and away team.')
            return
        }

        if (homeTeamId === awayTeamId) {
            setError('Home team and away team must be different.')
            return
        }

        await onSubmit(seasonId, homeTeamId, awayTeamId, videoUrl)

        setSeasonId('')
        setHomeTeamId('')
        setAwayTeamId('')
        setVideoUrl('')
        onClose()
    }

    return (
        <div className='modal-backdrop'>
            <div className='modal'>
                <div className='modal__header'>
                    <h2>{gameToEdit ? 'Edit game' : 'Create game'}</h2>

                    <button
                        type='button'
                        className='modal__close'
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className='modal__content game-modal__content'>
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

                    <input
                        className='form-input'
                        type='url'
                        value={videoUrl}
                        onChange={(event) => setVideoUrl(event.target.value)}
                        placeholder='Video URL'
                    />

                    {error && <p className='modal-error'>{error}</p>}
                </div>

                <div className='modal__actions'>
                    <button
                        type='button'
                        className='secondary-button'
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type='button'
                        className='primary-button'
                        onClick={handleSubmit}
                    >
                        {gameToEdit ? 'Save changes' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GameModal