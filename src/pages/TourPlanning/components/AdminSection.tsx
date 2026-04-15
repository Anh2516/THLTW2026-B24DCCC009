import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {Button,Card,Form,Input,InputNumber,Modal,Popconfirm,Progress,Select,Space,Statistic,Table,Tabs,Tag,Typography,} from 'antd';
import { currencyFormatter } from '../format';
import type { BudgetTotals, Destination, DestinationInput, DestinationType } from '../types';
import { useMemo, useState } from 'react';

type Props = {
	destinations: Destination[];
	planCount: number;
	popularDestination: string;
	popularLocation: string;
	monthlyRevenue: number;
	budgetStats: BudgetTotals;
	monthlyPlanStats: Array<{ month: string; count: number }>;
	topDestinations: Destination[];
	onCreateDestination: (payload: DestinationInput) => void;
	onUpdateDestination: (id: string, payload: DestinationInput) => void;
	onDeleteDestination: (id: string) => void;
};


type FormValues = {
	name: string;
	location: string;
	type: DestinationType;
	description: string;
	rating: number;
	priceLevel: number;
	visitHours: number;
	foodCost: number;
	stayCost: number;
	transportCost: number;
	image: string;
};

export const AdminSection: React.FC<Props> = ({
	destinations,
	planCount,
	popularDestination,
	popularLocation,
	monthlyRevenue,
	budgetStats,
	monthlyPlanStats,
	topDestinations,
	onCreateDestination,
	onUpdateDestination,
	onDeleteDestination,
}) => {
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Destination | null>(null);
	const [form] = Form.useForm<FormValues>();

	const openCreate = () => {
		setEditing(null);
		form.setFieldsValue({
			name: '',
			location: '',
			type: 'Biển',
			description: '',
			rating: 4.5,
			priceLevel: 3,
			visitHours: 4,
			foodCost: 300000,
			stayCost: 600000,
			transportCost: 250000,
			image: '',
		});
		setOpen(true);
	};

	const openEdit = (record: Destination) => {
		setEditing(record);
		form.setFieldsValue({ ...record });
		setOpen(true);
	};

	const submit = async () => {
		const values = await form.validateFields();
		if (editing) {
			onUpdateDestination(editing.id, values);
		} else {
			onCreateDestination(values);
		}
		setOpen(false);
	};

	const totalByDestination = useMemo(
		() =>
			destinations.map((d) => ({
				...d,
				totalCost: d.foodCost + d.stayCost + d.transportCost,
			})),
		[destinations],
	);

	return (
		<Card title="Trang quản trị (Admin)">
			<Tabs defaultActiveKey="management">
				<Tabs.TabPane tab="Quản lý điểm đến" key="management">
							<Space direction="vertical" size={12} style={{ width: '100%' }}>
								<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
									Thêm điểm đến
								</Button>
								<Table
									rowKey="id"
									size="small"
									dataSource={totalByDestination}
									scroll={{ x: 980 }}
									pagination={{ pageSize: 5 }}
									columns={[
										{ title: 'Tên', dataIndex: 'name', width: 180 },
										{ title: 'Loại', dataIndex: 'type', width: 100, render: (v: DestinationType) => <Tag>{v}</Tag> },
										{ title: 'Rating', dataIndex: 'rating', width: 80 },
										{ title: 'Mô tả', dataIndex: 'description', ellipsis: true },
										{
											title: 'Tổng chi',
											width: 140,
											render: (_, r) => `${currencyFormatter.format(r.totalCost)} đ`,
										},
										{
											title: 'Thao tác',
											width: 150,
											render: (_, r) => (
												<Space size="small">
													<Button type="link" icon={<EditOutlined />} onClick={() => openEdit(r)}>
														Sửa
													</Button>
													<Popconfirm
														title="Xóa điểm đến này?"
														okText="Xóa"
														cancelText="Hủy"
														onConfirm={() => onDeleteDestination(r.id)}
													>
														<Button type="link" danger icon={<DeleteOutlined />}>
															Xóa
														</Button>
													</Popconfirm>
												</Space>
											),
										},
									]}
								/>
							</Space>
				</Tabs.TabPane>
				<Tabs.TabPane tab="Thống kê" key="stats">
							<Space direction="vertical" size={12} style={{ width: '100%' }}>
								<Statistic title="Số lịch trình đã tạo" value={planCount} />
								<Statistic title="Địa điểm phổ biến" value={popularDestination} />
								<Statistic title="Khu vực phổ biến" value={popularLocation} />
								<Statistic title="Doanh thu ước tính" value={`${currencyFormatter.format(Math.round(monthlyRevenue))} đ`} />
								<Typography.Text strong>Chi theo hạng mục</Typography.Text>
								<div>
									<Typography.Text>Ăn uống ({currencyFormatter.format(budgetStats.food)} đ)</Typography.Text>
									<Progress percent={budgetStats.total ? Math.round((budgetStats.food / budgetStats.total) * 100) : 0} />
									<Typography.Text>Lưu trú ({currencyFormatter.format(budgetStats.stay)} đ)</Typography.Text>
									<Progress percent={budgetStats.total ? Math.round((budgetStats.stay / budgetStats.total) * 100) : 0} />
									<Typography.Text>Di chuyển ({currencyFormatter.format(budgetStats.transport)} đ)</Typography.Text>
									<Progress percent={budgetStats.total ? Math.round((budgetStats.transport / budgetStats.total) * 100) : 0} />
								</div>
								<Typography.Text strong>Lịch trình theo tháng</Typography.Text>
								<Table
									size="small"
									rowKey="month"
									pagination={false}
									dataSource={monthlyPlanStats}
									locale={{ emptyText: 'Chưa có lịch trình nào được tạo.' }}
									columns={[
										{ title: 'Tháng', dataIndex: 'month' },
										{ title: 'Số lịch trình', dataIndex: 'count' },
									]}
								/>
								<Typography.Text strong>Top điểm đến theo rating</Typography.Text>
								{topDestinations.map((d) => (
									<Space key={d.id} style={{ width: '100%', justifyContent: 'space-between' }}>
										<Typography.Text>{d.name}</Typography.Text>
										<Tag color="gold">{d.rating}</Tag>
									</Space>
								))}
							</Space>
				</Tabs.TabPane>
			</Tabs>

			<Modal
				title={editing ? 'Chỉnh sửa điểm đến' : 'Thêm điểm đến'}
				visible={open}
				onCancel={() => setOpen(false)}
				onOk={submit}
				width={760}
				destroyOnClose
			>
				<Form form={form} layout="vertical">
					<Form.Item name="name" label="Tên điểm đến" rules={[{ required: true, message: 'Nhập tên điểm đến' }]}>
						<Input />
					</Form.Item>
					<Form.Item name="location" label="Khu vực/địa phương" rules={[{ required: true, message: 'Nhập khu vực' }]}>
						<Input />
					</Form.Item>
					<Form.Item name="type" label="Loại hình" rules={[{ required: true }]}>
						<Select>
							<Select.Option value="Biển">Biển</Select.Option>
							<Select.Option value="Núi">Núi</Select.Option>
							<Select.Option value="Thành phố">Thành phố</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Nhập mô tả' }]}>
						<Input.TextArea rows={3} />
					</Form.Item>
					<Form.Item name="image" label="Hình ảnh điểm đến" rules={[{ required: true, message: 'Chọn ảnh hoặc nhập URL' }]}>
						<Input placeholder="Dán URL ảnh" />
					</Form.Item>
					
					
					<Space size={12} style={{ display: 'flex', marginTop: 16 }}>
						<Form.Item name="rating" label="Rating" rules={[{ required: true }]} style={{ flex: 1 }}>
							<InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item name="priceLevel" label="Mức giá (1-5)" rules={[{ required: true }]} style={{ flex: 1 }}>
							<InputNumber min={1} max={5} style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item name="visitHours" label="Giờ tham quan" rules={[{ required: true }]} style={{ flex: 1 }}>
							<InputNumber min={1} max={24} style={{ width: '100%' }} />
						</Form.Item>
					</Space>
					<Space size={12} style={{ display: 'flex' }}>
						<Form.Item name="foodCost" label="Chi ăn uống" rules={[{ required: true }]} style={{ flex: 1 }}>
							<InputNumber min={0} step={50000} style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item name="stayCost" label="Chi lưu trú" rules={[{ required: true }]} style={{ flex: 1 }}>
							<InputNumber min={0} step={50000} style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item name="transportCost" label="Chi di chuyển" rules={[{ required: true }]} style={{ flex: 1 }}>
							<InputNumber min={0} step={50000} style={{ width: '100%' }} />
						</Form.Item>
					</Space>
				</Form>
			</Modal>
		</Card>
	);
};
