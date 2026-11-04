import {useState} from 'react'
import type {MatchCardData} from '../../types/chat'
import './MatchCard.css'

interface MatchCardProps {
    data: MatchCardData & {
        gameId?: string
        topPlayers?: Array<{ name: string; points: number }>
    }
    onNavigateToAnalytics?: (gameId: string) => void
}

export const MatchCard = ({data, onNavigateToAnalytics}: MatchCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className='chat-match-card'>
            <div className='chat-match-header'>
                <span className='chat-match-title'>Resumen del Partido</span>
                {data.date && <span className='chat-match-date'>{data.date}</span>}
            </div>
            <div className='chat-match-body'>
                <div className='chat-match-team'>
                    <span className='chat-match-team-name'>{data.homeTeam}</span>
                    <strong className='chat-match-team-score'>{data.homeScore}</strong>
                </div>
                <div className='chat-match-vs'>VS</div>
                <div className='chat-match-team chat-match-team-right'>
                    <strong className='chat-match-team-score'>{data.awayScore}</strong>
                    <span className='chat-match-team-name'>{data.awayTeam}</span>
                </div>
            </div>

            {data.topPlayers && data.topPlayers.length > 0 && (
                <div className='chat-match-expand-section'>
                    <button
                        className='chat-match-toggle-btn'
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Ocultar detalles ▲' : 'Ver más detalles ▼'}
                    </button>

                    {isExpanded && (
                        <div className='chat-match-details'>
                            <span className='chat-match-details-title'>Plantel / Destacados:</span>
                            <ul className='chat-match-players-list'>
                                {data.topPlayers.map((player, index) => (
                                    <li key={index} className='chat-match-player-item'>
                                        <span>{player.name}</span>
                                        <strong>{player.points} pts</strong>
                                    </li>
                                ))}
                            </ul>

                            {/* Botón requerido para ir a la vista Analytics con el gameId */}
                            {data.gameId && onNavigateToAnalytics && (
                                <button
                                    className='chat-match-analytics-btn'
                                    onClick={() => onNavigateToAnalytics(data.gameId!)}
                                >
                                    Ver estadísticas completas en Analytics 📊
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}