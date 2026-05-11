export const createGame = async (
    seasonId: string,
    homeTeamId: string,
    awayTeamId: string,
) => {
    const res = await fetch("http://localhost:8080/games", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            season_id: seasonId,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            game_date: new Date().toISOString(),
            status: "scheduled",
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
};

export const uploadStats = async (gameId: string, file: File) => {
    const formData = new FormData();
    formData.append("game_id", gameId);
    console.log("GAME ID:", gameId)
    formData.append("file", file);

    const res = await fetch("http://localhost:8081/uploads", {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
}

export const processStats = async (uploadId: string) => {
    const res = await fetch("http://localhost:8081/analytics/process", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({upload_id: uploadId}),
    });

    return res.json();
}

export const getPlayerStats = async (gameId: string) => {
    const res = await fetch(`http://localhost:8081/analytics/games/${gameId}/players`);

    return res.json();
}