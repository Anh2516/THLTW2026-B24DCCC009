import { Card, Col, Row, Statistic } from 'antd';
import { useMemo } from 'react';
import { useModel } from 'umi';
import Chart from 'react-apexcharts';

const ReportsTab: React.FC = () => {
	const { stats, chartSeries } = useModel('quanlyclub');

	const options = useMemo(
		() => ({
			chart: { type: 'bar' as const, stacked: false, toolbar: { show: true } },
			plotOptions: {
				bar: { horizontal: false, columnWidth: '55%', borderRadius: 2 },
			},
			dataLabels: { enabled: false },
			stroke: { show: true, width: 2, colors: ['transparent'] },
			xaxis: { categories: chartSeries.categories, title: { text: 'Câu lạc bộ' } },
			yaxis: { title: { text: 'Số đơn đăng ký' }, min: 0 },
			fill: { opacity: 1 },
			legend: { position: 'top' as const },
			colors: ['#fadb14', '#52c41a', '#ff4d4f'],
		}),
		[chartSeries.categories],
	);

	return (
		<div>
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic title="Tổng số câu lạc bộ" value={stats.clubCount} />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic title="Đơn chờ duyệt" value={stats.pending} valueStyle={{ color: '#d4b106' }} />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic title="Đơn đã duyệt" value={stats.approved} valueStyle={{ color: '#3f8600' }} />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic title="Đơn từ chối" value={stats.rejected} valueStyle={{ color: '#cf1322' }} />
					</Card>
				</Col>
			</Row>

			<Card title="Đơn đăng ký theo CLB và trạng thái">
				{chartSeries.categories.length === 0 ? (
					<p>Chưa có dữ liệu CLB.</p>
				) : (
					<Chart options={options} series={chartSeries.series} type="bar" height={380} />
				)}
			</Card>
		</div>
	);
};

export default ReportsTab;
