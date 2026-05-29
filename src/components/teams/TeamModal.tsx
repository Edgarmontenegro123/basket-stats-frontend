import { useState } from 'react'
import type { Team, CreateTeamPayload } from '../types/team'
import './TeamModal.css'

type TeamModalProps = {
    isOpen: boolean
    teamToEdit?: Team | null
    onClose: () => void
    onSubmit: (payload: CreateTeamPayload) => Promise<void>
}

const TeamModal = ({
                       isOpen,
                       teamToEdit,
                       onClose,
                       onSubmit,
                   }: TeamModalProps) => {
    const [teamName, setTeamName] = useState(teamToEdit?.name ?? '')
    const [logoUrl, setLogoUrl] = useState(teamToEdit?.logo_url ?? '')

    if (!isOpen) return null

    const handleSubmit = async () => {
        if (!teamName.trim()) return

        await onSubmit({
            name: teamName.trim(),
            logo_url: logoUrl.trim()
        })

        setTeamName('')
        setLogoUrl('')
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
                    <input
                        className='form-input'
                        placeholder='Logo URL'
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
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