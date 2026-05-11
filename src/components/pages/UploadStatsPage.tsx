import {useState} from 'react';
import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import '../common/PageLayout.css'
import type {PlayerStats} from '../types/player';

import {
    createGame,
    uploadStats,
    processStats,
    getPlayerStats,
} from '../services/api.ts';

const UploadStatsPage = () => {
    const [seasonId, setSeasonId] = useState('');
    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [players, setPlayers] = useState<PlayerStats[]>([]);

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file');
            return;
        }

        try {
            // 1. Crear game
            if (!seasonId || !homeTeamId || !awayTeamId) {
                alert('Complete all IDs');
                return;
            }
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
                <div>
                    <input
                        placeholder='Season ID'
                        value={seasonId}
                        onChange={(e) => setSeasonId(e.target.value)}
                        />

                    <br/><br/>

                    <input
                        placeholder='Home Team ID'
                        value={homeTeamId}
                        onChange={(e) => setHomeTeamId(e.target.value)}
                        />

                    <br/><br/>

                    <input
                        placeholder='Away Team ID'
                        value={awayTeamId}
                        onChange={(e) => setAwayTeamId(e.target.value)}
                    />
                </div>

                <br/>

                <input
                    type='file'
                    accept='.pdf'
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    />

                <br />
                <br />

                <button onClick={handleUpload}>Upload & Process</button>
            </SectionCard>

            {players.length > 0 && (
                <SectionCard title='Player Stats'>
                    <table>
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