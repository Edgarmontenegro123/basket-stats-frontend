import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import '../common/PageLayout.css'

const ComparePage = () => {
    return (
        <div>
            <PageHeader
                title='Compare Teams'
                subtitle='Compare statistics between teams'
            />

            <SectionCard title='Comparison'>
                <p>Select teams to compare their stats.</p>
            </SectionCard>
        </div>
    )
}

export default ComparePage