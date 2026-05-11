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
    const [file, setFile] = useState<File | null>(null);
    const [players, setPlayers] = useState<PlayerStats[]>([]);

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file');
            return;
        }

        try {
            // 1. Crear game
            const game = await createGame();

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