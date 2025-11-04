import { useEffect, useState } from 'react';
import { FaRegTrashCan } from 'react-icons/fa6';
import { FaPenFancy } from 'react-icons/fa6';
import axios from 'axios';

function Canchas({ club }) {
	const [canchas, setCanchas] = useState([]);
	const [isOpenCanchas, setModalCanchas] = useState(false);
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [canchaToEdit, setCanchaToEdit] = useState(null);
	const [editHoyos, setEditHoyos] = useState({});

	useEffect(() => {
		axios
			.get(`https://golf-backend-production-ad4e.up.railway.app/canchas?idClub=${club.id}`)
			.then((response) => setCanchas(response.data))
			.catch((error) => console.error(error));
	}, [club.id]);

	async function addHoyos(nuevosHoyos, canchaId) {
		try {
			const parCancha = Object.values(nuevosHoyos).reduce((acc, hoyo) => acc + hoyo.par, 0);
			await axios.put(`https://golf-backend-production-ad4e.up.railway.app/canchas/${canchaId}/hoyos`, {
				hoyos: nuevosHoyos,
				parCancha: parCancha
			});
			await axios
				.get(`https://golf-backend-production-ad4e.up.railway.app/canchas?idClub=${club.id}`)
				.then((response) => setCanchas(response.data))
				.catch((error) => console.error(error));
		} catch (error) {
			alert('Algo ha salido mal');
			console.error('Error al guardar hoyos', error);
		}
	}

	const formCancha = (cancha) => {
		const hoyos = [];
		for (let i = 1; i <= cancha.cant_hoyos; i++) {
			hoyos.push(
				<div key={i}>
					<span>Hoyo {i}:</span>
					<span>par:</span>
					<select>
						<option value='2'>2</option>
						<option value='3'>3</option>
						<option value='4' selected>
							4
						</option>
						<option value='5'>5</option>
						<option value='6'>6</option>
						<option value='7'>7</option>
					</select>
					<span>distancia:</span>
					<input type='number' min='0' step='0.01' placeholder='yardas:' className='yrds' />
					<span>dificultad:</span>
					<input type='number' min='0' step='0.01' className='yrds' />
					<hr />
				</div>
			);
		}
		return (
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					const datosHoyos = {};
					for (let i = 0; i <= cancha.cant_hoyos * 3 - 3; i++) {
						const hoyoId = `hoyo_${i / 3 + 1}`;
						datosHoyos[hoyoId] = {
							par: parseInt(e.target[i].value),
							distancia: parseFloat(e.target[i + 1].value),
							dificultad: parseFloat(e.target[i + 2].value)
						};
						i += 2;
					}
					await addHoyos(datosHoyos, cancha.id);
				}}
			>
				{hoyos}
				<br />
				<button type='submit'>Cargar Hoyos</button>
			</form>
		);
	};

	const handleEditClick = (cancha) => {
		setCanchaToEdit(cancha);
		setEditHoyos({ ...cancha.hoyos });
		setEditModalOpen(true);
	};

	return (
		<div className='canchas'>
			<h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>{club.nombre}</h3>
			<h2>DATOS DE TUS CANCHAS</h2>

			{canchas.length === 0 && <h3>No hay canchas registradas...</h3>}

			<div>
				{!isOpenCanchas ? (
					<button onClick={() => setModalCanchas(!isOpenCanchas)}>Agregar Nueva Cancha</button>
				) : (
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							const nombre = e.target[0].value;
							const cant_hoyos = parseInt(e.target[1].value);
							const clubVinculo = club.id;
							try {
								await axios.post('https://golf-backend-production-ad4e.up.railway.app/canchas', { nombre, cant_hoyos, clubVinculo });
								await axios
									.get(`https://golf-backend-production-ad4e.up.railway.app/canchas?idClub=${club.id}`)
									.then((response) => setCanchas(response.data))
									.catch((error) => console.error(error));
								e.target.reset();
								setModalCanchas(false);
							} catch (error) {
								console.error(error);
							}
						}}
					>
						<input type='text' placeholder='nombre de cancha:' required />
						<input type='number' placeholder='numero de hoyos:' required />
						<button type='submit'>Agregar Cancha</button>
						<button onClick={() => setModalCanchas(!isOpenCanchas)}>Cerrar</button>
					</form>
				)}
			</div>
			{canchas.map((cancha) => (
				<div key={cancha.id}>
					{!cancha.hoyos ? (
						<div>
							<span>Agrega los datos de cancha: {cancha.nombre}</span>
							<div className='formCancha'>{formCancha(cancha)}</div>
						</div>
					) : (
						<div className='datos_cancha'>
							<div className='table_container'>
								<table>
									<caption>
										<div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center' }}>
											<span>{cancha.nombre.toUpperCase()}</span>
											<FaRegTrashCan
												size={17}
												className='pointer'
												title='Eliminar cancha'
												onClick={async () => {
													if (!window.confirm(`¿Seguro que deseas eliminar cancha ${cancha.nombre}?`)) return;
													try {
														await axios.delete(`https://golf-backend-production-ad4e.up.railway.app/canchas/${cancha.id}`);
														await axios
															.get(`https://golf-backend-production-ad4e.up.railway.app/canchas?idClub=${club.id}`)
															.then((response) => setCanchas(response.data))
															.catch((error) => console.error(error));
														alert('Cancha eliminada correctamente!');
													} catch (error) {
														alert('Error al eliminar cancha');
														console.error(error);
													}
												}}
											/>
											<FaPenFancy
												size={17}
												className='pointer'
												title='Editar datos de cancha'
												onClick={() => {
													handleEditClick(cancha);
												}}
											/>
										</div>
									</caption>
									<thead>
										<tr>
											<th></th>
											{Object.keys(cancha.hoyos).map((e, index) => (
												<th>H {index + 1}</th>
											))}
										</tr>
									</thead>
									<tbody>
										<tr>
											<th>Par</th>
											{Object.values(cancha.hoyos).map((hoyo) => (
												<td key={hoyo}>{hoyo.par}</td>
											))}
										</tr>
										<tr>
											<th>Distancia</th>
											{Object.values(cancha.hoyos).map((hoyo) => (
												<td key={hoyo}>{hoyo.distancia}</td>
											))}
										</tr>
										<tr>
											<th>Dificultad</th>
											{Object.values(cancha.hoyos).map((hoyo) => (
												<td key={hoyo}>{hoyo.dificultad || '-'}</td>
											))}
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			))}

			{isEditModalOpen && canchaToEdit && (
				<div className='modal_edit_cancha'>
					<div className='modal_edit_cancha_cont'>
						<h3>Editar hoyos de {canchaToEdit.nombre}</h3>
						<form
							onSubmit={async (e) => {
								e.preventDefault();
								try {
									await axios.put(`https://golf-backend-production-ad4e.up.railway.app/canchas/${canchaToEdit.id}/hoyos`, {
										hoyos: editHoyos,
										parCancha: Object.values(editHoyos).reduce((acc, hoyo) => acc + Number(hoyo.par), 0)
									});
									const response = await axios.get(`https://golf-backend-production-ad4e.up.railway.app/canchas?idClub=${club.id}`);
									setCanchas(response.data);
									alert('Cancha actualizada!');
									setEditModalOpen(false);
									setCanchaToEdit(null);
								} catch (error) {
									alert('Error al editar cancha');
								}
							}}
						>
							{Object.entries(editHoyos).map(([hoyoId, hoyo], idx) => (
								<div key={hoyoId} style={{ marginBottom: 10 }}>
									<b>{hoyoId.replace('_', ' ').toUpperCase()}</b>
									<span> Par: </span>
									<input
										type='number'
										min={2}
										max={7}
										value={hoyo.par}
										onChange={(e) =>
											setEditHoyos((prev) => ({
												...prev,
												[hoyoId]: { ...prev[hoyoId], par: Number(e.target.value) }
											}))
										}
										style={{ width: 50 }}
									/>
									<span> Distancia: </span>
									<input
										type='number'
										min={0}
										value={hoyo.distancia}
										onChange={(e) =>
											setEditHoyos((prev) => ({
												...prev,
												[hoyoId]: { ...prev[hoyoId], distancia: Number(e.target.value) }
											}))
										}
										style={{ width: 70 }}
									/>
									<span> Dificultad: </span>
									<input
										type='number'
										min={0}
										value={hoyo.dificultad}
										onChange={(e) =>
											setEditHoyos((prev) => ({
												...prev,
												[hoyoId]: { ...prev[hoyoId], dificultad: Number(e.target.value) }
											}))
										}
										style={{ width: 70 }}
									/>
								</div>
							))}
							<button type='submit'>Guardar</button>
							<button type='button' onClick={() => setEditModalOpen(false)}>
								Cancelar
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default Canchas;
