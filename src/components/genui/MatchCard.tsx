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

            {/* Acciones directas visibles sin ocultar detrás de desplegables */}
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