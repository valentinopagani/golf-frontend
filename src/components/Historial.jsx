import { useEffect, useState } from 'react';
import ModalEst from './ModalEst';
import axios from 'axios';

function Historial({ dni }) {
	const [historialJugador, setHistorialJugador] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [torneoDatos, setTorneoDatos] = useState([]);
	const [jugadorDatos, setJugadorDatos] = useState([]);

	useEffect(() => {
		axios
			.get(`https://golf-backend-production-ad4e.up.railway.app/inscriptos/historial?dni=${dni}`)
			.then((response) => setHistorialJugador(response.data))
			.catch((error) => console.error(error));
	}, [dni]);

	const renderTorneosJugados = () => {
		return historialJugador.inscriptos?.map((jugador) => {
			const torneo = historialJugador.torneos.find((torneo) => torneo.id === jugador.torneo);
			const total = jugador.categoria.toLowerCase().includes('gross') || jugador.categoria.toLowerCase().includes('scratch') ? jugador.totalScore : jugador.totalScore - jugador.handicap * torneo.rondas;
			return (
				<tr key={jugador.id}>
					<td>{torneo?.fech_ini}</td>
					<td
						className='pointer'
						onClick={() => {
							setTorneoDatos(torneo);
							setJugadorDatos(jugador);
							setIsOpen(true);
						}}
					>
						<b style={{ color: 'brown', fontWeight: 900 }}>+</b> {torneo?.nombre}
					</td>
					<td>{jugador.categoria}</td>
					<td>{torneo?.nombreClubVinculo}</td>
					<td>{total}</td>
				</tr>
			);
		});
	};

	return (
		<div className='table_container'>
			<table>
				<caption>{historialJugador.torneos?.length} TORNEO/S</caption>
				<thead>
					<tr>
						<th>Fecha</th>
						<th>Torneo</th>
						<th>Categoría</th>
						<th>Club</th>
						<th>Score</th>
					</tr>
				</thead>
				<tbody>{renderTorneosJugados()}</tbody>
			</table>
			{isOpen && <ModalEst torneo={torneoDatos} jugadorDatos={jugadorDatos} setIsOpen={setIsOpen} condicion={true} />}
		</div>
	);
}

export default Historial;
