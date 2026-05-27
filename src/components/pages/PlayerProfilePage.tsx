import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {getPlayerById} from '../services/api'
import type {Player} from '../types/player'

export const PlayerProfilePage = () => {
    const {id} = useParams()
    const [player, setPlayer] = useState<Player | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchPlayer = async () => {
            if (!id) {
                return
            }

            try {
                setIsLoading(true)
                setError('')

                const playerData = await getPlayerById(id)
                setPlayer(playerData)
            } catch {
                setError('Could not load player.')
            } finally {
                setIsLoading(false)
            }
        }

        void fetchPlayer()
    }, [id])

    if (isLoading) {
        return (
            <div className='loading-overlay'>
                <div className='loading-box'>
                    <div className='loading-spinner' />
                    <p>Loading player...</p>
                </div>
            </div>
        )
    }

    if (error || !player) {
        return <p>{error || 'Player not found.'}</p>
    }

    return (
        <div className='player-profile-page'>
            <section className='player-profile-card'>
                {player.photo_url ? (
                    <img
                        src={player.photo_url}
                        alt={player.first_name}
                        className='player-profile-avatar'
                    />
                ) : (
                    <div className='player-profile-avatar-placeholder'>
                        {player.first_name.charAt(0)}
                    </div>
                )}

                <div>
                    <h1>
                        {player.first_name} {player.last_name}
                    </h1>

                    <div className='player-profile-info'>
                        <p>Number: {player.number}</p>
                        <p>Position: {player.position || '-'}</p>
                        <p>Height: {player.height_cm ? `${player.height_cm} cm` : '-'}</p>
                        <p>Weight: {player.weight_kg ? `${player.weight_kg} kg` : '-'}</p>
                        <p>Birth date: {player.birth_date || '-'}</p>
                    </div>
                </div>
            </section>
        </div>
    )
}