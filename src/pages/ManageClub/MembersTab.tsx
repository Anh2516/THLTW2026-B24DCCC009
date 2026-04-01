import type { Club, Registration } from '@/models/clubStore.types';
import { SwapOutlined } from '@ant-design/icons';
import { Button, Modal, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useModel } from 'umi';

const MembersTab: React.FC = () => {
	const { approvedMembers, clubs, getClubName, bulkTransferMembers } = useModel('quanlyclub');
	const [clubFilter, setClubFilter] = useState<string | undefined>(undefined);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [transferOpen, setTransferOpen] = useState(false);
	const [targetClubId, setTargetClubId] = useState<string | undefined>(undefined);

	const filtered = useMemo(() => {
		if (!clubFilter) return approvedMembers;
		return approvedMembers.filter((m: Registration) => m.clubId === clubFilter);
	}, [approvedMembers, clubFilter]);

	const columns: ColumnsType<Registration> = [
		{ title: 'Họ tên', dataIndex: 'fullName', sorter: (a, b) => a.fullName.localeCompare(b.fullName, 'vi') },
		{ title: 'Email', dataIndex: 'email', ellipsis: true },
		{ title: 'SĐT', dataIndex: 'phone', width: 120 },
		{ title: 'Giới tính', dataIndex: 'gender', width: 90 },
		{ title: 'Địa chỉ', dataIndex: 'address', ellipsis: true },
		{ title: 'Sở trường', dataIndex: 'strengths', ellipsis: true },
		{
			title: 'Câu lạc bộ',
			dataIndex: 'clubId',
			render: (id: string) => getClubName(id),
			sorter: (a, b) => getClubName(a.clubId).localeCompare(getClubName(b.clubId), 'vi'),
		},
	];

	const doTransfer = () => {
		if (!targetClubId) return;
		bulkTransferMembers(selectedRowKeys.map(String), targetClubId);
		setTransferOpen(false);
		setSelectedRowKeys([]);
		setTargetClubId(undefined);
	};

	return (
		<div>
			<Space style={{ marginBottom: 16 }} wrap>
				<span>Lọc theo CLB:</span>
				<Select
					allowClear
					placeholder="Tất cả"
					style={{ minWidth: 220 }}
					value={clubFilter}
					onChange={(v) => setClubFilter(v)}
				>
					{clubs.map((c: Club) => (
						<Select.Option key={c.id} value={c.id}>
							{c.name}
						</Select.Option>
					))}
				</Select>
				<Button type="primary" icon={<SwapOutlined />} disabled={!selectedRowKeys.length} onClick={() => setTransferOpen(true)}>
					Chuyển CLB hàng loạt
				</Button>
			</Space>

			<Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
				Danh sách chỉ gồm thành viên đã được duyệt (trạng thái Đã duyệt).
			</Typography.Paragraph>

			<Table
				rowKey="id"
				rowSelection={{
					selectedRowKeys,
					onChange: (keys) => setSelectedRowKeys(keys),
				}}
				columns={columns}
				dataSource={filtered}
				scroll={{ x: 1000 }}
				pagination={{ pageSize: 10, showSizeChanger: true }}
			/>

			<Modal
				title="Chuyển câu lạc bộ"
				visible={transferOpen}
				onCancel={() => setTransferOpen(false)}
				onOk={doTransfer}
				okText="Xác nhận"
				okButtonProps={{ disabled: !targetClubId }}
			>
				<Typography.Paragraph>
					Bạn đang chuyển <strong>{selectedRowKeys.length}</strong> thành viên sang câu lạc bộ khác.
				</Typography.Paragraph>
				<Select
					placeholder="Chọn CLB đích"
					style={{ width: '100%' }}
					value={targetClubId}
					onChange={setTargetClubId}
				>
					{clubs.map((c: Club) => (
						<Select.Option key={c.id} value={c.id}>
							{c.name}
						</Select.Option>
					))}
				</Select>
			</Modal>
		</div>
	);
};

export default MembersTab;
