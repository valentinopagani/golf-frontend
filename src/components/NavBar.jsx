import * as React from 'react';
import { NavLink, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import logo from '../components/logo.png';
import { CgMenuLeft } from 'react-icons/cg';
import { IoGolf } from 'react-icons/io5';

const pages = ['inicio', 'resultados', 'estadísticas jugadores', 'estadísticas canchas'];

function NavBar() {
	const [anchorElNav, setAnchorElNav] = React.useState(null);

	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget);
	};
	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	return (
		<AppBar className='nav' sx={{ backgroundColor: 'green', padding: '0 30px' }}>
			<Container sx={{ maxWidth: '1600px !important' }}>
				<Toolbar disableGutters>
					<Typography
						noWrap
						sx={{
							mb: -1,
							mr: 5,
							display: { xs: 'none', md: 'flex' }
						}}
					>
						<Link to='/'>
							<img src={logo} alt='logo' className='nav_logo' />
						</Link>
					</Typography>

					<Box
						sx={{
							flexGrow: 1,
							display: { xs: 'flex', md: 'none' }
						}}
					>
						<IconButton size='large' aria-label='account of current user' aria-controls='menu-appbar' aria-haspopup='true' onClick={handleOpenNavMenu} color='inherit'>
							<CgMenuLeft size={30} />
						</IconButton>
						<Menu
							id='menu-appbar'
							anchorEl={anchorElNav}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left'
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left'
							}}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{
								display: {
									xs: 'block',
									md: 'none'
								}
							}}
						>
							{pages.map((page) => (
								<MenuItem key={page} onClick={handleCloseNavMenu}>
									<NavLink className='nav_a' to={page === 'inicio' ? '/' : page.replaceAll(' ', '')}>
										{page}
									</NavLink>
								</MenuItem>
							))}
						</Menu>
					</Box>
					<Typography
						noWrap
						sx={{
							display: {
								xs: 'flex',
								md: 'none'
							},
							flexGrow: 1
						}}
					>
						<NavLink to='/'>
							<img src={logo} alt='logo' className='nav_logo' />
						</NavLink>
					</Typography>
					<Box
						sx={{
							flexGrow: 1,
							display: {
								xs: 'none',
								md: 'flex'
							}
						}}
					>
						{pages.map((page) => (
							<NavLink key={page} activeclassName='active' className='nav_a' to={page === 'inicio' ? '/' : page.replaceAll(' ', '')} onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
								{page}
							</NavLink>
						))}
					</Box>

					<Box sx={{ flexGrow: 0 }}>
						<Tooltip title='Acceder'>
							<NavLink to='/login'>
								<IoGolf size={30} />
							</NavLink>
						</Tooltip>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
}
export default NavBar;
