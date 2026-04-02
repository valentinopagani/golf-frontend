import { useEffect, useState } from 'react';
import { Alert, Button } from '@mui/material';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import axios from 'axios';

function TablaReservas({ clubId, clubNombre, fecha, user }) {
	const [turnos, setTurnos] = useState([]);
	const [valorReserva, setValorReserva] = useState(null);
	const [fechaSelec, setFechaSelec] = useState(fecha);
	const [teeSelec, setTeeSelec] = useState(1);
	const [isOpen, setIsOpen] = useState(false);
	const [isOpenDetalle, setIsOpenDetalle] = useState(false);
	const [detalles, setDetalles] = useState([]);
	const [horaPass, setHoraPass] = useState('');
	const [teeModal, setTeeModal] = useState(1);
	const [errorDia, setErrorDia] = useState(false);
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [disponibilidad, setDisponibilidad] = useState(0);
	const [preference, setPreference] = useState(null);
	const items = [0, 1, 2, 3];

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/turnos/${clubId}/${fechaSelec}`)
			.then((response) => {
				if (response.data.fecha_inhabilitada) {
					setErrorDia(response.data.motivo);
					setTurnos([]);
				} else {
					setErrorDia(false);
					setTurnos(response.data);
				}
			})
			.catch((error) => console.error('Error al traer turnos:', error));
	}, [clubId, fechaSelec]);

	useEffect(() => {
		if (clubId) {
			axios
				.get(`${process.env.REACT_APP_BACKEND_URL}/mp_public_key`, {
					params: { club_id: clubId }
				})
				.then((response) => {
					initMercadoPago(response.data.publicKey, {
						locale: 'es-AR'
					});
				})
				.catch((error) => {
					console.error('Error publicKey', error);
				});
		}

		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/clubes?valorReserva=${clubId}`)
			.then((response) => setValorReserva(response.data[0].valor))
			.catch((error) => console.error(error));
	}, [clubId]);

	const createPreference = async (club_id, fecha, jugador, hora, tee, formularioObj) => {
		try {
			const payload = {
				club_id,
				fecha,
				jugador,
				hora,
				tee,
				type: 0, // 0 = reserva, 1 = inscripción
				formulario: formularioObj
			};
			const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/create_preference`, payload, { withCredentials: true });
			const { id } = response.data;

			return id;
		} catch (error) {
			console.error('Error al crear preferencia', error);
			setError([2, 'Ocurrió un error al generar preferencias de MercadoPago']);
		}
	};

	const reservar = async (hora, jugador, tee, formularioObj) => {
		try {
			setError(false);
			if (!user) {
				// 🟡🟡🟡🟡🟡🟡 VER COMO HACER
				await axios.get(`${process.env.REACT_APP_BACKEND_URL}/turnos/check`, {
					params: {
						club_id: clubId,
						fecha: fechaSelec,
						hora: hora,
						jugador: jugador,
						tee: tee
					}
				});
				const id = await createPreference(clubId, fechaSelec, jugador, hora, tee, formularioObj);
				if (id) {
					setPreference(id);
				}
			} else {
				await axios.post(`${process.env.REACT_APP_BACKEND_URL}/turnos/reservar`, {
					club_id: clubId,
					fecha: fechaSelec,
					hora: hora,
					jugador: jugador,
					tee: tee,
					telefono: formularioObj.telefono,
					email: formularioObj.email
				});
				const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/turnos/${clubId}/${fechaSelec}`);
				setTurnos(response.data);
				setLoading(false);
				closeModal();
				setError([0, 'Se reservó con éxito.']);
			}
		} catch (err) {
			setPreference(null);
			setLoading(false);
			const errorMsg = err.response?.data?.error || err.message || 'Error al reservar';
			// Manejo de errores específicos
			if (errorMsg === 'Turno completo') {
				setError([1, 'Lo sentimos, el horario seleccionado está completo.']);
			} else if (errorMsg === 'Jugador duplicado') {
				setError([1, 'Este jugador ya tiene una reserva en este día.']);
			} else if (errorMsg === 'Datos incompletos') {
				setError([1, 'Faltan datos requeridos para reservar.']);
			} else {
				setError([1, `Error al reservar: ${errorMsg}`]);
			}
			console.error('Error al reservar:', err);
		}
	};

	// limpiar mensaje de error después de 5 segundos
	useEffect(() => {
		if (!error) return;
		const timer = setTimeout(() => setError(false), 5000);
		return () => clearTimeout(timer);
	}, [error]);

	function openModal(hora, disponibles, tee) {
		setHoraPass(hora);
		setDisponibilidad(disponibles);
		setTeeModal(tee);
		setIsOpen(true);
	}
	function closeModal() {
		setIsOpen(false);
		setPreference(null);
		setLoading(false);
		setHoraPass('');
		setDisponibilidad(0);
		setError(false);
		setEmail('');
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
			setError([0, 'Reserva eliminada con éxito.']);
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

			{error[0] === 0 && <Alert severity='success'>{error[1]}</Alert>}

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

				<h3 style={{ color: 'green' }}>Valor de la reserva: ${valorReserva}</h3>
			</div>

			<br />

			{turnos.length === 0 ? (
				<Alert severity='info'>No se reservan turnos para este día. {errorDia && errorDia.toUpperCase()}</Alert>
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
							{turnos &&
								turnos
									.filter((turno) => turno.tee === teeSelec)
									.map((turno) => (
										<tr key={`${turno.hora}-${turno.tee}`}>
											<td>{turno.hora}</td>
											{items.map((i) => (
												<td key={i}>
													{turno.reservas && turno.reservas[i] ? (
														<span onClick={() => user && obtenerDatos(turno, turno.reservas[i])} style={{ cursor: user && 'pointer' }}>
															{turno.reservas[i].jugador}
														</span>
													) : (
														<span style={{ color: '#bbb' }}>LIBRE</span>
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

						<p style={{ color: disponibilidad >= 3 ? '#468828ff' : 'orange', marginBottom: '10px' }}>
							{disponibilidad} {disponibilidad > 1 ? 'lugares libres' : 'lugar libre'} en este horario
						</p>

						{error[0] === 1 && <Alert severity='warning'>{error[1]}</Alert>}
						{error[0] === 2 && <Alert severity='error'>{error[1]}</Alert>}

						<form
							className='form_reserva'
							autoComplete='off'
							onSubmit={(e) => {
								e.preventDefault();

								setLoading(true);

								const telefono = e.target.telefono.value;
								if (!user) {
									if (telefono.length < 10) {
										setError([1, 'Teléfono inválido']);
										setLoading(false);
										return;
									}
								}

								function capitalizarConRegex(oracion) {
									return oracion.replace(/(^|\s)\S/g, function (letra) {
										return letra.toUpperCase();
									});
								}
								function normalizeName(s) {
									return (s || '').trim().replace(/\s+/g, ' ');
								}

								const nombreApellido = e.target.apellido.value + ' ' + e.target.nombre.value;
								const jugador = normalizeName(capitalizarConRegex(nombreApellido.toLowerCase()));

								const formularioObj = { email: email, telefono: telefono };

								reservar(horaPass, jugador, teeModal, formularioObj);
							}}
						>
							<label>
								Nombre/s: <input type='text' id='nombre' minLength={3} placeholder='Nombre completo' onChange={(e) => (e.target.value = e.target.value.replace(/[^A-Za-z ]/g, ''))} required />
							</label>
							<label>
								Apellido/s: <input type='text' id='apellido' minLength={2} placeholder='Apellido completo' onChange={(e) => (e.target.value = e.target.value.replace(/[^A-Za-z ]/g, ''))} required />
							</label>
							<label>
								Teléfono: <input type='text' id='telefono' maxLength={10} placeholder='Número de teléfono' onChange={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))} required={!user} />
							</label>
							<label>
								e-mail:
								<input type='email' id='email' value={email} placeholder='Dirección de correo electrónico' onChange={(e) => setEmail(e.target.value)} required={!user} />
							</label>

							<div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
								<Button variant='contained' size='small' color='error' onClick={() => closeModal()}>
									cerrar
								</Button>
								<Button variant='contained' size='small' color='success' type='submit' disabled={loading}>
									{loading ? (user ? 'reservando...' : 'esperando pago') : user ? 'reservar' : `generar pago | $${valorReserva}`}
								</Button>
							</div>
							{preference && (
								<Wallet
									initialization={{ preferenceId: preference }}
									onError={(error) => {
										console.error(error);
										setError([2, 'Ocurrió un error con el Wallet de MercadoPago']);
									}}
								/>
							)}
						</form>
					</div>
				</div>
			)}

			{/* MODAL DATOS RESERVA */}
			{isOpenDetalle && (
				<div className='modal'>
					<div className='modal_cont'>
						<h3>{fechaSelec.split('-').reverse().join('-') + ' | ' + horaPass}hs.</h3>

						<span>Jugador: {detalles.jugador}</span>
						<span>Reservó el día: {detalles.fech_alta.slice(0, 10).split('-').reverse().join('-')}</span>
						<span>Teléfono: {detalles.telefono ? detalles.telefono : <span style={{ color: 'gray' }}>sin registro</span>}</span>
						<span>
							e-mail:{' '}
							{detalles.email ? (
								<a href={`mailto:${detalles.email}`} style={{ color: 'blue' }}>
									{detalles.email}
								</a>
							) : (
								<span style={{ color: 'gray' }}>sin registro</span>
							)}
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
