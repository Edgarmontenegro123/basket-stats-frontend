import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import '../common/PageLayout.css'

const RankingsPage = () => {
    return (
        <div>
            <PageHeader
                title='Rankings'
                subtitle='Top performers and statistics leaders'
            />

            <SectionCard title='Rankings'>
                <p>Rankings will be displayed here.</p>
            </SectionCard>
        </div>
    )
}

export default RankingsPage