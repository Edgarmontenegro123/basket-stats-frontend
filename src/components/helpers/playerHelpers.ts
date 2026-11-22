export const getPlayerPositionLabel = (
    position?: string | null,
) => {
    const positions: Record<string, string> = {
        PG: 'Point Guard',
        SG: 'Shooting Guard',
        SF: 'Small Forward',
        PF: 'Power Forward',
        C: 'Centre',
    }

    return position ? positions[position] || position : '-'
}

export const getPlayerPositionAbbreviation = (
    position?: string | null,
) => {
    return position || '-'
}

export const buildPlayerNameCandidates = (rawName: string): string[] => {
    const clean = rawName.trim().replace(/\s+/g, ' ')
    if (!clean) return []

    const parts = clean.split(' ')
    if (parts.length < 2) return [clean]

    const reversed = [...parts].reverse().join(' ')
    return Array.from(new Set([clean, reversed]))
}