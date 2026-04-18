import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import '../common/PageLayout.css'

const UploadStatsPage = () => {
    return (
        <div>
            <PageHeader
                title='Upload Stats'
                subtitle='Upload match statistics files'
            />

            <SectionCard title='Upload File'>
                <p>Upload a PDF, CSV or Excel file with game stats.</p>
            </SectionCard>
        </div>
    )
}

export default UploadStatsPage