import {useState, useEffect} from 'react';
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import '../common/PageLayout.css'
import type {PlayerStats} from '../types/player';

import {
    createGame,
    uploadStats,
    processStats,
    getPlayerStats,
    getTeams,
    getSeasons,
} from '../services/api.ts';

const UploadStatsPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [players, setPlayers] = useState<PlayerStats[]>([]);

    const [seasonId, setSeasonId] = useState('');
    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [teams, setTeams] = useState<{id: string; name: string} []>([]);
    const [seasons, setSeasons] = useState<{id: string; name: string} []>([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await getTeams();
                setTeams(data);
            } catch (error) {
                console.error(error);
            }
        };

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
        };

        void fetchSeasons();
    }, []);

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file');
            return;
        }

        if (!seasonId || !homeTeamId || !awayTeamId) {
            alert('Complete all IDs');
            return;
        }

        try {
            // 1. Crear game
            const game = await createGame(seasonId, homeTeamId, awayTeamId);

            // 2. Subir pdf
            const upload = await uploadStats(game.id, file);

            // 3. Procesar
            await processStats(upload.id);

            // 4. Obtener stats
            const playersData = await getPlayerStats(game.id);

            setPlayers(playersData);
        } catch (error) {
            console.error(error);
            alert('Error processing file')
        }
    }

    return (
        <div>
            <PageHeader
                title='Upload Stats'
                subtitle='Upload match statistics files'
            />

            <SectionCard title='Upload File'>
                <div className='form-group'>
                    <div className='form-row'>
                        <select
                            className='form-select'
                            value={seasonId}
                            onChange={(e) => setSeasonId(e.target.value)}
                        >
                            <option value=''>Select Season</option>

                            {seasons.map(season => (
                                <option key={season.id} value={season.id}>
                                    {season.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className='form-select'
                            value={homeTeamId}
                            onChange={(e) => setHomeTeamId(e.target.value)}
                        >
                            <option value=''>Select Home Team</option>

                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className='form-select'
                            value={awayTeamId}
                            onChange={(e) => setAwayTeamId(e.target.value)}
                        >
                            <option value=''>Select Away Team</option>

                            {teams
                                .filter((team) => team.id !== homeTeamId)
                                .map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div className='file-upload'>
                        <input
                            type='file'
                            accept='.pdf'
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                            />
                    </div>

                    <button
                        className='primary-button'
                        onClick={handleUpload}
                        disabled={!file || !seasonId || !homeTeamId || !awayTeamId}

                    >Upload & Process</button>
                </div>

            </SectionCard>

            {players.length > 0 && (
                <SectionCard title='Player Stats'>
                    <table className='data-table'>
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Team</th>
                                <th>PTS</th>
                                <th>REB</th>
                                <th>AST</th>
                            </tr>
                        </thead>
                        <tbody>
                        {players.map((player, index) => (
                            <tr key={index}>
                                <td>{player.player_name}</td>
                                <td>{player.team_name}</td>
                                <td>{player.points}</td>
                                <td>{player.rebounds}</td>
                                <td>{player.assists}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </SectionCard>
            )}
        </div>
    )
}

export default UploadStatsPage