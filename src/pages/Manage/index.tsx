import ColumnChart from '@/components/Chart/ColumnChart';
import LineChart from '@/components/Chart/LineChart';
import {
	CalendarOutlined,
	DashboardOutlined,
	EditOutlined,
	FireOutlined,
	PlusOutlined,
	TrophyOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	DatePicker,
	Descriptions,
	Divider,
	Drawer,
	Empty,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Progress,
	Row,
	Segmented,
	Select,
	Space,
	Statistic,
	Table,
	Tag,
	Timeline,
	Typography,
} from 'antd';
import moment from 'moment';
import { useState } from 'react';

const { RangePicker } = DatePicker;
const { Search, TextArea } = Input;
const { Text, Title } = Typography;

const cats = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Other'];
const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];

const newId = () => String(Date.now());

function bmiLabel(w: number, h: number) {
	const b = w / Math.pow(h / 100, 2);
	let color = 'green';
	let text = 'Bình thường';
	if (b < 18.5) {
		color = 'blue';
		text = 'Thiếu cân';
	} else if (b >= 25 && b < 30) {
		color = 'gold';
		text = 'Thừa cân';
	} else if (b >= 30) {
		color = 'red';
		text = 'Béo phì';
	}
	return { bmi: b.toFixed(1), color, text };
}

export default function Manage() {
	const [wf] = Form.useForm();
	const [hf] = Form.useForm();
	const [gf] = Form.useForm();

	const [workouts, setWorkouts] = useState([
		{
			id: '1',
			date: moment().subtract(3, 'd').toISOString(),
			category: 'Cardio',
			exercise: 'Chạy 5km',
			duration: 40,
			calories: 300,
			notes: '',
			status: 'completed',
		},
		{
			id: '2',
			date: moment().subtract(1, 'd').toISOString(),
			category: 'Strength',
			exercise: 'Ngực+vai',
			duration: 60,
			calories: 400,
			notes: '',
			status: 'completed',
		},
	]);
	const [health, setHealth] = useState([
		{
			id: 'h1',
			date: moment().subtract(14, 'd').toISOString(),
			weight: 77,
			height: 175,
			restingHeartRate: 72,
			sleepHours: 7,
		},
		{ id: 'h2', date: moment().toISOString(), weight: 76, height: 175, restingHeartRate: 70, sleepHours: 7.5 },
	]);
	const [goals, setGoals] = useState([
		{
			id: 'g1',
			name: 'Giảm 3kg',
			type: 'Giảm cân',
			targetValue: 3,
			currentValue: 1.5,
			deadline: moment().add(30, 'd').toISOString(),
			status: 'Đang thực hiện',
		},
	]);
	const exercises = [
		{
			id: 'e1',
			name: 'Squat',
			group: 'Legs',
			level: 'Trung bình',
			caloriesPerHour: 500,
			description: 'Tập chân, mông.',
		},
		{
			id: 'e2',
			name: 'Burpee',
			group: 'Full Body',
			level: 'Khó',
			caloriesPerHour: 600,
			description: 'Toàn thân, HIIT.',
		},
		{ id: 'e3', name: 'Bicep Curl', group: 'Arms', level: 'Dễ', caloriesPerHour: 220, description: 'Tay trước.' },
	];

	const [wModal, setWModal] = useState(false);
	const [hModal, setHModal] = useState(false);
	const [gDrawer, setGDrawer] = useState(false);
	const [exModal, setExModal] = useState(false);

	const [editW, setEditW] = useState<any>(null);
	const [editH, setEditH] = useState<any>(null);
	const [editG, setEditG] = useState<any>(null);
	const [pickEx, setPickEx] = useState<any>(null);

	const [wSearch, setWSearch] = useState('');
	const [wCat, setWCat] = useState<string | 'all'>('all');
	const [wRange, setWRange] = useState<any>(null);
	const [gFilter, setGFilter] = useState<string>('Tất cả');
	const [exGroup, setExGroup] = useState<string | 'all'>('all');
	const [exSearch, setExSearch] = useState('');

	const wSorted = [...workouts].sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());
	const hSorted = [...health].sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());

	const wShow = wSorted.filter((r) => {
		const okText = (r.exercise + r.category).toLowerCase().includes(wSearch.toLowerCase());
		const okCat = wCat === 'all' || r.category === wCat;
		const okDate = !wRange?.[0] || !wRange?.[1] ? true : moment(r.date).isBetween(wRange[0], wRange[1], 'day', '[]');
		return okText && okCat && okDate;
	});

	const gShow = goals.filter((g) => gFilter === 'Tất cả' || g.status === gFilter);
	const exShow = exercises.filter(
		(e) => (exGroup === 'all' || e.group === exGroup) && e.name.toLowerCase().includes(exSearch.toLowerCase()),
	);

	const monthDone = workouts.filter((x) => moment(x.date).isSame(moment(), 'month') && x.status === 'completed').length;
	const totalCal = workouts.filter((x) => x.status === 'completed').reduce((s, x) => s + x.calories, 0);
	const streak = (() => {
		let n = 0;
		let d = moment().startOf('day');
		const days = new Set(
			workouts.filter((x) => x.status === 'completed').map((x) => moment(x.date).format('YYYY-MM-DD')),
		);
		while (days.has(d.format('YYYY-MM-DD'))) {
			n++;
			d = d.subtract(1, 'day');
		}
		return n;
	})();
	const goalPct =
		goals.length === 0
			? 0
			: Math.round(
					goals.reduce((s, g) => s + Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)), 0) /
						goals.length,
			  );

	const months = [0, 1, 2, 3, 4, 5].map((i) => moment().subtract(5 - i, 'month'));
	const monthBars = months.map(
		(m) => workouts.filter((x) => moment(x.date).isSame(m, 'month') && x.status === 'completed').length,
	);
	const hAsc = [...health].sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());
	const latest = hSorted[0];

	const statusTag = (s: string) => {
		const map: Record<string, string> = { completed: 'green', planned: 'orange', skipped: 'red' };
		const lab: Record<string, string> = { completed: 'Hoàn thành', planned: 'Kế hoạch', skipped: 'Bỏ lỡ' };
		return <Tag color={map[s]}>{lab[s] || s}</Tag>;
	};

	const wCols = [
		{ title: 'Ngày', dataIndex: 'date', render: (v: string) => moment(v).format('DD/MM/YYYY') },
		{ title: 'Loại', dataIndex: 'category' },
		{ title: 'Bài tập', dataIndex: 'exercise' },
		{ title: 'Phút', dataIndex: 'duration' },
		{ title: 'Calo', dataIndex: 'calories' },
		{ title: 'TT', dataIndex: 'status', render: statusTag },
		{
			title: '',
			render: (_: any, r: any) => (
				<Space>
					<Button
						icon={<EditOutlined />}
						size='small'
						onClick={() => {
							setEditW(r);
							wf.setFieldsValue({ ...r, date: moment(r.date) });
							setWModal(true);
						}}
					/>
					<Popconfirm title='Xóa?' onConfirm={() => setWorkouts(workouts.filter((x) => x.id !== r.id))}>
						<Button danger size='small'>
							Xóa
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	const hCols = [
		{ title: 'Ngày', dataIndex: 'date', render: (v: string) => moment(v).format('DD/MM/YYYY') },
		{ title: 'Kg', dataIndex: 'weight' },
		{ title: 'Cm', dataIndex: 'height' },
		{
			title: 'BMI',
			render: (_: any, r: any) => {
				const x = bmiLabel(r.weight, r.height);
				return (
					<>
						{x.bmi} <Tag color={x.color}>{x.text}</Tag>
					</>
				);
			},
		},
		{ title: 'Nhịp tim', dataIndex: 'restingHeartRate' },
		{ title: 'Ngủ (h)', dataIndex: 'sleepHours' },
		{
			title: '',
			render: (_: any, r: any) => (
				<Space>
					<Button
						icon={<EditOutlined />}
						size='small'
						onClick={() => {
							setEditH(r);
							hf.setFieldsValue({ ...r, date: moment(r.date) });
							setHModal(true);
						}}
					/>
					<Popconfirm title='Xóa?' onConfirm={() => setHealth(health.filter((x) => x.id !== r.id))}>
						<Button danger size='small'>
							Xóa
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	const saveW = async () => {
		const v = await wf.validateFields();
		const row = {
			id: editW?.id ?? newId(),
			date: v.date.toISOString(),
			category: v.category,
			exercise: v.exercise,
			duration: v.duration,
			calories: v.calories,
			notes: v.notes || '',
			status: v.status,
		};
		setWorkouts(editW ? workouts.map((x) => (x.id === editW.id ? row : x)) : [row, ...workouts]);
		setWModal(false);
		setEditW(null);
		wf.resetFields();
	};

	const saveH = async () => {
		const v = await hf.validateFields();
		const row = {
			id: editH?.id ?? newId(),
			date: v.date.toISOString(),
			weight: v.weight,
			height: v.height,
			restingHeartRate: v.restingHeartRate,
			sleepHours: v.sleepHours,
		};
		setHealth(editH ? health.map((x) => (x.id === editH.id ? row : x)) : [row, ...health]);
		setHModal(false);
		setEditH(null);
		hf.resetFields();
	};

	const saveG = async () => {
		const v = await gf.validateFields();
		const row = {
			id: editG?.id ?? newId(),
			name: v.name,
			type: v.type,
			targetValue: v.targetValue,
			currentValue: v.currentValue,
			deadline: v.deadline.toISOString(),
			status: v.status,
		};
		setGoals(editG ? goals.map((x) => (x.id === editG.id ? row : x)) : [row, ...goals]);
		setGDrawer(false);
		setEditG(null);
		gf.resetFields();
	};

	return (
		<div style={{ padding: 8 }}>
			<Space direction='vertical' size={16} style={{ width: '100%' }}>
				<Card>
					<Title level={4} style={{ margin: 0 }}>
						Theo dõi luyện tập & sức khỏe
					</Title>
					<Text type='secondary'>Bài thực hành — dữ liệu demo trong state.</Text>
				</Card>

				<Row gutter={[12, 12]}>
					<Col xs={12} md={6}>
						<Card size='small'>
							<Statistic title='Buổi tập tháng này' value={monthDone} prefix={<DashboardOutlined />} />
						</Card>
					</Col>
					<Col xs={12} md={6}>
						<Card size='small'>
							<Statistic title='Tổng calo' value={totalCal} suffix='kcal' prefix={<FireOutlined />} />
						</Card>
					</Col>
					<Col xs={12} md={6}>
						<Card size='small'>
							<Statistic title='Streak' value={streak} suffix='ngày' prefix={<CalendarOutlined />} />
						</Card>
					</Col>
					<Col xs={12} md={6}>
						<Card size='small'>
							<Statistic title='Tiến độ TB (mục tiêu)' value={goalPct} suffix='%' prefix={<TrophyOutlined />} />
						</Card>
					</Col>
				</Row>

				<Row gutter={[12, 12]}>
					<Col xs={24} lg={14}>
						<Card size='small'>
							<ColumnChart
								title='Buổi tập / tháng'
								xAxis={months.map((m) => m.format('MM/YYYY'))}
								yAxis={[monthBars]}
								yLabel={['Buổi']}
								formatY={(n: number) => `${n}`}
								colors={['#1677ff']}
							/>
						</Card>
					</Col>
					<Col xs={24} lg={10}>
						<Card size='small'>
							<LineChart
								title='Cân nặng'
								xAxis={hAsc.map((x) => moment(x.date).format('DD/MM'))}
								yAxis={[hAsc.map((x) => x.weight)]}
								yLabel={['Kg']}
								formatY={(n: number) => n.toFixed(1)}
								colors={['#52c41a']}
							/>
						</Card>
					</Col>
				</Row>

				<Card
					title='Nhật ký tập'
					extra={
						<Button
							type='primary'
							size='small'
							icon={<PlusOutlined />}
							onClick={() => {
								setEditW(null);
								wf.resetFields();
								wf.setFieldsValue({ date: moment(), category: 'Cardio', status: 'completed' });
								setWModal(true);
							}}
						>
							Thêm
						</Button>
					}
				>
					<Space wrap style={{ marginBottom: 12 }}>
						<Search
							placeholder='Tìm bài...'
							allowClear
							style={{ width: 200 }}
							onChange={(e) => setWSearch(e.target.value)}
						/>
						<Select
							style={{ width: 140 }}
							value={wCat}
							onChange={setWCat}
							options={[{ label: 'Tất cả', value: 'all' }, ...cats.map((c) => ({ label: c, value: c }))]}
						/>
						<RangePicker onChange={setWRange} />
					</Space>
					<Table rowKey='id' size='small' pagination={{ pageSize: 5 }} columns={wCols as any} dataSource={wShow} />
				</Card>

				<Row gutter={[12, 12]}>
					<Col xs={24} md={12}>
						<Card title='5 buổi gần nhất' size='small'>
							<Timeline>
								{wSorted.slice(0, 5).map((x) => (
									<Timeline.Item key={x.id}>
										{moment(x.date).format('DD/MM')} — {x.exercise}
									</Timeline.Item>
								))}
							</Timeline>
						</Card>
					</Col>
					<Col xs={24} md={12}>
						<Card title='Chỉ số mới nhất' size='small'>
							{latest ? (
								<Descriptions column={1} size='small'>
									<Descriptions.Item label='Cân'>{latest.weight} kg</Descriptions.Item>
									<Descriptions.Item label='Cao'>{latest.height} cm</Descriptions.Item>
									<Descriptions.Item label='BMI'>
										{bmiLabel(latest.weight, latest.height).bmi}{' '}
										<Tag color={bmiLabel(latest.weight, latest.height).color}>
											{bmiLabel(latest.weight, latest.height).text}
										</Tag>
									</Descriptions.Item>
								</Descriptions>
							) : (
								<Empty />
							)}
						</Card>
					</Col>
				</Row>

				<Card
					title='Chỉ số sức khỏe'
					extra={
						<Button
							type='primary'
							size='small'
							icon={<PlusOutlined />}
							onClick={() => {
								setEditH(null);
								hf.resetFields();
								hf.setFieldsValue({ date: moment(), height: latest?.height ?? 175 });
								setHModal(true);
							}}
						>
							Thêm
						</Button>
					}
				>
					<Table rowKey='id' size='small' pagination={{ pageSize: 5 }} columns={hCols as any} dataSource={hSorted} />
				</Card>

				<Card
					title='Mục tiêu'
					extra={
						<Space wrap>
							<Segmented
								value={gFilter}
								onChange={(v) => setGFilter(v as string)}
								options={['Tất cả', 'Đang thực hiện', 'Đã đạt', 'Đã hủy']}
							/>
							<Button
								type='primary'
								size='small'
								icon={<PlusOutlined />}
								onClick={() => {
									setEditG(null);
									gf.resetFields();
									gf.setFieldsValue({ status: 'Đang thực hiện', type: 'Giảm cân', deadline: moment().add(30, 'd') });
									setGDrawer(true);
								}}
							>
								Thêm
							</Button>
						</Space>
					}
				>
					<Row gutter={[12, 12]}>
						{gShow.map((g) => (
							<Col xs={24} md={12} lg={8} key={g.id}>
								<Card
									size='small'
									actions={[
										<Button
											type='link'
											key='e'
											onClick={() => {
												setEditG(g);
												gf.setFieldsValue({ ...g, deadline: moment(g.deadline) });
												setGDrawer(true);
											}}
										>
											Sửa
										</Button>,
										<Popconfirm key='d' title='Xóa?' onConfirm={() => setGoals(goals.filter((x) => x.id !== g.id))}>
											<Button type='link' danger>
												Xóa
											</Button>
										</Popconfirm>,
									]}
								>
									<Text strong>{g.name}</Text>
									<div>
										<Tag>{g.type}</Tag>{' '}
										<Tag color={g.status === 'Đã đạt' ? 'success' : g.status === 'Đã hủy' ? 'default' : 'processing'}>
											{g.status}
										</Tag>
									</div>
									<Text type='secondary'>Deadline: {moment(g.deadline).format('DD/MM/YYYY')}</Text>
									<Progress percent={Math.min(100, Math.round((g.currentValue / g.targetValue) * 100))} />
									<div>
										Hiện tại:{' '}
										<InputNumber
											size='small'
											min={0}
											value={g.currentValue}
											onChange={(v) => {
												const cur = Number(v ?? 0);
												setGoals(
													goals.map((x) =>
														x.id === g.id
															? {
																	...x,
																	currentValue: cur,
																	status:
																		cur >= x.targetValue
																			? 'Đã đạt'
																			: x.status === 'Đã đạt'
																			? 'Đang thực hiện'
																			: x.status,
															  }
															: x,
													),
												);
											}}
										/>{' '}
										/ {g.targetValue}
									</div>
								</Card>
							</Col>
						))}
					</Row>
				</Card>

				<Card title='Thư viện bài tập'>
					<Space wrap style={{ marginBottom: 12 }}>
						<Select
							style={{ width: 160 }}
							value={exGroup}
							onChange={setExGroup}
							options={[{ label: 'Tất cả', value: 'all' }, ...muscleGroups.map((g) => ({ label: g, value: g }))]}
						/>
						<Search
							placeholder='Tên bài...'
							allowClear
							style={{ width: 200 }}
							onChange={(e) => setExSearch(e.target.value)}
						/>
					</Space>
					<Row gutter={[12, 12]}>
						{exShow.map((e) => (
							<Col xs={24} md={8} key={e.id}>
								<Card
									size='small'
									hoverable
									onClick={() => {
										setPickEx(e);
										setExModal(true);
									}}
								>
									<Text strong>{e.name}</Text>
									<div>
										<Tag>{e.group}</Tag> <Tag color='purple'>{e.level}</Tag>
									</div>
									<Text type='secondary'>{e.description}</Text>
								</Card>
							</Col>
						))}
					</Row>
				</Card>
			</Space>

			<Modal
				destroyOnClose
				visible={wModal}
				title={editW ? 'Sửa buổi tập' : 'Thêm buổi tập'}
				onCancel={() => setWModal(false)}
				onOk={saveW}
			>
				<Form form={wf} layout='vertical'>
					<Form.Item name='date' label='Ngày' rules={[{ required: true }]}>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='category' label='Loại' rules={[{ required: true }]}>
						<Select options={cats.map((c) => ({ label: c, value: c }))} />
					</Form.Item>
					<Form.Item name='exercise' label='Bài tập' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Row gutter={8}>
						<Col span={12}>
							<Form.Item name='duration' label='Phút' rules={[{ required: true }]}>
								<InputNumber min={1} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='calories' label='Calo' rules={[{ required: true }]}>
								<InputNumber min={0} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item name='status' label='Trạng thái' rules={[{ required: true }]}>
						<Select
							options={[
								{ label: 'Hoàn thành', value: 'completed' },
								{ label: 'Kế hoạch', value: 'planned' },
								{ label: 'Bỏ lỡ', value: 'skipped' },
							]}
						/>
					</Form.Item>
					<Form.Item name='notes' label='Ghi chú'>
						<TextArea rows={2} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				destroyOnClose
				visible={hModal}
				title={editH ? 'Sửa chỉ số' : 'Thêm chỉ số'}
				onCancel={() => setHModal(false)}
				onOk={saveH}
			>
				<Form form={hf} layout='vertical'>
					<Form.Item name='date' label='Ngày' rules={[{ required: true }]}>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
					<Row gutter={8}>
						<Col span={12}>
							<Form.Item name='weight' label='Cân (kg)' rules={[{ required: true }]}>
								<InputNumber min={1} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='height' label='Cao (cm)' rules={[{ required: true }]}>
								<InputNumber min={1} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={8}>
						<Col span={12}>
							<Form.Item name='restingHeartRate' label='Nhịp tim nghỉ' rules={[{ required: true }]}>
								<InputNumber min={1} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='sleepHours' label='Giờ ngủ' rules={[{ required: true }]}>
								<InputNumber min={0} max={24} step={0.1} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>

			<Drawer
				destroyOnClose
				width={380}
				visible={gDrawer}
				title={editG ? 'Sửa mục tiêu' : 'Thêm mục tiêu'}
				onClose={() => setGDrawer(false)}
			>
				<Form form={gf} layout='vertical'>
					<Form.Item name='name' label='Tên' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='type' label='Loại' rules={[{ required: true }]}>
						<Select
							options={['Giảm cân', 'Tăng cơ', 'Cải thiện sức bền', 'Khác'].map((t) => ({ label: t, value: t }))}
						/>
					</Form.Item>
					<Row gutter={8}>
						<Col span={12}>
							<Form.Item name='targetValue' label='Mục tiêu' rules={[{ required: true }]}>
								<InputNumber min={0} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='currentValue' label='Hiện tại' rules={[{ required: true }]}>
								<InputNumber min={0} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item name='deadline' label='Deadline' rules={[{ required: true }]}>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='status' label='Trạng thái' rules={[{ required: true }]}>
						<Select options={['Đang thực hiện', 'Đã đạt', 'Đã hủy'].map((t) => ({ label: t, value: t }))} />
					</Form.Item>
					<Button type='primary' block onClick={saveG}>
						Lưu
					</Button>
				</Form>
			</Drawer>

			<Modal footer={null} visible={exModal} title={pickEx?.name} onCancel={() => setExModal(false)}>
				{pickEx && (
					<>
						<Tag>{pickEx.group}</Tag> <Tag>{pickEx.level}</Tag>
						<p>{pickEx.description}</p>
						<Divider />
						<Text>~{pickEx.caloriesPerHour} kcal/giờ</Text>
					</>
				)}
			</Modal>
		</div>
	);
}
