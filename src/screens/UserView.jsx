import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import draw from '../components/undraw_playing-golf_016o.svg';
import logoProyInfo from '../components/LogoPapiGuille.png';
import drawplayer from '../components/drawplayer.png';

const Login = lazy(() => import('./Login'));
const Home = lazy(() => import('./Home'));
const Resultados = lazy(() => import('./Resultados'));
const EstadisticasJugador = lazy(() => import('./EstadisticasJugador'));
const EstadisticasCancha = lazy(() => import('./EstadisticasCancha'));
const Inscripciones = lazy(() => import('./Inscripciones'));

function UserView() {
	return (
		<div>
			<ScrollToTop />
			<div className='body'>
				<Suspense fallback={<div className='loading'>Cargando...</div>}>
					<NavBar />
					<Routes>
						<Route exact path='/' element={<Home />} />
						<Route exact path='/login' element={<Login />} />
						<Route exact path='/resultados' element={<Resultados />} />
						<Route exact path='/estadísticasjugadores' element={<EstadisticasJugador />} />
						<Route exact path='/estadísticascanchas' element={<EstadisticasCancha />} />
						<Route exact path='/inscripciones' element={<Inscripciones />} />
						<Route
							path='/*'
							element={
								<div style={{ width: '100%', height: 'calc(100vh - 68px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
									<h2 style={{ fontSize: 40, fontWeight: 'bold' }}>PÁGINA NO ENCONTRADA</h2>
									<span>Comprueba que la ruta de dirección sea la correcta...</span>
									<img src={draw} alt='draw' width={150} />
									<Link to='/' style={{ color: 'blue', fontSize: 25 }}>
										Ir a GolfPoint
									</Link>
								</div>
							}
						/>
					</Routes>
				</Suspense>
			</div>
			<footer>
				<svg viewBox='0 0 500 150' preserveAspectRatio='none' style={{ height: '30px', width: '100%', marginBottom: -6 }}>
					<path d='M-13.26,41.94 C156.04,253.13 324.21,-44.89 503.67,87.33 L500.00,150.00 L0.00,150.00 Z' style={{ stroke: 'none', fill: '#cccccc' }}></path>
				</svg>
				<div>
					<img src={drawplayer} alt='draw' className='draw_player' />
					<h3>Desarrollado por</h3>
					<img src={logoProyInfo} alt='logo proyinfo' className='logo_footer' />
					<h3>ProyInfo | 2025</h3>
				</div>
			</footer>
		</div>
	);
}

function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}

export default UserView;
