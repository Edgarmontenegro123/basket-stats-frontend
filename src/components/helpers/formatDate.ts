export const formatDateToDDMMYYYY = (dateString?: string | null) => {
    if (!dateString) return 'Sin fecha'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString // Si ya viene en otro formato o texto

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return `${day}-${month}-${year}`
}

export const parseGameTimestamp = (dateValue: unknown): number => {
    if (typeof dateValue !== 'string' || !dateValue.trim()) return 0
    const clean = dateValue.trim().split('T')[0]

    // Formato DD-MM-YYYY o DD/MM/YYYY
    const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
    if (dmyMatch) {
        const [, day, month, year] = dmyMatch
        return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
    }

    // Formato YYYY-MM-DD
    const ymdMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
    if (ymdMatch) {
        const [, year, month, day] = ymdMatch
        return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
    }

    const parsed = new Date(dateValue).getTime()
    return Number.isNaN(parsed) ? 0 : parsed
}