import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

function TorneosHome({ torneo, club }) {
	return (
		<Paper sx={{ m: 2, padding: '10px 20px', maxWidth: 500, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }} elevation={3} className='paper'>
			<Box sx={{ textAlign: 'center' }}>
				<img src={club.logo} alt='logo del club' />
			</Box>
			<Box sx={{ textAlign: 'center' }}>
				<Typography variant='span'>{club.nombre}</Typography>
				<Typography variant='h6' sx={{ fontWeight: 'bold' }}>
					{torneo.nombre}
				</Typography>
				<Typography variant='span' sx={{ backgroundColor: '#ffffa9', fontWeight: 'bold' }}>
					{torneo.fech_ini !== torneo.fech_fin ? torneo.fech_ini + ' al ' + torneo.fech_fin : torneo.fech_ini}
				</Typography>
				<br />
				<Typography variant='span' sx={{ fontWeight: 'bold' }}>
					{torneo.rondas} {torneo.rondas === 1 ? 'ronda' : 'rondas'}
				</Typography>
				<Typography>{torneo.descripcion}</Typography>
				<Stack direction='row' flexWrap='wrap' maxWidth={380} justifyContent='center'>
					{torneo.categorias.map((categoria, idx) => (
						<Chip key={idx} label={categoria.nombre} size='small' sx={{ margin: 0.4 }} />
					))}
				</Stack>
			</Box>
		</Paper>
	);
}

export default TorneosHome;
