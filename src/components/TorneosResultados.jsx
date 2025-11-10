import { Box, Paper, Typography } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import EstadisticasTorneo from './EstadisticasTorneo';
import axios from 'axios';

function TorneosResultados({ torneo }) {
	const [jugadores, setJugadores] = useState([]);
	const [torneoPass, setTorneoPass] = useState([]);
	const [modal, setModal] = useState(false);
	const [categoriaSelect, setCategoriaSelect] = useState('Todas');

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/inscriptos?torneo=${torneo.id}`)
			.then((response) => setJugadores(response.data))
			.catch((error) => console.error(error));
	}, [torneo.id]);

	const getScore = (jugador, categoria) => {
		if (categoria.nombre.toLowerCase().includes('gross') || categoria.nombre.toLowerCase().includes('scratch')) {
			return jugador.totalScore;
		}
		return jugador.totalScore - jugador.handicap;
	};

	const getPodio = useMemo(
		() => (categoria) => {
			const jugadoresCategoria = jugadores.filter((jugador) => jugador.categoria.toLowerCase() === categoria.nombre.toLowerCase());
			jugadoresCategoria.sort((a, b) => getScore(a, categoria) - getScore(b, categoria));

			const podio = [];
			let posicion = 1;
			for (let i = 0; i < jugadoresCategoria.length; i++) {
				if (i > 0 && getScore(jugadoresCategoria[i], categoria) !== getScore(jugadoresCategoria[i - 1], categoria)) {
					posicion += 1;
				}
				if (posicion > 3) break;
				podio.push({ ...jugadoresCategoria[i], posicion });
			}
			return podio;
		},
		[jugadores]
	);

	const handleTorneoClick = async (torneo, categoria) => {
		setCategoriaSelect(categoria.nombre);
		await setTorneoPass(torneo);
		setModal(true);
	};

	const renderCategoria = (categoria) => {
		const podio = getPodio(categoria);
		return (
			<Box key={categoria.id} display='flex' flexDirection='column' margin={2} padding={1} borderRadius={1.4} boxShadow='0px 0px 10px 0px rgba(0, 0, 0, 0.2)' onClick={() => handleTorneoClick(torneo, categoria)} className='pointer' sx={{ transition: 'all 0.1s', '&:hover': { scale: 1.01, boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.3)' } }}>
				<Typography variant='span' textAlign='center' fontStyle='italic'>
					{categoria.nombre}
				</Typography>
				{podio.length > 0 &&
					podio.map((jugador) => (
						<Typography key={jugador.dni} variant='span' marginLeft={jugador.posicion - 1} color={jugador.posicion === 1 ? '#feb800' : jugador.posicion === 2 ? '#757575' : jugador.posicion === 3 ? '#ca5010' : 'black'}>
							{jugador.posicion === 1 && '🥇 '} {jugador.posicion === 2 && '🥈 '} {jugador.posicion === 3 && '🥉 '}
							{jugador.nombre}
						</Typography>
					))}
			</Box>
		);
	};

	return (
		<div>
			<Paper sx={{ width: '90vw', mb: 4, p: 2, borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }} elevation={5} className='paper_res'>
				<Box textAlign='center' width='35%'>
					<Typography variant='span' fontStyle='italic'>
						{torneo.nombreClubVinculo}
					</Typography>
					<Typography variant='h6' fontWeight='bold'>
						{torneo.nombre.toUpperCase()}
					</Typography>
					<Typography variant='span' backgroundColor='#ffffa9' fontWeight='bold'>
						{torneo.fech_ini !== torneo.fech_fin ? torneo.fech_ini + ' al ' + torneo.fech_fin : torneo.fech_ini}
					</Typography>
					<Typography fontWeight='bold'>
						{torneo.rondas} {torneo.rondas === 1 ? 'ronda' : 'rondas'}
					</Typography>
					<Typography fontSize={14} fontStyle='italic'>
						{torneo.descripcion}
					</Typography>
				</Box>
				<Box width='65%' display='flex' flexWrap='wrap' justifyContent='center' alignItems='center'>
					{torneo.categorias.map(renderCategoria)}
				</Box>
			</Paper>
			{modal && <EstadisticasTorneo torneo={torneoPass} jugadores={jugadores} categoriaSelect={categoriaSelect} setModal={setModal} />}
		</div>
	);
}

export default TorneosResultados;
