import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import '../common/PageLayout.css'

const TeamsPage = () => {
    return (
        <div>
            <PageHeader
                title='Teams'
                subtitle='Manage your teams and opponents'
            />

            <SectionCard title='Teams' actionLabel='New team'>
                <p>No teams available yet.</p>
            </SectionCard>
        </div>
    )
}

export default TeamsPage