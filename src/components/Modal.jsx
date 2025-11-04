import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, IconButton, Typography } from '@mui/material';
import { IoCloseCircleSharp } from 'react-icons/io5';
import axios from 'axios';

function Modal({ torneoDatos, jugadorDatos, setJugadoresTorneo, idsTorneosAdmin, setIsOpen }) {
	const [scores, setScores] = useState({});
	const [canchas, setCanchas] = useState([]);

	useEffect(() => {
		axios
			.get('https://golf-backend-production-ad4e.up.railway.app//canchas')
			.then((response) => setCanchas(response.data))
			.catch((error) => console.error(error));
	}, []);

	const handleInputChange = useCallback((e, ronda, hoyo) => {
		const { value } = e.target;
		setScores((prevScores) => ({
			...prevScores,
			[`ronda${ronda}_hoyo${hoyo}`]: parseInt(value)
		}));
	}, []);

	const handleSubmit = async () => {
		const updatedScores = { ...scores };
		const canchaSeleccionada = canchas.find((cancha) => cancha.id === torneoDatos.cancha);
		const hoyos = canchaSeleccionada ? canchaSeleccionada.cant_hoyos : 0;

		for (let i = 1; i <= torneoDatos.rondas; i++) {
			let idaSum = 0;
			let vueltaSum = 0;
			let rondaSum = 0;

			if (hoyos === 9) {
				// Cancha de 9 hoyos
				for (let j = 1; j <= 4; j++) {
					idaSum += scores[`ronda${i}_hoyo${j}`] || 0;
					rondaSum += scores[`ronda${i}_hoyo${j}`] || 0;
				}
				for (let j = 5; j <= 9; j++) {
					vueltaSum += scores[`ronda${i}_hoyo${j}`] || 0;
					rondaSum += scores[`ronda${i}_hoyo${j}`] || 0;
				}
			} else {
				// Cancha de 18 hoyos
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
		const totalScore = Object.values(scores).reduce((acc, score) => acc + score, 0);
		try {
			await axios.put('https://golf-backend-production-ad4e.up.railway.app//inscriptos/score', {
				id: jugadorDatos.id,
				scores: updatedScores,
				totalScore
			});
			setScores({});
			setIsOpen(false);
			await axios
				.get(`https://golf-backend-production-ad4e.up.railway.app//inscriptos?torneos=${idsTorneosAdmin.join(',')}`)
				.then((response) => setJugadoresTorneo(response.data))
				.catch((error) => console.error(error));
		} catch (error) {
			console.error('Error al actualizar scores en MySQL', error);
		}
	};

	const modalContent = useMemo(() => {
		const form = [];
		const canchaSeleccionada = canchas.find((cancha) => cancha.id === torneoDatos.cancha);
		const hoyos = canchaSeleccionada ? canchaSeleccionada.cant_hoyos : 0;

		for (let i = 1; i <= torneoDatos.rondas; i++) {
			form.push(
				<div key={`ronda${i}`}>
					<Typography fontSize={20} fontWeight='bold'>
						Ronda {i}
					</Typography>
					<span>De ida:</span>
					{Array.from({ length: hoyos / 2 }, (_, k) => (
						<input key={`ronda${i}_hoyo${k + 1}`} type='number' placeholder={`Hoyo ${k + 1}`} id={`ronda${i}_hoyo${k + 1}`} onChange={(e) => handleInputChange(e, i, k + 1)} required />
					))}
					<br />
					<span>Vuelta:</span>
					{Array.from({ length: hoyos / 2 }, (_, j) => (
						<input key={`ronda${i}_hoyo${j + 10}`} type='number' placeholder={`Hoyo ${j + 10}`} id={`ronda${i}_hoyo${j + 10}`} onChange={(e) => handleInputChange(e, i, j + 10)} required />
					))}
				</div>
			);
		}
		return form;
	}, [canchas, handleInputChange, torneoDatos.cancha, torneoDatos.rondas]);

	return (
		<div className='modal'>
			<div className='modal_cont'>
				<h4>{torneoDatos.nombre.toUpperCase()}</h4>
				<h3>{jugadorDatos.dni + ' - ' + jugadorDatos.nombre.toUpperCase()}</h3>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
				>
					{modalContent}
					<Button type='submit' variant='contained' color='primary'>
						Cargar
					</Button>
				</form>
				<IconButton size='medium' sx={{ position: 'absolute', top: 5, right: 10, color: 'white' }} onClick={() => setIsOpen(false)}>
					<IoCloseCircleSharp fontSize='40' />
				</IconButton>
			</div>
		</div>
	);
}

export default Modal;
