import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import '../common/PageLayout.css'

const GamesPage = () => {
    return (
        <div>
            <PageHeader
                title='Games'
                subtitle='Track and manage your matches'
            />

            <SectionCard title='Games' actionLabel='New game'>
                <p>No games recorded yet.</p>
            </SectionCard>
        </div>
    )
}

export default GamesPage