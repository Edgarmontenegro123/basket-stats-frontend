import { useState } from 'react'
import type { Team, CreateTeamPayload } from '../types/team'
import './TeamModal.css'

type TeamModalProps = {
    isOpen: boolean
    teamToEdit?: Team | null
    onClose: () => void
    onSubmit: (payload: CreateTeamPayload) => Promise<void>
}

const isValidUrl = (value: string) => {
    if (!value.trim()) return true

    try {
        new URL(value)
        return true
    } catch {
        return false
    }
}

const TeamModal = ({
                       isOpen,
                       teamToEdit,
                       onClose,
                       onSubmit,
                   }: TeamModalProps) => {
    const [teamName, setTeamName] = useState(teamToEdit?.name ?? '')
    const [logoUrl, setLogoUrl] = useState(teamToEdit?.logo_url ?? '')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async () => {
        const trimmedName = teamName.trim()
        const trimmedLogoUrl = logoUrl.trim()

        if (trimmedName.length < 2) {
            setError('Team name must contain at least 2 characters')
            return
        }
        if (trimmedName.length > 30) {
            setError('Team name must contain a maximum of 30 characters')
            return
        }
        if (!isValidUrl(trimmedLogoUrl)) {
            setError('Logo URL must be valid')
            return
        }

        setError('')

        await onSubmit({
            name: trimmedName,
            logo_url: trimmedLogoUrl,
        })

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
                    {error && <p className='form-error'>{error}</p>}
                    <input
                        className='form-input'
                        placeholder='Team name'
                        value={teamName}
                        onChange={(e) => {
                            setTeamName(e.target.value)
                            setError('')
                    }}
                    />
                    <input
                        className='form-input'
                        placeholder='Logo URL'
                        value={logoUrl}
                        onChange={(e) => {
                            setLogoUrl(e.target.value)
                            setError('')
                        }}
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