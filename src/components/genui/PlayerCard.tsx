import type {PlayerCardData} from '../../types/chat'
import './PlayerCard.css'

interface ExtendedPlayerCardData extends PlayerCardData {
    teamBadgeUrl?: string
    photoUrl?: string
}

interface PlayerCardProps {
    data: ExtendedPlayerCardData
}

export const PlayerCard = ({data}: PlayerCardProps) => {
    return (
        <div className='chat-player-card'>
            <div className='chat-player-header'>
                {data.photoUrl ? (
                    <img src={data.photoUrl} alt={data.name} className='chat-player-badge' />
                ) : (
                    <div className='chat-player-badge-placeholder'>
                        {data.name.charAt(0)}
                    </div>
                )}
                <div className='chat-player-info'>
                    <h4 className='chat-player-name'>{data.name}</h4>
                    <div className='chat-player-team-row'>
                        {data.teamBadgeUrl && (
                            <img src={data.teamBadgeUrl} alt={data.team} className='chat-team-badge' />
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
        </div>
    )
}