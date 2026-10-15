import {useNavigate} from 'react-router-dom'
import './PageHeader.css'

type PageHeaderProps = {
    title: string
    subtitle?: string
    showBack?: boolean
}

const PageHeader = ({title, subtitle, showBack = false}: PageHeaderProps) => {
    const navigate = useNavigate()

    return (
        <header className='page-header'>
            {showBack && (
                <button
                    type='button'
                    className='page-header__back-button'
                    onClick={() => navigate(-1)}
                    aria-label='Go back'
                    >
                    ← Back
                </button>
            )}
            <h1 className='page-header__title'>{title}</h1>
            {subtitle ? <p className='page-header__subtitle'>{subtitle}</p> : null}
        </header>
    )
}

export default PageHeader