import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import StatCard from '../common/StatCard'
import './DashboardPage.css'

const DashboardPage = () => {
    return (
        <div className='dashboard-page'>
            <PageHeader title='Dashboard' subtitle='Resumen general del equipo' />

            <section className='dashboard-page__stats'>
                <StatCard label='Record' value='0-1' />
                <StatCard label='Win Rate' value='0%' />
                <StatCard label='PPG' value='24' />
                <StatCard label='Opp PPG' value='43' />
            </section>

            <section className='dashboard-page__grid'>
                <SectionCard title='Recent Games' actionLabel='View all'>
                    <p>vs Capitán del Espacio — 24 : 43</p>
                </SectionCard>

                <SectionCard title='Top Players' actionLabel='Rankings'>
                    <p>Patanchon Matías — 6 PTS</p>
                    <p>Landoni Nicolás — 6 PTS</p>
                    <p>Portas Fernando — 5 PTS</p>
                </SectionCard>
            </section>
        </div>
    )
}

export default DashboardPage