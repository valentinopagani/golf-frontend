import { useEffect, useState } from 'react';
import CategoryStatsChart from '../components/CategoryStatsChart';
import axios from 'axios';

function AnalisisInscriptos({ club }) {
	const [fechaMin, setFechaMin] = useState('Todas');
	const [fechaMax, setFechaMax] = useState('Todas');
	const [categoryStats, setCategoryStats] = useState({ labels: [], values: [] });

	const fechaMinSelec = (value) => {
		if (value === '') {
			setFechaMin('Todas');
		} else {
			setFechaMin(value);
		}
	};

	const fechaMaxSelec = (value) => {
		if (value === '') {
			setFechaMax('Todas');
		} else {
			setFechaMax(value);
		}
	};

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_BACKEND_URL}/estadisticas/inscriptosStats?clubId=${club.id}&clubNombre=${club.nombre}&fechaMin=${fechaMin}&fechaMax=${fechaMax}`
			)
			.then((response) => setCategoryStats(response.data))
			.catch((error) => console.error(error));
	}, [fechaMin, fechaMax, club]);

	return (
		<div>
			<h2>Análisis de inscriptos totales o por categoría</h2>
			<div style={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '10px 0' }}>
					<label>
						Desde:{' '}
						<input type='date' onChange={(e) => fechaMinSelec(e.target.value)} style={{ marginRight: 8 }} />
					</label>

					<label>
						Hasta:{' '}
						<input type='date' onChange={(e) => fechaMaxSelec(e.target.value)} />
					</label>
				</div>
			</div>
			<CategoryStatsChart data={categoryStats} />
		</div>
	);
}

export default AnalisisInscriptos;
