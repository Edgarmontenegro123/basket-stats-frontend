import { useState } from 'react'
import type { Team } from '../types/team'
import './TeamModal.css'

type TeamModalProps = {
    isOpen: boolean
    teamToEdit?: Team | null
    onClose: () => void
    onSubmit: (name: string) => Promise<void>
}

const TeamModal = ({
                       isOpen,
                       teamToEdit,
                       onClose,
                       onSubmit,
                   }: TeamModalProps) => {
    const [teamName, setTeamName] = useState(teamToEdit?.name ?? '')

    if (!isOpen) return null

    const handleSubmit = async () => {
        if (!teamName.trim()) return

        await onSubmit(teamName.trim())
        setTeamName('')
        onClose()
    }

    return (
        <div className='modal-backdrop'>
            <div className='modal'>
                <div className='modal__header'>
                    <h2>{teamToEdit ? 'Edit team' : 'Create team'}</h2>
                    <button type='button' className='modal__close' onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className='modal__content'>
                    <input
                        className='form-input'
                        placeholder='Team name'
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                    />
                </div>

                <div className='modal__actions'>
                    <button type='button' className='secondary-button' onClick={onClose}>
                        Cancel
                    </button>

                    <button type='button' className='primary-button' onClick={handleSubmit}>
                        {teamToEdit ? 'Save changes' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TeamModal