import { useEffect, useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { compareAsc, parse } from 'date-fns';
import { Box, Button, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { IoCloseCircleSharp } from 'react-icons/io5';
import { useForm } from 'react-hook-form';
import axios from 'axios';

function Inscripciones() {
	const [preference, setPreference] = useState(null);
	const [torneos, setTorneos] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [torneoData, setTorneoData] = useState([]);
	const [formulario, setFormulario] = useState({});
	const [verificado, setVerificado] = useState(false);

	const [status, setStatus] = useState(null);

	useEffect(() => {
		const query = new URLSearchParams(window.location.search);
		if (query.get('status')) {
			setStatus(query.get('status'));
		}
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
			.get('https://golf-backend-production-ad4e.up.railway.app/torneos?tipo=inscripciones')
			.then((response) => setTorneos(response.data))
			.catch((error) => console.error(error));
	}, []);

	const filteredTorneos = torneos.sort((a, b) => compareAsc(parse(a.fech_ini, 'dd/MM/yyyy', new Date()), parse(b.fech_ini, 'dd/MM/yyyy', new Date())));

	const openModal = (torneo) => {
		setTorneoData(torneo);
		setIsOpen(true);
	};

	const closeModal = () => {
		setIsOpen(false);
		setTorneoData([]);
		setPreference(null);
	};

	const onSubmit = handleSubmit((data) => {
		setFormulario(data);
		setVerificado(true);
	});

	const createPreference = async (torneo) => {
		try {
			const response = await axios.post('https://golf-backend-production-ad4e.up.railway.app/create_preference', {
				title: `Inscripcion a ${torneo.nombre}`,
				description: `El torneo se llevará a cabo en ${torneo.nombreClubVinculo}, inicia el ${torneo.fech_ini !== torneo.fech_fin ? torneo.fech_ini + ' al ' + torneo.fech_fin : torneo.fech_ini}`,
				price: torneo.valor,
				formulario: formulario,
				credentials: 'include'
			});
			const { id } = response.data;
			return id;
		} catch (error) {
			console.error('Error', error);
		}
	};

	const handleBuy = async (torneo) => {
		const id = await createPreference(torneo);
		if (id) {
			setPreference(id);
		}
	};

	return (
		<div className='body_home'>
			<div className='title_banner'>
				<h2>Apuntate en tu próximo torneo</h2>
			</div>

			{status && (
				<center>
					{status === 'success' && <span style={{ color: 'green', fontSize: 26, fontWeight: 'bolder' }}>¡Pago realizado con éxito!</span>}
					{status === 'failure' && <span style={{ color: 'red', fontSize: 26, fontWeight: 'bolder' }}>¡Algo ha salido mal... Intentelo nuevamente!</span>}
				</center>
			)}

			<div>
				{filteredTorneos.map((torneo) => (
					<Paper key={torneo.id} className='torneos_ins'>
						<Box sx={{ maxWidth: '600px' }}>
							<Typography variant='span'>{torneo.nombreClubVinculo}</Typography>
							<Typography variant='h6' sx={{ fontWeight: 'bold' }}>
								{torneo.nombre}
							</Typography>
							<Typography variant='span' sx={{ backgroundColor: '#ffffa9', fontWeight: 'bold' }}>
								📅 {torneo.fech_ini !== torneo.fech_fin ? torneo.fech_ini + ' al ' + torneo.fech_fin : torneo.fech_ini}
							</Typography>
							<Stack direction='row' marginTop={1} flexWrap='wrap' maxWidth='600px' justifyContent='center'>
								{torneo.categorias.map((categoria, idx) => (
									<Chip key={idx} label={categoria.nombre} size='small' sx={{ margin: 0.4 }} />
								))}
							</Stack>
						</Box>
						<Box>
							<Button color='success' variant='contained' onClick={() => openModal(torneo)}>
								inscripción
							</Button>
						</Box>
					</Paper>
				))}
			</div>

			{isOpen && (
				<div className='modal'>
					<div className='modal_cont_ins'>
						<h3>Formulario de Inscripción</h3>
						<div className='modal_cont_ins_contain'>
							<div>
								<span style={{ fontWeight: 800 }}>Datos del Torneo:</span>
								<hr />
								<span>Torneo: {torneoData.nombre}</span>
								<span>Fecha: {torneoData.fech_ini !== torneoData.fech_fin ? torneoData.fech_ini + ' al ' + torneoData.fech_fin : torneoData.fech_ini}</span>
								<span>Lugar: {torneoData.nombreClubVinculo}</span>
								<span style={{ color: '#008000', fontWeight: 900 }}>Valor ${torneoData.valor}</span>
								<Button variant='contained' disabled={!verificado ? true : false} color='success' size='small' onClick={() => handleBuy(torneoData)} title='Generar cupón de pago mediante Mercado Pago'>
									Generar Cupón de Pago
								</Button>
								{preference && (
									<Wallet
										initialization={{ preferenceId: preference }}
										onError={(error) => {
											console.error(error);
											alert('Ocurrió un error');
										}}
									/>
								)}
							</div>
							<div>
								<span style={{ fontWeight: 800 }}>Datos del jugador:</span>
								<hr />
								<form style={{ display: 'flex', flexDirection: 'column', gap: 5, margin: '10px 0' }} onSubmit={onSubmit} autoComplete='off'>
									<label>
										Nombre: <input type='text' name='nombre' placeholder='ej: Juan' {...register('nombre', { required: 'Completa el nombre *' })} />
									</label>
									{errors.nombre && <span style={{ color: 'red', fontSize: 12 }}>{errors.nombre.message}</span>}
									<label>
										Apellido: <input type='text' name='apellido' placeholder='ej: Perez' {...register('apellido', { required: 'Completa el apellido *' })} />
									</label>
									{errors.apellido && <span style={{ color: 'red', fontSize: 12 }}>{errors.apellido.message}</span>}
									<label>
										DNI: <input type='number' name='dni' placeholder='sin puntos ni guiones' {...register('dni', { required: 'Completa el dni... *', valueAsNumber: true, min: { value: 1000000, message: 'Debe contener al menos 7 dígitos' }, max: { value: 99999999, message: 'Debe contener como máximo 8 dígitos' } })} />
									</label>
									{errors.dni && <span style={{ color: 'red', fontSize: 12 }}>{errors.dni.message}</span>}
									<label>
										Club Pertenencia: <input type='text' name='clubPer' placeholder='club asociado' {...register('clubPer', { required: 'Completa el club al que perteneces *' })} />
									</label>
									{errors.clubPer && <span style={{ color: 'red', fontSize: 12 }}>{errors.clubPer.message}</span>}
									<label>
										Teléfono: <input type='number' name='tel' placeholder='ej: 3534174147' {...register('tel', { required: 'Completa el teléfono *', valueAsNumber: true })} />
									</label>
									{errors.tel && <span style={{ color: 'red', fontSize: 12 }}>{errors.tel.message}</span>}
									<label>
										Email:
										<input
											type='email'
											name='email'
											placeholder='ej: juanperez23@ejemplo.com'
											{...register('email', {
												required: 'Completa el email *',
												pattern: {
													value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
													message: 'Ingresa un email válido *'
												}
											})}
										/>
									</label>
									{errors.email && <span style={{ color: 'red', fontSize: 12 }}>{errors.email.message}</span>}
									<label>
										HDC: <input type='number' name='hcp' {...register('hdc', { required: 'Completa el handicap *', valueAsNumber: true, min: { value: 0, message: 'No se puede cargar un HDC negativo' }, max: { value: 99, message: 'Debe contener como máximo 2 dígitos' } })} />
									</label>
									{errors.hdc && <span style={{ color: 'red', fontSize: 12 }}>{errors.hdc.message}</span>}
									<label>
										Categoría:
										<select name='categoria' {...register('categoria')}>
											{torneoData.categorias.map((cat) => (
												<option value={cat.nombre} key={cat.id}>
													{cat.nombre}
												</option>
											))}
										</select>
									</label>
									<span style={{ color: '#1976d2', fontSize: 14 }}>¡Siempre verificá que la categoría sea la correcta!</span>
									<Button variant='contained' size='small' type='submit'>
										Cargar
									</Button>
								</form>
							</div>
						</div>
					</div>

					<IconButton onClick={() => closeModal()} size='medium' sx={{ position: 'absolute', top: 5, right: 10, color: 'white' }}>
						<IoCloseCircleSharp fontSize='40' />
					</IconButton>
				</div>
			)}
		</div>
	);
}

export default Inscripciones;
