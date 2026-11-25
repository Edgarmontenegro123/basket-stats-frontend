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

    const candidates: string[] = [clean]

    // Rotaciones circulares: "Daniel Alvarez Pesce" -> "Alvarez Pesce Daniel", "Pesce Daniel Alvarez"
    for (let i = 1; i < parts.length; i++) {
        const rotated = [...parts.slice(i), ...parts.slice(0, i)].join(' ')
        candidates.push(rotated)
    }

    // Reverso completo y rotaciones del reverso
    const reversedParts = [...parts].reverse()
    candidates.push(reversedParts.join(' '))
    for (let i = 1; i < reversedParts.length; i++) {
        const rotatedRev = [...reversedParts.slice(i), ...reversedParts.slice(0, i)].join(' ')
        candidates.push(rotatedRev)
    }

    // Si tiene 2 palabras ("Daniel Alvarez"), probar también solo el apellido ("Alvarez")
    // para que el backend devuelva coincidencia parcial si es única
    if (parts.length === 2) {
        candidates.push(parts[1], parts[0])
    }

    return Array.from(new Set(candidates))
}