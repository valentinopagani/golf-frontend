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
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			title: { display: false }
		},
		scales: {
			x: {
				ticks: {
					autoSkip: false,
					maxRotation: 0,
					minRotation: 0,
					align: 'center'
				}
			},
			y: {
				beginAtZero: true,
				ticks: { stepSize: 1 }
			}
		}
	};

	const chartWidth = Math.max(data.labels.length * 140, 700);

	return (
		<div style={{ background: '#f3faf3', borderRadius: 8, padding: '10px', height: '400px', overflowX: 'auto', width: '100%' }}>
			<div style={{ height: '100%', width: chartWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<Bar data={chartData} options={options} />
			</div>
		</div>
	);
};

export default CategoryStatsChart;
