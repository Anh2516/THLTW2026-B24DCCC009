import TinyEditor from '@/components/TinyEditor';
import type { Club, Registration } from '@/models/clubStore.types';
import { DeleteOutlined, EditOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { Avatar, Button, DatePicker, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { useModel } from 'umi';

const stripHtml = (html: string) => {
	if (!html) return '';
	const d = document.createElement('div');
	d.innerHTML = html;
	return (d.textContent || '').replace(/\s+/g, ' ').trim();
};

const ClubsTab: React.FC = () => {
	const { clubs, upsertClub, deleteClub, registrations } = useModel('quanlyclub');
	const [search, setSearch] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [membersModal, setMembersModal] = useState<{ clubId: string; clubName: string } | null>(null);
	const [editing, setEditing] = useState<Club | null>(null);
	const [form] = Form.useForm<{
		name: string;
		foundedAt: moment.Moment;
		presidentName: string;
		active: boolean;
		avatarUrl: string;
		descriptionHtml: string;
	}>();

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return clubs;
		return clubs.filter(
			(c: Club) =>
				c.name.toLowerCase().includes(q) ||
				c.presidentName.toLowerCase().includes(q) ||
				stripHtml(c.descriptionHtml).toLowerCase().includes(q),
		);
	}, [clubs, search]);

	const openCreate = () => {
		setEditing(null);
		form.resetFields();
		form.setFieldsValue({
			active: true,
			foundedAt: moment(),
			descriptionHtml: '',
			avatarUrl: '',
			presidentName: '',
			name: '',
		});
		setModalOpen(true);
	};

	const openEdit = (c: Club) => {
		setEditing(c);
		form.setFieldsValue({
			name: c.name,
			foundedAt: moment(c.foundedAt),
			presidentName: c.presidentName,
			active: c.active,
			avatarUrl: c.avatarUrl,
			descriptionHtml: c.descriptionHtml,
		});
		setModalOpen(true);
	};

	const submit = async () => {
		const v = await form.validateFields();
		upsertClub({
			id: editing?.id,
			name: v.name,
			foundedAt: v.foundedAt.format('YYYY-MM-DD'),
			presidentName: v.presidentName,
			active: v.active,
			avatarUrl: v.avatarUrl?.trim() || 'https://api.dicebear.com/7.x/shapes/svg?seed=club',
			descriptionHtml: v.descriptionHtml || '',
		});
		setModalOpen(false);
	};

	const membersOfClub = useMemo(() => {
		if (!membersModal) return [];
		return registrations.filter((r: Registration) => r.clubId === membersModal.clubId && r.status === 'approved');
	}, [membersModal, registrations]);

	const columns: ColumnsType<Club> = [
		{
			title: 'Ảnh đại diện',
			dataIndex: 'avatarUrl',
			width: 88,
			render: (url: string, r) => <Avatar src={url} size={48} alt={r.name} />,
		},
		{
			title: 'Tên CLB',
			dataIndex: 'name',
			sorter: (a, b) => a.name.localeCompare(b.name, 'vi'),
		},
		{
			title: 'Ngày thành lập',
			dataIndex: 'foundedAt',
			width: 130,
			sorter: (a, b) => moment(a.foundedAt).valueOf() - moment(b.foundedAt).valueOf(),
			render: (d: string) => moment(d).format('DD/MM/YYYY'),
		},
		{
			title: 'Mô tả',
			dataIndex: 'descriptionHtml',
			ellipsis: true,
			render: (html: string) => (
				<Typography.Text ellipsis={{ tooltip: stripHtml(html) }} style={{ maxWidth: 280 }}>
					{stripHtml(html) || '—'}
				</Typography.Text>
			),
		},
		{
			title: 'Chủ nhiệm',
			dataIndex: 'presidentName',
			width: 160,
			sorter: (a, b) => a.presidentName.localeCompare(b.presidentName, 'vi'),
		},
		{
			title: 'Hoạt động',
			dataIndex: 'active',
			width: 110,
			align: 'center',
			filters: [
				{ text: 'Có', value: true },
				{ text: 'Không', value: false },
			],
			onFilter: (value, record) => record.active === value,
			render: (active: boolean) => (active ? <Tag color="green">Có</Tag> : <Tag>Không</Tag>),
		},
		{
			title: 'Thao tác',
			key: 'actions',
			width: 220,
			fixed: 'right',
			render: (_, c) => (
				<Space size="small" wrap>
					<Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(c)}>
						Sửa
					</Button>
					<Popconfirm title="Xóa câu lạc bộ này?" onConfirm={() => deleteClub(c.id)} okText="Xóa" cancelText="Hủy">
						<Button type="link" size="small" danger icon={<DeleteOutlined />}>
							Xóa
						</Button>
					</Popconfirm>
					<Button type="link" size="small" icon={<TeamOutlined />} onClick={() => setMembersModal({ clubId: c.id, clubName: c.name })}>
						Thành viên
					</Button>
				</Space>
			),
		},
	];

	return (
		<div>
			<Space style={{ marginBottom: 16 }} wrap>
				<Input.Search allowClear placeholder="Tìm theo tên CLB, chủ nhiệm, mô tả…" onChange={(e) => setSearch(e.target.value)} style={{ width: 320 }} />
				<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
					Thêm CLB
				</Button>
			</Space>

			<Table rowKey="id" columns={columns} dataSource={filtered} scroll={{ x: 960 }} pagination={{ pageSize: 10, showSizeChanger: true }} />

			<Modal title={editing ? 'Chỉnh sửa câu lạc bộ' : 'Thêm câu lạc bộ'} visible={modalOpen} onCancel={() => setModalOpen(false)} onOk={submit} width={720} destroyOnClose>
				<Form form={form} layout="vertical" style={{ marginTop: 8 }}>
					<Form.Item name="name" label="Tên câu lạc bộ" rules={[{ required: true, message: 'Bắt buộc' }]}>
						<Input />
					</Form.Item>
					<Form.Item name="foundedAt" label="Ngày thành lập" rules={[{ required: true, message: 'Bắt buộc' }]}>
						<DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
					</Form.Item>
					<Form.Item name="presidentName" label="Chủ nhiệm CLB" rules={[{ required: true, message: 'Bắt buộc' }]}>
						<Input placeholder="Nhập tên chủ nhiệm" />
					</Form.Item>
					<Form.Item name="avatarUrl" label="URL ảnh đại diện">
						<Input placeholder="https://…" />
					</Form.Item>
					<Form.Item name="active" label="Đang hoạt động" valuePropName="checked">
						<Switch checkedChildren="Có" unCheckedChildren="Không" />
					</Form.Item>
					<Form.Item name="descriptionHtml" label="Mô tả (HTML)">
						<TinyEditor height={280} miniToolbar />
					</Form.Item>
				</Form>
			</Modal>

			<Modal title={`Thành viên — ${membersModal?.clubName ?? ''}`} visible={!!membersModal} onCancel={() => setMembersModal(null)} footer={null} width={640}>
				<Table
					size="small"
					rowKey="id"
					dataSource={membersOfClub}
					pagination={false}
					columns={[
						{ title: 'Họ tên', dataIndex: 'fullName' },
						{ title: 'Email', dataIndex: 'email' },
						{ title: 'SĐT', dataIndex: 'phone', width: 120 },
					]}
				/>
				{membersOfClub.length === 0 ? <Typography.Text type="secondary">Chưa có thành viên đã duyệt.</Typography.Text> : null}
			</Modal>
		</div>
	);
};

export default ClubsTab;
