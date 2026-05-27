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
        <div>
            <h1>
                {player.first_name} {player.last_name}
            </h1>
            <p>Number: {player.number}</p>
            <p>Position: {player.position || '-'}</p>
            <p>Height: {player.height_cm || '-'} cm</p>
            <p>Weight: {player.weight_kg || '-'} kg</p>
        </div>
    )
}