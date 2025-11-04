import { Button, Paper, Typography } from '@mui/material';
import { parse, subMonths } from 'date-fns';
import axios from 'axios';

function TorneosAdmin({ torneo, club }) {
	async function eliminarTorneo() {
		if (!window.confirm('¿Seguro que deseas eliminar este torneo?')) return;
		try {
			await axios.delete(`https://golf-backend-production-ad4e.up.railway.app/torneos/${torneo.id}`);
			window.alert('Torneo eliminado correctamente');
			window.location.reload();
		} catch (error) {
			alert('Error al eliminar el torneo');
			console.error(error);
		}
	}

	const actualDate = new Date();
	const twoMonthsAgo = subMonths(actualDate, 2);

	return (
		<Paper
			sx={{
				p: '10px 18px',
				maxWidth: 350
			}}
			elevation={2}
		>
			<Typography
				sx={{
					color: 'gray',
					fontSize: 12,
					textAlign: 'center',
					fontWeight: 'bold'
				}}
			>
				{club.nombre + (torneo.editado != null ? ' (editado)' : '')}
			</Typography>
			<Typography sx={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>{torneo.nombre.toUpperCase()}</Typography>
			<Typography sx={{ fontSize: 15 }}>
				<b>Inicia: </b> {torneo.fech_ini}
			</Typography>
			<Typography sx={{ fontSize: 15 }}>
				<b>Cierra: </b> {torneo.fech_fin}
			</Typography>
			<Typography sx={{ fontSize: 15 }}>
				<b>{torneo.rondas} ronda/s</b>
			</Typography>
			<Typography sx={{ fontSize: 15 }}>
				<b>Categoria/s: </b> {torneo.categorias.map((cat) => cat.nombre + ', ')}
			</Typography>
			<Typography sx={{ fontSize: 15 }}>
				<b>Descripcion:</b> {torneo.descripcion}
			</Typography>
			{torneo.valor && <Typography sx={{ fontSize: 16, fontWeight: 'bold' }}>Valor inscripción: ${torneo.valor}</Typography>}
			<Button sx={{ p: 0, fontWeight: 'bold', mr: 2 }} color='error' onClick={eliminarTorneo} title='Eliminar de forma permanente'>
				Eliminar
			</Button>
			{torneo.finalizado === 1 && parse(torneo.fech_ini, 'dd/MM/yyyy', new Date()) >= twoMonthsAgo && (
				<Button
					sx={{ p: 0, fontWeight: 'bold' }}
					color='primary'
					onClick={async () => {
						try {
							await axios.put(`https://golf-backend-production-ad4e.up.railway.app/torneos/${torneo.id}/reabrir`, { finalizado: 0 });
							alert('Torneo reabierto correctamente');
						} catch (error) {
							alert('Error al reabrir torneo');
							console.error(error);
						}
					}}
				>
					Reabrir inscriptos
				</Button>
			)}
		</Paper>
	);
}

export default TorneosAdmin;
