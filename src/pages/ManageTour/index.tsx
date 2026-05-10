/**
 * Bài tập: app lập kế hoạch du lịch (demo đơn giản — 1 file).
 * Dữ liệu lưu localStorage, không backend.
 */
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
	Alert,
	Button,
	Card,
	Col,
	Form,
	Input,
	InputNumber,
	Modal,
	Progress,
	Rate,
	Row,
	Select,
	Slider,
	Space,
	Table,
	Tabs,
	Typography,
	Upload,
	message,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

type Loai = 'beach' | 'mountain' | 'city';

type DiemDen = {
	id: string;
	ten: string;
	viTri: string;
	anh: string;
	loai: Loai;
	rating: number;
	giaUocTinh: number; // VND / chuyến gợi ý (để lọc)
	moTa: string;
	tgThamQuan: string;
	tienAn: number;
	tienKhachSan: number;
	tienXe: number;
};

const LS = 'du_lich_sv_demo';

const MAC_DINH: DiemDen[] = [
	{
		id: '1',
		ten: 'Phú Quốc',
		viTri: 'Kiên Giang',
		anh: 'https://picsum.photos/seed/pq/400/240',
		loai: 'beach',
		rating: 4.7,
		giaUocTinh: 3000000,
		moTa: 'Biển đẹp, đảo ngọc.',
		tgThamQuan: '2 ngày',
		tienAn: 700000,
		tienKhachSan: 1200000,
		tienXe: 800000,
	},
	{
		id: '2',
		ten: 'Sa Pa',
		viTri: 'Lào Cai',
		anh: 'https://picsum.photos/seed/sp/400/240',
		loai: 'mountain',
		rating: 4.6,
		giaUocTinh: 2500000,
		moTa: 'Núi non, ruộng bậc thang.',
		tgThamQuan: '2 ngày',
		tienAn: 500000,
		tienKhachSan: 900000,
		tienXe: 700000,
	},
	{
		id: '3',
		ten: 'Đà Lạt',
		viTri: 'Lâm Đồng',
		anh: 'https://picsum.photos/seed/dl/400/240',
		loai: 'mountain',
		rating: 4.5,
		giaUocTinh: 2200000,
		moTa: 'Khí hậu mát, thành phố hoa.',
		tgThamQuan: '2 ngày',
		tienAn: 500000,
		tienKhachSan: 800000,
		tienXe: 600000,
	},
	{
		id: '4',
		ten: 'Hà Nội',
		viTri: 'Miền Bắc',
		anh: 'https://picsum.photos/seed/hn/400/240',
		loai: 'city',
		rating: 4.4,
		giaUocTinh: 2000000,
		moTa: 'Phố cổ, văn hoá.',
		tgThamQuan: '3 ngày',
		tienAn: 600000,
		tienKhachSan: 1000000,
		tienXe: 300000,
	},
];

/** Mỗi ngày có uid; mỗi điểm ghép có key riêng (kéo/xóa ổn định). */
type MotNgay = { uid: string; hang: { key: string; id: string }[] };

type Luu = { ds: DiemDen[]; ngay: MotNgay[]; nganSachToiDa: number };

function chuanNgay(raw: unknown): MotNgay[] {
	if (!Array.isArray(raw) || raw.length === 0) {
		return [{ uid: 'ngay-1', hang: [] }];
	}
	const row0 = raw[0] as unknown;
	if (typeof row0 === 'string') {
		const ids = [...(raw as string[])];
		return [{ uid: 'ngay-1', hang: ids.map((id, j) => ({ key: `0-${j}-${id}`, id })) }];
	}
	return (raw as Record<string, unknown>[]).map((row, idx) => {
		if ((row as MotNgay).hang && Array.isArray((row as MotNgay).hang)) {
			const r = row as MotNgay;
			return { uid: r.uid || `ngay-${idx}`, hang: r.hang.map((x) => ({ ...x })) };
		}
		if ((row as MotNgay).ids && Array.isArray((row as MotNgay).ids)) {
			const r = row as unknown as { uid?: string; ids: string[] };
			return {
				uid: r.uid || `ngay-${idx}`,
				hang: r.ids.map((id, j) => ({ key: `${idx}-${j}-${id}`, id })),
			};
		}
		const ids = [...(row as unknown as string[])];
		return {
			uid: `ngay-${idx}`,
			hang: ids.map((id, j) => ({ key: `${idx}-${j}-${id}`, id })),
		};
	});
}

function docDL(): Luu {
	try {
		const s = localStorage.getItem(LS);
		if (!s) {
			return { ds: MAC_DINH, ngay: [{ uid: 'ngay-1', hang: [] }], nganSachToiDa: 5000000 };
		}
		const o = JSON.parse(s);
		return {
			ds: o.ds?.length ? o.ds : MAC_DINH,
			ngay: chuanNgay(o.ngay),
			nganSachToiDa: typeof o.nganSachToiDa === 'number' ? o.nganSachToiDa : 5000000,
		};
	} catch {
		return { ds: MAC_DINH, ngay: [{ uid: 'ngay-1', hang: [] }], nganSachToiDa: 5000000 };
	}
}

export default function ManageTour() {
	const [ds, setDs] = useState<DiemDen[]>(() => docDL().ds);
	const [ngay, setNgay] = useState<MotNgay[]>(() => docDL().ngay);
	const [nganSachToiDa, setNganSachToiDa] = useState(() => docDL().nganSachToiDa);

	const [locLoai, setLocLoai] = useState<Loai | 'tat_ca'>('tat_ca');
	const [giaMax, setGiaMax] = useState(5000000);
	const [ratingMin, setRatingMin] = useState(4);

	const [modal, setModal] = useState(false);
	const [sua, setSua] = useState<DiemDen | null>(null);
	const [form] = Form.useForm();

	useEffect(() => {
		if (!ds.length) {
			return;
		}
		localStorage.setItem(LS, JSON.stringify({ ds, ngay, nganSachToiDa }));
	}, [ds, ngay, nganSachToiDa]);

	const mapId = useMemo(() => {
		const m: Record<string, DiemDen> = {};
		ds.forEach((d) => {
			m[d.id] = d;
		});
		return m;
	}, [ds]);

	const dsLoc = useMemo(() => {
		return ds.filter((d) => {
			if (locLoai !== 'tat_ca' && d.loai !== locLoai) {
				return false;
			}
			if (d.giaUocTinh > giaMax) {
				return false;
			}
			if (d.rating < ratingMin) {
				return false;
			}
			return true;
		});
	}, [ds, locLoai, giaMax, ratingMin]);

	const popular = useMemo(() => {
		const dem: Record<string, number> = {};
		ngay.forEach((n) => {
			n.hang.forEach(({ id }) => {
				dem[id] = (dem[id] || 0) + 1;
			});
		});
		return Object.entries(dem)
			.sort((x, y) => y[1] - x[1])
			.slice(0, 5)
			.map(([id, n]) => ({ ten: mapId[id]?.ten ?? id, n }));
	}, [ngay, mapId]);

	let tongChi = 0;
	let tongAn = 0;
	let tongKhach = 0;
	let tongXe = 0;
	ngay.forEach((n) => {
		n.hang.forEach(({ id }) => {
			const d = mapId[id];
			if (d) {
				tongChi += d.tienAn + d.tienKhachSan + d.tienXe;
				tongAn += d.tienAn;
				tongKhach += d.tienKhachSan;
				tongXe += d.tienXe;
			}
		});
	});

	let gioDiChuyen = 0;
	let truoc: string | null = null;
	ngay.forEach((n) => {
		n.hang.forEach(({ id }) => {
			if (truoc && truoc !== id) {
				gioDiChuyen += 1 + ((truoc + id).length % 5);
			}
			truoc = id;
		});
	});

	const vuotNS = tongChi > nganSachToiDa;

	const themNgay = () => setNgay([...ngay, { uid: `ngay-${Date.now()}`, hang: [] }]);

	const xoaNgay = (uid: string) => {
		if (ngay.length <= 1) {
			message.warning('Giữ ít nhất 1 ngày');
			return;
		}
		setNgay(ngay.filter((n) => n.uid !== uid));
	};

	const themVaoNgay = (uid: string, idDiem: string) => {
		if (!idDiem) {
			return;
		}
		const hangThem = { key: `k-${Date.now()}`, id: idDiem };
		setNgay(ngay.map((n) => (n.uid === uid ? { ...n, hang: [...n.hang, hangThem] } : { ...n, hang: [...n.hang] })));
	};

	const xoaKhoiNgay = (uid: string, viTri: number) => {
		setNgay(
			ngay.map((n) => {
				if (n.uid !== uid) {
					return { ...n, hang: [...n.hang] };
				}
				const b = [...n.hang];
				b.splice(viTri, 1);
				return { ...n, hang: b };
			}),
		);
	};

	const moThem = () => {
		setSua(null);
		form.resetFields();
		form.setFieldsValue({
			loai: 'city',
			rating: 4.5,
			giaUocTinh: 2000000,
			tienAn: 500000,
			tienKhachSan: 800000,
			tienXe: 400000,
			anh: 'https://picsum.photos/seed/new/400/240',
		});
		setModal(true);
	};

	const moSua = (r: DiemDen) => {
		setSua(r);
		form.setFieldsValue(r);
		setModal(true);
	};

	const luuForm = async () => {
		const v = await form.validateFields();
		if (sua) {
			setDs(ds.map((x) => (x.id === sua.id ? { ...sua, ...v } : x)));
			message.success('Đã sửa');
		} else {
			const id = String(Date.now());
			setDs([...ds, { ...v, id }]);
			message.success('Đã thêm');
		}
		setModal(false);
	};

	const xoaDiem = (id: string) => {
		Modal.confirm({
			title: 'Xóa điểm này?',
			onOk: () => {
				setDs(ds.filter((x) => x.id !== id));
				setNgay(ngay.map((n) => ({ ...n, hang: n.hang.filter((x) => x.id !== id) })));
			},
		});
	};

	const tongDemDiem = ngay.reduce((s, n) => s + n.hang.length, 0);

	return (
		<div style={{ padding: 8 }}>
			<Typography.Title level={3}>Lập kế hoạch du lịch</Typography.Title>

			<Tabs type='card'>
				<Tabs.TabPane tab='Khám phá' key='1'>
					<Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
						<Col xs={24} md={8}>
							Loại:{' '}
							<Select
								style={{ width: '100%', marginTop: 8 }}
								value={locLoai}
								onChange={setLocLoai}
								options={[
									{ value: 'tat_ca', label: 'Tất cả' },
									{ value: 'beach', label: 'Biển' },
									{ value: 'mountain', label: 'Núi' },
									{ value: 'city', label: 'Thành phố' },
								]}
							/>
						</Col>
						<Col xs={24} md={8}>
							Giá tối đa (triệu):{' '}
							<Slider min={1} max={8} value={giaMax / 1000000} onChange={(x) => setGiaMax(x * 1000000)} />
						</Col>
						<Col xs={24} md={8}>
							Rating tối thiểu: <Slider min={3} max={5} step={0.1} value={ratingMin} onChange={setRatingMin} />
						</Col>
					</Row>
					<Row gutter={[12, 12]}>
						{dsLoc.map((d) => (
							<Col xs={24} sm={12} lg={8} key={d.id}>
								<Card hoverable cover={<img alt='' src={d.anh} style={{ height: 160, objectFit: 'cover' }} />}>
									<Card.Meta
										title={d.ten}
										description={
											<>
												<div>{d.viTri}</div>
												<Rate disabled value={d.rating} style={{ fontSize: 14 }} />
												<div>{d.moTa}</div>
												<Typography.Text strong>~ {(d.giaUocTinh / 1000000).toFixed(1)} triệu</Typography.Text>
											</>
										}
									/>
								</Card>
							</Col>
						))}
					</Row>
				</Tabs.TabPane>

				<Tabs.TabPane tab='Lịch trình' key='2'>
					<Space wrap style={{ marginBottom: 12 }}>
						<Typography.Text>Tổng chi (ước tính): {tongChi.toLocaleString('vi-VN')} ₫</Typography.Text>
						<Typography.Text>|</Typography.Text>
						<Typography.Text>Tổng giờ đi giữa các điểm (mock): ~{gioDiChuyen}h</Typography.Text>
					</Space>
					<Button type='dashed' icon={<PlusOutlined />} onClick={themNgay}>
						Thêm ngày
					</Button>
					{ngay.map((n, i) => (
						<Card
							key={n.uid}
							title={`Ngày ${i + 1}`}
							style={{ marginTop: 12 }}
							extra={
								<Button danger size='small' onClick={() => xoaNgay(n.uid)}>
									Xóa ngày
								</Button>
							}
						>
							<Space wrap>
								<Select
									key={`pick-${n.uid}-${n.hang.map((h) => h.key).join(',')}`}
									placeholder='Chọn điểm thêm vào ngày'
									style={{ minWidth: 200 }}
									options={ds.map((d) => ({ value: d.id, label: d.ten }))}
									onChange={(idDiem) => themVaoNgay(n.uid, idDiem)}
								/>
							</Space>
							<ul style={{ marginTop: 8 }}>
								{n.hang.map((slot, j) => (
									<li key={slot.key}>
										{mapId[slot.id]?.ten ?? slot.id}{' '}
										<Button
											type='link'
											size='small'
											danger
											icon={<DeleteOutlined />}
											onClick={() => xoaKhoiNgay(n.uid, j)}
										/>
									</li>
								))}
							</ul>
						</Card>
					))}
				</Tabs.TabPane>

				<Tabs.TabPane tab='Ngân sách' key='3'>
					<Typography.Paragraph>
						Ngân sách tối đa:{' '}
						<InputNumber
							min={0}
							step={100000}
							value={nganSachToiDa}
							onChange={(v) => setNganSachToiDa(Number(v) || 0)}
							formatter={(x) => `${x}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
						/>{' '}
						₫
					</Typography.Paragraph>
					{vuotNS ? (
						<Alert type='error' message='Vượt ngân sách!' showIcon />
					) : (
						<Alert type='info' message='Chưa vượt ngân sách' showIcon />
					)}
					<Typography.Title level={5} style={{ marginTop: 16 }}>
						Chia tiền (theo chuyến hiện tại)
					</Typography.Title>
					{tongChi === 0 ? (
						<Typography.Text type='secondary'>Chưa chọn điểm trong lịch trình</Typography.Text>
					) : (
						<>
							<div>Ăn uống: {tongAn.toLocaleString('vi-VN')} ₫</div>
							<Progress percent={Math.round((tongAn / tongChi) * 100)} />
							<div>Lưu trú: {tongKhach.toLocaleString('vi-VN')} ₫</div>
							<Progress percent={Math.round((tongKhach / tongChi) * 100)} strokeColor='#722ed1' />
							<div>Đi lại: {tongXe.toLocaleString('vi-VN')} ₫</div>
							<Progress percent={Math.round((tongXe / tongChi) * 100)} strokeColor='#52c41a' />
						</>
					)}
				</Tabs.TabPane>

				<Tabs.TabPane tab='Quản trị' key='4'>
					<Button type='primary' icon={<PlusOutlined />} onClick={moThem}>
						Thêm điểm đến
					</Button>
					<Table
						style={{ marginTop: 12 }}
						rowKey='id'
						pagination={{ pageSize: 5 }}
						dataSource={ds}
						scroll={{ x: 720 }}
						columns={[
							{
								title: 'Ảnh',
								dataIndex: 'anh',
								width: 80,
								render: (u: string) => <img alt='' src={u} width={60} height={40} style={{ objectFit: 'cover' }} />,
							},
							{ title: 'Tên', dataIndex: 'ten' },
							{ title: 'Vị trí', dataIndex: 'viTri' },
							{
								title: 'Rating',
								dataIndex: 'rating',
								render: (r: number) => <Rate disabled value={r} style={{ fontSize: 14 }} />,
							},
							{
								title: '',
								render: (_, r: DiemDen) => (
									<Space>
										<Button size='small' onClick={() => moSua(r)}>
											Sửa
										</Button>
										<Button size='small' danger onClick={() => xoaDiem(r.id)}>
											Xóa
										</Button>
									</Space>
								),
							},
						]}
					/>
					<Typography.Title level={5} style={{ marginTop: 24 }}>
						Thống kê nhanh (theo lịch đang ghép)
					</Typography.Title>
					<Typography.Paragraph>
						Số lần ghép điểm vào lịch: <b>{tongDemDiem}</b>
					</Typography.Paragraph>
					<Typography.Paragraph>Điểm hay chọn:</Typography.Paragraph>
					<Table
						size='small'
						pagination={false}
						rowKey='ten'
						dataSource={popular.length ? popular : [{ ten: '(chưa có)', n: 0 }]}
						columns={[
							{ title: 'Điểm', dataIndex: 'ten' },
							{ title: 'Số lần', dataIndex: 'n' },
						]}
					/>
					<Typography.Paragraph style={{ marginTop: 12 }}>
						Tổng chi ước tính (giống tab Lịch trình): <b>{tongChi.toLocaleString('vi-VN')} ₫</b>
					</Typography.Paragraph>
				</Tabs.TabPane>
			</Tabs>

			<Modal
				title={sua ? 'Sửa điểm' : 'Thêm điểm'}
				visible={modal}
				onCancel={() => setModal(false)}
				onOk={luuForm}
				width={560}
			>
				<Form form={form} layout='vertical'>
					<Form.Item name='ten' label='Tên' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='viTri' label='Vị trí' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='anh' label='Link ảnh'>
						<Input placeholder='https://...' />
					</Form.Item>
					<Form.Item label='Hoặc upload (base64)'>
						<Upload
							beforeUpload={(file) => {
								const rd = new FileReader();
								rd.onload = () => form.setFieldsValue({ anh: rd.result });
								rd.readAsDataURL(file);
								return false;
							}}
							showUploadList={false}
						>
							<Button>Chọn ảnh</Button>
						</Upload>
					</Form.Item>
					<Form.Item name='loai' label='Loại' rules={[{ required: true }]}>
						<Select
							options={[
								{ value: 'beach', label: 'Biển' },
								{ value: 'mountain', label: 'Núi' },
								{ value: 'city', label: 'Thành phố' },
							]}
						/>
					</Form.Item>
					<Form.Item name='rating' label='Rating'>
						<Rate allowHalf />
					</Form.Item>
					<Form.Item name='giaUocTinh' label='Giá ước tính (VND)'>
						<InputNumber style={{ width: '100%' }} min={0} />
					</Form.Item>
					<Form.Item name='moTa' label='Mô tả'>
						<Input.TextArea rows={2} />
					</Form.Item>
					<Form.Item name='tgThamQuan' label='Thời gian tham quan'>
						<Input />
					</Form.Item>
					<Form.Item name='tienAn' label='Tiền ăn (VND)'>
						<InputNumber style={{ width: '100%' }} min={0} />
					</Form.Item>
					<Form.Item name='tienKhachSan' label='Tiền khách sạn (VND)'>
						<InputNumber style={{ width: '100%' }} min={0} />
					</Form.Item>
					<Form.Item name='tienXe' label='Tiền xe/di chuyển (VND)'>
						<InputNumber style={{ width: '100%' }} min={0} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
