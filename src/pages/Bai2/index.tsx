import React, { useEffect, useMemo, useState } from 'react';
import {Button,Card,Col,Form,Input,InputNumber,Row,Select,Space,Table,Tag,Typography,message,} from 'antd';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

type MucDoKho = 'de' | 'trung_binh' | 'kho' | 'rat_kho';

interface KhoiKienThuc {
  id: string;
  ten: string;
  moTa?: string;
}

interface MonHoc {
  id: string;
  maMon: string;
  tenMon: string;
  soTinChi: number;
}

interface CauHoi {
  id: string;
  maCauHoi: string;
  monHocId: string;
  noiDung: string;
  mucDo: MucDoKho;
  khoiId: string;
}

interface DeThi {
  id: string;
  tenDe: string;
  monHocId: string;
  khoiId: string | 'tat_ca';
  soLuongTheoMucDo: Record<MucDoKho, number>;
  danhSachCauHoiIds: string[];
}

interface CauTrucDeThi {
  id: string;
  tenDe: string;
  monHocId: string;
  khoiId: string | 'tat_ca';
  soLuongTheoMucDo: Record<MucDoKho, number>;
}

type ThongTinDeThiForm = {
  tenDe: string;
  monHocId: string;
  khoiId: string | 'tat_ca';
  soCauDe: number;
  soCauTB: number;
  soCauKho: number;
  soCauRatKho: number;
};

const nhanMucDo: Record<MucDoKho, string> = {
  de: 'Dễ',
  trung_binh: 'Trung bình',
  kho: 'Khó',
  rat_kho: 'Rất khó',
};

const mauMucDo: Record<MucDoKho, string> = {
  de: 'green',
  trung_binh: 'blue',
  kho: 'orange',
  rat_kho: 'red',
};

const LS_KEY_DE_THI = 'bai2_dsDeThi';
const LS_KEY_CAU_TRUC_DE_THI = 'bai2_dsCauTrucDeThi';

const Bai2: React.FC = () => {
  const [formDeThi] = Form.useForm<ThongTinDeThiForm>();
  const [dsKhoi, setDsKhoi] = useState<KhoiKienThuc[]>([]);
  const [dsMon, setDsMon] = useState<MonHoc[]>([]);
  const [dsCauHoi, setDsCauHoi] = useState<CauHoi[]>([]);
  const [dsDeThi, setDsDeThi] = useState<DeThi[]>([]);
  const [dsCauTrucDeThi, setDsCauTrucDeThi] = useState<CauTrucDeThi[]>([]);

  const [boLocMon, setBoLocMon] = useState<string | undefined>();
  const [boLocKhoi, setBoLocKhoi] = useState<string | undefined>();
  const [boLocMucDo, setBoLocMucDo] = useState<MucDoKho | undefined>();

  const taoId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

  useEffect(() => {
    try {
      const rawDeThi = localStorage.getItem(LS_KEY_DE_THI);
      const rawCauTruc = localStorage.getItem(LS_KEY_CAU_TRUC_DE_THI);

      if (rawDeThi) {
        const parsedDe: DeThi[] = JSON.parse(rawDeThi);
        if (Array.isArray(parsedDe)) {
          setDsDeThi(parsedDe);
        }
      }

      if (rawCauTruc) {
        const parsedCt: CauTrucDeThi[] = JSON.parse(rawCauTruc);
        if (Array.isArray(parsedCt)) {
          setDsCauTrucDeThi(parsedCt);
        }
      }
    } catch (err) {
      console.error('Lỗi đọc dữ liệu đề thi từ localStorage:', err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_DE_THI, JSON.stringify(dsDeThi));
    } catch {
    }
  }, [dsDeThi]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_CAU_TRUC_DE_THI, JSON.stringify(dsCauTrucDeThi));
    } catch {
    }
  }, [dsCauTrucDeThi]);

  const cauHoiDaLoc = useMemo(
    () =>
      dsCauHoi.filter((ch) => {
        if (boLocMon && ch.monHocId !== boLocMon) return false;
        if (boLocKhoi && ch.khoiId !== boLocKhoi) return false;
        if (boLocMucDo && ch.mucDo !== boLocMucDo) return false;
        return true;
      }),
    [dsCauHoi, boLocMon, boLocKhoi, boLocMucDo],
  );

  const xuLyThemKhoi = (values: { ten: string; moTa?: string }) => {
    setDsKhoi((prev) => [...prev, { id: taoId(), ten: values.ten.trim(), moTa: values.moTa?.trim() }]);
    message.success('Đã thêm khối kiến thức.');
  };

  const xuLyThemMon = (values: { maMon: string; tenMon: string; soTinChi: number }) => {
    setDsMon((prev) => [
      ...prev,
      { id: taoId(), maMon: values.maMon.trim(), tenMon: values.tenMon.trim(), soTinChi: values.soTinChi },
    ]);
    message.success('Đã thêm môn học.');
  };

  const xuLyThemCauHoi = (values: {
    maCauHoi: string;
    monHocId: string;
    noiDung: string;
    mucDo: MucDoKho;
    khoiId: string;
  }) => {
    setDsCauHoi((prev) => [
      ...prev,
      {
        id: taoId(),
        maCauHoi: values.maCauHoi.trim(),
        monHocId: values.monHocId,
        noiDung: values.noiDung.trim(),
        mucDo: values.mucDo,
        khoiId: values.khoiId,
      },
    ]);
    message.success('Đã thêm câu hỏi.');
  };

  const xuLyTaoDeThi = (values: ThongTinDeThiForm) => {
    const boLoc = (mucDo: MucDoKho) =>
      dsCauHoi.filter((ch) => {
        if (ch.monHocId !== values.monHocId) return false;
        if (values.khoiId !== 'tat_ca' && ch.khoiId !== values.khoiId) return false;
        if (ch.mucDo !== mucDo) return false;
        return true;
      });

    const boDe = boLoc('de');
    const boTB = boLoc('trung_binh');
    const boKho = boLoc('kho');
    const boRatKho = boLoc('rat_kho');

    if (
      boDe.length < values.soCauDe ||
      boTB.length < values.soCauTB ||
      boKho.length < values.soCauKho ||
      boRatKho.length < values.soCauRatKho
    ) {
      message.error('Không đủ câu hỏi phù hợp trong ngân hàng để tạo đề theo cấu trúc yêu cầu.');
      return;
    }

    const chonNgauNhien = (ds: CauHoi[], soLuong: number) =>
      [...ds].sort(() => Math.random() - 0.5).slice(0, soLuong).map((ch) => ch.id);

    const danhSachCauHoiIds = [
      ...chonNgauNhien(boDe, values.soCauDe),
      ...chonNgauNhien(boTB, values.soCauTB),
      ...chonNgauNhien(boKho, values.soCauKho),
      ...chonNgauNhien(boRatKho, values.soCauRatKho),
    ];

    const soLuongTheoMucDo: Record<MucDoKho, number> = {
      de: values.soCauDe,
      trung_binh: values.soCauTB,
      kho: values.soCauKho,
      rat_kho: values.soCauRatKho,
    };

    setDsDeThi((prev) => [
      ...prev,
      {
        id: taoId(),
        tenDe: values.tenDe.trim(),
        monHocId: values.monHocId,
        khoiId: values.khoiId,
        soLuongTheoMucDo,
        danhSachCauHoiIds,
      },
    ]);

    message.success('Đã tạo và lưu cấu trúc đề thi.');
  };

  const xuLyLuuCauTrucDeThi = (values: ThongTinDeThiForm) => {
    const soLuongTheoMucDo: Record<MucDoKho, number> = {
      de: values.soCauDe,
      trung_binh: values.soCauTB,
      kho: values.soCauKho,
      rat_kho: values.soCauRatKho,
    };

    setDsCauTrucDeThi((prev) => [
      ...prev,
      {
        id: taoId(),
        tenDe: values.tenDe.trim(),
        monHocId: values.monHocId,
        khoiId: values.khoiId,
        soLuongTheoMucDo,
      },
    ]);

    message.success('Đã lưu cấu trúc đề thi để sử dụng lại sau này.');
  };

  const timMonTheoId = (id: string) => dsMon.find((m) => m.id === id)?.tenMon ?? 'Không rõ';
  const timKhoiTheoId = (id: string) => dsKhoi.find((k) => k.id === id)?.ten ?? 'Không rõ';

  return (
    <Row justify="center" style={{ padding: 24 }}>
      <Col xs={24} lg={22} xl={20}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Title level={3}>Bài 2: Hệ thống quản lý ngân hàng câu hỏi &amp; đề thi</Title>
            <Paragraph>
              Hệ thống này cho phép quản lý <Text strong>khối kiến thức</Text>, <Text strong>môn học</Text>,{' '}
              <Text strong>câu hỏi tự luận</Text> theo <Text strong>mức độ khó</Text> và tạo{' '}
              <Text strong>đề thi theo cấu trúc</Text> dựa trên ngân hàng câu hỏi.
            </Paragraph>
          </Card>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="1. Danh mục khối kiến thức">
                <Form layout="vertical" onFinish={xuLyThemKhoi}>
                  <Form.Item
                    label="Tên khối kiến thức"
                    name="ten"
                    rules={[{ required: true, message: 'Vui lòng nhập tên khối kiến thức' }]}
                  >
                    <Input placeholder="VD: Tổng quan, Chuyên sâu..." />
                  </Form.Item>
                  <Form.Item label="Mô tả" name="moTa">
                    <Input.TextArea rows={3} placeholder="Ghi chú thêm (không bắt buộc)" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Thêm khối kiến thức
                    </Button>
                  </Form.Item>
                </Form>

                <Table<KhoiKienThuc>
                  style={{ marginTop: 16 }}
                  size="small"
                  rowKey="id"
                  dataSource={dsKhoi}
                  pagination={false}
                  columns={[
                    { title: 'Tên khối kiến thức', dataIndex: 'ten' },
                    { title: 'Mô tả', dataIndex: 'moTa' },
                  ]}
                  locale={{ emptyText: 'Chưa có khối kiến thức nào.' }}
                />
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="2. Danh mục môn học">
                <Form layout="vertical" onFinish={xuLyThemMon}>
                  <Form.Item
                    label="Mã môn"
                    name="maMon"
                    rules={[{ required: true, message: 'Vui lòng nhập mã môn học' }]}
                  >
                    <Input placeholder="VD: INT101" />
                  </Form.Item>
                  <Form.Item
                    label="Tên môn học"
                    name="tenMon"
                    rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
                  >
                    <Input placeholder="VD: Nhập môn lập trình" />
                  </Form.Item>
                  <Form.Item
                    label="Số tín chỉ"
                    name="soTinChi"
                    rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ' }]}
                  >
                    <InputNumber style={{ width: '100%' }} min={1} max={10} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Thêm môn học
                    </Button>
                  </Form.Item>
                </Form>

                <Table<MonHoc>
                  style={{ marginTop: 16 }}
                  size="small"
                  rowKey="id"
                  dataSource={dsMon}
                  pagination={false}
                  columns={[
                    { title: 'Mã môn', dataIndex: 'maMon' },
                    { title: 'Tên môn', dataIndex: 'tenMon' },
                    { title: 'Số TC', dataIndex: 'soTinChi', width: 80 },
                  ]}
                  locale={{ emptyText: 'Chưa có môn học nào.' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="3. Quản lý câu hỏi tự luận">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form layout="vertical" onFinish={xuLyThemCauHoi}>
                  <Form.Item
                    label="Mã câu hỏi"
                    name="maCauHoi"
                    rules={[{ required: true, message: 'Vui lòng nhập mã câu hỏi' }]}
                  >
                    <Input placeholder="VD: Q001" />
                  </Form.Item>

                  <Form.Item
                    label="Môn học"
                    name="monHocId"
                    rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
                  >
                    <Select placeholder="Chọn môn học">
                      {dsMon.map((m) => (
                        <Option key={m.id} value={m.id}>
                          {m.tenMon}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Khối kiến thức"
                    name="khoiId"
                    rules={[{ required: true, message: 'Vui lòng chọn khối kiến thức' }]}
                  >
                    <Select placeholder="Chọn khối kiến thức">
                      {dsKhoi.map((k) => (
                        <Option key={k.id} value={k.id}>
                          {k.ten}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Mức độ khó"
                    name="mucDo"
                    rules={[{ required: true, message: 'Vui lòng chọn mức độ khó' }]}
                  >
                    <Select placeholder="Chọn mức độ">
                      <Option value="de">Dễ</Option>
                      <Option value="trung_binh">Trung bình</Option>
                      <Option value="kho">Khó</Option>
                      <Option value="rat_kho">Rất khó</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Nội dung câu hỏi"
                    name="noiDung"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                  >
                    <Input.TextArea rows={4} placeholder="Nhập nội dung câu hỏi tự luận..." />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={!dsMon.length || !dsKhoi.length}>
                      Thêm câu hỏi vào ngân hàng
                    </Button>
                  </Form.Item>
                </Form>
              </Col>

              <Col xs={24} md={12}>
                <Paragraph strong>Bộ lọc tìm kiếm câu hỏi</Paragraph>
                <Space style={{ marginBottom: 16 }} wrap>
                  <Select
                    allowClear
                    placeholder="Lọc theo môn học"
                    style={{ minWidth: 180 }}
                    value={boLocMon}
                    onChange={(v) => setBoLocMon(v)}
                  >
                    {dsMon.map((m) => (
                      <Option key={m.id} value={m.id}>
                        {m.tenMon}
                      </Option>
                    ))}
                  </Select>

                  <Select
                    allowClear
                    placeholder="Lọc theo khối kiến thức"
                    style={{ minWidth: 200 }}
                    value={boLocKhoi}
                    onChange={(v) => setBoLocKhoi(v)}
                  >
                    {dsKhoi.map((k) => (
                      <Option key={k.id} value={k.id}>
                        {k.ten}
                      </Option>
                    ))}
                  </Select>

                  <Select
                    allowClear
                    placeholder="Lọc theo mức độ"
                    style={{ minWidth: 160 }}
                    value={boLocMucDo}
                    onChange={(v: MucDoKho | undefined) => setBoLocMucDo(v)}
                  >
                    <Option value="de">Dễ</Option>
                    <Option value="trung_binh">Trung bình</Option>
                    <Option value="kho">Khó</Option>
                    <Option value="rat_kho">Rất khó</Option>
                  </Select>
                </Space>

                <Table<CauHoi>
                  size="small"
                  rowKey="id"
                  dataSource={cauHoiDaLoc}
                  pagination={{ pageSize: 5 }}
                  columns={[
                    { title: 'Mã câu hỏi', dataIndex: 'maCauHoi', width: 100 },
                    {
                      title: 'Môn học',
                      dataIndex: 'monHocId',
                      render: (id: string) => timMonTheoId(id),
                    },
                    {
                      title: 'Khối kiến thức',
                      dataIndex: 'khoiId',
                      render: (id: string) => timKhoiTheoId(id),
                    },
                    {
                      title: 'Mức độ',
                      dataIndex: 'mucDo',
                      render: (muc: MucDoKho) => (
                        <Tag color={mauMucDo[muc]}>{nhanMucDo[muc]}</Tag>
                      ),
                    },
                    { title: 'Nội dung', dataIndex: 'noiDung' },
                  ]}
                  locale={{ emptyText: 'Chưa có câu hỏi nào trong ngân hàng.' }}
                />
              </Col>
            </Row>
          </Card>

          <Card title="4. Quản lý đề thi theo cấu trúc">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form form={formDeThi} layout="vertical" onFinish={xuLyTaoDeThi}>
                  <Form.Item
                    label="Tên đề thi"
                    name="tenDe"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đề thi' }]}
                  >
                    <Input placeholder="VD: Đề giữa kỳ môn X" />
                  </Form.Item>

                  <Form.Item
                    label="Môn học"
                    name="monHocId"
                    rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
                  >
                    <Select placeholder="Chọn môn học">
                      {dsMon.map((m) => (
                        <Option key={m.id} value={m.id}>
                          {m.tenMon}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Khối kiến thức"
                    name="khoiId"
                    initialValue="tat_ca"
                    rules={[{ required: true, message: 'Vui lòng chọn khối kiến thức' }]}
                  >
                    <Select>
                      <Option value="tat_ca">Tất cả khối kiến thức</Option>
                      {dsKhoi.map((k) => (
                        <Option key={k.id} value={k.id}>
                          {k.ten}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Paragraph strong>Số lượng câu hỏi theo mức độ khó</Paragraph>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item
                        label="Dễ"
                        name="soCauDe"
                        initialValue={0}
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Trung bình"
                        name="soCauTB"
                        initialValue={0}
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Khó"
                        name="soCauKho"
                        initialValue={0}
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Rất khó"
                        name="soCauRatKho"
                        initialValue={0}
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Space>
                      <Button
                        onClick={() => {
                          formDeThi
                            .validateFields()
                            .then((values) => xuLyLuuCauTrucDeThi(values))
                            .catch(() => {});
                        }}
                      >
                        Lưu cấu trúc đề thi
                      </Button>
                      <Button type="primary" htmlType="submit" disabled={!dsCauHoi.length}>
                        Tạo đề thi theo cấu trúc
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Col>

              <Col xs={24} md={12}>
                <Paragraph strong>Các đề thi đã lưu</Paragraph>
                <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                  Cấu trúc đề thi được lưu để tái sử dụng (chưa gắn với câu hỏi cụ thể).
                </Paragraph>
                <Table<CauTrucDeThi>
                  size="small"
                  rowKey="id"
                  dataSource={dsCauTrucDeThi}
                  pagination={{ pageSize: 5 }}
                  columns={[
                    { title: 'Tên đề', dataIndex: 'tenDe' },
                    {
                      title: 'Môn học',
                      dataIndex: 'monHocId',
                      render: (id: string) => timMonTheoId(id),
                    },
                    {
                      title: 'Khối kiến thức',
                      dataIndex: 'khoiId',
                      render: (id: string | 'tat_ca') =>
                        id === 'tat_ca' ? 'Tất cả khối kiến thức' : timKhoiTheoId(id),
                    },
                    {
                      title: 'Cấu trúc mức độ',
                      dataIndex: 'soLuongTheoMucDo',
                      render: (soLuong: Record<MucDoKho, number>) => (
                        <Space direction="vertical" size={0}>
                          <span>
                            Dễ: <Text strong>{soLuong.de}</Text>
                          </span>
                          <span>
                            Trung bình: <Text strong>{soLuong.trung_binh}</Text>
                          </span>
                          <span>
                            Khó: <Text strong>{soLuong.kho}</Text>
                          </span>
                          <span>
                            Rất khó: <Text strong>{soLuong.rat_kho}</Text>
                          </span>
                        </Space>
                      ),
                    },
                    {
                      title: 'Tổng số câu (theo cấu trúc)',
                      render: (_, de: CauTrucDeThi) =>
                        de.soLuongTheoMucDo.de +
                        de.soLuongTheoMucDo.trung_binh +
                        de.soLuongTheoMucDo.kho +
                        de.soLuongTheoMucDo.rat_kho,
                    },
                  ]}
                  locale={{ emptyText: 'Chưa có cấu trúc đề thi nào được lưu.' }}
                />

                <Paragraph strong style={{ marginTop: 24 }}>
                  Các đề thi đã tạo từ cấu trúc
                </Paragraph>
                <Table<DeThi>
                  size="small"
                  rowKey="id"
                  dataSource={dsDeThi}
                  pagination={{ pageSize: 5 }}
                  columns={[
                    { title: 'Tên đề', dataIndex: 'tenDe' },
                    {
                      title: 'Môn học',
                      dataIndex: 'monHocId',
                      render: (id: string) => timMonTheoId(id),
                    },
                    {
                      title: 'Khối kiến thức',
                      dataIndex: 'khoiId',
                      render: (id: string | 'tat_ca') =>
                        id === 'tat_ca' ? 'Tất cả khối kiến thức' : timKhoiTheoId(id),
                    },
                    {
                      title: 'Tổng số câu (thực tế)',
                      render: (_, de: DeThi) =>
                        de.danhSachCauHoiIds ? de.danhSachCauHoiIds.length : 0,
                    },
                  ]}
                  locale={{ emptyText: 'Chưa có đề thi nào được tạo.' }}
                />
              </Col>
            </Row>
          </Card>
        </Space>
      </Col>
    </Row>
  );
};

export default Bai2;