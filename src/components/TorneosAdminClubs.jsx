import { useEffect, useState } from 'react';
import { FormGroup, IconButton, Paper, Typography } from '@mui/material';
import { FaSearch } from 'react-icons/fa';
import TorneosAdmin from './TorneosAdmin';
import EstadisticasTorneo from './EstadisticasTorneo';
import { FaPencil } from 'react-icons/fa6';
import axios from 'axios';

function TorneosAdminClubs({ club, user }) {
	const [torneosProximos, setTorneosProximos] = useState([]);
	const [torneosAntiguos, setTorneosAntiguos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [selectedCategorias, setSelectedCategorias] = useState([]);
	const [filterName, setFilterName] = useState('');
	const [filteredTorneos, setFilteredTorneos] = useState([]);
	const [canchas, setCanchas] = useState([]);
	const [fechIni, setFechIni] = useState('');
	const [fechFin, setFechFin] = useState('');
	const [torneoPass, setTorneoPass] = useState([]);
	const [modal, setModal] = useState(false);
	const [editModal, setEditModal] = useState(false);
	const [datosEdit, setDatosEdit] = useState([]);
	const [jugadoresTorneos, setJugadoresTorneos] = useState([]);
	const [insc, setInsc] = useState(false);
	const [inscEdit, setInscEdit] = useState(false);

	useEffect(() => {
		axios
			.get(`https://golf-backend-production-ad4e.up.railway.app//canchas?idClub=${club.id}`)
			.then((response) => setCanchas(response.data))
			.catch((error) => console.error(error));

		axios
			.get('https://golf-backend-production-ad4e.up.railway.app//torneos?tipo=proximos')
			.then((response) => setTorneosProximos(response.data))
			.catch((error) => console.error(error));

		axios
			.get('https://golf-backend-production-ad4e.up.railway.app//torneos?tipo=antiguos')
			.then((response) => setTorneosAntiguos(response.data))
			.catch((error) => console.error(error));

		axios
			.get(`https://golf-backend-production-ad4e.up.railway.app//categorias?club=${club.id}`)
			.then((response) => setCategorias(response.data))
			.catch((error) => console.error(error));

		axios
			.get(`https://golf-backend-production-ad4e.up.railway.app//inscriptos?clubReg=${club.id}`)
			.then((response) => setJugadoresTorneos(response.data))
			.catch((error) => console.error(error));
	}, [club.id]);

	// SELECCIONAR CATEGORIAS
	const handleCheckboxChange = (event) => {
		const { value, checked } = event.target;
		if (checked) {
			setSelectedCategorias([...selectedCategorias, value]);
		} else {
			setSelectedCategorias(selectedCategorias.filter((categoria) => categoria !== value));
		}
	};

	// BUSCAR TORNEO
	useEffect(() => {
		setFilteredTorneos(torneosAntiguos.filter((torneo) => torneo.nombre.toLowerCase().includes(filterName.toLowerCase())));
	}, [filterName, torneosAntiguos]);

	// ABRIR MODAL DE EDICION
	const openEditModal = (torneo, club) => {
		setDatosEdit(torneo);
		setSelectedCategorias(torneo.categorias.map((cat) => cat.nombre));
		setInscEdit(torneo.valor !== null ? true : false);
		setEditModal(true);
	};

	const handleTorneoClick = async (torneo) => {
		await setTorneoPass(torneo);
		setModal(true);
	};

	const date = new Date();
	let day = date.getDate();
	if (day < 10) {
		day = '0' + day;
	}
	let month = date.getMonth() + 1;
	if (month < 10) {
		month = '0' + month;
	}
	const year = date.getFullYear();
	const actualDate = year + '/' + month + '/' + day;

	return (
		<div>
			<h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>{club.nombre}</h3>
			<h2 id='nuevo_torneo'>ADMINISTRÁ TUS TORNEOS</h2>

			<div className='nueva_categoria'>
				<h3>Añadir una nueva Categoria:</h3>
				<form
					autoComplete='off'
					onSubmit={async (e) => {
						e.preventDefault();
						const nombre = e.target.cat_nombre.value;
						const vinculo = club.id;
						try {
							await axios.post('https://golf-backend-production-ad4e.up.railway.app//categorias', { nombre, vinculo });
							await axios
								.get(`https://golf-backend-production-ad4e.up.railway.app//categorias?club=${club.id}`)
								.then((response) => setCategorias(response.data))
								.catch((error) => console.error(error));
							e.target.reset();
						} catch (error) {
							console.error('estas errado pa', error);
						}
					}}
					id='form_cat'
				>
					<input type='text' id='cat_nombre' placeholder='nombre de categoria:' required />
					<button type='submit'>Crear</button>
				</form>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, marginTop: 10 }}>
					{categorias.map((cat) => (
						<Paper key={cat.id} elevation={1} sx={{ padding: 1 }}>
							<span>{cat.nombre} </span>
							<span
								style={{ cursor: 'pointer', color: 'red' }}
								title='Eliminar categoria'
								onClick={async () => {
									if (!window.confirm('¿Seguro que deseas eliminar esta categoria?')) return;
									try {
										await axios.delete(`https://golf-backend-production-ad4e.up.railway.app//categorias/${cat.id}`);
										await axios
											.get(`https://golf-backend-production-ad4e.up.railway.app//categorias?club=${club.id}`)
											.then((response) => setCategorias(response.data))
											.catch((error) => console.error(error));
									} catch (error) {
										alert('Error al eliminar categoria');
										console.error(error);
									}
								}}
							>
								x
							</span>
						</Paper>
					))}
				</div>
			</div>

			<div className='torneos_view'>
				<div>
					<Paper sx={{ p: 2 }} elevation={4} className='paper_newtorneo'>
						<h3>+ Agregar nuevo Torneo</h3>
						<hr />
						<form
							autoComplete='off'
							onSubmit={async (e) => {
								e.preventDefault();
								if (selectedCategorias.length === 0) {
									return alert('Selecciona al menos una categoría');
								}
								const fechaInicio = e.target.fech_ini.value.split('-');
								const fechaFin = e.target.fech_fin.value.split('-');
								const nombre = e.target.nombre_tor.value;
								const fech_ini = fechaInicio[2] + '/' + fechaInicio[1] + '/' + fechaInicio[0];
								const fech_fin = fechaFin[2] + '/' + fechaFin[1] + '/' + fechaFin[0];
								const cancha = e.target.cancha_juego.value;
								const rondas = parseInt(e.target.rondas.value);
								const categorias = selectedCategorias;
								const descripcion = e.target.descripcion_tor.value;
								const clubVinculo = club.id;
								const nombreClubVinculo = club.nombre;
								const fech_alta = new Date().toLocaleDateString();
								const valor = insc ? e.target.valor.value : null;
								const finalizado = 0;
								try {
									const response = await axios.post('https://golf-backend-production-ad4e.up.railway.app//torneos', {
										nombre,
										fech_ini,
										fech_fin,
										cancha,
										rondas,
										descripcion,
										clubVinculo,
										nombreClubVinculo,
										fech_alta,
										valor,
										finalizado
									});
									const torneoId = response.data.id;
									// Cargar cada categoría seleccionada a la tabla categorias_torneo
									await Promise.all(
										categorias.map((nombre) =>
											axios.post('https://golf-backend-production-ad4e.up.railway.app//categorias_torneo', {
												nombre,
												torneo_id: torneoId
											})
										)
									);

									document.getElementById('form_torneo').reset();
									setFechIni('');
									setFechFin('');
									setSelectedCategorias([]);
									await axios
										.get('https://golf-backend-production-ad4e.up.railway.app//torneos?tipo=proximos')
										.then((response) => setTorneosProximos(response.data))
										.catch((error) => console.error(error));
								} catch (error) {
									alert('Algo ha salido mal');
									console.error('Error al crear torneo o categorías', error);
								}
							}}
							className='form_torneo'
							id='form_torneo'
						>
							<input type='text' id='nombre_tor' placeholder='Nombre del torneo:' required />
							<div>
								<label>Fecha de inicio:</label>
								<input type='date' id='fech_ini' max={fechFin} onChange={(e) => setFechIni(e.target.value)} required />
							</div>
							<div>
								<label>Fecha de cierre:</label>
								<input type='date' id='fech_fin' min={fechIni} onChange={(e) => setFechFin(e.target.value)} required />
							</div>
							<div>
								<label>Cancha:</label>
								<select id='cancha_juego' required>
									{canchas.map((cancha) => (
										<option key={cancha.id} value={cancha.id}>
											{cancha.nombre} ({cancha.cant_hoyos} hoyos)
										</option>
									))}
								</select>
							</div>
							<div>
								<label>Número de rondas:</label>
								<select id='rondas' required>
									<option value='1'>1</option>
									<option value='2'>2</option>
									<option value='3'>3</option>
									<option value='4'>4</option>
								</select>
							</div>
							<div>
								<label>Seleccionar categoría/s:</label>
								<FormGroup onChange={handleCheckboxChange}>
									{categorias.map((categoria) => (
										<div key={categoria.id}>
											<input type='checkbox' value={categoria.nombre} className='pointer' />
											<label key={categoria.id}> {categoria.nombre}</label>
										</div>
									))}
								</FormGroup>
							</div>
							<textarea id='descripcion_tor' placeholder='Añade una descripcion:' />

							<h3>+ Inscripciones Web</h3>
							<hr />
							<div>
								<label>Permitir inscripciones web:</label>
								<select onChange={(e) => setInsc(!insc)}>
									<option value={false}>No</option>
									<option value={true}>Sí</option>
								</select>
							</div>
							{insc && (
								<div>
									<label>Valor de inscripción:</label>
									<input type='number' id='valor' min={1000} placeholder='$' required />
								</div>
							)}

							<button type='submit' title='Nuevo torneo en el club'>
								Agregar Torneo
							</button>
						</form>
					</Paper>
				</div>

				<div className='torneos_list'>
					<h3>Torneos proximos:</h3>
					<div className='torneos'>
						{torneosProximos
							.filter((torneo) => torneo.clubVinculo === club.id && torneo.fech_ini.split('/').reverse().join('/') >= actualDate)
							.sort((a, b) => new Date(a.fech_ini.split('/').reverse().join('-')) - new Date(b.fech_ini.split('/').reverse().join('-')))
							.map((torneo) => (
								<div key={torneo.id} className='torneo_adm'>
									<TorneosAdmin torneo={torneo} club={club} />
									{torneo.finalizado === 0 && (
										<IconButton
											className='edit_bt'
											onClick={() => {
												openEditModal(torneo, club);
											}}
										>
											<FaPencil size={18} color='#0e7cde' />
										</IconButton>
									)}
								</div>
							))}
					</div>
				</div>
			</div>

			<div className='torneos_all'>
				{torneosAntiguos.filter((torneo) => torneo.clubVinculo === club.id).length === 0 ? (
					<h3>Los torneos pasados se visualizarán aquí...</h3>
				) : (
					<div id='torneos'>
						<h3>Todos los Torneos:</h3>
						<label htmlFor='search'>Buscar: </label>
						<input type='text' placeholder='Filtrar por nombre de torneo:' value={filterName} onChange={(e) => setFilterName(e.target.value)} autoComplete='off' />
						<FaSearch />
						<div className='torneos'>
							{filteredTorneos.filter((torneo) => torneo.clubVinculo === club.id).length === 0 ? (
								<Typography variant='h3' sx={{ mt: 12, mb: 12 }}>
									No se encontró ningun torneo con ese nombre...
								</Typography>
							) : (
								filteredTorneos
									.filter((torneo) => torneo.clubVinculo === club.id)
									.sort((a, b) => new Date(b.fech_ini.split('/').reverse().join('-')) - new Date(a.fech_ini.split('/').reverse().join('-')))
									.map((torneo) => (
										<div key={torneo.id} onDoubleClick={() => handleTorneoClick(torneo)} className='torneo_adm'>
											<TorneosAdmin torneo={torneo} club={club} />
											{torneo.finalizado === 0 && (
												<IconButton
													className='edit_bt'
													onClick={() => {
														openEditModal(torneo, club);
													}}
												>
													<FaPencil size={18} color='#0e7cde' />
												</IconButton>
											)}
										</div>
									))
							)}
						</div>
					</div>
				)}
			</div>

			{modal && <EstadisticasTorneo torneo={torneoPass} jugadores={jugadoresTorneos} setModal={setModal} user={user} />}

			{editModal && (
				<div className='modal'>
					<Paper elevation={2} className='paper_editorneo'>
						<h3>
							Editar: <i>{datosEdit.nombre}</i>
						</h3>
						<form
							autoComplete='off'
							onSubmit={async (e) => {
								e.preventDefault();
								if (selectedCategorias.length === 0) {
									return alert('Selecciona al menos una categoría');
								}
								const fechaInicio = e.target.fech_ini.value.split('-');
								const fechaFin = e.target.fech_fin.value.split('-');
								const nombre = e.target.nombre_tor.value;
								const fech_ini = fechaInicio[2] + '/' + fechaInicio[1] + '/' + fechaInicio[0];
								const fech_fin = fechaFin[2] + '/' + fechaFin[1] + '/' + fechaFin[0];
								const cancha = e.target.cancha_juego.value;
								const rondas = parseInt(e.target.rondas.value);
								const categorias = selectedCategorias;
								const descripcion = e.target.descripcion_tor.value;
								const editado = new Date().toLocaleDateString();
								const valor = inscEdit ? e.target.valor.value : null;
								try {
									await axios.put(`https://golf-backend-production-ad4e.up.railway.app//torneos/${datosEdit.id}`, {
										nombre,
										fech_ini,
										fech_fin,
										cancha,
										rondas,
										descripcion,
										valor,
										editado
									});
									// Eliminar categorías_torneo asociadas
									await axios.delete(`https://golf-backend-production-ad4e.up.railway.app//categorias_torneo/torneo/${datosEdit.id}`);
									// Crear nuevas categorías_torneo
									await Promise.all(
										categorias.map((nombre) =>
											axios.post('https://golf-backend-production-ad4e.up.railway.app//categorias_torneo', {
												nombre,
												torneo_id: datosEdit.id
											})
										)
									);
									await axios
										.get('https://golf-backend-production-ad4e.up.railway.app//torneos?tipo=proximos')
										.then((response) => setTorneosProximos(response.data))
										.catch((error) => console.error(error));
									await axios
										.get('https://golf-backend-production-ad4e.up.railway.app//torneos?tipo=antiguos')
										.then((response) => setTorneosAntiguos(response.data))
										.catch((error) => console.error(error));
									document.getElementById('form_edit_torneo').reset();
									setFechIni('');
									setFechFin('');
									setSelectedCategorias([]);
									setInscEdit(false);
									setEditModal(false);
								} catch (error) {
									alert('Algo ha salido mal');
									console.error('Error al editar torneo', error);
								}
							}}
							id='form_edit_torneo'
						>
							<div>
								<label>Nombre: </label>
								<input type='text' id='nombre_tor' placeholder='Nombre del torneo:' defaultValue={datosEdit.nombre} required />
							</div>
							<div>
								<label>Fecha de inicio:</label>
								<input type='date' id='fech_ini' defaultValue={datosEdit.fech_ini.split('/').reverse().join('-')} max={fechFin} onChange={(e) => setFechIni(e.target.value)} required />
							</div>
							<div>
								<label>Fecha de cierre:</label>
								<input type='date' id='fech_fin' defaultValue={datosEdit.fech_fin.split('/').reverse().join('-')} min={fechIni} onChange={(e) => setFechFin(e.target.value)} required />
							</div>
							<div>
								<label>Cancha:</label>
								<select id='cancha_juego' defaultValue={datosEdit.cancha}>
									<option selected disabled>
										Selecciona una chancha
									</option>
									{canchas.map((cancha) => (
										<option key={cancha.id} value={cancha.id}>
											{cancha.nombre} ({cancha.cant_hoyos} hoyos)
										</option>
									))}
								</select>
							</div>
							<div>
								<label>Número de rondas:</label>
								<select id='rondas' defaultValue={datosEdit.rondas} required>
									<option value='1'>1</option>
									<option value='2'>2</option>
									<option value='3'>3</option>
									<option value='4'>4</option>
								</select>
							</div>
							<div>
								<label>Seleccionar categoría/s:</label>
								<FormGroup onChange={handleCheckboxChange}>
									{categorias.map((categoria) => (
										<div key={categoria.id}>
											<input
												type='checkbox'
												value={categoria.nombre}
												className='pointer'
												// defaultChecked compara con el array de nombres
												defaultChecked={selectedCategorias.includes(categoria.nombre)}
											/>
											<span> {categoria.nombre}</span>
										</div>
									))}
								</FormGroup>
							</div>
							<textarea id='descripcion_tor' placeholder='Añade una descripcion:' defaultValue={datosEdit.descripcion} />
							<div>
								<label>Permitir inscripciones web:</label>
								<select onChange={() => setInscEdit(!inscEdit)} defaultValue={inscEdit}>
									<option value={false}>No</option>
									<option value={true}>Sí</option>
								</select>
							</div>
							{inscEdit && (
								<div>
									<label>Valor de inscripción:</label>
									<input type='number' id='valor' min={1000} placeholder='$' required defaultValue={datosEdit.valor} />
								</div>
							)}
							<div className='edit_bts'>
								<button onClick={() => setEditModal(false)} title='Cerrar Editor' className='cerrar_edit'>
									Cancelar
								</button>
								<button type='submit' title='Confirmar Cambios' className='submit_edit'>
									Guardar Cambios
								</button>
							</div>
						</form>
					</Paper>
				</div>
			)}
		</div>
	);
}
export default TorneosAdminClubs;
