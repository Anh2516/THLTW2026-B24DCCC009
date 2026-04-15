import { Card, Col, Row, Select, Space } from 'antd';
import type { Destination, DestinationType } from '../types';
import { DestinationCard } from './DestinationCard';

type Props = {
	destinations: Destination[];
	typeFilter: 'Tất cả' | DestinationType;
	sortBy: 'rating' | 'price';
	onTypeFilterChange: (v: 'Tất cả' | DestinationType) => void;
	onSortChange: (v: 'rating' | 'price') => void;
};

export const ExploreSection: React.FC<Props> = ({
	destinations,
	typeFilter,
	sortBy,
	onTypeFilterChange,
	onSortChange,
}) => (
	<Card title="Trang chủ - Khám phá điểm đến">
		<Space wrap style={{ marginBottom: 16 }}>
			<Select value={typeFilter} style={{ width: 170 }} onChange={onTypeFilterChange}>
				<Select.Option value="Tất cả">Tất cả loại hình</Select.Option>
				<Select.Option value="Biển">Biển</Select.Option>
				<Select.Option value="Núi">Núi</Select.Option>
				<Select.Option value="Thành phố">Thành phố</Select.Option>
			</Select>
			<Select value={sortBy} style={{ width: 170 }} onChange={onSortChange}>
				<Select.Option value="rating">Sắp xếp: Đánh giá</Select.Option>
				<Select.Option value="price">Sắp xếp: Giá</Select.Option>
			</Select>
		</Space>

		<Row gutter={[12, 12]}>
			{destinations.map((d) => (
				<Col xs={24} sm={12} md={12} xl={8} key={d.id}>
					<DestinationCard destination={d} />
				</Col>
			))}
		</Row>
	</Card>
);
