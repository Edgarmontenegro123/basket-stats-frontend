import {useEffect, useState} from 'react'
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import type {Team} from '../types/team'
import {getTeams} from '../services/api'
import '../common/PageLayout.css'

const ComparePage = () => {
    const [teams, setTeams] = useState<Team[]>([])
    const [teamAId, setTeamAId] = useState('')
    const [teamBId, setTeamBId] = useState('')

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await getTeams()
                setTeams(data)

                if (data.length > 0) {
                    setTeamAId(data[0].id)
                }

                if (data.length > 1) {
                    setTeamBId(data[1].id)
                }
            } catch (error) {
                console.error(error)
            }
        }

        void fetchTeams()
    }, []);

    return (
        <div>
            <PageHeader
                title='Compare Teams'
                subtitle='Compare statistics between teams'
            />

            <SectionCard title='Comparison'>
                <div className='form-row'>
                    <div className='form-group'>
                        <label>Team A</label>
                        <select
                            className='form-select'
                            value={teamAId}
                            onChange={(event) => setTeamAId(event.target.value)}
                        >
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='form-group'>
                        <label>Team B</label>
                        <select
                            className='form-select'
                            value={teamBId}
                            onChange={(event) => setTeamBId(event.target.value)}
                        >
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </SectionCard>
        </div>
    )
}

export default ComparePage