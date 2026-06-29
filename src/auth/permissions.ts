export type UserRole = 'admin' | 'coach' | 'dt' | 'player' | 'user'

export const normaliseRole = (role?: string): UserRole => {
    if (!role) return 'player'

    const normalisedRole = role.toLowerCase()

    if (normalisedRole === 'dt') return 'coach'

    return normalisedRole as UserRole
}

export const canManageTeams = (role?: string) => {
    const userRole = normaliseRole(role)

    return userRole === 'admin' || userRole === 'coach'
}

export const canManagePlayers = (role?: string) => {
    const userRole = normaliseRole(role)

    return userRole === 'admin' || userRole === 'coach'
}

export const canManageGames = (role?: string) => {
    const userRole = normaliseRole(role)

    return userRole === 'admin'
}

export const canManageSeasons = (role?: string) => {
    const userRole = normaliseRole(role)

    return userRole === 'admin'
}

export const canUploadStats = (role?: string) => {
    const userRole = normaliseRole(role)

    return userRole === 'admin' || userRole === 'coach'
}