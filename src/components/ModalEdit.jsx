import { Button, Stack } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';

function ModalEdit({ jugadorDatos, setJugadoresTorneo, idsTorneosAdmin, setIsOpen }) {
	const [scores, setScores] = useState({ ...jugadorDatos.scores });

	const handleInputChange = (e, key) => {
		const value = parseInt(e.target.value) || null;
		setScores((prev) => ({
			...prev,
			[key]: value
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const updatedScores = { ...scores };
		const rondas = Object.keys(jugadorDatos.scores).filter((key) => key.match(/^ronda\d+_hoyo1$/)).length;
		const hoyos = Object.keys(jugadorDatos.scores).filter((key) => key.startsWith('ronda1_hoyo')).length;

		for (let i = 1; i <= rondas; i++) {
			let idaSum = 0,
				vueltaSum = 0,
				rondaSum = 0;
			if (hoyos === 9) {
				for (let j = 1; j <= 4; j++) {
					idaSum += scores[`ronda${i}_hoyo${j}`] || 0;
					rondaSum += scores[`ronda${i}_hoyo${j}`] || 0;
				}
				for (let j = 5; j <= 9; j++) {
					vueltaSum += scores[`ronda${i}_hoyo${j}`] || 0;
					rondaSum += scores[`ronda${i}_hoyo${j}`] || 0;
				}
			} else {
				for (let j = 1; j <= 9; j++) {
					idaSum += scores[`ronda${i}_hoyo${j}`] || 0;
					rondaSum += scores[`ronda${i}_hoyo${j}`] || 0;
				}
				for (let j = 10; j <= 18; j++) {
					vueltaSum += scores[`ronda${i}_hoyo${j}`] || 0;
					rondaSum += scores[`ronda${i}_hoyo${j}`] || 0;
				}
			}
			updatedScores[`ronda${i}_ida`] = idaSum;
			updatedScores[`ronda${i}_vuelta`] = vueltaSum;
			updatedScores[`ronda${i}`] = rondaSum;
		}

		const totalScore = Object.keys(updatedScores)
			.filter((key) => key.match(/^ronda\d+$/))
			.reduce((acc, key) => acc + (updatedScores[key] || 0), 0);

		try {
			await axios.put(`${process.env.REACT_APP_BACKEND_URL}/inscriptos/score`, {
				id: jugadorDatos.id,
				scores: updatedScores,
				totalScore
			});
			const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/inscriptos?torneos=${idsTorneosAdmin.join(',')}`);
			setJugadoresTorneo(response.data);
			setIsOpen(false);
			alert('Scores actualizados!');
		} catch (error) {
			console.error('Error al actualizar scores', error);
			alert('Error al actualizar scores', error);
		}
	};

	return (
		<div className='modal_edit'>
			<div className='modal_edit_cont'>
				<h2>{jugadorDatos.dni + ' - ' + jugadorDatos.nombre}</h2>
				<form onSubmit={handleSubmit}>
					<div>
						{Object.entries(scores)
							.filter(([key]) => key.includes('hoyo'))
							.map(([key, value]) => (
								<label key={key}>
									{'R' + key[5] + '.Hoyo ' + key.substring(11)}: <input type='number' value={value} onChange={(e) => handleInputChange(e, key)} placeholder={key} />
								</label>
							))}
					</div>
					<Stack direction='row'>
						<Button variant='contained' size='small' onClick={() => setIsOpen(false)}>
							cancelar
						</Button>
						<Button variant='contained' size='small' color='success' type='submit'>
							actualizar
						</Button>
					</Stack>
				</form>
			</div>
		</div>
	);
}

export default ModalEdit;
