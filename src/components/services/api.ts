import type { CreatePlayerPayload, Player } from '../types/player'

const MANAGEMENT_API_URL = import.meta.env.VITE_MANAGEMENT_API_URL;
const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL;


export const createGame = async (
    seasonId: string,
    homeTeamId: string,
    awayTeamId: string,
) => {
    // Go backend connection
    // const res = await fetch('http://localhost:8080/games', {

    // Node backend connection
    const res = await fetch(`${MANAGEMENT_API_URL}/games`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            season_id: seasonId,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            game_date: new Date().toISOString(),
            location: null,
            is_friendly: false,
            home_score: null,
            away_score: null,
            status: 'scheduled',
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
};

export const getGames = async () => {
    // Go backend connection
    // const res = await fetch('http://localhost:8080/games');
    // Node backend connection
    const res = await fetch(`${MANAGEMENT_API_URL}/games`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
}

export const uploadStats = async (gameId: string, file: File) => {
    const formData = new FormData();
    formData.append('game_id', gameId);
    formData.append('file', file);

    // Go backend connection
    // const res = await fetch('http://localhost:8081/uploads', {
    // Node backend connection
    const res = await fetch(`${ANALYTICS_API_URL}/uploads`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
}

export const processStats = async (uploadId: string) => {
    console.log('Processing stats with API:', ANALYTICS_API_URL)
    // Go backend connection
    // const res = await fetch('http://localhost:8081/analytics/process', {
    // Node backend connection
    const res = await fetch(`${ANALYTICS_API_URL}/analytics/process`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({upload_id: uploadId}),
    });

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.error || 'Error processing stats')
    }

    return data;
}

export const getPlayerStats = async (gameId: string) => {
    // Go backend connection
    // const res = await fetch(`http://localhost:8081/analytics/games/${gameId}/players`);
    // Node backend connection
    const res = await fetch(`${ANALYTICS_API_URL}/analytics/games/${gameId}/players`);

    return res.json();
}

export const getPlayerById = async (id: string) => {
    const res = await fetch(`${MANAGEMENT_API_URL}/players/${id}`)

    if (!res.ok) {
        throw new Error('Could not fetch player')
    }

    return res.json()
}

export const getTeams = async () => {
    // Go backend connection
    // const res = await fetch('http://localhost:8080/teams');
    // Node backend connection
    const res = await fetch(`${MANAGEMENT_API_URL}/teams`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
}

export const createSeason = async (
    teamId: string,
    name: string,
)=> {
    // Go backend connection
    // const res = await fetch('http://localhost:8080/seasons', {
    // Node backend connection
    const res = await fetch(`${MANAGEMENT_API_URL}/seasons`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            team_id: teamId,
            name,
            year: new Date().getFullYear(),
            start_date: '2026-01-01',
            end_date: '2026-12-31',
            is_active: true,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
}

export const getSeasons = async () => {
    // Go backend connection
    // const res = await fetch('http://localhost:8080/seasons');
    // Node backend connection
    const res = await fetch(`${MANAGEMENT_API_URL}/seasons`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
}

export const updateSeason = async (
    id: string,
    teamId: string,
    name: string,
) => {
    const res = await fetch(`${MANAGEMENT_API_URL}/seasons/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            team_id: teamId,
            name,
            year: new Date().getFullYear(),
            start_date: '2026-01-01',
            end_date: '2026-12-31',
            is_active: true,
        }),
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
    }

    return res.json()
}

export const deleteSeason = async (id: string) => {
    const res = await fetch(`${MANAGEMENT_API_URL}/seasons/${id}`, {
        method: 'DELETE',
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
    }
}

export const createTeam = async (name: string) => {
    const shortName = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);

    // Go backend connection
    // const res = await fetch('http://localhost:8080/teams', {
    // Node backend connection
    const res = await fetch(`${MANAGEMENT_API_URL}/teams`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({
            name,
            short_name: shortName,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
}

export const getPlayerStatsByGameId = async (gameId: string) => {
    const res = await fetch(`${ANALYTICS_API_URL}/analytics/games/${gameId}/players`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
};

export const getTeamStatsByGameId = async (gameId: string) => {
    const res = await fetch(`${ANALYTICS_API_URL}/analytics/games/${gameId}/teams`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
};

export const updateGame = async (
    id: string,
    seasonId: string,
    homeTeamId: string,
    awayTeamId: string,
) => {
    const res = await fetch(`${MANAGEMENT_API_URL}/games/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            season_id: seasonId,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            game_date: new Date().toISOString(),
            location: null,
            is_friendly: false,
            home_score: null,
            away_score: null,
            status: 'scheduled',
        }),
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
    }

    return res.json()
}

export const deleteGame = async (id: string) => {
    const res = await fetch(`${MANAGEMENT_API_URL}/games/${id}`, {
        method: 'DELETE',
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
    }
}

export const updateTeam = async (id: string, name: string) => {
    const shortName = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);

    const res = await fetch(`${MANAGEMENT_API_URL}/teams/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            short_name: shortName,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
};

export const deleteTeam = async (id: string) => {
    const res = await fetch(`${MANAGEMENT_API_URL}/teams/${id}`, {
        method: 'DELETE',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }
};

export const getTopScorers = async (
    limit: number = 5,
) => {
    const res = await fetch(
        `${ANALYTICS_API_URL}/analytics/players/rankings?stat=points&limit=${limit}`,
    );

    if (!res.ok) {
        const text = await res.text();

        throw new Error(text);
    }

    return res.json();
};

export const getPlayerRankings = async (
    stat: string,
    limit: number = 10,
) => {
    const res = await fetch(
        `${ANALYTICS_API_URL}/analytics/players/rankings?stat=${stat}&limit=${limit}`,
    )

    if (!res.ok) {
        const text = await res.text()

        throw new Error(text)
    }

    return res.json()
};

export const getAggregatedPlayerRankings = async (
    stat: string,
    limit: number = 10,
) => {
    const res = await fetch(
        `${ANALYTICS_API_URL}/analytics/players/aggregated-rankings?stat=${stat}&limit=${limit}`,
    )

    if (!res.ok) {
        const text = await res.text()

        throw new Error(text)
    }

    return res.json()
};

export const getPlayers = async (): Promise<Player[]> => {
    const res = await fetch(`${MANAGEMENT_API_URL}/players`)

    if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
    }

    return res.json()
}

export const getPlayersByTeam = async (
    teamId: string,
): Promise<Player[]> => {
    const res = await fetch(`${MANAGEMENT_API_URL}/teams/${teamId}/players`)

    if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
    }

    return res.json()
}

export const createPlayer = async (
    payload: CreatePlayerPayload,
): Promise<Player> => {
    const res = await fetch(`${MANAGEMENT_API_URL}/players`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
    }

    return res.json()
}

export const updatePlayer = async (
    id: string,
    payload: CreatePlayerPayload,
): Promise<Player> => {
    const res = await fetch(`${MANAGEMENT_API_URL}/players/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
    }

    return res.json()
}

export const deletePlayer = async (id: string): Promise<void> => {
    const res = await fetch(`${MANAGEMENT_API_URL}/players/${id}`, {
        method: 'DELETE',
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
    }
}

export const getPlayerSummaryByName = async (
    playerName: string,
) => {
    const res = await fetch(
        `${ANALYTICS_API_URL}/analytics/players/${encodeURIComponent(playerName)}/summary`,
    )

    if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
    }

    return res.json()
}