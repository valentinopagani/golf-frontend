import { useEffect, useState } from 'react';
import { Alert, Button, Paper } from '@mui/material';
import axios from 'axios';

function Parametros({ club, fecha }) {
	const [diasSeleccionados, setDiasSeleccionados] = useState(club?.dias_habilitados || []);
	const [inicioSalida, setInicioSalida] = useState(club?.hora_ini?.slice(0, 5));
	const [finSalida, setFinSalida] = useState(club?.hora_fin?.slice(0, 5));
	const [biTee, setBiTee] = useState(club?.biTee || 1);
	const [sociosFree, setSociosFree] = useState(club?.sociosFree || 0);
	const [error, setError] = useState(false);
	const [diasInhabilitados, setDiasInhabilitados] = useState([]);

	const toggleDay = (day) => {
		setDiasSeleccionados((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
	};

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/clubes/dias_inhabilitados?clubId=${club.id}`)
			.then((response) => setDiasInhabilitados(response.data))
			.catch((error) => console.error(error));
	}, [club]);

	// limpiar mensaje de error después de 5 segundos
	useEffect(() => {
		if (!error) return;
		const timer = setTimeout(() => setError(false), 5000);
		return () => clearTimeout(timer);
	}, [error]);

	return (
		<div className='body_home'>
			<h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>{club.nombre}</h3>
			<h2>PARÁMETROS SOBRE LAS RESERVAS</h2>

			{error && <Alert severity={error[0] === 1 ? 'error' : 'success'}>{error[1]}</Alert>}

			<h3>Configuración:</h3>
			<form
				style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
				onSubmit={async (e) => {
					e.preventDefault();
					try {
						if (!window.confirm('Seguro que deseas modificar los horarios de salida?')) return;
						const dias = diasSeleccionados.length ? diasSeleccionados.sort() : null;
						const data = {
							dias: dias,
							inicio: inicioSalida + ':00',
							fin: finSalida + ':00',
							sociosFree: Number(sociosFree),
							tee: Number(biTee),
							id: Number(club.id)
						};
						await axios.put(`${process.env.REACT_APP_BACKEND_URL}/clubes/reservas`, data);
						window.location.reload();
					} catch (error) {
						console.error(error);
						setError([1, 'Error al modificar los horarios de salida!']);
						e.target.reset();
					}
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
					<span>Días habilitados para reservar: </span>

					<label>
						<input type='checkbox' value={0} checked={diasSeleccionados?.includes(0)} onChange={() => toggleDay(0)} /> Lunes
					</label>
					<label>
						<input type='checkbox' value={1} checked={diasSeleccionados?.includes(1)} onChange={() => toggleDay(1)} /> Martes
					</label>
					<label>
						<input type='checkbox' value={2} checked={diasSeleccionados?.includes(2)} onChange={() => toggleDay(2)} /> Miércoles
					</label>
					<label>
						<input type='checkbox' value={3} checked={diasSeleccionados?.includes(3)} onChange={() => toggleDay(3)} /> Jueves
					</label>
					<label>
						<input type='checkbox' value={4} checked={diasSeleccionados?.includes(4)} onChange={() => toggleDay(4)} /> Viernes
					</label>
					<label>
						<input type='checkbox' value={5} checked={diasSeleccionados?.includes(5)} onChange={() => toggleDay(5)} /> Sábados
					</label>
					<label>
						<input type='checkbox' value={6} checked={diasSeleccionados?.includes(6)} onChange={() => toggleDay(6)} /> Domingos
					</label>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
					<span>Horario de salida: </span>

					<label>
						desde las <input type='time' value={inicioSalida} max={finSalida} onChange={(e) => setInicioSalida(e.target.value)} style={{ border: 'none', background: '#d5d5d5ff' }} required />
						hs.
					</label>
					<label>
						hasta las <input type='time' value={finSalida} min={inicioSalida} onChange={(e) => setFinSalida(e.target.value)} style={{ border: 'none', background: '#d5d5d5ff' }} required />
						hs.
					</label>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
					<span>Tee de salida: </span>

					<label>
						<input type='radio' value={0} name='biTee' defaultChecked={club.biTee === 0} onChange={(e) => setBiTee(e.target.value)} /> Tee 1
					</label>
					<label>
						<input type='radio' value={1} name='biTee' defaultChecked={club.biTee === 1} onChange={(e) => setBiTee(e.target.value)} /> Tee 1 y 10
					</label>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
					<span>Socios poseén reserva gratis: </span>

					<label>
						<input type='radio' value={0} name='sociosFree' defaultChecked={club.sociosFree === 0} onChange={(e) => setSociosFree(e.target.value)} /> No
					</label>
					<label>
						<input type='radio' value={1} name='sociosFree' defaultChecked={club.sociosFree === 1} onChange={(e) => setSociosFree(e.target.value)} /> Sí
					</label>
				</div>

				<Button type='submit' variant='outlined' size='small'>
					actualizar
				</Button>
			</form>

			<h3>Inhabilitar fecha para reservas:</h3>
			<form
				style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
				onSubmit={async (e) => {
					e.preventDefault();
					try {
						if (!window.confirm(`Seguro que deseas inhabilitar las reservas para el día ${e.target.fecha_inhabilitada.value.slice(0, 10).split('-').reverse().join('-')}?`)) return;
						const data = {
							fecha: e.target.fecha_inhabilitada.value,
							motivo: e.target.motivo.value,
							club_id: Number(club.id)
						};
						await axios.put(`${process.env.REACT_APP_BACKEND_URL}/clubes/dias_inhabilitados`, data);
						await axios
							.get(`${process.env.REACT_APP_BACKEND_URL}/clubes/dias_inhabilitados?clubId=${club.id}`)
							.then((response) => setDiasInhabilitados(response.data))
							.catch((error) => console.error(error));

						setError([0, `Se inhabilitó con éxito la fecha ${e.target.fecha_inhabilitada.value.slice(0, 10).split('-').reverse().join('-')}!`]);
						e.target.reset();
					} catch (error) {
						console.error(error);
						if (error.response?.status === 400 && error.response?.data?.reservas) {
							const reservas = error.response.data.reservas;
							const detalles = reservas.map((r) => `${r.jugador} (${r.hora.slice(0, 5)}hs)`).join(' - ');

							setError([1, `No se pudo inhabilitar, hay ${reservas.length} reservas para esa fecha: ${detalles}`]);
						} else setError([1, 'Error al inhabilitar fecha!']);
						e.target.reset();
					}
				}}
			>
				<label>
					Fecha: <input type='date' min={fecha} id='fecha_inhabilitada' required />
				</label>

				<label style={{ display: 'flex', gap: '4px' }}>
					Motivo: <input type='text' id='motivo' placeholder='Cuenta el porqué...' style={{ width: '100%', boxSizing: 'border-box' }} />
				</label>

				<Button type='submit' variant='outlined' size='small' color='warning'>
					inhabilitar
				</Button>
			</form>

			<div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', width: '100%', gap: '15px', marginTop: '10px' }}>
				<span>Próximas fechas inhabilitadas:</span>
				{!diasInhabilitados.length ? (
					<span style={{ color: 'gray' }}>ninguna por el momento...</span>
				) : (
					diasInhabilitados.map((dia) => (
						<Paper elevation={3} sx={{ p: 1 }} title={dia?.motivo} key={dia.id}>
							{dia.fecha.slice(0, 10).split('-').reverse().join('-')}{' '}
							<span
								style={{ cursor: 'pointer', color: 'red' }}
								title='Eliminar fecha inhabilitada'
								onClick={async () => {
									try {
										await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/clubes/dias_inhabilitados/${dia.id}`);
										await axios
											.get(`${process.env.REACT_APP_BACKEND_URL}/clubes/dias_inhabilitados?clubId=${club.id}`)
											.then((response) => setDiasInhabilitados(response.data))
											.catch((error) => console.error(error));
										setError([0, `Se habilitó con éxito la fecha ${dia.fecha.slice(0, 10).split('-').reverse().join('-')}!`]);
									} catch (error) {
										console.error(error);
										setError([1, 'Error al habilitar fecha!']);
									}
								}}
							>
								X
							</span>
						</Paper>
					))
				)}
			</div>
		</div>
	);
}

export default Parametros;
