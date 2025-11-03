import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CategoryStatsChart = ({ data }) => {
	if (!data || !Array.isArray(data.labels) || !Array.isArray(data.values)) {
		return <div>No hay datos para mostrar</div>;
	}

	const chartData = {
		labels: data.labels,
		datasets: [
			{
				label: 'Inscriptos',
				data: data.values,
				backgroundColor: 'rgba(30, 144, 255, 0.7)',
				borderColor: 'rgba(30, 144, 255, 1)',
				borderWidth: 1
			}
		]
	};

	const options = {
		responsive: true,
		plugins: {
			legend: { display: false },
			title: { display: false }
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: { stepSize: 1 }
			}
		}
	};

	return (
		<div style={{ width: '100%', maxWidth: 900, margin: '0 auto', background: '#f3faf3', borderRadius: 8, padding: 16 }}>
			<Bar data={chartData} options={options} />
		</div>
	);
};

export default CategoryStatsChart;
