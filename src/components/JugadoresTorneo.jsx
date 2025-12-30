import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import ModalEdit from './ModalEdit';
import { MdEdit } from 'react-icons/md';
import { FaTrash } from 'react-icons/fa';
import AnalisisInscriptos from './AnalisisInscriptos';
import { Button, IconButton } from '@mui/material';
import { IoCloseCircleSharp } from 'react-icons/io5';
import axios from 'axios';

function JugadoresTorneo({ club }) {
	const [torneos, setTorneos] = useState([]);
	const [jugadores, setJugadores] = useState([]);
	const [filterJugadoresDni, setFilterJugadoresDni] = useState('');
	const [filterJugadoresNombre, setFilterJugadoresNombre] = useState('');
	const [filteredJugadores, setFilteredJugadores] = useState([]);
	const [jugadoresTorneo, setJugadoresTorneo] = useState([]);
	const [filterTorneo, setFilterTorneo] = useState(0);
	const [filteredTorneo, setFilteredTorneo] = useState(null);
	const [registrado, setRegistrado] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [isOpenEdit, setIsOpenEdit] = useState(false);
	const [jugadorDatos, setJugadorDatos] = useState([]);
	const [torneoDatos, setTorneoDatos] = useState([]);
	const [filterCategoria, setFilterCategoria] = useState({});
	const [showGraf, setShowGraf] = useState(false);
	const [openComprobante, setOpenComprobante] = useState(false);
	const [emailInscripto, setEmailInscripto] = useState('');

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/torneos?tipo=inscripcionesadmin&clubVinculo=${club.id}`)
			.then((response) => setTorneos(response.data))
			.catch((error) => console.error(error));

		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/jugadores`)
			.then((response) => setJugadores(response.data))
			.catch((error) => console.error(error));
	}, [club]);

	// traer los inscriptos de x torneos
	const idsTorneosAdmin = useMemo(() => torneos.map((t) => t.id), [torneos]);
	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/inscriptos?torneos=${idsTorneosAdmin.join(',')}`)
			.then((response) => setJugadoresTorneo(response.data))
			.catch((error) => console.error(error));
	}, [idsTorneosAdmin]);

	useEffect(() => {
		setFilteredTorneo(torneos.find((torneo) => torneo.id === filterTorneo));
	}, [filterTorneo, torneos]);

	// autocompletar formulario
	useEffect(() => {
		setFilteredJugadores(
			jugadores.filter((jugador) => {
				if (filterJugadoresDni.length >= 5) {
					return jugador.dni.toString() === filterJugadoresDni;
				}
				if (filterJugadoresNombre.length > 0) {
					return jugador.nombre.toLowerCase().includes(filterJugadoresNombre.toLowerCase());
				}
				return false;
			})
		);
	}, [filterJugadoresNombre, filterJugadoresDni, jugadores]);

	useEffect(() => {
		if ((filterJugadoresNombre.length >= 3 && filteredJugadores.length === 1) || (filterJugadoresDni.length >= 5 && filteredJugadores.length === 1)) {
			setRegistrado(true);
		} else {
			setRegistrado(false);
		}
	}, [filterJugadoresNombre, filterJugadoresDni, filteredJugadores]);

	const jugadoresPorTorneo = torneos.reduce((acc, torneo) => {
		acc[torneo.nombre] = {
			...torneo,
			jugadores: jugadoresTorneo.filter((jugador) => jugador.torneo === torneo.id)
		};
		return acc;
	}, {});

	async function cerrarTorneo(torneoId) {
		try {
			if (!window.confirm('¿Deseas cerrar este torneo?')) return;
			await axios.put(`${process.env.REACT_APP_BACKEND_URL}/torneos/${torneoId}/finalizar`, { finalizado: 1 });
			await axios
				.get(`${process.env.REACT_APP_BACKEND_URL}/torneos?tipo=inscripcionesadmin&clubVinculo=${club.id}`)
				.then((response) => setTorneos(response.data))
				.catch((error) => console.error(error));
		} catch (error) {
			alert('Error al cerrar el torneo');
			console.error(error);
		}
	}

	const handleCategoriaChange = (torneoId, categoria) => {
		setFilterCategoria((prev) => ({
			...prev,
			[torneoId]: categoria
		}));
	};

	return (
		<div className='jugadores_admin'>
			<h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>{club.nombre}</h3>
			<h2>REGISTRÁ LOS JUGADORES</h2>

			<Button variant='contained' color='primary' sx={{ mt: '25px' }} onClick={() => setShowGraf(true)}>
				👁 ver gráfico de inscriptos
			</Button>

			<form
				className='form_nuevojug'
				id='form_nuevojug'
				autoComplete='off'
				onSubmit={async (e) => {
					e.preventDefault();
					function capitalizarConRegex(oracion) {
						return oracion.replace(/(^|\s)\S/g, function (letra) {
							return letra.toUpperCase();
						});
					}
					const dni = registrado ? filteredJugadores[0].dni : e.target.dni.value;
					const nombre = registrado ? filteredJugadores[0].nombre : capitalizarConRegex(e.target.nombre.value);
					const torneo = e.target.torneo.value;
					const categoria = e.target.categoria.value;
					const handicap = parseInt(e.target.handicap.value);
					const clubReg = club.nombre;
					const clubSocio = capitalizarConRegex(e.target.club_per.value);
					const fech_alta = new Date().toLocaleDateString();
					// Verificar si ya está inscripto en este torneo
					try {
						const check = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/inscriptos/check`, { params: { torneo, dni } });
						if (check.data && check.data.exists) {
							alert('El jugador ya está inscrito en este torneo');
							return;
						}
					} catch (error) {
						console.error('Error verificando inscripción', error);
						return;
					}
					if (registrado) {
						try {
							await axios.post(`${process.env.REACT_APP_BACKEND_URL}/inscriptos`, { dni, nombre, torneo, categoria, handicap, clubReg, clubSocio, fech_alta });
							await axios
								.get(`${process.env.REACT_APP_BACKEND_URL}/inscriptos?torneos=${idsTorneosAdmin.join(',')}`)
								.then((response) => setJugadoresTorneo(response.data))
								.catch((error) => console.error(error));
						} catch (error) {
							console.error('error al registrar inscripto', error);
						}
					} else {
						const fecha = e.target.fech_nac.value.split('-');
						const fech_nac = fecha[2] + '/' + fecha[1] + '/' + fecha[0];
						const sexo = e.target.sexo.value;
						try {
							await axios.post(`${process.env.REACT_APP_BACKEND_URL}/jugadores`, { dni, nombre, fech_nac, sexo, clubReg, fech_alta });
							await axios.post(`${process.env.REACT_APP_BACKEND_URL}/inscriptos`, { dni, nombre, torneo, categoria, handicap, clubReg, clubSocio, fech_alta });
							await axios
								.get(`${process.env.REACT_APP_BACKEND_URL}/jugadores`)
								.then((response) => setJugadores(response.data))
								.catch((error) => console.error(error));
							await axios
								.get(`${process.env.REACT_APP_BACKEND_URL}/inscriptos?torneos=${idsTorneosAdmin.join(',')}`)
								.then((response) => setJugadoresTorneo(response.data))
								.catch((error) => console.error(error));
						} catch (error) {
							console.error('error al registrar inscripto y/o datos personales', error);
						}
					}
					e.target.reset();
					setFilterJugadoresDni('');
					setFilterJugadoresNombre('');
					setRegistrado(false);
					setFilterTorneo(0);
					setFilteredTorneo(null);
				}}
			>
				<div>
					<label>
						Torneo:{' '}
						<select id='torneo' onChange={(e) => setFilterTorneo(parseInt(e.target.value))} required>
							<option>Elegir...</option>
							{torneos
								.filter((torneo) => torneo.clubVinculo === club.id)
								.map((torneo) => (
									<option value={torneo.id} key={torneo.id}>
										{torneo.nombre}
									</option>
								))}
						</select>
					</label>
					<label>
						Categoría:{' '}
						<select id='categoria' required>
							{filteredTorneo && filteredTorneo.categorias.length > 0 ? filteredTorneo.categorias.map((categoria, i) => <option key={i}>{categoria.nombre}</option>) : <option disabled>Primero elige un torneo</option>}
						</select>
					</label>
					<label>
						Matrícula: <input type='text' id='dni' pattern='[0-9]*' maxLength={6} onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))} onChange={(e) => setFilterJugadoresDni(e.target.value)} placeholder={registrado && filteredJugadores[0] ? filteredJugadores[0].dni : '(sin puntos)'} required={registrado ? false : true} />
					</label>
					<label>
						Nombre: <input type='text' id='nombre' onChange={(e) => setFilterJugadoresNombre(e.target.value)} placeholder={registrado && filteredJugadores[0] ? filteredJugadores[0].nombre : '(apellido/s y nombre/s)'} required={registrado ? false : true} />
					</label>
				</div>
				{!registrado ? (
					<div>
						<label>
							Fecha de nacimiento: <input type='date' id='fech_nac' required />
						</label>
						<label>
							Género:{' '}
							<select id='sexo' required>
								<option value='H'>Hombre</option>
								<option value='M'>Mujer</option>
								<option value='X'>Otro</option>
							</select>
						</label>
					</div>
				) : (
					registrado && filteredJugadores[0] && <span className='green'>Ya tenemos los datos de {filteredJugadores[0].dni + ' - ' + filteredJugadores[0].nombre}!!</span>
				)}
				<div>
					<label>
						Handicap: <input type='text' id='handicap' pattern='[0-9]*' maxLength={2} onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))} placeholder='HDC' required />
					</label>
					<label>
						Club de pertenencia: <input type='text' id='club_per' placeholder='club asociado' />
					</label>
				</div>
				<a href={'https://www.vistagolf.com.ar/handicap/DiferencialesArg.asp?strCampo=Campo1&strValor=' + filterJugadoresDni !== null ? filterJugadoresDni : filteredJugadores[0]?.dni} target='_blank' rel='noreferrer' style={{ color: 'blue' }}>
					Verificar HDC
				</a>
				<button type='submit'>Inscribir +</button>
			</form>

			{Object.keys(jugadoresPorTorneo)
				.sort((a, b) => a.localeCompare(b))
				.map((torneoNombre) => {
					const torneo = jugadoresPorTorneo[torneoNombre];
					const categorias = [...new Set(torneo.jugadores.map((jugador) => jugador.categoria))];
					const selectedCategoria = filterCategoria[torneo.id] || 'Todas';
					return (
						<div key={torneoNombre} className='jugadores_torneo'>
							<div className='jugadores_torneo_header'>
								<select value={selectedCategoria} onChange={(e) => handleCategoriaChange(torneo.id, e.target.value)}>
									<option value='Todas'>Todas las categorías</option>
									{categorias.map((categoria) => (
										<option key={categoria} value={categoria}>
											{categoria}
										</option>
									))}
								</select>
								<span>{torneoNombre.toUpperCase()}</span>
								<button onClick={() => cerrarTorneo(torneo.id)}>Cerrar torneo</button>
							</div>
							{torneo.jugadores.length === 0 && <p>No hay jugadores inscriptos...</p>}
							{categorias
								.filter((categoria) => selectedCategoria === 'Todas' || categoria === selectedCategoria)
								.map((categoria) => (
									<div key={categoria} className='table_container'>
										<table>
											<caption>
												Cat. {categoria.toUpperCase()}
												<label>
													{' (' + torneo.jugadores.filter((jugador) => jugador.categoria === categoria).length} inscriptos, {torneo.jugadores.filter((jugador) => jugador.categoria === categoria && jugador.scores).length} scores)
												</label>
											</caption>
											<thead>
												<tr>
													<th>Matrícula</th>
													<th>Nombre</th>
													<th>HCP</th>
													<th>Club</th>
													<th>Fecha Inscripción</th>
													<th>Scores</th>
													<th />
													<th />
												</tr>
											</thead>
											<tbody>
												{torneo.jugadores
													.filter((jugador) => jugador.categoria === categoria)
													.sort((a, b) => a.nombre.localeCompare(b.nombre))
													.map((jugador) => (
														<tr key={jugador.dni} style={{ backgroundColor: jugador?.comprobante && '#fffec6ff' }} title={jugador?.comprobante && 'Jugador inscripto online'}>
															<td>{jugador.dni}</td>
															<td>
																{jugador.nombre}{' '}
																{jugador.comprobante && (
																	<span
																		className='pointer'
																		title='Ver información de la inscripción online'
																		onClick={() => {
																			setJugadorDatos(jugador);
																			setEmailInscripto(jugador.email);
																			setOpenComprobante(true);
																		}}
																	>
																		📋
																	</span>
																)}
															</td>
															<td>{jugador.handicap}</td>
															<td>{jugador.clubSocio}</td>
															<td>{jugador.fech_alta}</td>
															<td>
																{jugador.scores ? (
																	<span>✅</span>
																) : (
																	<span
																		onClick={() => {
																			setJugadorDatos(jugador);
																			setTorneoDatos(torneo);
																			setIsOpen(true);
																		}}
																		className='pointer'
																	>
																		❌
																	</span>
																)}
															</td>
															<td>
																{jugador.scores && (
																	<MdEdit
																		size={20}
																		onClick={() => {
																			setJugadorDatos(jugador);
																			setTorneoDatos(torneo);
																			setIsOpenEdit(true);
																		}}
																		className='pointer'
																	/>
																)}
															</td>
															<td>
																<FaTrash
																	className='pointer'
																	title='Eliminar'
																	onClick={async () => {
																		if (!window.confirm(`¿Seguro que deseas eliminar a ${jugador.nombre}?`)) return;
																		try {
																			await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/inscriptos/${jugador.id}`);
																			await axios
																				.get(`${process.env.REACT_APP_BACKEND_URL}/inscriptos?torneos=${idsTorneosAdmin.join(',')}`)
																				.then((response) => setJugadoresTorneo(response.data))
																				.catch((error) => console.error(error));
																		} catch (error) {
																			alert('Error al eliminar jugador');
																			console.error(error);
																		}
																	}}
																/>
															</td>
														</tr>
													))}
											</tbody>
										</table>
									</div>
								))}
						</div>
					);
				})}

			{isOpen && <Modal torneoDatos={torneoDatos} jugadorDatos={jugadorDatos} setJugadoresTorneo={setJugadoresTorneo} idsTorneosAdmin={idsTorneosAdmin} setIsOpen={setIsOpen} />}

			{isOpenEdit && <ModalEdit jugadorDatos={jugadorDatos} setJugadoresTorneo={setJugadoresTorneo} idsTorneosAdmin={idsTorneosAdmin} setIsOpen={setIsOpenEdit} />}

			{showGraf && (
				<div className='modal'>
					<div className='modal_cont'>
						<AnalisisInscriptos club={club} />
					</div>
					<IconButton size='medium' sx={{ position: 'absolute', top: 5, right: 10, color: 'white' }} onClick={() => setShowGraf(false)}>
						<IoCloseCircleSharp fontSize='40' />
					</IconButton>
				</div>
			)}

			{openComprobante && (
				<div className='modal'>
					<div className='modal_cont'>
						<h2>{jugadorDatos.dni + ' - ' + jugadorDatos.nombre}</h2>
						<span>Teléfono: {jugadorDatos.telefono}</span>
						<span>
							Email:{' '}
							<a href={'mailto:' + emailInscripto} style={{ color: 'blue' }}>
								{emailInscripto}
							</a>
						</span>
						<span>Nro. de transacción: {jugadorDatos.comprobante}</span>
						<span>Se realizó el pago en la fecha: {jugadorDatos.fech_alta}</span>
					</div>
					<IconButton
						size='medium'
						sx={{ position: 'absolute', top: 5, right: 10, color: 'white' }}
						onClick={() => {
							setOpenComprobante(false);
							setJugadorDatos([]);
							setEmailInscripto('');
						}}
					>
						<IoCloseCircleSharp fontSize='40' />
					</IconButton>
				</div>
			)}
		</div>
	);
}

export default JugadoresTorneo;
