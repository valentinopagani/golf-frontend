import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import NavBarAdmin from '../components/NavBarAdmin';
import TorneosAdminClubs from '../components/TorneosAdminClubs';
import JugadoresTorneo from '../components/JugadoresTorneo';
import JugadoresAdm from '../components/JugadoresAdm';
import Canchas from '../components/Canchas';
import axios from 'axios';

function AdminClubs({ user }) {
	const [clubes, setClubes] = useState([]);

	const userId = user.displayName.toLowerCase().replaceAll(' ', '');

	const navigate = useNavigate();
	useEffect(() => {
		if (!window.location.pathname.includes('/administrador')) {
			navigate('/administrador');
		}
	}, [navigate]);

	useEffect(() => {
		axios
			.get(`https://golf-backend-production-ad4e.up.railway.app/clubes?vinculo=${userId}`)
			.then((response) => setClubes(response.data))
			.catch((error) => console.error(error));
	}, [userId]);

	return (
		<div className='admin_club'>
			<NavBarAdmin />
			{clubes.map((club) => (
				<div key={club.id}>
					<Routes>
						<Route path='/administrador' element={<TorneosAdminClubs club={club} user={user} />} />
						<Route path='/administrador/inscripciones' element={<JugadoresTorneo club={club} />} />
						<Route path='/administrador/jugadores' element={<JugadoresAdm club={club} />} />
						<Route path='/administrador/miscanchas' element={<Canchas club={club} />} />
					</Routes>

					{/* {tabs === 2 && (
								<div id='cancha'>
									<Canchas canchas={canchas} setCanchas={setCanchas} club={club} />
								</div>
							)}

							{tabs === 3 && (
								<div>
									<h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>{club.nombre}</h3>
									<h2>MODIFICÁ LOS DATOS DE TUS JUGADORES</h2>
									<JugadoresAdm />
								</div>
							)} */}
				</div>
			))}
		</div>
	);
}

export default AdminClubs;
