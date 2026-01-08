import { useState, lazy, memo, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';
import { IoCloseCircleSharp } from 'react-icons/io5';
import { TbWorldDownload } from 'react-icons/tb';
import * as XLSX from 'xlsx';
import axios from 'axios';

const ModalEst = lazy(() => import('./ModalEst'));

const EstadisticasTorneo = memo(function EstadisticasTorneo({ torneo, categoriaSelect, setModal, user }) {
	const [isOpen, setIsOpen] = useState(false);
	const [jugadoresFiltrados, setJugadoresFiltrados] = useState([]);
	const [jugadorDatos, setJugadorDatos] = useState([]);
	const [selectedCategoria, setSelectedCategoria] = useState(categoriaSelect || 'Todas');
	const [comprobantes, setComprobantes] = useState([]);

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/jugadoresFiltrados/${torneo.id}`)
			.then((response) => setJugadoresFiltrados(response.data))
			.catch((error) => console.error(error));
	}, [torneo.id]);

	useEffect(() => {
		if (!user) return;
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/inscriptos?comprobantesTorneo=${torneo.id}`)
			.then((response) => setComprobantes(response.data))
			.catch((error) => console.error(error));
	}, [user, torneo.id]);

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
						MATRÍCULA: jugador.dni,
						JUGADOR: jugador.nombre,
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
						MATRÍCULA: jugador.dni,
						JUGADOR: jugador.nombre,
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

	const exportComprobantesToExcel = () => {
		const workbook = XLSX.utils.book_new();

		const data = comprobantes.map((item, index) => ({
			'#': index + 1,
			'NRO. COMPROBANTE': item.comprobante,
			JUGADOR: item.nombre,
			MATRÍCULA: item.dni,
			'CLUB DE PERTENENCIA': item.clubSocio,
			'FECHA ALTA': item.fech_alta,
			TORNEO: torneo.nombre,
			CATEGORIA: item.categoria,
			TELEFONO: item.telefono,
			EMAIL: item.email
		}));

		// Título arriba
		const title = [[`COMPROBANTES - TORNEO ${torneo.nombre}`]];
		const worksheet = XLSX.utils.aoa_to_sheet(title);

		if (!worksheet['!merges']) worksheet['!merges'] = [];
		worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } });

		// Datos desde fila 3
		XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A3', skipHeader: false });

		// Ajuste de columnas
		worksheet['!cols'] = [
			{ wpx: 20 }, // #
			{ wpx: 150 }, // Comprobante
			{ wpx: 200 }, // Nombre
			{ wpx: 65 }, // DNI
			{ wpx: 150 }, // Club
			{ wpx: 90 }, // Fecha alta
			{ wpx: 200 }, // Torneo
			{ wpx: 120 }, // Categoría
			{ wpx: 90 }, // Teléfono
			{ wpx: 200 } // Email
		];

		XLSX.utils.book_append_sheet(workbook, worksheet, 'Comprobantes');

		XLSX.writeFile(workbook, `Comprobantes_Torneo_${torneo.nombre}.xlsx`);
	};

	const getPosiciones = (jugadorIndex, jugadoresCategoria) => {
		if (jugadorIndex === 0) return 1;
		if (jugadorIndex > 0 && jugadoresCategoria[jugadorIndex].scoreNeto !== jugadoresCategoria[jugadorIndex - 1].scoreNeto) {
			return jugadorIndex + 1;
		}
		return jugadoresCategoria[jugadorIndex - 1] ? getPosiciones(jugadorIndex - 1, jugadoresCategoria) : 1;
	};

	return (
		<div className='modal'>
			<div className='modal_cont'>
				<div className='modal_title'>
					{user && (
						<div>
							<IconButton onClick={exportToExcel} size='small' title='Exportar tabla a Excel'>
								<PiMicrosoftExcelLogoFill fill='green' fontSize='30' />
							</IconButton>
							<IconButton onClick={exportComprobantesToExcel} size='small' title='Descargar comprobantes de inscripcion online'>
								<TbWorldDownload fontSize='30' />
							</IconButton>
						</div>
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
											<th className='dni'>Matrícula</th>
											<th className='jug'>JUGADOR</th>
											<th className='club'>Club</th>
											<th className='hdc'>HDC</th>
											{torneo.rondas === 1 && <th className='ida'>Ida</th>}
											{torneo.rondas === 1 && <th className='vuelta'>Vuelta</th>}
											<th className='score'>Score</th>
										</tr>
									</thead>
									<tbody>
										{jugadoresCategoria.map((jugador, jugadorIndex) => {
											return (
												<tr key={jugador.dni}>
													<td>{jugadorIndex + 1}</td>
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
