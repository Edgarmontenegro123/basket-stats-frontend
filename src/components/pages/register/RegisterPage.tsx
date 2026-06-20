import * as React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../services/authApi'
import './RegisterPage.css'

const RegisterPage = () => {
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (!name.trim()) {
            setError('Name is required')
            return
        }

        if (!email.trim()) {
            setError('Email is required')
            return
        }

        if (!password) {
            setError('Password is required')
            return
        }

        if (!confirmPassword) {
            setError('Confirm password is required')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)

        try {
            await register(name, email, password)
            navigate('/login', {
                state: {
                    message: 'Account created successfully. Please sign in.'
                }
            })
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error registering user')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className='register-page'>
            <section className='register-card'>
                <div className='register-card__header'>
                    <span className='register-card__eyebrow'>Basket Stats</span>
                    <h1>Create account</h1>
                    <p>Register to start using your dashboard.</p>
                </div>

                <form className='register-form' onSubmit={handleSubmit}>
                    <label>
                        Name
                        <input
                            type='text'
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder='Admin'
                        />
                    </label>

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

                    <label>
                        Confirm password
                        <input
                            type='password'
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder='••••••••'
                        />
                    </label>

                    {error && <p className='register-form__error'>{error}</p>}

                    <button type='submit' disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>
                <p className='register-card__footer'>
                    Already have an account? <Link to='/login'>Sign in</Link>
                </p>
            </section>
        </main>
    )
}

export default RegisterPage