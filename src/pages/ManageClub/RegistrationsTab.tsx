import type { Club, Registration, RegistrationStatus } from '@/models/clubStore.types';
import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, EyeOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { useModel } from 'umi';

const statusTag = (s: RegistrationStatus) => {
	if (s === 'approved') return <Tag color="green">Đã duyệt</Tag>;
	if (s === 'rejected') return <Tag color="red">Từ chối</Tag>;
	return <Tag color="gold">Chờ duyệt</Tag>;
};

const RegistrationsTab: React.FC = () => {
	const {
		registrations,
		clubs,
		actionLogs,
		getClubName,
		upsertRegistration,
		deleteRegistration,
		setRegistrationStatus,
		bulkSetRegistrationStatus,
	} = useModel('quanlyclub');

	const [search, setSearch] = useState('');
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [detail, setDetail] = useState<Registration | null>(null);
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<Registration | null>(null);
	const [logOpen, setLogOpen] = useState(false);
	const [rejectModal, setRejectModal] = useState<{ ids: string[]; bulk: boolean } | null>(null);
	const [rejectForm] = Form.useForm<{ notes: string }>();
	const [regForm] = Form.useForm<Record<string, unknown>>();

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return registrations;
		return registrations.filter(
			(r: Registration) =>
				r.fullName.toLowerCase().includes(q) ||
				r.email.toLowerCase().includes(q) ||
				r.phone.includes(q) ||
				getClubName(r.clubId).toLowerCase().includes(q),
		);
	}, [registrations, search, getClubName]);

	const openCreate = () => {
		setEditing(null);
		regForm.resetFields();
		regForm.setFieldsValue({
			gender: 'Nam',
			clubId: clubs[0]?.id,
			status: 'pending',
			notes: '',
		});
		setFormOpen(true);
	};

	const openEdit = (r: Registration) => {
		setEditing(r);
		regForm.setFieldsValue({
			...r,
		});
		setFormOpen(true);
	};

	const submitReg = async () => {
		const v = await regForm.validateFields();
		if (editing && v.status === 'rejected' && !(v.notes as string)?.trim()) {
			Modal.error({ title: 'Thiếu ghi chú', content: 'Khi từ chối, vui lòng nhập ghi chú / lý do.' });
			return;
		}
		upsertRegistration({
			id: editing?.id,
			fullName: v.fullName as string,
			email: v.email as string,
			phone: v.phone as string,
			gender: v.gender as string,
			address: v.address as string,
			strengths: v.strengths as string,
			clubId: v.clubId as string,
			reason: v.reason as string,
			status: (v.status as RegistrationStatus) ?? 'pending',
			notes: (v.notes as string) ?? '',
		});
		setFormOpen(false);
		setSelectedRowKeys([]);
	};

	const confirmApprove = (ids: string[]) => {
		Modal.confirm({
			title: ids.length > 1 ? `Duyệt ${ids.length} đơn đã chọn?` : 'Duyệt đơn này?',
			okText: 'Duyệt',
			cancelText: 'Hủy',
			onOk: () => {
				if (ids.length === 1) setRegistrationStatus(ids[0], 'approved');
				else bulkSetRegistrationStatus(ids, 'approved');
				setSelectedRowKeys([]);
			},
		});
	};

	const openReject = (ids: string[], bulk: boolean) => {
		rejectForm.resetFields();
		setRejectModal({ ids, bulk });
	};

	const submitReject = async () => {
		const v = await rejectForm.validateFields();
		if (!rejectModal) return;
		const reason = v.notes.trim();
		if (rejectModal.ids.length === 1) setRegistrationStatus(rejectModal.ids[0], 'rejected', reason);
		else bulkSetRegistrationStatus(rejectModal.ids, 'rejected', reason);
		setRejectModal(null);
		setSelectedRowKeys([]);
	};

	const columns: ColumnsType<Registration> = [
		{ title: 'Họ tên', dataIndex: 'fullName', sorter: (a, b) => a.fullName.localeCompare(b.fullName, 'vi'), width: 160 },
		{ title: 'Email', dataIndex: 'email', width: 180, ellipsis: true },
		{ title: 'SĐT', dataIndex: 'phone', width: 110 },
		{ title: 'Giới tính', dataIndex: 'gender', width: 90 },
		{ title: 'Địa chỉ', dataIndex: 'address', ellipsis: true, width: 140 },
		{ title: 'Sở trường', dataIndex: 'strengths', ellipsis: true, width: 120 },
		{
			title: 'CLB',
			dataIndex: 'clubId',
			width: 160,
			ellipsis: true,
			render: (id: string) => getClubName(id),
			sorter: (a, b) => getClubName(a.clubId).localeCompare(getClubName(b.clubId), 'vi'),
		},
		{ title: 'Lý do đăng ký', dataIndex: 'reason', ellipsis: true, width: 160 },
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			width: 110,
			filters: [
				{ text: 'Chờ duyệt', value: 'pending' },
				{ text: 'Đã duyệt', value: 'approved' },
				{ text: 'Từ chối', value: 'rejected' },
			],
			onFilter: (value, record) => record.status === value,
			render: (s: RegistrationStatus) => statusTag(s),
		},
		{ title: 'Ghi chú', dataIndex: 'notes', ellipsis: true, width: 140 },
		{
			title: 'Thao tác',
			key: 'act',
			fixed: 'right',
			width: 280,
			render: (_, r) => (
				<Space size="small" wrap>
					<Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(r)}>
						Chi tiết
					</Button>
					<Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>
						Sửa
					</Button>
					<Popconfirm title="Xóa đơn này?" onConfirm={() => deleteRegistration(r.id)} okText="Xóa" cancelText="Hủy">
						<Button type="link" size="small" danger icon={<DeleteOutlined />}>
							Xóa
						</Button>
					</Popconfirm>
					{r.status === 'pending' ? (
						<>
							<Button type="link" size="small" icon={<CheckOutlined />} onClick={() => confirmApprove([r.id])}>
								Duyệt
							</Button>
							<Button type="link" size="small" danger icon={<CloseOutlined />} onClick={() => openReject([r.id], false)}>
								Từ chối
							</Button>
						</>
					) : null}
				</Space>
			),
		},
	];

	const pendingSelected = useMemo(() => {
		const idSet = new Set(selectedRowKeys.map(String));
		return registrations.filter((r: Registration) => idSet.has(r.id) && r.status === 'pending');
	}, [registrations, selectedRowKeys]);

	return (
		<div>
			<Space style={{ marginBottom: 16 }} wrap>
				<Input.Search allowClear placeholder="Tìm theo tên, email, SĐT, CLB…" onChange={(e) => setSearch(e.target.value)} style={{ width: 320 }} />
				<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
					Thêm đơn
				</Button>
				<Button
					type="primary"
					disabled={!pendingSelected.length}
					icon={<CheckOutlined />}
					onClick={() => confirmApprove(pendingSelected.map((x: Registration) => x.id))}
				>
					Duyệt {pendingSelected.length} đơn đã chọn
				</Button>
				<Button danger disabled={!pendingSelected.length} icon={<CloseOutlined />} onClick={() => openReject(pendingSelected.map((x: Registration) => x.id), true)}>
					Từ chối {pendingSelected.length} đơn đã chọn
				</Button>
				<Button icon={<HistoryOutlined />} onClick={() => setLogOpen(true)}>
					Lịch sử thao tác
				</Button>
			</Space>

			<Table
				rowKey="id"
				rowSelection={{
					selectedRowKeys,
					onChange: (keys) => setSelectedRowKeys(keys),
					getCheckboxProps: (record) => ({
						disabled: record.status !== 'pending',
					}),
				}}
				columns={columns}
				dataSource={filtered}
				scroll={{ x: 1400 }}
				pagination={{ pageSize: 10, showSizeChanger: true }}
			/>

			<Modal title="Chi tiết đơn đăng ký" visible={!!detail} onCancel={() => setDetail(null)} footer={null} width={560}>
				{detail ? (
					<Space direction="vertical" style={{ width: '100%' }}>
						<Typography.Text>
							<strong>Họ tên:</strong> {detail.fullName}
						</Typography.Text>
						<Typography.Text>
							<strong>Email:</strong> {detail.email}
						</Typography.Text>
						<Typography.Text>
							<strong>SĐT:</strong> {detail.phone}
						</Typography.Text>
						<Typography.Text>
							<strong>Giới tính:</strong> {detail.gender}
						</Typography.Text>
						<Typography.Text>
							<strong>Địa chỉ:</strong> {detail.address}
						</Typography.Text>
						<Typography.Text>
							<strong>Sở trường:</strong> {detail.strengths}
						</Typography.Text>
						<Typography.Text>
							<strong>CLB:</strong> {getClubName(detail.clubId)}
						</Typography.Text>
						<Typography.Text>
							<strong>Lý do:</strong> {detail.reason}
						</Typography.Text>
						<div>{statusTag(detail.status)}</div>
						{detail.notes ? (
							<Typography.Text>
								<strong>Ghi chú:</strong> {detail.notes}
							</Typography.Text>
						) : null}
					</Space>
				) : null}
			</Modal>

			<Modal title={editing ? 'Sửa đơn đăng ký' : 'Thêm đơn đăng ký'} visible={formOpen} onCancel={() => setFormOpen(false)} onOk={submitReg} width={640} destroyOnClose>
				<Form form={regForm} layout="vertical" style={{ marginTop: 8 }}>
					<Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
						<Input />
					</Form.Item>
					<Form.Item name="phone" label="SĐT" rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
						<Select>
							<Select.Option value="Nam">Nam</Select.Option>
							<Select.Option value="Nữ">Nữ</Select.Option>
							<Select.Option value="Khác">Khác</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name="strengths" label="Sở trường" rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name="clubId" label="Câu lạc bộ" rules={[{ required: true }]}>
						<Select placeholder="Chọn CLB">
							{clubs.map((c: Club) => (
								<Select.Option key={c.id} value={c.id}>
									{c.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item name="reason" label="Lý do đăng ký" rules={[{ required: true }]}>
						<Input.TextArea rows={3} />
					</Form.Item>
					{editing ? (
						<>
							<Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
								<Select>
									<Select.Option value="pending">Chờ duyệt</Select.Option>
									<Select.Option value="approved">Đã duyệt</Select.Option>
									<Select.Option value="rejected">Từ chối</Select.Option>
								</Select>
							</Form.Item>
							<Form.Item name="notes" label="Ghi chú (bắt buộc nếu từ chối)" rules={[{ required: false }]}>
								<Input.TextArea rows={2} />
							</Form.Item>
						</>
					) : null}
				</Form>
			</Modal>

			<Modal
				title={rejectModal?.bulk ? `Từ chối ${rejectModal.ids.length} đơn` : 'Từ chối đơn'}
				visible={!!rejectModal}
				onCancel={() => setRejectModal(null)}
				onOk={submitReject}
				okText="Xác nhận từ chối"
			>
				<Typography.Paragraph type="secondary">Nhập lý do từ chối (ghi chú). Trường này là bắt buộc.</Typography.Paragraph>
				<Form form={rejectForm} layout="vertical">
					<Form.Item name="notes" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
						<Input.TextArea rows={4} placeholder="Lý do từ chối…" />
					</Form.Item>
				</Form>
			</Modal>

			<Modal title="Lịch sử thao tác" visible={logOpen} onCancel={() => setLogOpen(false)} footer={null} width={720}>
				<Table
					size="small"
					rowKey="id"
					dataSource={actionLogs}
					pagination={{ pageSize: 8 }}
					columns={[
						{
							title: 'Thời điểm',
							dataIndex: 'at',
							width: 160,
							render: (iso: string) => moment(iso).format('HH:mm DD/MM/YYYY'),
						},
						{ title: 'Nội dung', dataIndex: 'text' },
					]}
				/>
			</Modal>
		</div>
	);
};

export default RegistrationsTab;
