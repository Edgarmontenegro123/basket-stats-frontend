import './SectionCard.css'
import type { ReactNode } from 'react'

type SectionCardProps = {
    title: string
    actionLabel?: string
    onAction?: () => void
    children: ReactNode
}

const SectionCard = ({
                         title,
                         actionLabel,
                         onAction,
                         children
}: SectionCardProps) => {
    return (
        <section className='section-card'>
            <div className='section-card__header'>
                <h2 className='section-card__title'>{title}</h2>
                {actionLabel ? (
                    <button
                        className='section-card__action'
                        type='button'
                        onClick={onAction}
                    >
                        {actionLabel}
                    </button>
                ) : null}
            </div>

            <div className='section-card__content'>{children}</div>
        </section>
    )
}

export default SectionCard