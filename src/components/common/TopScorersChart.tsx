import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import type {AggregatedPlayerRanking} from '../types/player'

type TopScorersChartProps = {
    players: AggregatedPlayerRanking[]
}

const TopScorersChart = ({players}: TopScorersChartProps) => {
    const chartData = players.map((player) => ({
        name: player.player_name,
        points: Number(player.total),
        average: Number(player.average),
        games: Number(player.games_played),
    }))

    return (
        <div className='top-scorers-chart'>
            <ResponsiveContainer width='100%' height={300}>
                <BarChart
                    data={chartData}
                    layout='vertical'
                    margin={{
                        top: 8,
                        right: 24,
                        left: 32,
                        bottom: 8,
                    }}
                >
                    <CartesianGrid
                        stroke='var(--chart-grid)'
                        strokeDasharray='3 3'
                        horizontal={false}
                    />
                    <XAxis
                        type='number'
                        tick={{
                            fill: 'var(--chart-muted)',
                            fontSize: 12,
                        }}
                        axisLine={{
                            stroke: 'var(--chart-grid)',
                        }}
                        tickLine={false}
                    />
                    <YAxis
                        type='category'
                        dataKey='name'
                        width={120}
                        tick={{
                            fill: 'var(--chart-text)',
                            fontSize: 12,
                        }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{
                            fill: 'var(--chart-tooltip-cursor)',
                        }}
                        contentStyle={{
                            backgroundColor: 'var(--chart-tooltip-bg)',
                            border: '1px solid var(--chart-grid)',
                            borderRadius: '12px',
                            color: 'var(--chart-text)',
                        }}
                        labelStyle={{
                            color: 'var(--chart-text)',
                            fontWeight: 700,
                        }}
                        formatter={(value, name, props) => {
                            if (name === 'points') {
                                return [
                                    `${value} PTS`,
                                    'Total points',
                                ]
                            }

                            return [
                                value,
                                props.name,
                            ]
                        }}
                    />
                    <Bar
                        dataKey='points'
                        name='points'
                        fill='var(--chart-bar)'
                        radius={[0, 8, 8, 0]}
                        barSize={24}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default TopScorersChart