import { useEffect, useState } from 'react'
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import type { PlayerStats } from '../types/player'
import { getPlayerRankings } from '../services/api'
import './RankingsPage.css'
import '../common/PageLayout.css'

const RankingsPage = () => {
    const [players, setPlayers] = useState<PlayerStats[]>([])
    const [selectedStat, setSelectedStat] = useState<
        'points' |
        'rebounds' |
        'assists' |
        'steals' |
        'blocks'
    >('points')

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const data = await getPlayerRankings(
                    selectedStat,
                )

                setPlayers(data)
            } catch (error) {
                console.error(error)
            }
        }

        void fetchRankings()
    }, [selectedStat])

    return (
        <div>
            <PageHeader
                title='Rankings'
                subtitle='Top performers and statistics leaders'
            />

            <SectionCard title='Rankings'>
                <div className='rankings-tabs'>
                    <button
                        className={
                            selectedStat === 'points'
                                ? 'rankings-tab rankings-tab--active'
                                : 'rankings-tab'
                        }
                        onClick={() => setSelectedStat('points')}
                    >
                        Points
                    </button>

                    <button
                        className={
                            selectedStat === 'rebounds'
                                ? 'rankings-tab rankings-tab--active'
                                : 'rankings-tab'
                        }
                        onClick={() => setSelectedStat('rebounds')}
                    >
                        Rebounds
                    </button>

                    <button
                        className={
                            selectedStat === 'assists'
                                ? 'rankings-tab rankings-tab--active'
                                : 'rankings-tab'
                        }
                        onClick={() => setSelectedStat('assists')}
                    >
                        Assists
                    </button>

                    <button
                        className={
                            selectedStat === 'steals'
                                ? 'rankings-tab rankings-tab--active'
                                : 'rankings-tab'
                        }
                        onClick={() => setSelectedStat('steals')}
                    >
                        Steals
                    </button>

                    <button
                        className={
                            selectedStat === 'blocks'
                                ? 'rankings-tab rankings-tab--active'
                                : 'rankings-tab'
                        }
                        onClick={() => setSelectedStat('blocks')}
                    >
                        Blocks
                    </button>
                </div>

                <div className='table-wrapper'>
                    <table className='data-table'>
                        <thead>
                        <tr>
                            <th>Player</th>
                            <th>Team</th>
                            <th>{selectedStat.toUpperCase()}</th>
                        </tr>
                        </thead>

                        <tbody>
                        {players.map((player) => (
                            <tr key={player.id}>
                                <td>{player.player_name}</td>
                                <td>{player.team_name}</td>

                                <td>
                                    {player[selectedStat]}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    )
}

export default RankingsPage