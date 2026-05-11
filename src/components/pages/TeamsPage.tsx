import {useEffect, useState} from 'react';
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import '../common/PageLayout.css'

import {getTeams, createTeam} from '../services/api'
import type {Team} from '../types/team'




const TeamsPage = () => {
    const [teams, setTeams] = useState<Team[]>([])
    const [newTeamName, setNewTeamName] = useState('')

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await getTeams()
                setTeams(data)
            } catch (error) {
                console.error(error)
            }
        }

        void fetchTeams()
    }, []);

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) return;

        const exists = teams.some(
            (team) => team.name.toLowerCase() === newTeamName.toLowerCase(),
        );

        if (exists) {
            alert ('Team already exists!');
            return;
        }

        try {
            const newTeam = await createTeam(newTeamName)

            setTeams((prev) => [...prev, newTeam])
            setNewTeamName('')
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div>
            <PageHeader
                title='Teams'
                subtitle='Manage your teams and opponents'
            />

            <SectionCard title='Teams' actionLabel='New team'>
                <div style={{marginBottom: '16px'}}>
                    <input
                        placeholder='Team name'
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                    />
                    <button onClick={handleCreateTeam}>
                        Create
                    </button>
                </div>
                {teams.length === 0 ? (
                    <p>No teams available yet.</p>
                ) : (
                    <ul>
                        {teams.map((team) => (
                            <li key={team.id}>{team.name}</li>
                        ))}
                    </ul>
                )}
            </SectionCard>
        </div>
    )
}

export default TeamsPage