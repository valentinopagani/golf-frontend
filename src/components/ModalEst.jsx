import { lazy, useState, useMemo, useEffect } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { FaRegAddressCard } from 'react-icons/fa6';
import { FcStatistics } from 'react-icons/fc';
import { FaHistory } from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { IoCloseCircleSharp } from 'react-icons/io5';
import axios from 'axios';

const Historial = lazy(() => import('./Historial'));

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function ModalEst({ torneo, jugadorDatos, setIsOpen, condicion }) {
	const [datosCancha, setDatosCancha] = useState([]);

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/canchas?idCancha=${torneo.cancha}`)
			.then((response) => setDatosCancha(response.data[0]))
			.catch((error) => console.error(error));
	}, [torneo.cancha]);

	const scores = useMemo(() => jugadorDatos.scores || {}, [jugadorDatos.scores]);
	const numRondas = torneo.rondas;
	const numHoyos = datosCancha ? datosCancha.cant_hoyos : 18;
	const [tabs, setTabs] = useState(1);

	const calcularEstadisticas = useMemo(() => {
		let aguila = 0;
		let birdie = 0;
		let par = 0;
		let bogey = 0;
		let dbogey = 0;

		for (let rondaIndex = 0; rondaIndex < numRondas; rondaIndex++) {
			for (let hoyoIndex = 0; hoyoIndex < numHoyos; hoyoIndex++) {
				const score = scores[`ronda${rondaIndex + 1}_hoyo${hoyoIndex + 1}`];
				const parHoyo = datosCancha.hoyos[`hoyo_${hoyoIndex + 1}`].par;
				if (score === parHoyo) {
					par += 1;
				} else if (score === parHoyo + 1) {
					bogey += 1;
				} else if (score === parHoyo - 1) {
					birdie += 1;
				} else if (score === parHoyo + 2) {
					dbogey += 1;
				} else if (score === parHoyo - 2) {
					aguila += 1;
				}
			}
		}

		par = (par / (numRondas * numHoyos)) * 100;
		birdie = (birdie / (numRondas * numHoyos)) * 100;
		bogey = (bogey / (numRondas * numHoyos)) * 100;
		dbogey = (dbogey / (numRondas * numHoyos)) * 100;
		aguila = (aguila / (numRondas * numHoyos)) * 100;

		return {
			labels: ['Par', 'Birdie', 'Bogey', 'Doble Bogey', 'Águila'],
			datasets: [
				{
					label: 'Porcentaje',
					data: [par, birdie, bogey, dbogey, aguila],
					backgroundColor: ['#bde9ba', '#f7ebb9', '#c9d9e9', '#f5c7c5', '#78ffd2']
				}
			]
		};
	}, [numRondas, numHoyos, scores, datosCancha]);

	const graficoEstadisticas = useMemo(() => {
		const labels = Array.from({ length: numHoyos }, (_, i) => i + 1);
		const datasets = [];

		for (let rondaIndex = 0; rondaIndex < numRondas; rondaIndex++) {
			datasets.push({
				label: `${rondaIndex + 1}º Ronda | Par`,
				data: labels.map((_, hoyoIndex) => scores[`ronda${rondaIndex + 1}_hoyo${hoyoIndex + 1}`] || 0),
				backgroundColor: rondaIndex + 1 === 1 ? '#3572ffff' : rondaIndex + 1 === 2 ? '#51e386' : rondaIndex + 1 === 3 ? '#73dada' : rondaIndex + 1 ? '#f37a7a' : 'black'
			});
		}

		return {
			labels,
			datasets: [
				{
					label: 'Par Hoyo',
					data: labels.map((_, hoyoIndex) => datosCancha.hoyos[`hoyo_${hoyoIndex + 1}`].par),
					backgroundColor: 'rgba(0, 0, 0, 0.3)'
				},
				...datasets
			]
		};
	}, [numHoyos, numRondas, scores, datosCancha]);

	return (
		<div className='modal'>
			<div className='modal_cont'>
				<h4>
					{torneo.nombre.toUpperCase()} - {jugadorDatos.categoria.toUpperCase()}
				</h4>
				<h3>
					{jugadorDatos.dni + ' - ' + jugadorDatos.nombre.toUpperCase()} <b className='green'>(HCP: {jugadorDatos.handicap})</b>
				</h3>

				<Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }} className='est_bts'>
					<Button color='black' variant='contained' sx={{ margin: '0 10px' }} onClick={() => setTabs(1)}>
						<FaRegAddressCard size={26} style={{ marginRight: 5 }} />
						tarjeta
					</Button>
					<Button color='black' variant='contained' sx={{ margin: '0 10px' }} onClick={() => setTabs(2)}>
						<FcStatistics size={28} style={{ marginRight: 5 }} />
						estadísticas
					</Button>
					{!condicion && (
						<Button color='black' variant='contained' sx={{ margin: '0 10px' }} onClick={() => setTabs(3)}>
							<FaHistory size={20} style={{ marginRight: 5 }} />
							historial
						</Button>
					)}
				</Box>

				{tabs === 1 && (
					<div>
						{Array.from({ length: numRondas }, (_, rondaIndex) => {
							let parJugador = 0;
							return (
								<div className='table_container' key={`ronda${rondaIndex + 1}`}>
									<table className='tabla_jugador'>
										<caption>Ronda {rondaIndex + 1}</caption>
										<thead>
											<tr>
												<th>Hoyo</th>
												{Array.from({ length: numHoyos }, (_, hoyoIndex) => (
													<th key={`hoyo${hoyoIndex + 1}`}>{hoyoIndex + 1}</th>
												))}
												<th>Gross</th>
												<th>Neto</th>
											</tr>
											<tr>
												<td>Par Hoyo</td>
												{Array.from({ length: numHoyos }, (_, hoyoIndex) => (
													<td key={`hoyo${hoyoIndex + 1}`}>{datosCancha.hoyos[`hoyo_${hoyoIndex + 1}`].par}</td>
												))}
												<td>{datosCancha.parCancha}</td>
												<td>-</td>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>Golpes jugador</td>
												{Array.from({ length: numHoyos }, (_, hoyoIndex) => {
													const score = scores[`ronda${rondaIndex + 1}_hoyo${hoyoIndex + 1}`];
													parJugador += score;
													const parHoyo = datosCancha.hoyos[`hoyo_${hoyoIndex + 1}`].par;
													if (score === parHoyo) {
														return (
															<td key={`hoyo${hoyoIndex + 1}`} className='par'>
																<span>{scores[`ronda${rondaIndex + 1}_hoyo${hoyoIndex + 1}`] || '-'}</span>
															</td>
														);
													} else if (score === parHoyo + 1) {
														return (
															<td key={`hoyo${hoyoIndex + 1}`} className='bogey'>
																<span>{scores[`ronda${rondaIndex + 1}_hoyo${hoyoIndex + 1}`] || '-'}</span>
															</td>
														);
													} else if (score === parHoyo - 1) {
														return (
															<td key={`hoyo${hoyoIndex + 1}`} className='birdie'>
																<span>{scores[`ronda${rondaIndex + 1}_hoyo${hoyoIndex + 1}`] || '-'}</span>
															</td>
														);
													} else if (score === parHoyo + 2) {
														return (
															<td key={`hoyo${hoyoIndex + 1}`} className='dbogey'>
																<span>{scores[`ronda${rondaIndex + 1}_hoyo${hoyoIndex + 1}`] || '-'}</span>
															</td>
														);
													} else if (score === parHoyo - 2) {
														return (
															<td key={`hoyo${hoyoIndex + 1}`} className='aguila'>
																<span>{scores[`ronda${rondaIndex + 1}_hoyo${hoyoIndex + 1}`] || '-'}</span>
															</td>
														);
													} else {
														return (
															<td key={`hoyo${hoyoIndex + 1}`}>
																<span>{scores[`ronda${rondaIndex + 1}_hoyo${hoyoIndex + 1}`] || '-'}</span>
															</td>
														);
													}
												})}
												<td>{parJugador}</td>
												{jugadorDatos.categoria.toLowerCase().includes('gross') || jugadorDatos.categoria.toLowerCase().includes('scratch') ? <td>-</td> : <td>{parJugador - jugadorDatos.handicap}</td>}
											</tr>
											{rondaIndex + 1 === numRondas && (
												<tr>
													<td>SCORE</td>
													<td>{jugadorDatos.categoria.toLowerCase().includes('gross') || jugadorDatos.categoria.toLowerCase().includes('scratch') ? jugadorDatos.totalScore - datosCancha.parCancha : jugadorDatos.totalScore - jugadorDatos.handicap - datosCancha.parCancha * torneo.rondas}</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							);
						})}
					</div>
				)}

				{tabs === 2 && (
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', width: '960px' }} className='grafic_container'>
						<div style={{ width: '250px', height: '250px' }}>
							<Pie
								className='torta'
								data={calcularEstadisticas}
								options={{
									responsive: true,
									animation: {
										duration: 2000
									},
									plugins: {
										tooltip: {
											callbacks: {
												label: function (context) {
													const label = context.label || '';
													const value = context.parsed || 0;
													return label + ': ' + value.toFixed(0) + '%';
												}
											}
										}
									}
								}}
							/>
						</div>
						<div style={{ width: '700px', height: '350px' }}>
							<Bar
								className='grafico'
								data={graficoEstadisticas}
								options={{
									responsive: true,
									animation: {
										duration: 2000
									},
									scales: {
										x: {
											title: {
												display: true,
												text: 'Número de Hoyo'
											},
											grid: {
												color: '#ddd',
												lineWidth: 4
											}
										},
										y: {
											title: {
												display: true,
												text: 'Par'
											},
											ticks: {
												stepSize: 1
											}
										}
									}
								}}
							/>
						</div>
					</div>
				)}

				{tabs === 3 && <Historial dni={jugadorDatos.dni} />}

				<IconButton onClick={() => setIsOpen(false)} size='medium' sx={{ position: 'absolute', top: 5, right: 10, color: 'white' }}>
					<IoCloseCircleSharp fontSize='40' />
				</IconButton>
			</div>
		</div>
	);
}

export default ModalEst;
