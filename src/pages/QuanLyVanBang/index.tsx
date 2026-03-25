import type { DiplomaRecord, FieldType, GraduationDecision, RegistryBook, TemplateField } from '@/models/quanlyvanbang';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Statistic, Table, Tabs, Tag, Typography } from 'antd';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { useModel } from 'umi';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

const fieldTypes: FieldType[] = ['String', 'Number', 'Date'];
const toDateString = (value: any): string | undefined => {
	if (!value) return undefined;
	if (typeof value === 'string') return value;
	if (typeof value?.format === 'function') return value.format('YYYY-MM-DD');
	return undefined;
};

const QuanLyVanBangPage: React.FC = () => {
	const {
		registryBooks,
		decisions,
		templateFields,
		diplomas,
		registryBookMap,
		decisionMap,
		upsertRegistryBook,
		deleteRegistryBook,
		upsertDecision,
		deleteDecision,
		upsertTemplateField,
		deleteTemplateField,
		addDiploma,
		updateDiploma,
		deleteDiploma,
		lookupDiplomas,
	} = useModel<any>('quanlyvanbang' as any);

	const [bookModal, setBookModal] = useState<{ open: boolean; edit?: RegistryBook }>({ open: false });
	const [decisionModal, setDecisionModal] = useState<{ open: boolean; edit?: GraduationDecision }>({ open: false });
	const [fieldModal, setFieldModal] = useState<{ open: boolean; edit?: TemplateField }>({ open: false });
	const [diplomaModal, setDiplomaModal] = useState<{ open: boolean; edit?: DiplomaRecord }>({ open: false });
	const [lookupForm] = Form.useForm();
	const [lookupResults, setLookupResults] = useState<DiplomaRecord[]>([]);

	const [bookForm] = Form.useForm();
	const [decisionForm] = Form.useForm();
	const [fieldForm] = Form.useForm();
	const [diplomaForm] = Form.useForm();
	const [activeTab, setActiveTab] = useState('book');

	const stats = useMemo(
		() => ({
			books: registryBooks.length,
			decisions: decisions.length,
			fields: templateFields.length,
			diplomas: diplomas.length,
			totalLookups: decisions.reduce((sum: number, d: GraduationDecision) => sum + d.lookupCount, 0),
		}),
		[registryBooks, decisions, templateFields, diplomas],
	);

	const openBook = (edit?: RegistryBook) => {
		setBookModal({ open: true, edit });
		bookForm.setFieldsValue(edit ? edit : { year: moment().year(), bookName: `Sổ văn bằng ${moment().year()}` });
	};
	const openDecision = (edit?: GraduationDecision) => {
		setDecisionModal({ open: true, edit });
		decisionForm.setFieldsValue(
			edit ? { ...edit, issuedDate: moment(edit.issuedDate, 'YYYY-MM-DD') } : { issuedDate: moment(), registryBookId: registryBooks[0]?.id },
		);
	};
	const openField = (edit?: TemplateField) => {
		setFieldModal({ open: true, edit });
		fieldForm.setFieldsValue(edit ? edit : { type: 'String', required: false });
	};
	const openDiploma = (edit?: DiplomaRecord) => {
		setDiplomaModal({ open: true, edit });
		const mappedExtraValues: Record<string, any> = {};
		if (edit?.extraValues) {
			templateFields.forEach((f: TemplateField) => {
				const raw = edit.extraValues[f.id];
				if (raw === undefined || raw === null || raw === '') return;
				mappedExtraValues[f.id] = f.type === 'Date' ? moment(String(raw), 'YYYY-MM-DD') : raw;
			});
		}
		diplomaForm.setFieldsValue(
			edit
				? {
						...edit,
						dob: moment(edit.dob, 'YYYY-MM-DD'),
						extraValues: mappedExtraValues,
				  }
				: { decisionId: decisions[0]?.id, dob: moment() },
		);
	};

	const submitBook = async () => {
		const v = await bookForm.validateFields();
		upsertRegistryBook({ id: bookModal.edit?.id, year: Number(v.year), bookName: v.bookName.trim() });
		setBookModal({ open: false });
	};
	const submitDecision = async () => {
		const v = await decisionForm.validateFields();
		upsertDecision({
			id: decisionModal.edit?.id,
			decisionNo: v.decisionNo.trim(),
			issuedDate: v.issuedDate.format('YYYY-MM-DD'),
			summary: v.summary.trim(),
			registryBookId: v.registryBookId,
		});
		setDecisionModal({ open: false });
	};
	const submitField = async () => {
		const v = await fieldForm.validateFields();
		upsertTemplateField({ id: fieldModal.edit?.id, name: v.name.trim(), type: v.type, required: !!v.required });
		setFieldModal({ open: false });
	};
	const submitDiploma = async () => {
		const v = await diplomaForm.validateFields();
		const extraValues: Record<string, string | number> = {};
		templateFields.forEach((f: TemplateField) => {
			const value = v.extraValues?.[f.id];
			if (value === undefined || value === null || value === '') return;
			if (f.type === 'Date') {
				const dateStr = toDateString(value);
				if (dateStr) extraValues[f.id] = dateStr;
				return;
			}
			extraValues[f.id] = value;
		});
		const payload = {
			decisionId: v.decisionId,
			diplomaNo: v.diplomaNo.trim(),
			studentId: v.studentId.trim(),
			fullName: v.fullName.trim(),
			dob: toDateString(v.dob) || '',
			extraValues,
		};
		if (diplomaModal.edit) updateDiploma(diplomaModal.edit.id, payload as any);
		else addDiploma(payload);
		setDiplomaModal({ open: false });
	};

	const bookColumns = [
		{ title: 'Năm', dataIndex: 'year', key: 'year', width: 120, sorter: (a: RegistryBook, b: RegistryBook) => a.year - b.year },
		{ title: 'Tên sổ văn bằng', dataIndex: 'bookName', key: 'bookName' },
		{ title: 'Số vào sổ tiếp theo', dataIndex: 'nextEntryNo', key: 'nextEntryNo', width: 180 },
		{
			title: 'Thao tác',
			key: 'action',
			render: (_: any, r: RegistryBook) => (
				<Space>
					<Button size='small' onClick={() => openBook(r)}>
						Sửa
					</Button>
					<Popconfirm title='Xóa sổ văn bằng?' onConfirm={() => deleteRegistryBook(r.id)}>
						<Button size='small' danger>
							Xóa
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	const decisionColumns = [
		{ title: 'Số QĐ', dataIndex: 'decisionNo', key: 'decisionNo', width: 150 },
		{ title: 'Ngày ban hành', dataIndex: 'issuedDate', key: 'issuedDate', width: 140 },
		{ title: 'Trích yếu', dataIndex: 'summary', key: 'summary' },
		{
			title: 'Sổ văn bằng',
			key: 'book',
			render: (_: any, r: GraduationDecision) => registryBookMap.get(r.registryBookId)?.bookName || '-',
		},
		{ title: 'Lượt tra cứu', dataIndex: 'lookupCount', key: 'lookupCount', width: 120 },
		{
			title: 'Thao tác',
			key: 'action',
			render: (_: any, r: GraduationDecision) => (
				<Space>
					<Button size='small' onClick={() => openDecision(r)}>
						Sửa
					</Button>
					<Popconfirm title='Xóa quyết định?' onConfirm={() => deleteDecision(r.id)}>
						<Button size='small' danger>
							Xóa
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	const templateColumns = [
		{ title: 'Tên trường', dataIndex: 'name', key: 'name' },
		{
			title: 'Kiểu dữ liệu',
			dataIndex: 'type',
			key: 'type',
			width: 140,
			render: (v: FieldType) => <Tag color={v === 'String' ? 'blue' : v === 'Number' ? 'purple' : 'orange'}>{v}</Tag>,
		},
		{ title: 'Bắt buộc', dataIndex: 'required', key: 'required', width: 120, render: (v: boolean) => (v ? <Tag color='green'>Có</Tag> : <Tag>Không</Tag>) },
		{
			title: 'Thao tác',
			key: 'action',
			render: (_: any, r: TemplateField) => (
				<Space>
					<Button size='small' onClick={() => openField(r)}>
						Sửa
					</Button>
					<Popconfirm title='Xóa trường?' onConfirm={() => deleteTemplateField(r.id)}>
						<Button size='small' danger>
							Xóa
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	const diplomaColumns = [
		{ title: 'Số vào sổ', dataIndex: 'entryNo', key: 'entryNo', width: 100 },
		{ title: 'Số hiệu văn bằng', dataIndex: 'diplomaNo', key: 'diplomaNo', width: 150 },
		{ title: 'MSV', dataIndex: 'studentId', key: 'studentId', width: 120 },
		{ title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
		{ title: 'Ngày sinh', dataIndex: 'dob', key: 'dob', width: 120 },
		{
			title: 'Quyết định',
			key: 'decision',
			render: (_: any, r: DiplomaRecord) => decisionMap.get(r.decisionId)?.decisionNo || '-',
		},
		{
			title: 'Thao tác',
			key: 'action',
			render: (_: any, r: DiplomaRecord) => (
				<Space>
					<Button size='small' onClick={() => openDiploma(r)}>
						Sửa
					</Button>
					<Popconfirm title='Xóa thông tin văn bằng?' onConfirm={() => deleteDiploma(r.id)}>
						<Button size='small' danger>
							Xóa
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<Card style={{ marginBottom: 12 }}>
				<Title level={4} style={{ marginBottom: 0 }}>
					Quản lý văn bằng tốt nghiệp
				</Title>
				<Text type='secondary'>Quản lý sổ văn bằng, quyết định tốt nghiệp, cấu hình phụ lục và tra cứu thông tin văn bằng.</Text>
				<Row gutter={12} style={{ marginTop: 12 }}>
					<Col xs={12} md={6}>
						<Statistic title='Sổ văn bằng' value={stats.books} />
					</Col>
					<Col xs={12} md={6}>
						<Statistic title='Quyết định' value={stats.decisions} />
					</Col>
					<Col xs={12} md={6}>
						<Statistic title='Văn bằng' value={stats.diplomas} />
					</Col>
					<Col xs={12} md={6}>
						<Statistic title='Lượt tra cứu' value={stats.totalLookups} />
					</Col>
				</Row>
			</Card>
			<Card>
				<Tabs activeKey={activeTab} onChange={setActiveTab}>
					<TabPane tab='1) Sổ văn bằng' key='book'>
						<Button type='primary' onClick={() => openBook()} style={{ marginBottom: 12 }}>
							Thêm sổ văn bằng
						</Button>
						<Table rowKey='id' dataSource={registryBooks} columns={bookColumns as any} bordered pagination={{ pageSize: 6 }} />
					</TabPane>
					<TabPane tab='2) Quyết định tốt nghiệp' key='decision'>
						<Button type='primary' onClick={() => openDecision()} style={{ marginBottom: 12 }}>
							Thêm quyết định
						</Button>
						<Table rowKey='id' dataSource={decisions} columns={decisionColumns as any} bordered pagination={{ pageSize: 6 }} />
					</TabPane>
					<TabPane tab='3) Cấu hình biểu mẫu phụ lục' key='template'>
						<Button type='primary' onClick={() => openField()} style={{ marginBottom: 12 }}>
							Thêm trường thông tin
						</Button>
						<Table rowKey='id' dataSource={templateFields} columns={templateColumns as any} bordered pagination={{ pageSize: 8 }} />
					</TabPane>
					<TabPane tab='4) Thông tin văn bằng' key='diploma'>
						<Button type='primary' onClick={() => openDiploma()} style={{ marginBottom: 12 }}>
							Thêm thông tin văn bằng
						</Button>
						<Table rowKey='id' dataSource={diplomas} columns={diplomaColumns as any} bordered pagination={{ pageSize: 8 }} />
					</TabPane>
					<TabPane tab='5) Tra cứu văn bằng' key='lookup'>
						<Form
							form={lookupForm}
							layout='vertical'
							onFinish={(v) => {
								setLookupResults(
									lookupDiplomas({
										diplomaNo: v.diplomaNo?.trim(),
										entryNo: v.entryNo,
										studentId: v.studentId?.trim(),
										fullName: v.fullName?.trim(),
										dob: v.dob?.format?.('YYYY-MM-DD'),
									}),
								);
							}}
						>
							<Row gutter={12}>
								<Col span={8}>
									<Form.Item name='diplomaNo' label='Số hiệu văn bằng'>
										<Input />
									</Form.Item>
								</Col>
								<Col span={8}>
									<Form.Item name='entryNo' label='Số vào sổ'>
										<InputNumber style={{ width: '100%' }} min={1} />
									</Form.Item>
								</Col>
								<Col span={8}>
									<Form.Item name='studentId' label='MSV'>
										<Input />
									</Form.Item>
								</Col>
								<Col span={8}>
									<Form.Item name='fullName' label='Họ tên'>
										<Input />
									</Form.Item>
								</Col>
								<Col span={8}>
									<Form.Item name='dob' label='Ngày sinh'>
										<DatePicker style={{ width: '100%' }} />
									</Form.Item>
								</Col>
								<Col span={8}>
									<Space style={{ marginTop: 30 }}>
										<Button type='primary' htmlType='submit'>
											Tra cứu
										</Button>
										<Button
											onClick={() => {
												lookupForm.resetFields();
												setLookupResults([]);
											}}
										>
											Xóa lọc
										</Button>
									</Space>
								</Col>
							</Row>
						</Form>
						<Text type='secondary' style={{ display: 'block', marginBottom: 8 }}>
							Lưu ý: Cần nhập ít nhất 2 tham số để tra cứu.
						</Text>
						<Table rowKey='id' dataSource={lookupResults} columns={diplomaColumns as any} bordered pagination={{ pageSize: 8 }} />
					</TabPane>
				</Tabs>
			</Card>

			<Modal visible={bookModal.open} title={bookModal.edit ? 'Sửa sổ văn bằng' : 'Thêm sổ văn bằng'} onCancel={() => setBookModal({ open: false })} onOk={submitBook}>
				<Form form={bookForm} layout='vertical'>
					<Form.Item name='year' label='Năm' rules={[{ required: true, message: 'Nhập năm' }]}>
						<InputNumber min={1990} max={9999} style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='bookName' label='Tên sổ văn bằng' rules={[{ required: true, message: 'Nhập tên sổ' }]}>
						<Input />
					</Form.Item>
				</Form>
			</Modal>

			<Modal visible={decisionModal.open} title={decisionModal.edit ? 'Sửa quyết định' : 'Thêm quyết định'} onCancel={() => setDecisionModal({ open: false })} onOk={submitDecision}>
				<Form form={decisionForm} layout='vertical'>
					<Form.Item name='decisionNo' label='Số quyết định' rules={[{ required: true, message: 'Nhập số quyết định' }]}>
						<Input />
					</Form.Item>
					<Form.Item name='issuedDate' label='Ngày ban hành' rules={[{ required: true, message: 'Chọn ngày ban hành' }]}>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='summary' label='Trích yếu' rules={[{ required: true, message: 'Nhập trích yếu' }]}>
						<Input.TextArea rows={3} />
					</Form.Item>
					<Form.Item name='registryBookId' label='Quản lý trong sổ văn bằng' rules={[{ required: true, message: 'Chọn sổ văn bằng' }]}>
						<Select>
							{registryBooks.map((x: RegistryBook) => (
								<Option key={x.id} value={x.id}>
									{x.bookName}
								</Option>
							))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>

			<Modal visible={fieldModal.open} title={fieldModal.edit ? 'Sửa trường' : 'Thêm trường'} onCancel={() => setFieldModal({ open: false })} onOk={submitField}>
				<Form form={fieldForm} layout='vertical'>
					<Form.Item name='name' label='Tên trường' rules={[{ required: true, message: 'Nhập tên trường' }]}>
						<Input />
					</Form.Item>
					<Form.Item name='type' label='Kiểu dữ liệu' rules={[{ required: true, message: 'Chọn kiểu dữ liệu' }]}>
						<Select>{fieldTypes.map((t) => <Option key={t}>{t}</Option>)}</Select>
					</Form.Item>
					<Form.Item name='required' label='Bắt buộc' rules={[{ required: true, message: 'Chọn bắt buộc/không' }]}>
						<Select>
							<Option value>Có</Option>
							<Option value={false}>Không</Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>

			<Modal visible={diplomaModal.open} title={diplomaModal.edit ? 'Sửa thông tin văn bằng' : 'Thêm thông tin văn bằng'} onCancel={() => setDiplomaModal({ open: false })} onOk={submitDiploma} width={760}>
				<Form form={diplomaForm} layout='vertical'>
					<Row gutter={12}>
						<Col span={12}>
							<Form.Item name='decisionId' label='Quyết định tốt nghiệp' rules={[{ required: true, message: 'Chọn quyết định' }]}>
								<Select>{decisions.map((x: GraduationDecision) => <Option key={x.id} value={x.id}>{x.decisionNo}</Option>)}</Select>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='diplomaNo' label='Số hiệu văn bằng' rules={[{ required: true, message: 'Nhập số hiệu văn bằng' }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item name='studentId' label='MSV' rules={[{ required: true }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item name='fullName' label='Họ tên' rules={[{ required: true, message: 'Nhập họ tên' }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item name='dob' label='Ngày sinh' rules={[{ required: true, message: 'Chọn ngày sinh' }]}>
								<DatePicker style={{ width: '100%' }} />
							</Form.Item>
						</Col>
					</Row>

					<Card size='small' title='Thông tin phụ lục'>
						<Row gutter={12}>
							{templateFields.map((f: TemplateField) => (
								<Col span={12} key={f.id}>
									<Form.Item name={['extraValues', f.id]} label={`${f.name} (${f.type})`} rules={f.required ? [{ required: true }] : undefined}>
										{f.type === 'Number' ? (
											<InputNumber style={{ width: '100%' }} />
										) : f.type === 'Date' ? (
											<DatePicker style={{ width: '100%' }} />
										) : (
											<Input />
										)}
									</Form.Item>
								</Col>
							))}
						</Row>
					</Card>
				</Form>
			</Modal>
		</div>
	);
};

export default QuanLyVanBangPage;
