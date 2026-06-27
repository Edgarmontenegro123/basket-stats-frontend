import {
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'
import type {GamesStatusChartProps} from '../types/chart'

const GamesStatusChart = ({
                              completed,
                              scheduled,
                          }: GamesStatusChartProps) => {
    const chartData = [
        {
            name: 'Completed',
            value: completed,
            fill: 'var(--chart-success)',
        },
        {
            name: 'Scheduled',
            value: scheduled,
            fill: 'var(--chart-warning)',
        },
    ]

    const totalGames = completed + scheduled

    if (totalGames === 0) {
        return (
            <p>No games available yet.</p>
        )
    }

    return (
        <div className='games-status-chart'>
            <ResponsiveContainer width='100%' height={260}>
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey='value'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                    />
                    <Tooltip
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
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className='games-status-chart__legend'>
                {chartData.map((item) => (
                    <div
                        key={item.name}
                        className='games-status-chart__legend-item'
                    >
                        <span
                            className='games-status-chart__dot'
                            style={{background: item.fill}}
                        />
                        <span>{item.name}</span>
                        <strong>{item.value}</strong>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GamesStatusChart