import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import axios from 'axios';

function TablaReservas({ clubId, clubNombre, fecha, user }) {
	const [turnos, setTurnos] = useState([]);
	const [fechaSelec, setFechaSelec] = useState(fecha);
	const [teeSelec, setTeeSelec] = useState(1);
	const [isOpen, setIsOpen] = useState(false);
	const [isOpenDetalle, setIsOpenDetalle] = useState(false);
	const [detalles, setDetalles] = useState([]);
	const [horaPass, setHoraPass] = useState('');
	const [teeModal, setTeeModal] = useState(1);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [disponibilidad, setDisponibilidad] = useState(0);
	const items = [0, 1, 2, 3];

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/turnos/${clubId}/${fechaSelec}`)
			.then((response) => setTurnos(response.data))
			.catch((error) => console.error('Error al traer turnos:', error));
	}, [clubId, fechaSelec]);

	function validateEmail(em) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(String(em).toLowerCase());
	}

	const reservar = async (hora, jugador, tee, tel, email) => {
		try {
			setLoading(true);
			setError('');

			await axios.post(`${process.env.REACT_APP_BACKEND_URL}/turnos/reservar`, {
				club_id: clubId,
				fecha: fechaSelec,
				hora: hora,
				jugador: jugador,
				tee: tee,
				telefono: tel,
				email: email
			});

			// Actualizar turnos
			const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/turnos/${clubId}/${fechaSelec}`);
			setTurnos(response.data);
			setLoading(false);
			closeModal();
		} catch (err) {
			setLoading(false);
			const errorMsg = err.response?.data?.error || 'Error al reservar';
			// Manejo de errores específicos
			if (errorMsg === 'Turno completo') {
				setError('❌ Lo sentimos, el horario seleccionado está completo.');
			} else if (errorMsg === 'Jugador duplicado') {
				setError('❌ Este jugador ya tiene una reserva en este día.');
			} else if (errorMsg === 'Datos incompletos') {
				setError('❌ Faltan datos requeridos para reservar.');
			} else {
				setError(`❌ Error al reservar: ${errorMsg}`);
			}
			console.error('Error al reservar:', err);
		}
	};

	function openModal(hora, disponibles, tee) {
		setHoraPass(hora);
		setDisponibilidad(disponibles);
		setTeeModal(tee);
		setIsOpen(true);
	}
	function closeModal() {
		setIsOpen(false);
		setHoraPass('');
		setDisponibilidad(0);
		setError('');
	}

	function obtenerDatos(turno, reserva) {
		setHoraPass(turno.hora);
		setDetalles(reserva);
		setIsOpenDetalle(true);
	}

	function closeDetalles() {
		setHoraPass('');
		setDetalles([]);
		setIsOpenDetalle(false);
	}

	const eliminarReserva = async () => {
		if (!window.confirm(`Seguro que deseas eliminar la reserva de ${detalles.jugador} el ${fechaSelec} a las ${horaPass}hs?`)) return;
		try {
			await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/turnos/${detalles.id}`);
			await axios
				.get(`${process.env.REACT_APP_BACKEND_URL}/turnos/${clubId}/${fechaSelec}`)
				.then((response) => setTurnos(response.data))
				.catch((error) => console.error('Error al traer turnos:', error));
			closeDetalles();
		} catch (error) {
			alert('Error al eliminar reserva');
			console.error(error);
		}
	};

	return (
		<div className='body_home'>
			{user ? (
				<div>
					<h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>{clubNombre}</h3>
					<h2>RESERVAS</h2>
				</div>
			) : (
				<div className='title_banner'>
					<h2>Reservas {clubNombre}</h2>
				</div>
			)}

			<div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
				<h3>
					Seleccionar fecha: <input type='date' onChange={(e) => setFechaSelec(e.target.value)} defaultValue={fecha} min={!user ? fecha : null} />
				</h3>

				<h3>
					Tee:
					<select value={teeSelec} onChange={(e) => setTeeSelec(Number(e.target.value))} style={{ marginLeft: '10px' }}>
						<option value={1}>TEE 1</option>
						<option value={10}>TEE 10</option>
					</select>
				</h3>
			</div>

			<br />

			{turnos.length === 0 ? (
				<h3>No se reservan turnos para este día...</h3>
			) : (
				<div className='table_container'>
					<table className='table_reservas'>
						<caption>
							TEE {teeSelec} | {fechaSelec.split('-').reverse().join('-')}
						</caption>
						<thead>
							<tr>
								<th>Horario</th>
								<th>Jugadores</th>
								<th></th>
								<th></th>
								<th></th>
								<th style={{ width: '70px' }}></th>
							</tr>
						</thead>
						<tbody>
							{turnos
								.filter((turno) => turno.tee === teeSelec)
								.map((turno) => (
									<tr key={`${turno.hora}-${turno.tee}`}>
										<td>{turno.hora}</td>
										{items.map((i) => (
											<td key={i}>
												{turno.reservas && turno.reservas[i] ? (
													<span onClick={() => user && obtenerDatos(turno, turno.reservas[i])} className={user ? 'help' : null}>
														{turno.reservas[i].jugador}
													</span>
												) : (
													<span style={{ color: '#bbb' }}>SIN OCUPAR</span>
												)}
											</td>
										))}
										<td>
											<button disabled={turno.disponibles === 0 || fechaSelec < fecha || (!user && fechaSelec === fecha)} title={turno.disponibles === 0 ? 'No hay disponibilidad' : null} onClick={() => openModal(turno.hora, turno.disponibles, teeSelec)}>
												Reservar
											</button>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			)}

			{/* MODAL FORMULARIO */}
			{isOpen && (
				<div className='modal'>
					<div className='modal_cont'>
						{!user && <h4>{clubNombre}</h4>}
						<h3>
							Reservar salida {fechaSelec.split('-').reverse().join('-')} a las {horaPass}hs. | Tee {teeModal}
						</h3>

						<br />

						<p style={{ color: disponibilidad >= 3 ? '#468828ff' : 'orange' }}>
							<i>{disponibilidad}</i> {disponibilidad > 1 ? 'lugares libres' : 'lugar libre'} en este horario
						</p>

						{error && <div style={{ color: '#d32f2f', padding: '6px', backgroundColor: '#ffebee', borderRadius: '4px', fontSize: '16px' }}>{error}</div>}

						<form
							className='form_reserva'
							autoComplete='off'
							onSubmit={(e) => {
								e.preventDefault();
								function capitalizarConRegex(oracion) {
									return oracion.replace(/(^|\s)\S/g, function (letra) {
										return letra.toUpperCase();
									});
								}
								const telefono = e.target.telefono.value;
								if (!user) {
									if (!validateEmail(email)) {
										setError('❌ e-mail inválido');
										return;
									}
									if (telefono.length < 10) {
										setError('❌ Teléfono inválido');
										return;
									}
								}
								const jugador = capitalizarConRegex(e.target.apellido.value + ' ' + e.target.nombre.value);
								reservar(horaPass, jugador, teeModal, telefono, email);
							}}
						>
							<label>
								Nombre/s: <input type='text' id='nombre' minLength={3} placeholder='Nombre completo' onChange={(e) => (e.target.value = e.target.value.replace(/[^A-Za-z ]/g, ''))} required />
							</label>
							<label>
								Apellido/s: <input type='text' id='apellido' minLength={2} placeholder='Apellido completo' onChange={(e) => (e.target.value = e.target.value.replace(/[^A-Za-z ]/g, ''))} required />
							</label>
							<label>
								Teléfono: <input type='text' id='telefono' maxLength={15} placeholder='Número de teléfono' onChange={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))} required={user ? false : true} />
							</label>
							<label>
								e-mail:
								<input type='email' id='email' value={email} placeholder='Dirección de correo electrónico' onChange={(e) => setEmail(e.target.value)} required={user ? false : true} />
							</label>
							<div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
								<Button variant='contained' size='small' color='error' onClick={() => closeModal()}>
									cerrar
								</Button>
								<Button variant='contained' size='small' type='submit' disabled={loading}>
									{loading ? 'Reservando...' : 'reservar'}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{isOpenDetalle && (
				<div className='modal'>
					<div className='modal_cont'>
						<h3>{fechaSelec.split('-').reverse().join('-') + ' | ' + horaPass}hs.</h3>

						<span>Jugador: {detalles.jugador}</span>
						<span>Reservó el día {detalles.fech_alta.slice(0, 10).split('-').reverse().join('-')}</span>
						<span>Teléfono: {detalles.telefono}</span>
						<span>
							e-mail:{' '}
							<a href={`mailto:${detalles.email}`} style={{ color: 'blue' }}>
								{detalles.email}
							</a>
						</span>

						<div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
							<Button variant='contained' size='small' color='error' onClick={() => eliminarReserva()}>
								eliminar reserva
							</Button>
							<Button variant='contained' size='small' color='primary' onClick={() => closeDetalles()}>
								cerrar
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default TablaReservas;
