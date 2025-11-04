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
			.get(`https://golf-backend-production-ad4e.up.railway.app//estadisticas/inscriptosStats?club=${encodeURIComponent(JSON.stringify(club))}&fechaMin=${fechaMin}&fechaMax=${fechaMax}`)
			.then((response) => setCategoryStats(response.data))
			.catch((error) => console.error(error));
	}, [fechaMin, fechaMax, club]);

	return (
		<div>
			<h2>Análisis de inscriptos totales o por categoría</h2>
			<div style={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
				<div>
					<label>Desde: </label>
					<input type='date' onChange={(e) => fechaMinSelec(e.target.value)} style={{ marginRight: 8 }} />

					<label style={{ marginLeft: 8 }}>Hasta: </label>
					<input type='date' onChange={(e) => fechaMaxSelec(e.target.value)} />
				</div>
			</div>
			<div>
				<CategoryStatsChart data={categoryStats} />
			</div>
		</div>
	);
}

export default AnalisisInscriptos;
