import { Space, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { currencyFormatter } from './format';
import type { PlannedRow } from './types';

export function getPlanTableColumns(): ColumnsType<PlannedRow> {
	return [
		{
			title: 'Ngày',
			dataIndex: 'day',
			width: 70,
			sorter: (a, b) => a.day - b.day,
		},
		{
			title: 'Điểm đến',
			render: (_, r) => (
				<Space>
					<img src={r.destination.image} alt={r.destination.name} style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 8 }} />
					<div>
						<div>{r.destination.name}</div>
						<Typography.Text type="secondary">{r.destination.location}</Typography.Text>
					</div>
				</Space>
			),
		},
		{
			title: 'Thời gian',
			width: 120,
			render: (_, r) => `${r.destination.visitHours} giờ`,
		},
		{
			title: 'Ngân sách',
			width: 150,
			render: (_, r) =>
				`${currencyFormatter.format(r.destination.foodCost + r.destination.stayCost + r.destination.transportCost)} đ`,
		},
	];
}
