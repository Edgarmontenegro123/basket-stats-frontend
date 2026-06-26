export const getPlayerPositionLabel = (position?: string | null) => {
    const positions: Record<string, string> = {
        PG: 'Point Guard (PG)',
        SG: 'Shooting Guard (SG)',
        SF: 'Small Forward (SF)',
        PF: 'Power Forward (PF)',
        C: 'Centre (C)',
    }

    return position ? positions[position] || position : '-'
}