import { useEffect, useState } from 'react';
import { Button, Paper } from '@mui/material';
import Historial from '../components/Historial';
import axios from 'axios';

function EstadisticasJugador() {
	const [jugadores, setJugadores] = useState([]);
	const [filtro, setFiltro] = useState('');
	const [bandera, setBandera] = useState(false);
	const [jugadorPase, setJugadorPase] = useState([]);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		axios
			.get(`https://golf-backend-production-ad4e.up.railway.app//jugadores?nombreDni=${filtro}`)
			.then((response) => setJugadores(response.data))
			.catch((error) => console.error(error));
	}, [filtro]);

	return (
		<div className='body_home'>
			<div className='title_banner'>
				<h2>Observá todas tus estadísticas y resultados.</h2>
			</div>

			<div className='estadisticas'>
				<form
					style={{ display: 'flex', alignItems: 'center', gap: 10 }}
					autoComplete='off'
					onSubmit={(e) => {
						e.preventDefault();
						setFiltro(e.target.inpfiltro.value.toLowerCase());
						setBandera(true);
						e.target.reset();
					}}
				>
					<input type='text' placeholder='🔎 Buscar por Apellido y Nombre o DNI:' id='inpfiltro' style={{ width: '350px', padding: '7px 5px' }} required />
					<Button type='submit' variant='outlined' size='medium'>
						Buscar 🏌🏻‍♂️
					</Button>
					{bandera && (
						<span onClick={() => setBandera(false)} style={{ cursor: 'pointer' }}>
							Limpiar filtro
						</span>
					)}
				</form>

				<div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
					{bandera &&
						(jugadores.length === 0 ? (
							<span>No se encontró resultados para {filtro}...</span>
						) : (
							jugadores.map((jugador) => (
								<Paper
									key={jugador.id}
									elevation={3}
									sx={{ padding: 2, cursor: 'pointer' }}
									onClick={() => {
										setJugadorPase(jugador);
										setIsOpen(true);
									}}
								>
									{jugador.dni} - {jugador.nombre}
								</Paper>
							))
						))}
				</div>
			</div>

			{isOpen && (
				<div className='modal'>
					<div className='modal_cont'>
						<h3>
							HISTORIAL DE {jugadorPase.dni} - {jugadorPase.nombre.toUpperCase()}:
						</h3>
						<Historial dni={jugadorPase.dni} />
						<Button onClick={() => setIsOpen(false)} variant='contained' size='small' color='error'>
							Cerrar
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default EstadisticasJugador;
