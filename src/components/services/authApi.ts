const MANAGEMENT_API_URL = import.meta.env.VITE_MANAGEMENT_API_URL

export type LoginResponse = {
    token: string
    user: {
        id: string
        name: string
        email: string
        role: string
    }
}

export const login = async (
    email: string,
    password: string
): Promise<LoginResponse> => {
    const res = await fetch(`${MANAGEMENT_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'Error logging in')
    }

    return res.json()
}

export const register = async (
    name: string,
    email: string,
    password: string
): Promise<{ message: string }> => {
    const res = await fetch(`${MANAGEMENT_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            email,
            password,
        }),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'Error registering user')
    }

    return res.json()
}