import {useParams} from 'react-router-dom'

export const PlayerProfilePage = () => {
    const {id} = useParams()

    return (
        <div>
            <h1>Player Profile</h1>
            <p>Player ID: {id}</p>
        </div>
    )
}