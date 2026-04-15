import { Card, Space, Tag, Typography } from 'antd';
import type { Destination } from '../types';

type Props = {
	destination: Destination;
};

export const DestinationCard: React.FC<Props> = ({ destination: d }) => (
	<Card hoverable cover={<img alt={d.name} src={d.image} style={{ height: 150, objectFit: 'cover' }} />} bodyStyle={{ padding: 12 }}>
		<Space direction="vertical" size={4} style={{ width: '100%' }}>
			<Typography.Text strong>{d.name}</Typography.Text>
			<Typography.Text type="secondary">{d.location}</Typography.Text>
			<Space size={6}>
				<Tag color="blue">{d.type}</Tag>
				<Tag color="gold">Rating: {d.rating}</Tag>
				<Tag>Giá: {d.priceLevel}/5</Tag>
			</Space>
		</Space>
	</Card>
);
