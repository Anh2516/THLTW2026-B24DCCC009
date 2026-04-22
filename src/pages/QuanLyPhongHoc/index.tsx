import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

type LoaiPhong = 'ly_thuyet' | 'thuc_hanh' | 'hoi_truong';
type PhongHoc = {
  maPhong: string;
  tenPhong: string;
  soChoNgoi: number;
  loaiPhong: LoaiPhong;
  nguoiPhuTrach: string;
};

const DANH_SACH_LOAI_PHONG = [
  { label: 'Lý thuyết', value: 'ly_thuyet' as LoaiPhong },
  { label: 'Thực hành', value: 'thuc_hanh' as LoaiPhong },
  { label: 'Hội trường', value: 'hoi_truong' as LoaiPhong },
];
const DANH_SACH_NGUOI_PHU_TRACH = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Quang C', 'Phạm Thành D', 'Võ Minh E'];

const QuanLyPhongHocPage = () => {
  const [form] = Form.useForm<PhongHoc>();

  const [danhSachPhong, setDanhSachPhong] = useState<PhongHoc[]>([
    { maPhong: 'P301', tenPhong: 'Phòng lý thuyết A', soChoNgoi: 45, loaiPhong: 'ly_thuyet', nguoiPhuTrach: 'Nguyễn Văn A' },
    { maPhong: 'LAB01', tenPhong: 'Phòng thực hành máy tính 1', soChoNgoi: 28, loaiPhong: 'thuc_hanh', nguoiPhuTrach: 'Trần Thị B' },
  ]);

  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [locLoaiPhong, setLocLoaiPhong] = useState<LoaiPhong>();
  const [locNguoiPhuTrach, setLocNguoiPhuTrach] = useState<string>();
  const [kieuSapXep, setKieuSapXep] = useState<'asc' | 'desc'>('asc');

  const [moModal, setMoModal] = useState(false);
  const [phongDangSua, setPhongDangSua] = useState<PhongHoc | null>(null);

  let danhSachHienThi = [...danhSachPhong];
  if (tuKhoaTimKiem.trim()) {
    const key = tuKhoaTimKiem.trim().toLowerCase();
    danhSachHienThi = danhSachHienThi.filter(
      (item) => item.maPhong.toLowerCase().includes(key) || item.tenPhong.toLowerCase().includes(key),
    );
  }
  if (locLoaiPhong) danhSachHienThi = danhSachHienThi.filter((item) => item.loaiPhong === locLoaiPhong);
  if (locNguoiPhuTrach) danhSachHienThi = danhSachHienThi.filter((item) => item.nguoiPhuTrach === locNguoiPhuTrach);
  danhSachHienThi.sort((a, b) => (kieuSapXep === 'asc' ? a.soChoNgoi - b.soChoNgoi : b.soChoNgoi - a.soChoNgoi));

  const moFormThem = () => {
    setPhongDangSua(null);
    form.resetFields();
    form.setFieldsValue({ soChoNgoi: 10, loaiPhong: 'ly_thuyet' });
    setMoModal(true);
  };
  const moFormSua = (phong: PhongHoc) => {
    setPhongDangSua(phong);
    form.setFieldsValue(phong);
    setMoModal(true);
  };
  const dongModal = () => {
    form.resetFields();
    setPhongDangSua(null);
    setMoModal(false);
  };

  const luuPhongHoc = async () => {
    try {
      const duLieu = await form.validateFields();
      const maMoi = duLieu.maPhong.trim().toLowerCase();
      const tenMoi = duLieu.tenPhong.trim().toLowerCase();

      const trungMa = danhSachPhong.some(
        (item) => item.maPhong.trim().toLowerCase() === maMoi && item.maPhong !== phongDangSua?.maPhong,
      );
      if (trungMa) {
        form.setFields([{ name: 'maPhong', errors: ['Mã phòng đã tồn tại'] }]);
        return;
      }

      const trungTen = danhSachPhong.some(
        (item) => item.tenPhong.trim().toLowerCase() === tenMoi && item.maPhong !== phongDangSua?.maPhong,
      );
      if (trungTen) {
        form.setFields([{ name: 'tenPhong', errors: ['Tên phòng đã tồn tại'] }]);
        return;
      }

      if (phongDangSua) {
        setDanhSachPhong((prev) =>
          prev.map((item) =>
            item.maPhong === phongDangSua.maPhong
              ? { ...item, ...duLieu, maPhong: duLieu.maPhong.trim(), tenPhong: duLieu.tenPhong.trim() }
              : item,
          ),
        );
        message.success('Đã cập nhật');
      } else {
        setDanhSachPhong((prev) => [
          { ...duLieu, maPhong: duLieu.maPhong.trim(), tenPhong: duLieu.tenPhong.trim() },
          ...prev,
        ]);
        message.success('Đã thêm');
      }

      dongModal();
    } catch (_e) {}
  };

  const xoaPhongHoc = (phong: PhongHoc) => {
    if (phong.soChoNgoi >= 30) {
      message.error('Chỉ xóa phòng dưới 30 chỗ');
      return;
    }
    setDanhSachPhong((prev) => prev.filter((item) => item.maPhong !== phong.maPhong));
    message.success('Đã xóa');
  };

  const cotBang: ColumnsType<PhongHoc> = [
    { title: 'Mã phòng', dataIndex: 'maPhong', width: 110 },
    { title: 'Tên phòng', dataIndex: 'tenPhong' },
    { title: 'Số chỗ', dataIndex: 'soChoNgoi', width: 90, align: 'right' },
    {
      title: 'Loại',
      dataIndex: 'loaiPhong',
      width: 120,
      render: (value: LoaiPhong) => DANH_SACH_LOAI_PHONG.find((x) => x.value === value)?.label,
    },
    { title: 'Phụ trách', dataIndex: 'nguoiPhuTrach', width: 150 },
    {
      title: 'Thao tác',
      width: 130,
      render: (_, phong) => (
        <Space>
          <Button type="link" onClick={() => moFormSua(phong)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa phòng này?"
            onConfirm={() => xoaPhongHoc(phong)}
            okText="Xóa"
            cancelText="Hủy"
            disabled={phong.soChoNgoi >= 30}
          >
            <Button type="link" danger disabled={phong.soChoNgoi >= 30}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý phòng học"
      extra={<Button type="primary" onClick={moFormThem}>Thêm phòng học</Button>}
    >
      <Space wrap style={{ marginBottom: 12 }}>
        <Input
          placeholder="Tìm theo mã phòng hoặc tên phòng"
          value={tuKhoaTimKiem}
          onChange={(e) => setTuKhoaTimKiem(e.target.value)}
          allowClear
          style={{ width: 260 }}
        />
        <Select
          placeholder="Lọc theo loại phòng"
          value={locLoaiPhong}
          onChange={setLocLoaiPhong}
          allowClear
          style={{ width: 180 }}
          options={DANH_SACH_LOAI_PHONG}
        />
        <Select
          placeholder="Lọc theo người phụ trách"
          value={locNguoiPhuTrach}
          onChange={setLocNguoiPhuTrach}
          allowClear
          style={{ width: 200 }}
          options={DANH_SACH_NGUOI_PHU_TRACH.map((x) => ({ label: x, value: x }))}
        />
        <Select
          value={kieuSapXep}
          onChange={setKieuSapXep}
          style={{ width: 190 }}
          options={[
            { label: 'Sắp xếp số chỗ tăng dần', value: 'asc' },
            { label: 'Sắp xếp số chỗ giảm dần', value: 'desc' },
          ]}
        />
      </Space>

      <Table rowKey="maPhong" columns={cotBang} dataSource={danhSachHienThi} pagination={{ pageSize: 8 }} />

      <Modal
        visible={moModal}
        title={phongDangSua ? 'Sửa phòng học' : 'Thêm phòng học'}
        onCancel={dongModal}
        onOk={luuPhongHoc}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="maPhong"
            label="Mã phòng"
            rules={[{ required: true, message: 'Nhập mã phòng' }, { max: 10, message: 'Tối đa 10 ký tự' }]}
          >
            <Input maxLength={10} />
          </Form.Item>
          <Form.Item
            name="tenPhong"
            label="Tên phòng"
            rules={[{ required: true, message: 'Nhập tên phòng' }, { max: 50, message: 'Tối đa 50 ký tự' }]}
          >
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item
            name="nguoiPhuTrach"
            label="Người phụ trách"
            rules={[{ required: true, message: 'Chọn người phụ trách' }]}
          >
            <Select options={DANH_SACH_NGUOI_PHU_TRACH.map((x) => ({ label: x, value: x }))} />
          </Form.Item>
          <Form.Item
            name="soChoNgoi"
            label="Số chỗ ngồi"
            rules={[{ required: true, message: 'Nhập số chỗ ngồi' }]}
          >
            <InputNumber min={10} max={200} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="loaiPhong"
            label="Loại phòng"
            rules={[{ required: true, message: 'Chọn loại phòng' }]}
          >
            <Select options={DANH_SACH_LOAI_PHONG} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default QuanLyPhongHocPage;