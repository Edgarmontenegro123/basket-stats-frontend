import {useState} from 'react'
import type {PlayerCardProps} from '../../types/chat'
import './PlayerCard.css'

const getInitials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || '?'

export const PlayerCard = ({data, onNavigateToPlayer}: PlayerCardProps) => {
    const [photoError, setPhotoError] = useState(false)
    const [badgeError, setBadgeError] = useState(false)

    return (
        <div className='chat-player-card'>
            <div className='chat-player-header'>
                {data.photoUrl && !photoError ? (
                    <img
                        src={data.photoUrl}
                        alt={data.name}
                        className='chat-player-badge'
                        onError={() => setPhotoError(true)}
                    />
                ) : (
                    <div className='chat-player-badge-placeholder'>
                        {getInitials(data.name)}
                    </div>
                )}
                <div className='chat-player-info'>
                    <h4 className='chat-player-name'>
                        {data.name}
                        {data.number !== undefined ? ` · #${data.number}` : ''}
                    </h4>
                    <div className='chat-player-team-row'>
                        {data.teamBadgeUrl && !badgeError && (
                            <img
                                src={data.teamBadgeUrl}
                                alt={data.team}
                                className='chat-team-badge'
                                onError={() => setBadgeError(true)}
                            />
                        )}
                        <span className='chat-player-team-text'>{data.team || 'Unknown team'}</span>
                    </div>
                </div>
            </div>

            <div className='chat-player-stats-grid'>
                <div className='chat-player-stat-box'>
                    <span className='chat-player-stat-label'>PTS</span>
                    <strong className='chat-player-stat-value'>{data.points}</strong>
                </div>
                <div className='chat-player-stat-box'>
                    <span className='chat-player-stat-label'>REB</span>
                    <strong className='chat-player-stat-value'>{data.rebounds}</strong>
                </div>
                <div className='chat-player-stat-box'>
                    <span className='chat-player-stat-label'>AST</span>
                    <strong className='chat-player-stat-value'>{data.assists}</strong>
                </div>
                <div className='chat-player-stat-box'>
                    <span className='chat-player-stat-label'>STL</span>
                    <strong className='chat-player-stat-value'>{data.steals}</strong>
                </div>
            </div>

            {data.id && onNavigateToPlayer && (
                <div className='chat-match-actions'>
                    <button
                        type='button'
                        className='chat-match-analytics-btn'
                        onClick={() => onNavigateToPlayer(data.id!)}
                    >
                        Ver perfil completo 👤
                    </button>
                </div>
            )}
        </div>
    )
}