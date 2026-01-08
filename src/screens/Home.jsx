import { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { GiGolfFlag } from 'react-icons/gi';
import logo from '../components/logo.png';
import TorneosHome from '../components/TorneosHome';
import { Link } from 'react-router-dom';
import { compareAsc, parse } from 'date-fns';
import axios from 'axios';

function Home() {
	const [clubes, setClubes] = useState([]);
	const [torneos, setTorneos] = useState([]);

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/clubes`)
			.then((response) => setClubes(response.data))
			.catch((error) => console.error(error));

		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/torneos?tipo=proximos`)
			.then((response) => setTorneos(response.data))
			.catch((error) => console.error(error));
	}, []);

	return (
		<div>
			<div className='banner_home'>
				<div>
					<h1>
						Golf<b>Point</b>
						<GiGolfFlag size={48} />
					</h1>
					<p>Precisión e información para un juego perfecto...</p>
					<Link to='/inscripciones'>Inscripciones</Link>
					<Link to='/reservas'>Reservas</Link>
				</div>
				<img src={logo} alt='' />
			</div>

			<div className='esfumado' />

			<div className='body_home'>
				<div className='desc_home'>
					<h3>Descubre GolfPoint: Tu compañero ideal para el mundo del golf</h3>
					<p>
						¿Eres un apasionado del golf y buscas una manera eficiente de gestionar tus actividades y eventos?
						<br />
						¡GolfPoint es la solución perfecta! <br />
						GolfPoint es más que una simple aplicación, es tu compañero ideal en el mundo del golf. Cuenta con una gestión integral de clubes y torneos, estadísticas individuales, con una interfaz simple e intuitiva, un entorno amigable y ágil para el registro, lectura y análisis de datos. Ofrece todo lo que necesitas para disfrutar al máximo tu pasión por el golf.
						<br />
						¡UNITE A NUESTRA HERMOSA FAMILIA!
					</p>
				</div>

				<h2>¡PRÓXIMOS TORNEOS!</h2>
				<div id='clubes_home'>
					<div className='clubes_banner_home'>
						<div className='torneos_home'>
							{torneos.length === 0 ? (
								<Paper sx={{ m: 2, border: '1px solid #aad4b4' }} elevation={3} className='paper'>
									<Box sx={{ p: '10px', textAlign: 'center' }}>
										<Typography variant='h6' sx={{ fontWeight: 'bold' }}>
											No hay próximos torneos...
										</Typography>
									</Box>
								</Paper>
							) : (
								torneos
									.sort((a, b) => compareAsc(parse(a.fech_ini, 'dd/MM/yyyy', new Date()), parse(b.fech_ini, 'dd/MM/yyyy', new Date())))
									.map((torneo) => {
										const club = clubes.find((club) => club.id === torneo.clubVinculo);
										return (
											<div key={torneo.id}>
												<TorneosHome torneo={torneo} club={club} />
											</div>
										);
									})
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;
