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