import { useState, lazy, memo, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';
import { IoCloseCircleSharp } from 'react-icons/io5';
import * as XLSX from 'xlsx';
import axios from 'axios';

const ModalEst = lazy(() => import('./ModalEst'));

const EstadisticasTorneo = memo(function EstadisticasTorneo({ torneo, categoriaSelect, jugadores, setModal, user }) {
	const [isOpen, setIsOpen] = useState(false);
	const [jugadoresFiltrados, setJugadoresFiltrados] = useState([]);
	const [jugadorDatos, setJugadorDatos] = useState([]);
	const [selectedCategoria, setSelectedCategoria] = useState(categoriaSelect || 'Todas');

	useEffect(() => {
		axios
			.get(`http://localhost:3001/jugadoresFiltrados/${torneo.id}`)
			.then((response) => setJugadoresFiltrados(response.data))
			.catch((error) => console.error(error));
	}, []);

	async function handleJugadorClick(jugador) {
		await setJugadorDatos(jugador);
		setIsOpen(true);
	}

	const exportToExcel = () => {
		const workbook = XLSX.utils.book_new();

		jugadoresFiltrados.forEach(({ categoria, jugadoresCategoria }) => {
			const data = jugadoresCategoria.map((jugador, index) => {
				if (torneo.rondas === 1) {
					return {
						'POS.': index + 1,
						DNI: jugador.dni,
						'APELLIDO Y NOMBRE': jugador.nombre,
						CLUB: jugador.clubSocio,
						HDC: jugador.handicap,
						IDA: jugador.scores['ronda1_ida'],
						VUELTA: jugador.scores['ronda1_vuelta'],
						TOTAL: jugador.totalScore,
						NETO: jugador.scoreNeto
					};
				} else {
					return {
						'POS.': index + 1,
						DNI: jugador.dni,
						'APELLIDO Y NOMBRE': jugador.nombre,
						CLUB: jugador.clubSocio,
						HDC: jugador.handicap,
						TOTAL: jugador.totalScore,
						NETO: jugador.scoreNeto
					};
				}
			});

			const title = [[`${torneo.nombre.toUpperCase()} - ${categoria.nombre.toUpperCase()} - ${torneo.fech_ini}`]];
			const worksheet = XLSX.utils.aoa_to_sheet(title);

			if (!worksheet['!merges']) worksheet['!merges'] = [];
			worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } });

			XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A3', skipHeader: false });

			const colWidths = [
				{ wpx: 35 }, // Posicion
				{ wpx: 75 }, // DNI
				{ wpx: 200 }, // Nombre
				{ wpx: 200 }, // Club
				{ wpx: 55 }, // HDC
				{ wpx: 55 }, // Ida
				{ wpx: 55 }, // Vuelta
				{ wpx: 55 }, // Total
				{ wpx: 55 } // Neto
			];
			worksheet['!cols'] = colWidths;

			XLSX.utils.book_append_sheet(workbook, worksheet, categoria.nombre);
		});

		XLSX.writeFile(workbook, `Resultados ${torneo.nombre} ${torneo.fech_ini}.xlsx`);
	};

	return (
		<div className='modal'>
			<div className='modal_cont'>
				<div className='modal_title'>
					{user && (
						<IconButton onClick={exportToExcel} title='Exportar a Excel'>
							<PiMicrosoftExcelLogoFill fill='green' fontSize='30' />
						</IconButton>
					)}
					<h3>{torneo.nombre}</h3>
					<select value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)}>
						<option value='Todas'>Todas las categorías</option>
						{torneo.categorias.map((categoria) => (
							<option key={categoria} value={categoria.nombre}>
								{categoria.nombre}
							</option>
						))}
					</select>
				</div>
				{jugadoresFiltrados
					.filter(({ categoria }) => selectedCategoria === 'Todas' || categoria.nombre === selectedCategoria)
					.map(({ categoria, jugadoresCategoria }) => {
						return (
							<div key={categoria} className='table_container'>
								<table className='tabla_est'>
									<caption>{categoria.nombre.toUpperCase()}</caption>
									<thead>
										<tr>
											<th className='pos'>Pos.</th>
											<th className='dni'>DNI</th>
											<th className='jug'>Apellido y Nombre</th>
											<th className='club'>Club</th>
											<th className='hdc'>HDC</th>
											{torneo.rondas === 1 && <th className='ida'>Ida</th>}
											{torneo.rondas === 1 && <th className='vuelta'>Vuelta</th>}
											<th className='score'>Score</th>
										</tr>
									</thead>
									<tbody>
										{jugadoresCategoria.map((jugador, jugadorIndex) => {
											function getPosiciones() {
												if (jugadorIndex === 0) return 1;
												if (jugadorIndex > 0 && jugadoresCategoria[jugadorIndex].scoreNeto !== jugadoresCategoria[jugadorIndex - 1].scoreNeto) return jugadorIndex + 1;
											}
											return (
												<tr key={jugador.dni}>
													<td>{getPosiciones()}</td>
													<td onClick={() => handleJugadorClick(jugador)} className='pointer'>
														{jugador.dni}
													</td>
													<td onClick={() => handleJugadorClick(jugador)} className='pointer'>
														<b style={{ color: 'brown', fontWeight: 900 }}>+</b> {jugador.nombre}
													</td>
													<td>{jugador.clubSocio}</td>
													<td className='hdc'>{jugador.handicap}</td>
													{torneo.rondas === 1 && jugador.scores && <td className='ida'>{jugador.scores['ronda1_ida']}</td>}
													{torneo.rondas === 1 && jugador.scores && <td className='vuelta'>{jugador.scores['ronda1_vuelta']}</td>}
													<td onClick={() => handleJugadorClick(jugador)} className='score'>
														{jugador.scoreNeto}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						);
					})}
				<IconButton onClick={() => setModal(false)} size='medium' sx={{ position: 'absolute', top: 5, right: 10, color: 'white' }}>
					<IoCloseCircleSharp fontSize='40' />
				</IconButton>
			</div>
			{isOpen && <ModalEst torneo={torneo} jugadorDatos={jugadorDatos} setIsOpen={setIsOpen} />}
		</div>
	);
});

export default EstadisticasTorneo;
