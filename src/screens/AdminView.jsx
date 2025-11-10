import { useEffect, useState } from 'react';
import firebaseApp, { db } from '../firebase/firebase';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import getUsuarios from '../firebase/usuarios';
import { doc, setDoc } from 'firebase/firestore';
import AdminClubs from './AdminClubs';
import axios from 'axios';

const auth = getAuth(firebaseApp);

function AdminView({ user }) {
	const [usuarios, setUsuarios] = useState([]);
	const [clubes, setClubes] = useState([]);
	const [filterName, setFilterName] = useState('');
	const [filteredClubes, setFilteredClubes] = useState([]);

	useEffect(() => {
		const fetchUsuarios = async () => {
			const usuariosData = await getUsuarios();
			setUsuarios(usuariosData);
		};
		fetchUsuarios();

		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/clubes`)
			.then((response) => setClubes(response.data))
			.catch((error) => console.error(error));
	}, []);

	// REGISTRAR USUARIO
	async function registrarNuevoUsuario(nuevoUsuario) {
		try {
			const currentUser = auth.currentUser;
			const currentEmail = currentUser.email;
			const currentPassword = prompt('Ingrese su contraseña:');
			const userCredential = await createUserWithEmailAndPassword(auth, nuevoUsuario.email, nuevoUsuario.contraseña);
			// Actualizar el displayName
			const user = userCredential.user;
			await updateProfile(user, {
				displayName: nuevoUsuario.nombre
			});
			// Guardar el usuario en la base de datos
			const userRef = doc(db, 'usuarios', nuevoUsuario.nombre.toLowerCase().replaceAll(' ', ''));
			await setDoc(userRef, {
				nombre: nuevoUsuario.nombre,
				email: nuevoUsuario.email,
				contraseña: nuevoUsuario.contraseña,
				fech_alta: nuevoUsuario.fech_alta
			});
			await signInWithEmailAndPassword(auth, currentEmail, currentPassword);
			window.location.reload();
		} catch (error) {
			console.error('Error al registrar usuario:', error);
		}
	}

	// BUSCAR CLUB
	useEffect(() => {
		setFilteredClubes(clubes.filter((club) => club.nombre.toLowerCase().includes(filterName.toLowerCase())));
	}, [filterName, clubes]);

	return (
		<>
			{user?.email === process.env.REACT_APP_EMAIL_ADMIN ? (
				// VISTA ADMIN GRAL
				<div className='admin_view'>
					<button onClick={() => signOut(auth)} className='logout'>
						cerrar sesion
					</button>

					<h2>¡Bienvenido, accediste como Administrador General!</h2>

					<h2>Registrar un nuevo usuario:</h2>
					<form
						autoComplete='off'
						onSubmit={(e) => {
							e.preventDefault();
							const nuevoUsuario = {
								nombre: e.target.nombre.value,
								email: e.target.email.value,
								contraseña: e.target.password.value,
								fech_alta: new Date().toLocaleDateString()
							};
							registrarNuevoUsuario(nuevoUsuario);
						}}
					>
						<input type='text' id='nombre' placeholder='Nombre del usuario:' />
						<input type='text' id='email' placeholder='Email del usuario:' />
						<input type='text' id='password' placeholder='Contraseña:' />
						<button type='submit'>Registrar Usuario</button>
					</form>

					<h2>Usuarios existentes:</h2>
					{usuarios.map((usuario) => (
						<div>
							<h3>{usuario.id}</h3>
							<span>email: {usuario.email}</span>
							<br />
							<span>contraseña: {usuario.contraseña}</span>
						</div>
					))}

					<h2>Agregar un nuevo club:</h2>
					<form
						autoComplete='off'
						onSubmit={async (e) => {
							e.preventDefault();
							const nombre = e.target.name.value;
							const logo = e.target.logo.value;
							const direccion = e.target.direccion.value;
							const telefono = parseInt(e.target.telefono.value);
							const contacto = e.target.contacto.value;
							const email = e.target.email.value;
							const vinculo = e.target.usuarioVinculado.value;
							const fech_alta = new Date().toLocaleDateString();
							try {
								await axios.post(`${process.env.REACT_APP_BACKEND_URL}/clubes`, { nombre, logo, direccion, telefono, contacto, email, vinculo, fech_alta });
							} catch (error) {
								console.error('estas errado pa', error);
							}
						}}
					>
						<input type='text' id='name' placeholder='Nombre del nuevo club:' />
						<input type='url' id='logo' placeholder='logo (url)' />
						<input type='text' placeholder='Direccion:' id='direccion' />
						<input type='number' placeholder='Num. Telefono:' id='telefono' />
						<input type='text' placeholder='Contacto:' id='contacto' />
						<input type='email' placeholder='Email:' id='email' />
						<label htmlFor='usuarioVinculado'>vincular con un usuario:</label>
						<select id='usuarioVinculado'>
							{usuarios.map((usuario) => (
								<option key={usuario.id} value={usuario.id}>
									{usuario.id}
								</option>
							))}
						</select>
						<button type='submit'>Agregar Club</button>
					</form>

					<h2>Clubes existentes:</h2>
					<input type='text' placeholder='Filtrar por nombre de club' value={filterName} onChange={(e) => setFilterName(e.target.value)} autoComplete='off' />

					{filteredClubes.map((club) => (
						<div>
							<h3>{club.nombre}</h3>
							<span>id: {club.id}</span> <br />
							<img src={club.logo} alt='logo del club' />
							<br />
							<span>{club.logo}</span> <br />
							<span>direccion: {club.direccion}</span> <br />
							<span>telefono: {club.telefono}</span> <br />
							<span>contacto: {club.contacto}</span> <br />
							<span>email: {club.email}</span> <br />
							<span>usuario vinculado: {club.vinculo}</span> <br />
							{/* <button onClick={() => eliminarClub(club.id)} className='delete_bt'>
								Eliminar
							</button> */}
						</div>
					))}
				</div>
			) : (
				// VISTA ADMIN CLUB
				<AdminClubs user={user} />
			)}
		</>
	);
}

export default AdminView;
