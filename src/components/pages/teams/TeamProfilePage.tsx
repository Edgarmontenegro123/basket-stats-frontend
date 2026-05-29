import {useParams} from 'react-router-dom'
import './TeamProfilePage.css'

const TeamProfilePage = () => {
    const {id} = useParams()

    return (
        <main className='team-profile-page'>
            <section className='team-profile-header'>
                <span className='team-profile-eyebrow'>Team Profile</span>
                <h1>Team details</h1>
                <p>Team ID: {id}</p>
            </section>
        </main>
    )
}

export default TeamProfilePage