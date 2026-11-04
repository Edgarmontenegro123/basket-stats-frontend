import './CompareCard.css'

interface CompareCardProps {
    data: {
        player1: { name: string; team: string; points: number }
        player2: { name: string; team: string; points: number }
    }
}

export const CompareCard = ({ data }: CompareCardProps) => {
    return (
        <div className='chat-compare-card'>
            <div className='chat-compare-header'>
                <span className='chat-compare-title'>Comparación de Jugadores</span>
            </div>
            <div className='chat-compare-body'>
                <div className='chat-compare-player'>
                    <span className='chat-compare-name'>{data.player1.name}</span>
                    <span className='chat-compare-team'>{data.player1.team}</span>
                    <strong className='chat-compare-points'>{data.player1.points} pts</strong>
                </div>
                <div className='chat-compare-vs'>VS</div>
                <div className='chat-compare-player'>
                    <span className='chat-compare-name'>{data.player2.name}</span>
                    <span className='chat-compare-team'>{data.player2.team}</span>
                    <strong className='chat-compare-points'>{data.player2.points} pts</strong>
                </div>
            </div>
        </div>
    )
}