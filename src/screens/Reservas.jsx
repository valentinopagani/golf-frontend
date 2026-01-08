import { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Reservas() {
	const [clubes, setClubes] = useState([]);
	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/clubes?tipo=clubesConReserva`)
			.then((response) => setClubes(response.data))
			.catch((error) => console.error('Error al traer clubes:', error));
	}, []);

	return (
		<div className='body_home'>
			<div className='title_banner'>
				<h2>Reservas</h2>
			</div>

			<h2>CLUBES CON RESERVAS:</h2>
			<div className='torneos_home'>
				{clubes.map((club) => (
					<Paper key={club.id} sx={{ m: 2, padding: '10px 20px', maxWidth: 500, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }} elevation={3} className='paper'>
						<Box sx={{ textAlign: 'center' }}>
							<img src={club.logo} alt='logo del club' />
						</Box>
						<Link to={`/reservas/${club.id}/${club.nombre}`} style={{ color: 'black' }}>
							<Box sx={{ textAlign: 'center' }}>
								<Typography variant='h6' sx={{ fontWeight: 'bold' }}>
									{club.nombre}
								</Typography>
							</Box>
						</Link>
					</Paper>
				))}
			</div>
		</div>
	);
}

export default Reservas;
