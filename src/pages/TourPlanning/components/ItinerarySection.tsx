import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, InputNumber, Select, Table } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { Destination, PlannedRow } from '../types';
import { getPlanTableColumns } from '../planTableColumns';

type Props = {
	form: FormInstance<{ destinationId: string; day: number }>;
	destinations: Destination[];
	plannedRows: PlannedRow[];
	onAdd: () => void;
};

export const ItinerarySection: React.FC<Props> = ({ form, destinations, plannedRows, onAdd }) => (
	<Card title="Tạo lịch trình du lịch">
		<Form layout="inline" form={form} style={{ rowGap: 12 }}>
			<Form.Item name="destinationId" rules={[{ required: true, message: 'Chọn điểm đến' }]}>
				<Select placeholder="Chọn điểm đến" style={{ minWidth: 220 }}>
					{destinations.map((d) => (
						<Select.Option key={d.id} value={d.id}>
							{d.name}
						</Select.Option>
					))}
				</Select>
			</Form.Item>
			<Form.Item name="day" rules={[{ required: true, message: 'Nhập ngày' }]}>
				<InputNumber min={1} max={30} placeholder="Ngày" />
			</Form.Item>
			<Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
				Thêm
			</Button>
		</Form>

		<div style={{ marginTop: 16 }}>
			<Table
				size="small"
				rowKey={(r, idx) => `${r.destinationId}-${r.day}-${idx}`}
				columns={getPlanTableColumns()}
				dataSource={plannedRows}
				pagination={{ pageSize: 5 }}
				scroll={{ x: 680 }}
			/>
		</div>
	</Card>
);
