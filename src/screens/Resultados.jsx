import { useEffect, useState, lazy, memo } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Paper } from '@mui/material';
import { parse, compareDesc } from 'date-fns';
import EstadisticasTorneo from '../components/EstadisticasTorneo';
import axios from 'axios';

const TorneosResultados = lazy(() => import('../components/TorneosResultados'));

const Resultados = memo(function Resultados() {
	const [torneosShow, setTorneosShow] = useState([]);
	const [torneos, setTorneos] = useState([]);
	const [inscriptos, setInscriptos] = useState([]);
	const [filtro, setFiltro] = useState('');
	const [bandera, setBandera] = useState(false);
	const [torneoPass, setTorneoPass] = useState([]);
	const [modal, setModal] = useState(false);

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/torneos?tipo=cincomeses`)
			.then((response) => setTorneosShow(response.data))
			.catch((error) => console.error(error));

		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/inscriptos`)
			.then((response) => setInscriptos(response.data))
			.catch((error) => console.error(error));
	}, []);

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/torneos?nombre=${filtro}`)
			.then((response) => setTorneos(response.data))
			.catch((error) => console.error(error));
	}, [filtro]);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm();

	const handleTorneoClick = async (torneo) => {
		await setTorneoPass(torneo);
		setModal(true);
	};

	return (
		<div className='body_resultados'>
			<div id='clubes_home'>
				<div className='title_banner'>
					<h2>Mirá los últimos torneos y sus resultados.</h2>
				</div>
				<div className='clubes_banner_home'>
					<div className='torneos_home'>
						{torneosShow
							.sort((a, b) => compareDesc(parse(a.fech_ini, 'dd/MM/yyyy', new Date()), parse(b.fech_ini, 'dd/MM/yyyy', new Date())))
							.map((torneo) => (
								<div key={torneo.id}>
									<div>
										<TorneosResultados sx={{ m: 0 }} torneo={torneo} />
									</div>
								</div>
							))}
					</div>
				</div>

				<div>
					<h2>📅 Buscar Torneos:</h2>
					<form
						style={{ display: 'flex', alignItems: 'center', gap: 10 }}
						autoComplete='off'
						onSubmit={handleSubmit((data) => {
							const value = (data.inpfiltro || '').trim();
							if (value.length !== 0) {
								setFiltro(value.toLowerCase());
								setBandera(true);
							}
							reset();
						})}
					>
						<input
							type='text'
							placeholder='🔎 Buscar por Nombre de Torneo:'
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
						{bandera && (
							<span onClick={() => setBandera(false)} style={{ cursor: 'pointer', marginLeft: 10 }}>
								Limpiar
							</span>
						)}
					</form>

					{errors.inpfiltro && <span style={{ color: 'red' }}>{errors.inpfiltro.message}</span>}

					<div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
						{bandera && torneos.length !== 0
							? torneos.map((torneo) => (
									<Paper key={torneo.id} elevation={2} sx={{ padding: 2, cursor: 'pointer' }} onClick={() => handleTorneoClick(torneo)}>
										{torneo.nombre + ' ' + torneo.fech_ini}
									</Paper>
							  ))
							: bandera && torneos.length === 0 && <span>No se encontraron resultados para {filtro}...</span>}
					</div>
				</div>
			</div>

			{modal && <EstadisticasTorneo torneo={torneoPass} jugadores={inscriptos} setModal={setModal} />}
		</div>
	);
});

export default Resultados;
