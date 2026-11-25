import {useState} from 'react'
import type {MatchCardData} from '../../types/chat'
import './MatchCard.css'

interface ExtendedMatchCardData extends MatchCardData {
    gameId?: string
    homeBadgeUrl?: string
    awayBadgeUrl?: string
    topPlayers?: Array<{ name: string; points: number }>
}

interface MatchCardProps {
    data: ExtendedMatchCardData
    onNavigateToAnalytics?: (gameId: string) => void
}

const getTeamInitials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || 'TM'

const MatchTeamBadge = ({name, badgeUrl}: {name: string; badgeUrl?: string}) => {
    const [imgError, setImgError] = useState(false)

    if (badgeUrl && !imgError) {
        return (
            <img
                src={badgeUrl}
                alt={name}
                className='chat-match-team-badge'
                onError={() => setImgError(true)}
            />
        )
    }

    return (
        <span className='chat-match-team-badge chat-match-team-badge--fallback' aria-hidden='true'>
            {getTeamInitials(name)}
        </span>
    )
}

export const MatchCard = ({data, onNavigateToAnalytics}: MatchCardProps) => {
    return (
        <div className='chat-match-card'>
            <div className='chat-match-header'>
                <span className='chat-match-title'>Resumen del Partido</span>
                {data.date && <span className='chat-match-date'>{data.date}</span>}
            </div>
            <div className='chat-match-body'>
                <div className='chat-match-team'>
                    <div className='chat-match-team-identity'>
                        <MatchTeamBadge name={data.homeTeam} badgeUrl={data.homeBadgeUrl} />
                        <span className='chat-match-team-name'>{data.homeTeam}</span>
                    </div>
                    <strong className='chat-match-team-score'>{data.homeScore}</strong>
                </div>
                <div className='chat-match-vs'>VS</div>
                <div className='chat-match-team chat-match-team-right'>
                    <div className='chat-match-team-identity chat-match-team-identity--right'>
                        <span className='chat-match-team-name'>{data.awayTeam}</span>
                        <MatchTeamBadge name={data.awayTeam} badgeUrl={data.awayBadgeUrl} />
                    </div>
                    <strong className='chat-match-team-score'>{data.awayScore}</strong>
                </div>
            </div>

            {data.topPlayers && data.topPlayers.length > 0 && (
                <div className='chat-match-details-section'>
                    <span className='chat-match-details-title'>Plantel / Destacados:</span>
                    <ul className='chat-match-players-list'>
                        {data.topPlayers.map((player, index) => (
                            <li key={index} className='chat-match-player-item'>
                                <span>{player.name}</span>
                                <strong>{player.points} pts</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className='chat-match-actions'>
                {data.gameId && onNavigateToAnalytics && (
                    <button
                        className='chat-match-analytics-btn'
                        onClick={() => onNavigateToAnalytics(data.gameId!)}
                    >
                        Ver analíticas 📊
                    </button>
                )}
            </div>
        </div>
    )
}