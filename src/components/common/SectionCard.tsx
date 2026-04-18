import './SectionCard.css'
import type { ReactNode } from 'react'

type SectionCardProps = {
    title: string
    actionLabel?: string
    children: ReactNode
}

const SectionCard = ({ title, actionLabel, children }: SectionCardProps) => {
    return (
        <section className='section-card'>
            <div className='section-card__header'>
                <h2 className='section-card__title'>{title}</h2>
                {actionLabel ? (
                    <button className='section-card__action' type='button'>
                        {actionLabel}
                    </button>
                ) : null}
            </div>

            <div className='section-card__content'>{children}</div>
        </section>
    )
}

export default SectionCard