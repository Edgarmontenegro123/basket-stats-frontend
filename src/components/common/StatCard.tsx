import './StatCard.css'

type StatCardProps = {
    label: string
    value: string
}

const StatCard = ({ label, value }: StatCardProps) => {
    return (
        <article className='stat-card'>
            <h3 className='stat-card__value'>{value}</h3>
            <p className='stat-card__label'>{label}</p>
        </article>
    )
}

export default StatCard