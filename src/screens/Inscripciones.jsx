import { useEffect, useState } from 'react';
import { compareAsc, parse } from 'date-fns';
import { Alert, Box, Button, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { IoCloseCircleSharp } from 'react-icons/io5';
import { useForm } from 'react-hook-form';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import QRCode from 'qrcode';
import axios from 'axios';

function Inscripciones() {
	const [torneos, setTorneos] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [torneoData, setTorneoData] = useState(null);
	const [metodoPago, setMetodoPago] = useState(null);
	const [direccionClub, setDireccionClub] = useState(null);
	const [filtroDni, setFiltroDni] = useState(0);
	const [jugadorRegistrado, setJugadorRegistrado] = useState(false);
	const [formulario, setFormulario] = useState([]);
	const [loading, setLoading] = useState(false);
	const [verificado, setVerificado] = useState(false);
	const [status, setStatus] = useState(null);
	const [loadingQR, setLoadingQR] = useState(false);
	const [qrData, setQrData] = useState(null);
	const [hash, setHash] = useState(null);
	const [preference, setPreference] = useState(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		const query = new URLSearchParams(window.location.search);
		if (query.get('status')) setStatus(query.get('status'));
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm();

	useEffect(() => {
		initMercadoPago(process.env.REACT_APP_MP_PUBLIC_KEY, {
			locale: 'es-AR'
		});

		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/torneos?tipo=inscripciones`)
			.then((response) => setTorneos(response.data))
			.catch((error) => console.error(error));
	}, []);

	// traer metodo de pago y direccion del club
	useEffect(() => {
		if (torneoData === null) return;
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/clubes?idTorneo=${torneoData.clubVinculo}`)
			.then((response) => {
				setMetodoPago(response.data[0].metodo_inscripcion);
				setDireccionClub(response.data[0].direccion);
			})
			.catch((error) => console.error(error));
	}, [torneoData]);

	// limpiar mensaje de error después de 5 segundos
	useEffect(() => {
		if (!error) return;
		const timer = setTimeout(() => setError(false), 5000);
		return () => clearTimeout(timer);
	}, [error]);

	const openModal = (torneo) => {
		setTorneoData(torneo);
		setIsOpen(true);
	};

	const closeModal = () => {
		setIsOpen(false);
		setTorneoData(null);
		setMetodoPago(null);
		setFormulario([]);
		setQrData(null);
		setVerificado(false);
		setHash(null);
		setPreference(null);
	};

	// autocompletar formulario con datos del jugador
	useEffect(() => {
		if (filtroDni.length !== 6) return;

		const fetchJugador = async () => {
			try {
				const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/jugadores?dniExacto=${filtroDni}`);
				setJugadorRegistrado(response.data.length > 0 ? response.data[0] : false);
			} catch (error) {
				console.error('Error buscando jugadores:', error);
				setJugadorRegistrado(false);
			}
		};

		fetchJugador();
	}, [filtroDni]);

	const onSubmit = handleSubmit(async (data) => {
		const dataForm = {
			dni: data.dni,
			nombre: jugadorRegistrado ? jugadorRegistrado.nombre : `${data.apellido} ${data.nombre}`,
			club_socio: jugadorRegistrado ? jugadorRegistrado.clubSocio : data.club_socio,
			tel: data.tel,
			email: data.email,
			hdc: data.hdc,
			categoria: data.categoria,
			torneo: torneoData.id
		};
		// Verificar en el backend si el DNI ya está inscripto en este torneo
		try {
			const r = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/inscriptos/check`, {
				params: {
					torneo: torneoData.id,
					dni: data.dni,
					categoria: data.categoria
				}
			});
			if (r.data && r.data.exists) {
				setError([1, 'Ya existe una inscripción con ese número de matrícula para este torneo']);
				return;
			} else {
				setFormulario(dataForm);
				setVerificado(true);
				setError(false);
			}
		} catch (err) {
			console.error('Error verificando inscripción:', err);
			return;
		}
	});

	const botonesPago = () => {
		if (metodoPago === 2) {
			return (
				<div>
					<Button
						variant='contained'
						disabled={!verificado || loadingQR}
						color='primary'
						size='small'
						onClick={generarQRSIRO}
						style={{ marginTop: 10, marginLeft: 10 }}
					>
						{loadingQR ? 'Generando QR...' : 'Generar QR'}
					</Button>
					{qrData && (
						<div style={{ textAlign: 'center', marginTop: 20 }}>
							<h4>Tu QR de pago</h4>
							<img src={qrData} alt='qr' style={{ width: 200, height: 200 }} />

							{/* Estado del pago en vivo */}
							{hash && <p style={{ marginTop: 10, fontWeight: 'bold' }}>Verificando pago...</p>}
						</div>
					)}
				</div>
			);
		} else if (metodoPago === 1) {
			return (
				<div>
					<Button
						variant='contained'
						disabled={!verificado || loading}
						color='success'
						size='small'
						onClick={() => handleBuy(torneoData)}
						title='Generar cupón de pago mediante Mercado Pago'
					>
						{loading ? 'esperando pago' : 'generar pago'}
					</Button>
					{!verificado && <span style={{ color: 'gray' }}>Primero completá el formulario</span>}
					{preference && (
						<Wallet
							initialization={{ preferenceId: preference }}
							onError={(error) => {
								console.error(error);
								setError([2, 'Ocurrió un error con el Wallet de MercadoPago']);
							}}
						/>
					)}
				</div>
			);
		}
	};

	// SIRO PAGOS
	const generarQRSIRO = async () => {
		try {
			setLoadingQR(true);
			const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/crear-qr`, {
				concepto: `Inscripcion`,
				descripcion: `Torneo en ${torneoData.nombreClubVinculo}`,
				importe: torneoData.valor,
				formulario: formulario
			});
			const stringQR = response.data.qr_string;
			// Guardar el hash del pago
			setHash(response.data.hash);
			// Convertir STRING → imagen PNG base64
			const qrImg = await QRCode.toDataURL(stringQR);
			setQrData(qrImg);
		} catch (error) {
			console.error(error);
			alert('ERROR AL GENERAR QR');
		} finally {
			setLoadingQR(false);
		}
	};

	// POLLING AUTOMÁTICO SIRO
	// useEffect(() => {
	// 	if (!hash) return;

	// 	const interval = setInterval(async () => {
	// 		try {
	// 			const r = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/estado-pago`, { hash });
	// 			if (r.data.estado === 'APROBADO') {
	// 				setStatus('success');
	// 				clearInterval(interval);
	// 			}
	// 			if (r.data.estado === 'RECHAZADO') {
	// 				setStatus('failure');
	// 				clearInterval(interval);
	// 			}
	// 		} catch (err) {
	// 			console.error('Error consultando estado:', err);
	// 		}
	// 	}, 5000);

	// 	return () => clearInterval(interval);
	// }, [hash]);

	// MERCADO PAGO
	const createPreference = async (torneo) => {
		try {
			const payload = {
				torneo_id: torneo.id,
				type: 1, // 0 = reserva, 1 = inscripción
				formulario: formulario
			};
			const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/create_preference`, payload, { withCredentials: true });
			const { id } = response.data;
			return id;
		} catch (error) {
			console.error('Error', error);
			setError([2, 'Ocurrió un error al generar preferencias de MercadoPago']);
			setLoading(false);
		}
	};

	const handleBuy = async (torneo) => {
		setLoading(true);
		const id = await createPreference(torneo);
		if (id) {
			setPreference(id);
		}
	};

	return (
		<div className='body_home'>
			<div className='title_banner'>
				<h2>Inscribite en tu próximo torneo</h2>
			</div>

			{status && (
				<center>
					{status === 'success' && (
						<span
							style={{
								color: 'green',
								fontSize: 30,
								fontWeight: 'bolder'
							}}
						>
							¡Pago realizado con éxito!
						</span>
					)}
					{status === 'failure' && (
						<span
							style={{
								color: 'red',
								fontSize: 30,
								fontWeight: 'bolder'
							}}
						>
							¡Algo ha salido mal... Intentelo nuevamente!
						</span>
					)}
				</center>
			)}

			<div>
				{!torneos.length ? (
					<div>No hay torneos disponibles para inscribirse en este momento...</div>
				) : (
					torneos
						.sort((a, b) => compareAsc(parse(a.fech_ini, 'dd/MM/yyyy', new Date()), parse(b.fech_ini, 'dd/MM/yyyy', new Date())))
						.map((torneo) => (
							<Paper key={torneo.id} elevation={3} className='torneos_ins'>
								<Box sx={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
									<Typography variant='span'>🚩 {torneo.nombreClubVinculo} 🚩</Typography>
									<Typography variant='h6' sx={{ fontWeight: 'bold' }}>
										{torneo.nombre}
									</Typography>
									<Typography
										variant='span'
										sx={{
											backgroundColor: '#ffffa9',
											fontWeight: 'bold'
										}}
									>
										📅 {torneo.fech_ini !== torneo.fech_fin ? torneo.fech_ini + ' al ' + torneo.fech_fin : torneo.fech_ini}
									</Typography>
									<Stack direction='row' marginTop={1} flexWrap='wrap' maxWidth='600px' justifyContent='center'>
										{torneo.categorias.map((categoria, idx) => (
											<Chip key={idx + categoria.nombre} label={categoria.nombre} size='small' sx={{ margin: 0.4 }} />
										))}
									</Stack>
								</Box>
								<Box>
									<Button color='success' variant='contained' onClick={() => openModal(torneo)}>
										inscripción
									</Button>
								</Box>
							</Paper>
						))
				)}
			</div>

			{isOpen && (
				<div className='modal'>
					<div className='modal_cont_ins'>
						<h3>Formulario de Inscripción</h3>
						{error && <Alert severity={error[0] === 1 ? 'warning' : 'error'}>{error[1]}</Alert>}
						<div className='modal_cont_ins_contain'>
							<div>
								<span style={{ fontWeight: 800 }}>Datos del Torneo:</span>
								<hr />
								<span>Torneo: {torneoData.nombre}</span>
								<span>Fecha: {torneoData.fech_ini !== torneoData.fech_fin ? torneoData.fech_ini + ' al ' + torneoData.fech_fin : torneoData.fech_ini}</span>
								<span>Lugar: {torneoData.nombreClubVinculo}</span>
								<iframe
									src={direccionClub}
									title='GMAPS direccion del club'
									style={{ border: 0 }}
									allowfullscreen=''
									loading='lazy'
									referrerpolicy='no-referrer-when-downgrade'
								></iframe>
								<span style={{ color: '#008000', fontWeight: 900 }}>Valor ${torneoData.valor}</span>
								{botonesPago()}
							</div>

							<div>
								<span style={{ fontWeight: 800 }}>Datos del jugador:</span>
								<hr />
								<form
									style={{
										display: 'flex',
										flexDirection: 'column',
										gap: 5,
										margin: '10px 0'
									}}
									onSubmit={onSubmit}
									onChange={() => {
										if (verificado) setVerificado(false);
										if (loading) setLoading(false);
									}}
									autoComplete='off'
								>
									<label>
										Matrícula:
										<input
											type='text'
											{...register('dni', {
												required: 'Completá el n. de matrícula *',
												onChange: (e) => {
													e.target.value = e.target.value.replace(/[^0-9]/g, '');
													setFiltroDni(e.target.value);
													if (e.target.value.length !== 6) {
														setJugadorRegistrado(false);
													}
												}
											})}
											maxLength={6}
											minLength={4}
										/>
									</label>
									{errors.dni && <span style={{ color: 'red', fontSize: 12 }}>{errors.dni.message}</span>}

									{!jugadorRegistrado ? (
										<>
											<label>
												Nombre/s:
												<input
													type='text'
													autoCapitalize='words'
													{...register('nombre', {
														required: 'Completá el nombre *',
														onChange: (e) => {
															e.target.value = e.target.value.replace(/[^a-zA-Z ]/g, '');
														}
													})}
												/>
											</label>
											{errors.nombre && <span style={{ color: 'red', fontSize: 12 }}>{errors.nombre.message}</span>}

											<label>
												Apellido/s:
												<input
													type='text'
													autoCapitalize='words'
													{...register('apellido', {
														required: 'Completá el apellido *'
													})}
												/>
											</label>
											{errors.apellido && <span style={{ color: 'red', fontSize: 12 }}>{errors.apellido.message}</span>}

											<label>
												Club Pertenencia:
												<input
													type='text'
													autoCapitalize='words'
													{...register('club_socio', {
														required: 'Completá el club al que perteneces *'
													})}
												/>
											</label>
											{errors.club_socio && <span style={{ color: 'red', fontSize: 12 }}>{errors.club_socio.message}</span>}
										</>
									) : (
										<span style={{ color: 'green' }}>Ya tenemos los datos de {jugadorRegistrado.nombre}</span>
									)}

									<label>
										Teléfono:
										<input
											type='text'
											maxLength={10}
											{...register('tel', {
												required: 'Completá el n. de teléfono *',
												onChange: (e) => {
													e.target.value = e.target.value.replace(/[^0-9]/g, '');
												},
												min: {
													value: 100000000,
													message: 'Debe contener 10 dígitos min'
												}
											})}
										/>
									</label>
									{errors.tel && <span style={{ color: 'red', fontSize: 12 }}>{errors.tel.message}</span>}

									<label>
										Email:
										<input
											type='email'
											{...register('email', {
												required: 'Completá el email *',
												pattern: {
													value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
													message: 'Ingresa un email válido *'
												}
											})}
										/>
									</label>
									{errors.email && <span style={{ color: 'red', fontSize: 12 }}>{errors.email.message}</span>}

									<label>
										HDC:
										<input
											type='text'
											{...register('hdc', {
												required: 'Completá el handicap *',
												onChange: (e) => {
													e.target.value = e.target.value.replace(/[^0-9]/g, '');
												}
											})}
											maxLength={2}
										/>
									</label>
									{errors.hdc && <span style={{ color: 'red', fontSize: 12 }}>{errors.hdc.message}</span>}

									<label>
										Categoría:
										<select {...register('categoria')}>
											{torneoData.categorias?.map((cat) => (
												<option key={cat.id} value={cat.nombre}>
													{cat.nombre}
												</option>
											))}
										</select>
									</label>

									<span style={{ color: '#1976d2', fontSize: 14 }}>¡Verificá que los datos ingresados sean correctos!</span>

									<Button variant='contained' size='small' type='submit'>
										cargar
									</Button>
								</form>
							</div>
						</div>
					</div>

					<IconButton
						onClick={() => closeModal()}
						size='medium'
						sx={{
							position: 'absolute',
							top: 5,
							right: 5,
							color: 'white'
						}}
					>
						<IoCloseCircleSharp fontSize='40' />
					</IconButton>
				</div>
			)}
		</div>
	);
}

export default Inscripciones;
