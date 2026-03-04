import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Tabs, Popconfirm, message, Row, Col, Space, Typography, Tag, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined, TrophyOutlined, UnorderedListOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const KHOA_LUU_TRU = {
  DANH_SACH_MON_HOC: 'bai2_categories',
  DANH_SACH_BUOI_HOC: 'bai2_studyRecords',
  DANH_SACH_MUC_TIEU: 'bai2_monthlyGoals',
} as const;

type LoaiMucTieu = 'subject' | 'total';

interface MonHoc {
  id: number;
  tenMon: string;
}

interface BuoiHoc {
  id: number;
  monHocId: number;
  tenMonChiTiet: string;
  thoiGianHocISO: string; // ISO string
  thoiLuongHocPhut: number;
  noiDungDaHoc?: string;
  ghiChuThem?: string;
}

interface MucTieuThang {
  id: number;
  thang: number;
  nam: number;
  loaiMucTieu: LoaiMucTieu;
  monHocId?: number;
  soPhutMucTieu: number;
}

// const DANH_SACH_MON_HOC_MAC_DINH: MonHoc[] = [
//   { id: 1, tenMon: 'Toán' },
//   { id: 2, tenMon: 'Văn' },
//   { id: 3, tenMon: 'Anh' },
//   { id: 4, tenMon: 'Khoa học' },
//   { id: 5, tenMon: 'Công nghệ' },
// ];

function taiTuLocalStorage<T>(khoa: string, giaTriMacDinh: T): T {
  try {
    const chuoi = localStorage.getItem(khoa);
    return chuoi ? (JSON.parse(chuoi) as T) : giaTriMacDinh;
  } catch {
    return giaTriMacDinh;
  }
}

function luuVaoLocalStorage(khoa: string, duLieu: unknown) {
  localStorage.setItem(khoa, JSON.stringify(duLieu));
}

const layIdMoi = (danhSach: { id: number }[]) =>
  danhSach.length ? Math.max(...danhSach.map((i) => i.id)) + 1 : 1;

const layTenMonHocTheoId = (danhSachMonHoc: MonHoc[], id?: number) =>
  danhSachMonHoc.find((m) => m.id === id)?.tenMon || '—';

const tinhTongSoPhutHocTrongThang = (
  danhSachBuoiHoc: BuoiHoc[],
  thang: number,
  nam: number,
  monHocId?: number,
) =>
  danhSachBuoiHoc
    .filter((buoi) => {
      const thoiGian = new Date(buoi.thoiGianHocISO);
      if (thoiGian.getMonth() + 1 !== thang || thoiGian.getFullYear() !== nam) return false;
      if (monHocId != null) return buoi.monHocId === monHocId;
      return true;
    })
    .reduce((tong, buoi) => tong + (buoi.thoiLuongHocPhut || 0), 0);

const daDatMucTieuThang = (danhSachBuoiHoc: BuoiHoc[], mucTieu: MucTieuThang) => {
  const tongPhutDaHoc =
    mucTieu.loaiMucTieu === 'total'
      ? tinhTongSoPhutHocTrongThang(danhSachBuoiHoc, mucTieu.thang, mucTieu.nam)
      : tinhTongSoPhutHocTrongThang(
          danhSachBuoiHoc,
          mucTieu.thang,
          mucTieu.nam,
          mucTieu.monHocId,
        );

  return tongPhutDaHoc >= mucTieu.soPhutMucTieu;
};

const cotSTT = {
  title: 'STT',
  key: 'index',
  width: 70,
  align: 'center' as const,
  render: (_: unknown, __: unknown, index: number) => index + 1,
};

const Bai2: React.FC = () => {
  // ----------- State chính -----------
  const [danhSachMonHoc, setDanhSachMonHoc] = useState<MonHoc[]>(() =>
    taiTuLocalStorage(KHOA_LUU_TRU.DANH_SACH_MON_HOC, []),
  );
  const [danhSachBuoiHoc, setDanhSachBuoiHoc] = useState<BuoiHoc[]>(() =>
    taiTuLocalStorage(KHOA_LUU_TRU.DANH_SACH_BUOI_HOC, []),
  );
  const [danhSachMucTieuThang, setDanhSachMucTieuThang] = useState<MucTieuThang[]>(() =>
    taiTuLocalStorage(KHOA_LUU_TRU.DANH_SACH_MUC_TIEU, []),
  );

  // Đồng bộ dữ liệu với localStorage
  useEffect(
    () => luuVaoLocalStorage(KHOA_LUU_TRU.DANH_SACH_MON_HOC, danhSachMonHoc),
    [danhSachMonHoc],
  );
  useEffect(
    () => luuVaoLocalStorage(KHOA_LUU_TRU.DANH_SACH_BUOI_HOC, danhSachBuoiHoc),
    [danhSachBuoiHoc],
  );
  useEffect(
    () => luuVaoLocalStorage(KHOA_LUU_TRU.DANH_SACH_MUC_TIEU, danhSachMucTieuThang),
    [danhSachMucTieuThang],
  );

  // ----------- Quản lý danh mục môn học -----------
  const [moModalMonHoc, setMoModalMonHoc] = useState(false);
  const [idMonHocDangSua, setIdMonHocDangSua] = useState<number | null>(null);
  const [formMonHoc] = Form.useForm();

  const moFormMonHoc = (monHoc?: MonHoc) => {
    setIdMonHocDangSua(monHoc?.id ?? null);
    formMonHoc.setFieldsValue({ tenMon: monHoc?.tenMon || '' });
    setMoModalMonHoc(true);
  };

  const dongFormMonHoc = () => {
    setMoModalMonHoc(false);
    setIdMonHocDangSua(null);
    formMonHoc.resetFields();
  };

  const luuMonHoc = async () => {
    const { tenMon } = await formMonHoc.validateFields();
    const tenDaCat = (tenMon as string).trim();

    setDanhSachMonHoc((dsCu) =>
      idMonHocDangSua
        ? dsCu.map((m) => (m.id === idMonHocDangSua ? { ...m, tenMon: tenDaCat } : m))
        : [...dsCu, { id: layIdMoi(dsCu), tenMon: tenDaCat }],
    );

    message.success(
      idMonHocDangSua ? 'Đã cập nhật tên môn học.' : 'Đã thêm môn học mới vào danh sách.',
    );
    dongFormMonHoc();
  };

  const xoaMonHoc = (idMonHoc: number) => {
    setDanhSachMonHoc((dsCu) => dsCu.filter((m) => m.id !== idMonHoc));
    setDanhSachBuoiHoc((dsCu) => dsCu.filter((b) => b.monHocId !== idMonHoc));
    setDanhSachMucTieuThang((dsCu) => dsCu.filter((m) => m.monHocId !== idMonHoc));
    message.success('Đã xóa môn học cùng các dữ liệu liên quan.');
  };

  // ----------- Quản lý buổi học -----------
  const [moModalBuoiHoc, setMoModalBuoiHoc] = useState(false);
  const [idBuoiHocDangSua, setIdBuoiHocDangSua] = useState<number | null>(null);
  const [formBuoiHoc] = Form.useForm();

  const moFormBuoiHoc = (buoi?: BuoiHoc) => {
    setIdBuoiHocDangSua(buoi?.id ?? null);
    formBuoiHoc.setFieldsValue(
      buoi
        ? {
            monHocId: buoi.monHocId,
            tenMonChiTiet: buoi.tenMonChiTiet,
            thoiGianHoc: moment(buoi.thoiGianHocISO),
            thoiLuongHocPhut: buoi.thoiLuongHocPhut,
            noiDungDaHoc: buoi.noiDungDaHoc,
            ghiChuThem: buoi.ghiChuThem,
          }
        : { thoiLuongHocPhut: 60 },
    );
    setMoModalBuoiHoc(true);
  };

  const dongFormBuoiHoc = () => {
    setMoModalBuoiHoc(false);
    setIdBuoiHocDangSua(null);
    formBuoiHoc.resetFields();
  };

  const luuBuoiHoc = async () => {
    const giaTri = await formBuoiHoc.validateFields();

    const duLieuMoi: Omit<BuoiHoc, 'id'> = {
      monHocId: giaTri.monHocId,
      tenMonChiTiet: giaTri.tenMonChiTiet.trim(),
      thoiGianHocISO: (giaTri.thoiGianHoc as moment.Moment).toISOString(),
      thoiLuongHocPhut: Number(giaTri.thoiLuongHocPhut) || 0,
      noiDungDaHoc: giaTri.noiDungDaHoc?.trim(),
      ghiChuThem: giaTri.ghiChuThem?.trim(),
    };

    setDanhSachBuoiHoc((dsCu) =>
      idBuoiHocDangSua
        ? dsCu.map((b) => (b.id === idBuoiHocDangSua ? { ...b, ...duLieuMoi } : b))
        : [...dsCu, { id: layIdMoi(dsCu), ...duLieuMoi }],
    );

    message.success(
      idBuoiHocDangSua ? 'Đã cập nhật thông tin buổi học.' : 'Đã thêm buổi học mới.',
    );
    dongFormBuoiHoc();
  };

  const xoaBuoiHoc = (idBuoiHoc: number) => {
    setDanhSachBuoiHoc((dsCu) => dsCu.filter((b) => b.id !== idBuoiHoc));
    message.success('Đã xóa buổi học.');
  };

  // ----------- Quản lý mục tiêu tháng -----------
  const [moModalMucTieu, setMoModalMucTieu] = useState(false);
  const [idMucTieuDangSua, setIdMucTieuDangSua] = useState<number | null>(null);
  const [formMucTieu] = Form.useForm();

  const moFormMucTieu = (mucTieu?: MucTieuThang) => {
    setIdMucTieuDangSua(mucTieu?.id ?? null);
    formMucTieu.setFieldsValue(
      mucTieu
        ? {
            thangNam: moment({ year: mucTieu.nam, month: mucTieu.thang - 1 }),
            loaiMucTieu: mucTieu.loaiMucTieu,
            monHocId: mucTieu.monHocId,
            soPhutMucTieu: mucTieu.soPhutMucTieu,
          }
        : { thangNam: moment(), loaiMucTieu: 'total' as LoaiMucTieu },
    );
    setMoModalMucTieu(true);
  };

  const dongFormMucTieu = () => {
    setMoModalMucTieu(false);
    setIdMucTieuDangSua(null);
    formMucTieu.resetFields();
  };

  const luuMucTieu = async () => {
    const giaTri = await formMucTieu.validateFields();
    const thangNam = giaTri.thangNam as moment.Moment;

    const mucTieuMoi: Omit<MucTieuThang, 'id'> = {
      thang: thangNam.month() + 1,
      nam: thangNam.year(),
      loaiMucTieu: giaTri.loaiMucTieu,
      monHocId: giaTri.loaiMucTieu === 'subject' ? giaTri.monHocId : undefined,
      soPhutMucTieu: Number(giaTri.soPhutMucTieu) || 0,
    };

    setDanhSachMucTieuThang((dsCu) =>
      idMucTieuDangSua
        ? dsCu.map((m) => (m.id === idMucTieuDangSua ? { ...m, ...mucTieuMoi } : m))
        : [...dsCu, { id: layIdMoi(dsCu), ...mucTieuMoi }],
    );

    message.success(
      idMucTieuDangSua ? 'Đã cập nhật mục tiêu tháng.' : 'Đã thêm mục tiêu học tập mới.',
    );
    dongFormMucTieu();
  };

  const xoaMucTieu = (idMucTieu: number) => {
    setDanhSachMucTieuThang((dsCu) => dsCu.filter((m) => m.id !== idMucTieu));
    message.success('Đã xóa mục tiêu học tập.');
  };

  // ----------- Cấu hình bảng -----------
  const cotMonHoc = [
    cotSTT,
    { title: 'Tên môn học', dataIndex: 'tenMon', key: 'tenMon' },
    {
      title: 'Thao tác',
      key: 'thaoTac',
      width: 180,
      render: (_: unknown, monHoc: MonHoc) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => moFormMonHoc(monHoc)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa môn học này? Các buổi học và mục tiêu liên quan cũng sẽ bị xóa."
            onConfirm={() => xoaMonHoc(monHoc.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const cotBuoiHoc = [
    cotSTT,
    { title: 'Tên môn / chủ đề', dataIndex: 'tenMonChiTiet', key: 'tenMonChiTiet' },
    {
      title: 'Danh mục môn',
      key: 'monHoc',
      render: (_: unknown, buoi: BuoiHoc) => layTenMonHocTheoId(danhSachMonHoc, buoi.monHocId),
    },
    {
      title: 'Thời gian học',
      dataIndex: 'thoiGianHocISO',
      key: 'thoiGianHocISO',
      render: (giaTri: string) => (giaTri ? moment(giaTri).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'thoiLuongHocPhut',
      key: 'thoiLuongHocPhut',
      align: 'right' as const,
      width: 120,
    },
    {
      title: 'Nội dung đã học',
      dataIndex: 'noiDungDaHoc',
      key: 'noiDungDaHoc',
      ellipsis: true,
    },
    {
      title: 'Ghi chú thêm',
      dataIndex: 'ghiChuThem',
      key: 'ghiChuThem',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'thaoTac',
      width: 160,
      render: (_: unknown, buoi: BuoiHoc) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => moFormBuoiHoc(buoi)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa buổi học này?"
            onConfirm={() => xoaBuoiHoc(buoi.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const cotMucTieuThang = [
    cotSTT,
    {
      title: 'Tháng / Năm',
      key: 'thangNam',
      render: (_: unknown, mucTieu: MucTieuThang) => `${mucTieu.thang}/${mucTieu.nam}`,
    },
    {
      title: 'Loại mục tiêu',
      key: 'loaiMucTieu',
      render: (_: unknown, mucTieu: MucTieuThang) =>
        mucTieu.loaiMucTieu === 'total' ? 'Tổng thời lượng (tất cả môn)' : 'Theo từng môn',
    },
    {
      title: 'Môn áp dụng (nếu có)',
      key: 'monHoc',
      render: (_: unknown, mucTieu: MucTieuThang) =>
        layTenMonHocTheoId(danhSachMonHoc, mucTieu.monHocId),
    },
    {
      title: 'Mục tiêu (phút)',
      dataIndex: 'soPhutMucTieu',
      key: 'soPhutMucTieu',
      align: 'right' as const,
      width: 120,
    },
    {
      title: 'Đã học (phút)',
      key: 'soPhutDaHoc',
      align: 'right' as const,
      width: 120,
      render: (_: unknown, mucTieu: MucTieuThang) =>
        mucTieu.loaiMucTieu === 'total'
          ? tinhTongSoPhutHocTrongThang(danhSachBuoiHoc, mucTieu.thang, mucTieu.nam)
          : tinhTongSoPhutHocTrongThang(
              danhSachBuoiHoc,
              mucTieu.thang,
              mucTieu.nam,
              mucTieu.monHocId,
            ),
    },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      width: 140,
      render: (_: unknown, mucTieu: MucTieuThang) =>
        daDatMucTieuThang(danhSachBuoiHoc, mucTieu) ? (
          <Tag color="green">Đã đạt mục tiêu</Tag>
        ) : (
          <Tag color="orange">Chưa đạt</Tag>
        ),
    },
    {
      title: 'Thao tác',
      key: 'thaoTac',
      width: 160,
      render: (_: unknown, mucTieu: MucTieuThang) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => moFormMucTieu(mucTieu)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa mục tiêu này?"
            onConfirm={() => xoaMucTieu(mucTieu.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Bài 2: Theo dõi tiến độ và mục tiêu học tập
        </Title>

        <Tabs defaultActiveKey="1">
          <TabPane
            key="1"
            tab={
              <span>
                <UnorderedListOutlined /> Danh mục môn học
              </span>
            }
          >
            <Row justify="end" style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => moFormMonHoc()}>
                Thêm môn học
              </Button>
            </Row>
            <Table
              columns={cotMonHoc}
              dataSource={danhSachMonHoc}
              rowKey="id"
              pagination={false}
              bordered
            />
          </TabPane>

          <TabPane
            key="2"
            tab={
              <span>
                <BookOutlined /> Các buổi học đã thực hiện
              </span>
            }
          >
            <Row justify="end" style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => moFormBuoiHoc()}>
                Thêm buổi học
              </Button>
            </Row>
            <Table
              columns={cotBuoiHoc}
              dataSource={danhSachBuoiHoc}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              bordered
            />
          </TabPane>

          <TabPane
            key="3"
            tab={
              <span>
                <TrophyOutlined /> Mục tiêu học tập theo tháng
              </span>
            }
          >
            <Row justify="end" style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => moFormMucTieu()}>
                Thêm mục tiêu tháng
              </Button>
            </Row>
            <Table
              columns={cotMucTieuThang}
              dataSource={danhSachMucTieuThang}
              rowKey="id"
              pagination={false}
              bordered
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal thêm / sửa môn học */}
      <Modal
        title={idMonHocDangSua ? 'Cập nhật môn học' : 'Thêm môn học mới'}
        visible={moModalMonHoc}
        onOk={luuMonHoc}
        onCancel={dongFormMonHoc}
        okText="Lưu lại"
        cancelText="Hủy"
      >
        <Form form={formMonHoc} layout="vertical">
          <Form.Item
            name="tenMon"
            label="Tên môn học"
            rules={[{ required: true, message: 'Vui lòng nhập tên môn học.' }]}
          >
            <Input placeholder="Ví dụ: Toán, Văn, Tiếng Anh..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm / sửa buổi học */}
      <Modal
        title={idBuoiHocDangSua ? 'Cập nhật buổi học' : 'Thêm buổi học mới'}
        visible={moModalBuoiHoc}
        onOk={luuBuoiHoc}
        onCancel={dongFormBuoiHoc}
        width={600}
        okText="Lưu lại"
        cancelText="Hủy"
      >
        <Form form={formBuoiHoc} layout="vertical" initialValues={{ thoiLuongHocPhut: 60 }}>
          <Form.Item
            name="monHocId"
            label="Môn học"
            rules={[{ required: true, message: 'Vui lòng chọn môn học.' }]}
          >
            <Select placeholder="Chọn môn">
              {danhSachMonHoc.map((monHoc) => (
                <Option key={monHoc.id} value={monHoc.id}>
                  {monHoc.tenMon}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tenMonChiTiet"
            label="Tên buổi học / chủ đề"
            rules={[{ required: true, message: 'Vui lòng nhập tên buổi học hoặc chủ đề.' }]}
          >
            <Input placeholder="Ví dụ: Ôn tập chương 1, Luyện đề số 3..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="thoiGianHoc"
                label="Thời gian học (ngày giờ)"
                rules={[{ required: true, message: 'Vui lòng chọn ngày giờ học.' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="thoiLuongHocPhut"
                label="Thời lượng (phút)"
                rules={[{ required: true, message: 'Vui lòng nhập thời lượng học.' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="noiDungDaHoc" label="Nội dung đã học">
            <TextArea
              rows={3}
              placeholder="Ví dụ: Ôn lại kiến thức cũ, làm bài tập số 1 - 5..."
            />
          </Form.Item>

          <Form.Item name="ghiChuThem" label="Ghi chú thêm">
            <TextArea
              rows={2}
              placeholder="Những điều cần lưu ý, cảm nhận sau buổi học..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm / sửa mục tiêu tháng */}
      <Modal
        title={
          idMucTieuDangSua ? 'Cập nhật mục tiêu tháng' : 'Thêm mục tiêu học tập cho tháng'
        }
        visible={moModalMucTieu}
        onOk={luuMucTieu}
        onCancel={dongFormMucTieu}
        okText="Lưu lại"
        cancelText="Hủy"
      >
        <Form form={formMucTieu} layout="vertical">
          <Form.Item
            name="thangNam"
            label="Tháng / Năm"
            rules={[{ required: true, message: 'Vui lòng chọn tháng.' }]}
          >
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="loaiMucTieu"
            label="Loại mục tiêu"
            rules={[{ required: true, message: 'Vui lòng chọn loại mục tiêu.' }]}
          >
            <Select
              placeholder="Chọn loại mục tiêu"
              onChange={() => formMucTieu.setFieldsValue({ monHocId: undefined })}
            >
              <Option value="total">Tổng thời lượng (tất cả môn)</Option>
              <Option value="subject">Theo một môn cụ thể</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(giaTriCu, giaTriMoi) =>
              giaTriCu.loaiMucTieu !== giaTriMoi.loaiMucTieu
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('loaiMucTieu') === 'subject' ? (
                <Form.Item
                  name="monHocId"
                  label="Môn học áp dụng"
                  rules={[{ required: true, message: 'Vui lòng chọn môn học.' }]}
                >
                  <Select placeholder="Chọn môn">
                    {danhSachMonHoc.map((monHoc) => (
                      <Option key={monHoc.id} value={monHoc.id}>
                        {monHoc.tenMon}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="soPhutMucTieu"
            label="Tổng số phút cần đạt trong tháng"
            rules={[
              { required: true, message: 'Vui lòng nhập số phút mục tiêu.' },
              {
                validator: (_, value) =>
                  !value || value > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error('Số phút phải lớn hơn 0.')),
              },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 1200" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Bai2;