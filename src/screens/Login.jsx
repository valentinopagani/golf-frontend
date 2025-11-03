import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseApp from '../firebase/firebase';

const auth = getAuth(firebaseApp);

function Login() {
	const [errorMessage, setErrorMessage] = useState('');

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm();

	const handleLogin = async (email, pass) => {
		try {
			await signInWithEmailAndPassword(auth, email, pass);
		} catch (error) {
			setErrorMessage('Inicio de sesión incorrecto, verifica tus credenciales.');
			setTimeout(() => setErrorMessage(''), 8000);
		}
	};

	return (
		<div className='login'>
			<h2>Ingresá a tu Club:</h2>
			<p>ingrese su email y contraseña</p>
			<form
				autoComplete='off'
				onSubmit={(val) => {
					handleSubmit((data) => handleLogin(data.email, data.password))(val);
				}}
			>
				<input
					type='email'
					name='email'
					id='email'
					placeholder='e-mail'
					{...register('email', {
						required: 'Ingresá tu e-mail *',
						pattern: {
							value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
							message: 'Ingresa un email válido *'
						}
					})}
				/>
				{errors.email && <span style={{ color: 'red', fontSize: 12 }}>{errors.email.message}</span>}
				<input type='password' id='password' name='password' placeholder='********' {...register('password', { required: 'Ingresá tu contraseña *', minLength: { value: 6 } })} />
				{errors.password && <span style={{ color: 'red', fontSize: 12 }}>{errors.password.message}</span>}
				<button type='submit' className='submit'>
					Iniciar Sesión
				</button>
				{errorMessage && <div className='error_login'>{errorMessage}</div>}
			</form>
		</div>
	);
}

export default Login;
