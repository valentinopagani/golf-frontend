import { useState, useEffect, Suspense, lazy } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter as Router } from 'react-router-dom';
import './firebase/firebase';
import './App.css';
import './adminclub.css';
import './home.css';

const AdminClubs = lazy(() => import('./screens/AdminClubs'));
const UserView = lazy(() => import('./screens/UserView'));

function App() {
	const [user, setUser] = useState(null);
	const [stylesLoaded, setStylesLoaded] = useState(false);

	useEffect(() => {
		const auth = getAuth();
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const checkStylesLoaded = () => {
			const styles = document.styleSheets;
			if (styles.length) setStylesLoaded(true);
		};

		checkStylesLoaded();

		document.addEventListener('readystatechange', checkStylesLoaded);

		return () => {
			document.removeEventListener('readystatechange', checkStylesLoaded);
		};
	}, []);

	if (!stylesLoaded) {
		return <div className='loading'>Cargando estilos...</div>;
	}

	return (
		<div className='App'>
			<Router>
				<Suspense fallback={<div className='loading'>Cargando...</div>}>{user ? <AdminClubs user={user} /> : <UserView />}</Suspense>
			</Router>
		</div>
	);
}

export default App;
