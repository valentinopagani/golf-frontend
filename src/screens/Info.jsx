import { useState } from 'react';
import { Button } from '@mui/material';
import axios from 'axios';

function Info({ club }) {
	const [diasSeleccionados, setDiasSeleccionados] = useState(club?.dias_habilitados || []);
	const [inicioSalida, setInicioSalida] = useState(club?.hora_ini?.slice(0, 5));
	const [finSalida, setFinSalida] = useState(club?.hora_fin?.slice(0, 5));
	const [biTee, setBiTee] = useState(club?.biTee || 1);
	const [sociosFree, setSociosFree] = useState(club?.sociosFree || 0);
	const [error, setError] = useState(false);

	const toggleDay = (day) => {
		setDiasSeleccionados((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
	};

	return (
		<div className='body_home'>
			<h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>{club.nombre}</h3>
			<h2>PARÁMETROS SOBRE LAS RESERVAS</h2>

			{error && <div style={{ color: error[0] === 1 ? '#d32f2f' : '#56b441ff', padding: '6px', backgroundColor: error[0] === 1 ? '#ffebee' : '#e6ffe0ff', borderRadius: '4px', fontSize: '16px', textAlign: 'center' }}>{error[1]}</div>}

			<form
				style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}
				onSubmit={async (e) => {
					e.preventDefault();
					try {
						if (!window.confirm('Seguro que deseas modificar los horarios de salida?')) return;
						const dias = diasSeleccionados.length > 0 ? diasSeleccionados.sort() : null;
						const data = {
							dias: dias,
							inicio: inicioSalida + ':00',
							fin: finSalida + ':00',
							sociosFree: Number(sociosFree),
							tee: Number(biTee),
							id: Number(club.id)
						};
						await axios.put(`${process.env.REACT_APP_BACKEND_URL}/clubes/reservas`, data);
						window.location.reload();
					} catch {
						setError([1, 'Error al modificar los horarios de salida!']);
						e.target.reset();
					}
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
					<span>Días habilitados para reservar: </span>

					<label>
						<input type='checkbox' value={0} checked={diasSeleccionados?.includes(0)} onChange={() => toggleDay(0)} /> Lunes
					</label>
					<label>
						<input type='checkbox' value={1} checked={diasSeleccionados?.includes(1)} onChange={() => toggleDay(1)} /> Martes
					</label>
					<label>
						<input type='checkbox' value={2} checked={diasSeleccionados?.includes(2)} onChange={() => toggleDay(2)} /> Miércoles
					</label>
					<label>
						<input type='checkbox' value={3} checked={diasSeleccionados?.includes(3)} onChange={() => toggleDay(3)} /> Jueves
					</label>
					<label>
						<input type='checkbox' value={4} checked={diasSeleccionados?.includes(4)} onChange={() => toggleDay(4)} /> Viernes
					</label>
					<label>
						<input type='checkbox' value={5} checked={diasSeleccionados?.includes(5)} onChange={() => toggleDay(5)} /> Sábados
					</label>
					<label>
						<input type='checkbox' value={6} checked={diasSeleccionados?.includes(6)} onChange={() => toggleDay(6)} /> Domingos
					</label>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
					<span>Horario de salida: </span>

					<label>
						desde las <input type='time' value={inicioSalida} max={finSalida} onChange={(e) => setInicioSalida(e.target.value)} style={{ border: 'none', background: '#d5d5d5ff' }} required />
						hs.
					</label>
					<label>
						hasta las <input type='time' value={finSalida} min={inicioSalida} onChange={(e) => setFinSalida(e.target.value)} style={{ border: 'none', background: '#d5d5d5ff' }} required />
						hs.
					</label>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
					<span>Tee de salida: </span>

					<label>
						<input type='radio' value={0} name='biTee' defaultChecked={club.biTee === 0} onChange={(e) => setBiTee(e.target.value)} /> Tee 1
					</label>
					<label>
						<input type='radio' value={1} name='biTee' defaultChecked={club.biTee === 1} onChange={(e) => setBiTee(e.target.value)} /> Tee 1 y 10
					</label>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
					<span>Socios poseén reserva gratis: </span>

					<label>
						<input type='radio' value={0} name='sociosFree' defaultChecked={club.sociosFree === 0} onChange={(e) => setSociosFree(e.target.value)} /> No
					</label>
					<label>
						<input type='radio' value={1} name='sociosFree' defaultChecked={club.sociosFree === 1} onChange={(e) => setSociosFree(e.target.value)} /> Sí
					</label>
				</div>

				<Button type='submit' variant='outlined' size='small'>
					actualizar
				</Button>
			</form>
		</div>
	);
}

export default Info;
