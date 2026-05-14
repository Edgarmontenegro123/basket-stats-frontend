import {useEffect, useState} from 'react'

import PageHeader from '../common/PageHeader'
import SectionCard from '../common/SectionCard'
import StatCard from '../common/StatCard'

import {
    getTeams,
    getSeasons,
    getGames,
} from '../services/api'

import './DashboardPage.css'

const DashboardPage = () => {
    const [teamsCount, setTeamsCount] = useState<number>(0)
    const [seasonsCount, setSeasonsCount] = useState<number>(0)
    const [gamesCount, setGamesCount] = useState<number>(0)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const teams = await getTeams()
                const seasons = await getSeasons()
                const games = await getGames()

                setTeamsCount(teams.length)
                setSeasonsCount(seasons.length)
                setGamesCount(games.length)
            } catch (error) {
                console.error(error)
            }
        }

        void fetchDashboardData()
    }, []);

    return (
        <div className='dashboard-page'>
            <PageHeader
                title='Dashboard'
                subtitle='Resumen general del equipo'
            />

            <section className='dashboard-page__stats'>
                <StatCard label='Teams' value={String(teamsCount)} />
                <StatCard label='Seasons' value={String(seasonsCount)} />
                <StatCard label='Games' value={String(gamesCount)} />
                <StatCard label='Status' value='MVP' />
            </section>

            <section className='dashboard-page__grid'>
                <SectionCard title='Current State'>
                    <p>Frontend and Backend connected successfully.</p>
                    <p>PDF uploads and stats processing are optional.</p>
                </SectionCard>

                <SectionCard title='Next Step'>
                    <p>Persist data using PostgreSQL.</p>
                </SectionCard>
            </section>
        </div>
    )
}

export default DashboardPage