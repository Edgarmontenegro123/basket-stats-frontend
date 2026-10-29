import type {PlayerCardData} from '../../types/chat'

interface PlayerCardProps {
    data: PlayerCardData
}

export const PlayerCard = ({data}: PlayerCardProps) => {
    return (
        <div className='bg-slate-900 border border-slate-700 rounded-xl p-4 my-2 text-slate-100 shadow-md max-w-sm'>
            <div className='flex items-center justify-between border-b border-slate-800 pb-2 mb-3'>
                <div>
                    <h4 className='font-bold text-lg text-amber-400'>{data.name}</h4>
                    {data.team && <span className='text-xs text-slate-400'>{data.team}</span>}
                </div>
                <span className='bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded font-medium'>
                    Player Summary
                </span>
            </div>

            <div className='grid grid-cols-4 gap-2 text-center'>
                <div className='bg-slate-800/60 p-2 rounded-lg'>
                    <span className='block text-xs text-slate-400'>PTS</span>
                    <span className='font-bold text-base text-white'>{data.points}</span>
                </div>
                <div className='bg-slate-800/60 p-2 rounded-lg'>
                    <span className='block text-xs text-slate-400'>REB</span>
                    <span className='font-bold text-base text-white'>{data.rebounds}</span>
                </div>
                <div className='bg-slate-800/60 p-2 rounded-lg'>
                    <span className='block text-xs text-slate-400'>AST</span>
                    <span className='font-bold text-base text-white'>{data.assists}</span>
                </div>
                <div className='bg-slate-800/60 p-2 rounded-lg'>
                    <span className='block text-xs text-slate-400'>STL</span>
                    <span className='font-bold text-base text-white'>{data.steals}</span>
                </div>
            </div>
        </div>
    )
}