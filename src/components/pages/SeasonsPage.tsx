import {useEffect, useState} from 'react';
import PageHeader from '../common/PageHeader.tsx';
import SectionCard from '../common/SectionCard.tsx';
import '../common/PageLayout.css';

import {getTeams, getSeasons, createSeason} from '../services/api.ts';

type Team = {
    id: string
    name: string
}

type Season = {
    id: string
    name: string
    team_id: string
}

const SeasonsPage = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);

    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [newSeasonName, setNewSeasonName] = useState('');

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await getTeams();
                setTeams(data);
            } catch (error) {
                console.error(error);
            }
        }

        void fetchTeams();
    }, []);

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const data = await getSeasons();
                setSeasons(data);
            } catch (error) {
                console.error(error);
            }
        }

        void fetchSeasons();
    }, []);

    const handleCreateSeason = async () => {
        if (!selectedTeamId || !newSeasonName.trim()) return

        try {
            const newSeason = await createSeason(selectedTeamId, newSeasonName);

            setSeasons((prev) => [...prev, newSeason]);
            setNewSeasonName('');
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <PageHeader title='Seasons'
                        subtitle='Manage seasons by team'
            />

            <SectionCard title='Create Season'>
                <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                    <option value=''>Select Team</option>

                    {
                        teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))
                    }
                </select>
                <br/><br/>

                <input
                    placeholder='Season name'
                    value={newSeasonName}
                    onChange={(e) => setNewSeasonName(e.target.value)}
                    />

                <br/><br/>

                <button onClick={handleCreateSeason}>Create Season</button>
            </SectionCard>

            <SectionCard title='Seasons List'>
                {seasons.length === 0 ? (
                    <p>No seasons available yet.</p>
                ) : (
                    <ul>
                        {seasons.map((season) => {
                            const team = teams.find(t => t.id === season.team_id)

                            return (
                                <li key={season.id}>
                                    {season.name} - {team ? team.name : 'Unknown Team'}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </SectionCard>
        </div>
    )
}

export default SeasonsPage;