import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import NavBarAdmin from '../components/NavBarAdmin';
import TorneosAdminClubs from '../components/TorneosAdminClubs';
import JugadoresTorneo from '../components/JugadoresTorneo';
import JugadoresAdm from '../components/JugadoresAdm';
import TablaReservas from '../components/TablaReservas';
import Canchas from '../components/Canchas';
import Info from './Info';
import axios from 'axios';

function AdminClubs({ user }) {
	const [clubes, setClubes] = useState([]);
	const [fechaActual, setFechaActual] = useState('');

	const userId = user.displayName.toLowerCase().replaceAll(' ', '');

	const navigate = useNavigate();
	useEffect(() => {
		if (!window.location.pathname.includes('/administrador')) {
			navigate('/administrador');
		}
	}, [navigate]);

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/clubes?vinculo=${userId}`)
			.then((response) => setClubes(response.data))
			.catch((error) => console.error(error));

		setFechaActual(
			new Date()
				.toLocaleString('en-CA', {
					timeZone: 'America/Argentina/Buenos_Aires',
					year: 'numeric',
					month: '2-digit',
					day: '2-digit'
				})
				.split(',')[0]
		);
	}, [userId]);

	return (
		<div className='admin_club'>
			<NavBarAdmin />
			{clubes.map((club) => (
				<div key={club.id}>
					<Routes>
						<Route exact path='/administrador' element={<TorneosAdminClubs club={club} user={user} />} />
						<Route exact path='/administrador/inscripciones' element={<JugadoresTorneo club={club} />} />
						<Route exact path='/administrador/jugadores' element={<JugadoresAdm club={club} />} />
						<Route exact path='/administrador/reservas' element={<TablaReservas clubId={club.id} clubNombre={club.nombre} fecha={fechaActual} user={userId} />} />
						<Route exact path='/administrador/miscanchas' element={<Canchas club={club} />} />
						<Route exact path='/administrador/info' element={<Info club={club} />} />
					</Routes>
				</div>
			))}
		</div>
	);
}

export default AdminClubs;
