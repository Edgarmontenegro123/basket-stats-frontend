import * as React from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../../services/authApi'
import './LoginPage.css'

const LoginPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const successMessage = location.state?.message

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const data = await login(email, password)

            localStorage.setItem('basket_stats_token', data.token)
            localStorage.setItem('basket_stats_user', JSON.stringify(data.user))

            navigate('/dashboard')
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error logging in')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className='login-page'>
            <section className='login-card'>
                <div className='login-card__header'>
                    <span className='login-card__eyebrow'>Basket Stats</span>
                    <h1>Welcome back</h1>
                    <p>Sign in to access your dashboard.</p>
                </div>

                <form className='login-form' onSubmit={handleSubmit}>
                    <label>
                        Email
                        <input
                            type='email'
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder='email@test.com'
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type='password'
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder='••••••••'
                        />
                    </label>

                    {successMessage && (
                        <p className='login-form__success'>{successMessage}</p>
                    )}

                    {error && <p className='login-form__error'>{error}</p>}

                    <button type='submit' disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                <p className='login-card__footer'>
                    Don't have an account? <Link to='/register'>Create account</Link>
                </p>
            </section>
        </main>
    )
}

export default LoginPage