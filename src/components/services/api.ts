export const createGame = async (
    seasonId: string,
    homeTeamId: string,
    awayTeamId: string,
) => {
    // Go backend connection
    // const res = await fetch('http://localhost:8080/games', {

    // Node backend connection
    const res = await fetch('http://localhost:3001/games', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            season_id: seasonId,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            game_date: new Date().toISOString(),
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
    const res = await fetch('http://localhost:3001/games');

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
}

export const uploadStats = async (gameId: string, file: File) => {
    const formData = new FormData();
    formData.append('game_id', gameId);
    console.log('GAME ID:', gameId)
    formData.append('file', file);

    // Go backend connection
    // const res = await fetch('http://localhost:8081/uploads', {
    // Node backend connection
    const res = await fetch('http://localhost:3002/uploads', {
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
    // Go backend connection
    // const res = await fetch('http://localhost:8081/analytics/process', {
    // Node backend connection
    const res = await fetch('http://localhost:3002/analytics/process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({upload_id: uploadId}),
    });

    return res.json();
}

export const getPlayerStats = async (gameId: string) => {
    // Go backend connection
    // const res = await fetch(`http://localhost:8081/analytics/games/${gameId}/players`);
    // Node backend connection
    const res = await fetch(`http://localhost:3002/analytics/games/${gameId}/players`);

    return res.json();
}

export const getTeams = async () => {
    // Go backend connection
    // const res = await fetch('http://localhost:8080/teams');
    // Node backend connection
    const res = await fetch('http://localhost:3001/teams');

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
    const res = await fetch('http://localhost:3001/seasons', {
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
    const res = await fetch('http://localhost:3001/seasons');

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
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
    const res = await fetch('http://localhost:3001/teams', {
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