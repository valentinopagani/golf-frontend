import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Paper } from '@mui/material';
import Historial from '../components/Historial';
import axios from 'axios';

function EstadisticasJugador() {
	const [jugadores, setJugadores] = useState(false);
	const [filtro, setFiltro] = useState(false);
	const [jugadorPase, setJugadorPase] = useState([]);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (!filtro) return;

		function normalizeName(s) {
			return (s || '').trim().replace(/\s+/g, ' ');
		}

		if (normalizeName(filtro).length < 3 || normalizeName(filtro) === ' ') return;

		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/jugadores?nombreDni=${filtro}`)
			.then((response) => setJugadores(response.data))
			.catch((error) => console.error(error));
	}, [filtro]);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm();

	return (
		<div className='body_home'>
			<div className='title_banner'>
				<h2>Observá tus estadísticas y resultados.</h2>
			</div>

			<h2 style={{ textAlign: 'start', fontSize: '24px' }}>🏌🏻‍♂️ Buscar Jugadores:</h2>
			<div className='estadisticas'>
				<form
					style={{ display: 'flex', alignItems: 'center', gap: 10 }}
					autoComplete='off'
					onSubmit={handleSubmit((data) => {
						const value = (data.inpfiltro || '').trim();
						if (value.length !== 0) {
							setFiltro(value.toLowerCase());
						}
						reset();
					})}
				>
					<input
						type='text'
						placeholder='🔎 Buscar por apellido, nombre o matrícula:'
						{...register('inpfiltro', {
							required: true,
							minLength: { value: 3, message: 'Mínimo 3 caracteres' },
							pattern: { value: /^[a-zA-Z0-9 ]+$/, message: 'Caracteres inválidos' }
						})}
						style={{ width: '350px', padding: '7px 5px' }}
					/>
					<Button type='submit' variant='contained' color='inherit' size='medium'>
						🔍
					</Button>
					{jugadores && (
						<span
							onClick={() => {
								setJugadores(false);
								setFiltro(false);
							}}
							style={{ cursor: 'pointer' }}
						>
							Limpiar
						</span>
					)}
				</form>

				{errors.inpfiltro && <span style={{ color: 'red' }}>{errors.inpfiltro.message}</span>}

				<div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
					{jugadores.length
						? jugadores.map((jugador) => (
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
						: !jugadores.length && filtro && <span>No se encontraron resultados para {filtro}...</span>}
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
