import { useState, useEffect } from 'react';
import { Button, Paper, Stack } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

function JugadoresAdm({ club }) {
	const [jugadores, setJugadores] = useState([]);
	const [filtro, setFiltro] = useState('');
	const [bandera, setBandera] = useState(false);
	const [jugadorData, setJugadorData] = useState([]);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/jugadores?nombreClub=${club.nombre}&nombreDni=${filtro}`)
			.then((response) => setJugadores(response.data))
			.catch((error) => console.error(error));
	}, [filtro, club.nombre]);

	const fechaNacimiento = isOpen && jugadorData.fech_nac !== null ? jugadorData.fech_nac.split('/').reverse().join('-') : 0;

	return (
		<div>
			<h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>{club.nombre}</h3>
			<h2>MODIFICÁ LOS DATOS DE TUS JUGADORES</h2>

			<div className='estadisticas'>
				<form
					style={{
						margin: '40px 0',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 10
					}}
					autoComplete='off'
					onSubmit={(e) => {
						e.preventDefault();
						setFiltro(e.target.inpfiltro.value.toLowerCase());
						setBandera(true);
						e.target.reset();
					}}
				>
					<input
						type='text'
						placeholder='🔎 Buscar por apellido, nombre o matrícula:'
						id='inpfiltro'
						style={{ width: '350px', padding: '7px 5px' }}
						required
					/>
					<Button type='submit' variant='contained' color='inherit' size='medium'>
						🏌🏻‍♂️🔍
					</Button>
					{bandera && (
						<span
							style={{ cursor: 'pointer' }}
							onClick={() => {
								setBandera(false);
								setFiltro('');
							}}
						>
							Limpiar
						</span>
					)}
				</form>
			</div>

			<div
				style={{
					width: '90%',
					margin: 'auto',
					marginBottom: '40px',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: 20
				}}
			>
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
									setJugadorData(jugador);
									setIsOpen(true);
								}}
							>
								{jugador.dni} - {jugador.nombre}
							</Paper>
						))
					))}
			</div>

			{club.dias_habilitados && (
				<div style={{ textAlign: 'center' }}>
					<h2>OBSERVÁ, MODIFICÁ Y REGISTRÁ LAS RESERVAS EN TU CLUB</h2>
					<Link to={`/administrador/reservas`}>
						<Button variant='contained' size='large' style={{ marginTop: '20px' }}>
							📋 reservas
						</Button>
					</Link>
				</div>
			)}

			{isOpen && (
				<div className='modal_edit'>
					<div className='modal_edit_cont'>
						<form
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: 20
							}}
							onSubmit={async (e) => {
								e.preventDefault();
								const nombre = e.target.nombre.value;
								const dni = e.target.dni.value;
								const fech_nac = e.target.fech_nac.value.split('-').reverse().join('/');
								const sexo = e.target.sexo.value;
								const clubSocio = e.target.clubSocio.value;
								try {
									await axios.put(`${process.env.REACT_APP_BACKEND_URL}/jugadores/` + jugadorData.id, {
										nombre,
										dni,
										fech_nac,
										sexo,
										clubSocio
									});
									setIsOpen(false);
									const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/jugadores?nombreClub=${club.nombre}&nombreDni=${filtro}`);
									setJugadores(response.data);
									alert('JUGADOR ACTUALIZADO CORRECTAMENTE');
								} catch (error) {
									alert('ERROR AL ACTUALIZAR JUGADOR. INTENTA NUEVAMENTE');
									console.error('Error al actualizar jugador:', error);
								}
							}}
						>
							<div>
								<label>
									Matrícula: <input type='number' name='dni' defaultValue={jugadorData.dni} style={{ width: '100px' }} />
								</label>
								<label>
									Nombre: <input type='text' name='nombre' defaultValue={jugadorData.nombre} />
								</label>
							</div>
							<div>
								<label>
									Fecha de Nacimiento: <input type='date' name='fech_nac' defaultValue={fechaNacimiento} />
								</label>
								<label>
									Género:{' '}
									<select name='sexo' defaultValue={jugadorData.sexo}>
										<option value='M'>Masculino</option>
										<option value='F'>Femenino</option>
										<option value='X'>Otro</option>
									</select>
								</label>
								<label>
									Club Asociado: <input type='text' name='clubSocio' defaultValue={jugadorData.clubSocio} />
								</label>
							</div>
							<Stack direction='row'>
								<Button variant='contained' size='small' onClick={() => setIsOpen(false)}>
									cancelar
								</Button>
								<Button variant='contained' size='small' color='success' type='submit'>
									actualizar
								</Button>
							</Stack>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default JugadoresAdm;
