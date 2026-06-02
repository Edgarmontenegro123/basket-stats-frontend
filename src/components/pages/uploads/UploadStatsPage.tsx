import {useState, useEffect} from 'react'
import PageHeader from '../../common/PageHeader'
import SectionCard from '../../common/SectionCard'
import type {PlayerStats} from '../../types/player'
import type {Game} from '../../types/game'
import type {TeamStat} from '../../types/analytics'
import BasketballLoader from '../../common/BasketballLoader'
import { normaliseText } from '../../helpers/normaliseText'
import {
    uploadStats,
    processStats,
    getPlayerStats,
    getGames,
    getTeamStatsByGameId,
    completeGame,
} from '../../services/api'
import './UploadStatsPage.css'
import '../../common/PageLayout.css'


const UploadStatsPage = () => {
    const [file, setFile] = useState<File | null>(null)
    const [players, setPlayers] = useState<PlayerStats[]>([])
    const [games, setGames] = useState<Game[]>([])
    const [selectedGameId, setSelectedGameId] = useState('')
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [isLoadingUploads, setIsLoadingUploads] = useState(true)


    useEffect(() => {
        const fetchGames = async () => {
            try {
                const data = await getGames();
                setGames(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingUploads(false)
            }
        };

        void fetchGames();
    }, []);

    const handleUpload = async () => {
        if (!file) {
            setErrorMessage('Please select a file');
            return;
        }

        if (!selectedGameId) {
            setErrorMessage('Select a game first');
            return;
        }

        try {
            setIsProcessing(true);
            setPlayers([]);
            setErrorMessage('');

            await new Promise((resolve) => setTimeout(resolve, 3000));

            // 1. Subir pdf
            const upload = await uploadStats(selectedGameId, file);

            // 2. Procesar
            await processStats(upload.id);

            // 3. Obtener stats
            const [playersData, teamStats] = await Promise.all([
                getPlayerStats(selectedGameId),
                getTeamStatsByGameId(selectedGameId),
            ]) as [PlayerStats[], TeamStat[]];

            const selectedGame = games.find((game) => game.id === selectedGameId)

            if (!selectedGame) {
                setErrorMessage('Selected game not found.')
                return
            }

            const homeTeamStat = teamStats.find(
                (team) =>
                    normaliseText(team.team_name) ===
                    normaliseText(selectedGame.home_team_name),
            )

            const awayTeamStat = teamStats.find(
                (team) =>
                    normaliseText(team.team_name) ===
                    normaliseText(selectedGame.away_team_name),
            )

            if (!homeTeamStat || !awayTeamStat) {
                setErrorMessage('Could not match processed team stats with selected game teams.')
                return
            }

            await completeGame(
                selectedGame.id,
                selectedGame.season_id,
                selectedGame.home_team_id,
                selectedGame.away_team_id,
                homeTeamStat.points,
                awayTeamStat.points,
            )

            setPlayers(playersData);
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setErrorMessage(error.message);
                return;
            }

            setErrorMessage('Error processing file');
        } finally {
            setIsProcessing(false);
        }
    }

    if (isLoadingUploads) {
        return (
            <div className='loading-overlay'>
                <div className='loading-box'>
                    <BasketballLoader />
                    <p>Loading Uploads...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {isProcessing && (
                <div className='loading-overlay'>
                    <div className='loading-box'>
                        <BasketballLoader/>
                        <p>Processing...</p>
                    </div>
                </div>
            )}
            <PageHeader
                title='Upload Stats'
                subtitle='Upload match statistics files'
            />

            <SectionCard title='Upload File'>
                <div className='form-group'>
                    <div className='form-row'>
                        <select
                            className='form-select'
                            value={selectedGameId}
                            onChange={(e) => setSelectedGameId(e.target.value)}
                        >
                            <option value=''>Select Game</option>

                            {games.map((game) => (
                                <option key={game.id} value={game.id}>
                                    {game.home_team_name} vs {game.away_team_name} - {new Date(game.game_date).toLocaleDateString()}
                                </option>
                            ))}
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
                        disabled={isProcessing || !file || !selectedGameId}

                    >Upload & Process</button>
                    {errorMessage && (
                        <div className='error-message'>
                            <strong>Error: </strong> {errorMessage}
                        </div>
                    )}
                </div>

            </SectionCard>

            {players.length > 0 && (
                <SectionCard title='Player Stats'>
                    <div className='table-wrapper upload-table-wrapper'>
                        <table className='data-table'>
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Team</th>
                                    <th>PTS</th>
                                    <th>REB</th>
                                    <th>AST</th>
                                    <th>MIN</th>
                                    <th>TOV</th>
                                    <th>STL</th>
                                    <th>BLK</th>
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
                                    <td>{player.minutes}</td>
                                    <td>{player.turnovers}</td>
                                    <td>{player.steals}</td>
                                    <td>{player.blocks}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='upload-mobile-list'>
                        {players.map((player, index) => (
                            <div key={index} className='upload-mobile-card'>
                                <h3>{player.player_name}</h3>
                                <p className='upload-mobile-subtitle'>{player.team_name}</p>

                                <div className='upload-mobile-stats-grid'>
                                    <p><span>PTS</span><strong>{player.points}</strong></p>
                                    <p><span>REB</span><strong>{player.rebounds}</strong></p>
                                    <p><span>AST</span><strong>{player.assists}</strong></p>
                                    <p><span>MIN</span><strong>{player.minutes}</strong></p>
                                    <p><span>TOV</span><strong>{player.turnovers}</strong></p>
                                    <p><span>STL</span><strong>{player.steals}</strong></p>
                                    <p><span>BLK</span><strong>{player.blocks}</strong></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}
        </div>
    )
}

export default UploadStatsPage