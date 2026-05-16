import { useEffect, useState } from 'react';
import {
    getGames,
    getPlayerStatsByGameId,
    getTeamStatsByGameId,
} from '../services/api';

type Game = {
    id: string;
    season_id: string;
    home_team_id: string;
    away_team_id: string;
    game_date: string;
    status: string;
};

type PlayerStat = {
    id: string;
    game_id: string;
    team_name: string;
    player_number: string;
    player_name: string;
    points: number;
    rebounds: number;
    assists: number;
    turnovers: number;
    steals: number;
    blocks: number;
};

type TeamStat = {
    id: string;
    game_id: string;
    team_name: string;
    points: number;
    rebounds: number;
    assists: number;
    turnovers: number;
    steals: number;
    blocks: number;
};

const GameAnalyticsPage = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [selectedGameId, setSelectedGameId] = useState('');
    const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
    const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadGames = async () => {
            try {
                const data = await getGames();
                setGames(data);
            } catch (error) {
                console.error(error);
                setError('Error loading games');
            }
        };

        loadGames();
    }, []);

    const handleLoadAnalytics = async () => {
        if (!selectedGameId) {
            setError('Select a game first');
            return;
        }

        try {
            setError('');

            const players = await getPlayerStatsByGameId(selectedGameId);
            const teams = await getTeamStatsByGameId(selectedGameId);

            setPlayerStats(players);
            setTeamStats(teams);
        } catch (error) {
            console.error(error);
            setError('Error loading analytics');
        }
    };

    return (
        <main>
            <h1>Game Analytics</h1>

            {error && <p>{error}</p>}

            <section>
                <label htmlFor="game">Select game</label>

                <select
                    id="game"
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                >
                    <option value="">Select a game</option>

                    {games.map((game) => (
                        <option key={game.id} value={game.id}>
                            {game.game_date} - {game.status}
                        </option>
                    ))}
                </select>

                <button onClick={handleLoadAnalytics}>
                    Load Analytics
                </button>
            </section>

            <section>
                <h2>Team Stats</h2>

                <table>
                    <thead>
                    <tr>
                        <th>Team</th>
                        <th>PTS</th>
                        <th>REB</th>
                        <th>AST</th>
                        <th>TO</th>
                        <th>STL</th>
                        <th>BLK</th>
                    </tr>
                    </thead>

                    <tbody>
                    {teamStats.map((stat) => (
                        <tr key={stat.id}>
                            <td>{stat.team_name}</td>
                            <td>{stat.points}</td>
                            <td>{stat.rebounds}</td>
                            <td>{stat.assists}</td>
                            <td>{stat.turnovers}</td>
                            <td>{stat.steals}</td>
                            <td>{stat.blocks}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>

            <section>
                <h2>Player Stats</h2>

                <table>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>Team</th>
                        <th>PTS</th>
                        <th>REB</th>
                        <th>AST</th>
                        <th>TO</th>
                        <th>STL</th>
                        <th>BLK</th>
                    </tr>
                    </thead>

                    <tbody>
                    {playerStats.map((stat) => (
                        <tr key={stat.id}>
                            <td>{stat.player_number}</td>
                            <td>{stat.player_name}</td>
                            <td>{stat.team_name}</td>
                            <td>{stat.points}</td>
                            <td>{stat.rebounds}</td>
                            <td>{stat.assists}</td>
                            <td>{stat.turnovers}</td>
                            <td>{stat.steals}</td>
                            <td>{stat.blocks}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>
        </main>
    );
};

export default GameAnalyticsPage;