import type {CompareCardProps} from '../../types/compare'
import './CompareCard.css'

export const CompareCard = ({data, onNavigateToAnalytics}: CompareCardProps) => {
    const handleAnalyticsClick = () => {
        if (!onNavigateToAnalytics) return

        const playerIds = [data.player1.id, data.player2.id].filter(
            (id): id is string => Boolean(id && id.trim() !== '')
        )

        onNavigateToAnalytics(data.gameId, playerIds.length > 0 ? playerIds : undefined)
    }

    return (
        <div className='chat-compare-card'>
            <div className='chat-compare-header'>
                <span className='chat-compare-title'>Comparación de Jugadores</span>
            </div>
            <div className='chat-compare-body'>
                <div className='chat-compare-player'>
                    <span className='chat-compare-name'>{data.player1.name}</span>
                    <span className='chat-compare-team'>{data.player1.team}</span>
                </div>
                <div className='chat-compare-vs'>VS</div>
                <div className='chat-compare-player'>
                    <span className='chat-compare-name'>{data.player2.name}</span>
                    <span className='chat-compare-team'>{data.player2.team}</span>
                </div>
            </div>

            <div className='chat-compare-stats-table'>
                <div className='chat-stat-row'>
                    <span>{data.player1.points}</span>
                    <strong>PTS</strong>
                    <span>{data.player2.points}</span>
                </div>
                <div className='chat-stat-row'>
                    <span>{data.player1.rebounds ?? 0}</span>
                    <strong>REB</strong>
                    <span>{data.player2.rebounds ?? 0}</span>
                </div>
                <div className='chat-stat-row'>
                    <span>{data.player1.assists ?? 0}</span>
                    <strong>AST</strong>
                    <span>{data.player2.assists ?? 0}</span>
                </div>
                <div className='chat-stat-row'>
                    <span>{data.player1.steals ?? 0}</span>
                    <strong>STL</strong>
                    <span>{data.player2.steals ?? 0}</span>
                </div>
            </div>

            {onNavigateToAnalytics && (
                <div className='chat-match-actions'>
                    <button
                        type='button'
                        className='chat-match-analytics-btn'
                        onClick={handleAnalyticsClick}
                    >
                        Ver analíticas 📊
                    </button>
                </div>
            )}
        </div>
    )
}