import { useEffect, useState } from 'react';
import axios from 'axios';

function EstadisticasCancha() {
	const [clubes, setClubes] = useState([]);
	const [datos, setDatos] = useState([]);

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/clubes`)
			.then((response) => setClubes(response.data))
			.catch((error) => console.error('Error:', error));

		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/estadisticas/canchasStats`)
			.then((response) => setDatos(response.data))
			.catch((error) => {
				console.error('Error:', error);
			});
	}, []);

	return (
		<div className='body_home'>
			<div className='title_banner'>
				<h2>Visualizá tu próxima cancha.</h2>
			</div>

			{clubes.map((club) => (
				<div key={club.id}>
					<h2>{club.nombre}</h2>

					{Object.keys(datos)
						.filter((element) => datos[element].club_id === club.id)
						.map((element) => (
							<details key={element}>
								<summary style={{ cursor: 'pointer', textAlign: 'center', fontSize: 20, margin: '10px 0' }}>CANCHA {datos[element].cancha_nombre.toUpperCase()}</summary>
								<div className='datos_cancha'>
									<div className='table_container'>
										<table key={element}>
											<thead>
												<tr>
													<th></th>
													<th>Distancia</th>
													<th>Dificultad</th>
													<th>Par</th>
													<th>Par Promedio</th>
													<th>Águila</th>
													<th>Birdie</th>
													<th>Par</th>
													<th>Bogey</th>
													<th>Doble Bogey</th>
												</tr>
											</thead>

											<tbody>
												{Object.keys(datos[element].estadisticas).map((hoyo) => (
													<tr key={hoyo}>
														<th>Hoyo {hoyo.split('_')[1]}</th>
														<td>{datos[element].estadisticas[hoyo].distancia} yd</td>
														<td>{datos[element].estadisticas[hoyo].dificultad}</td>
														<td>{datos[element].estadisticas[hoyo].par}</td>
														<td>{datos[element].estadisticas[hoyo].promedio}</td>
														<td className='aguila'>{datos[element].estadisticas[hoyo].porcentajes.aguila + ' %' || 'Cargando...'}</td>
														<td className='birdie'>{datos[element].estadisticas[hoyo].porcentajes.birdie + ' %' || 'Cargando...'}</td>
														<td className='par'>{datos[element].estadisticas[hoyo].porcentajes.par + ' %' || 'Cargando...'}</td>
														<td className='bogey'>{datos[element].estadisticas[hoyo].porcentajes.bogey + ' %' || 'Cargando...'}</td>
														<td className='dbogey'>{datos[element].estadisticas[hoyo].porcentajes.dobleBogey + ' %' || 'Cargando...'}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</details>
						))}
				</div>
			))}
		</div>
	);
}

export default EstadisticasCancha;
