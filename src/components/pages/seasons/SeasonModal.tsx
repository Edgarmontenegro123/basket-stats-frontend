import { useState } from 'react'
import type { Team } from '../../types/team.ts'
import type { Season } from '../../types/season.ts'
import './SeasonModal.css'

type SeasonModalProps = {
    isOpen: boolean
    teams: Team[]
    seasonToEdit?: Season | null
    onClose: () => void
    onSubmit: (teamId: string, name: string) => Promise<void>
}

const SeasonModal = ({
                         isOpen,
                         teams,
                         seasonToEdit,
                         onClose,
                         onSubmit,
                     }: SeasonModalProps) => {
    const [teamId, setTeamId] = useState(seasonToEdit?.team_id ?? '')
    const [seasonName, setSeasonName] = useState(seasonToEdit?.name ?? '')

    if (!isOpen) return null

    const handleSubmit = async () => {
        if (!teamId || !seasonName.trim()) return

        await onSubmit(teamId, seasonName.trim())

        setTeamId('')
        setSeasonName('')
        onClose()
    }

    return (
        <div className='modal-backdrop'>
            <div className='modal'>
                <div className='modal__header'>
                    <h2>{seasonToEdit ? 'Edit season' : 'Create season'}</h2>

                    <button
                        type='button'
                        className='modal__close'
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className='modal__content season-modal__content'>
                    <select
                        className='form-select'
                        value={teamId}
                        onChange={(e) => setTeamId(e.target.value)}
                    >
                        <option value=''>Select Team</option>

                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                    </select>

                    <input
                        className='form-input'
                        placeholder='Season name'
                        value={seasonName}
                        onChange={(e) => setSeasonName(e.target.value)}
                    />
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
                        {seasonToEdit ? 'Save changes' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SeasonModal