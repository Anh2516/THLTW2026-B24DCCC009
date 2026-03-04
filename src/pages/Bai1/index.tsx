import { useState } from 'react';
import { Button, Card, Col, InputNumber, Row, Typography, message } from 'antd';

const { Title, Paragraph, Text } = Typography;

const SO_LAN_DOAN_TOI_DA = 10;

type KetQuaDoan = 'thap_hon' | 'cao_hon' | 'chinh_xac';
type TrangThaiTroChoi = 'dang_choi' | 'thang' | 'thua';

interface BanGhiLichSuDoan {
  soLanThu: number;
  soNguoiDoan: number;
  ketQua: KetQuaDoan;
}

const Bai1 = () => {
  const [soBiMat, setSoBiMat] = useState<number>(() => Math.floor(Math.random() * 100) + 1);
  const [soNguoiDoan, setSoNguoiDoan] = useState<number | null>(null);
  const [soLanDoan, setSoLanDoan] = useState<number>(0);
  const [trangThaiTroChoi, setTrangThaiTroChoi] = useState<TrangThaiTroChoi>('dang_choi');
  const [lichSuDoan, setLichSuDoan] = useState<BanGhiLichSuDoan[]>([]);

  const luotConLai = SO_LAN_DOAN_TOI_DA - soLanDoan;

  const xuLyKhiNguoiChoiDoan = () => {
    if (trangThaiTroChoi !== 'dang_choi') {
      message.info('Vui lòng bấm "Chơi lại từ đầu" để bắt đầu ván mới.');
      return;
    }

    if (soNguoiDoan === null) {
      message.warning('Bạn chưa nhập số muốn đoán.');
      return;
    }

    if (soNguoiDoan < 1 || soNguoiDoan > 100) {
      message.warning('Vui lòng nhập một số trong khoảng từ 1 đến 100.');
      return;
    }

    const soLanDoanMoi = soLanDoan + 1;
    setSoLanDoan(soLanDoanMoi);

    if (soNguoiDoan === soBiMat) {
      setTrangThaiTroChoi('thang');
      setLichSuDoan((dsCu) => [
        ...dsCu,
        { soLanThu: soLanDoanMoi, soNguoiDoan, ketQua: 'chinh_xac' },
      ]);
      message.success('Tuyệt vời! Bạn đã đoán đúng số bí mật.');
      return;
    }

    if (soLanDoanMoi >= SO_LAN_DOAN_TOI_DA) {
      setTrangThaiTroChoi('thua');
      setLichSuDoan((dsCu) => [
        ...dsCu,
        {
          soLanThu: soLanDoanMoi,
          soNguoiDoan,
          ketQua: soNguoiDoan < soBiMat ? 'thap_hon' : 'cao_hon',
        },
      ]);
      message.error(`Bạn đã hết lượt. Số bí mật là ${soBiMat}.`);
      return;
    }

    const ketQuaHienTai: KetQuaDoan = soNguoiDoan < soBiMat ? 'thap_hon' : 'cao_hon';
    setLichSuDoan((dsCu) => [
      ...dsCu,
      { soLanThu: soLanDoanMoi, soNguoiDoan, ketQua: ketQuaHienTai },
    ]);

    if (ketQuaHienTai === 'thap_hon') {
      message.info('Số bạn đoán đang THẤP hơn số bí mật.');
    } else {
      message.info('Số bạn đoán đang CAO hơn số bí mật.');
    }
  };

  const choiLaiTuDau = () => {
    setSoBiMat(Math.floor(Math.random() * 100) + 1);
    setSoNguoiDoan(null);
    setSoLanDoan(0);
    setTrangThaiTroChoi('dang_choi');
    setLichSuDoan([]);
  };

  return (
    <Row justify="center" style={{ padding: 24 }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card>
          <Title level={3}>Bài 1: Trò chơi đoán số</Title>

          <Paragraph>
            Hệ thống sẽ chọn ngẫu nhiên{' '}
            <Text strong>một số nguyên từ 1 đến 100</Text>. Nhiệm vụ của bạn là tìm ra số đó
            trong tối đa <Text strong>{SO_LAN_DOAN_TOI_DA} lần đoán</Text>.
          </Paragraph>

          <Paragraph>
            <Text>Lượt đoán còn lại: </Text>
            <Text strong>{luotConLai}</Text>
          </Paragraph>

          <Row gutter={8} align="middle" style={{ marginBottom: 16 }}>
            <Col flex="auto">
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                max={100}
                value={soNguoiDoan as number | null}
                onChange={(giaTriMoi) => setSoNguoiDoan(giaTriMoi as number | null)}
                placeholder="Nhập số bạn đoán (1 - 100)"
                disabled={trangThaiTroChoi !== 'dang_choi'}
              />
            </Col>
            <Col>
              <Button
                type="primary"
                onClick={xuLyKhiNguoiChoiDoan}
                disabled={trangThaiTroChoi !== 'dang_choi'}
              >
                Đoán số
              </Button>
            </Col>
            <Col>
              <Button onClick={choiLaiTuDau}>Chơi lại từ đầu</Button>
            </Col>
          </Row>

          {trangThaiTroChoi === 'thang' && (
            <Paragraph type="success">
              <Text strong>
                Quá xuất sắc! Bạn đã đoán đúng số bí mật {soBiMat} trong {soLanDoan} lần thử.
              </Text>
            </Paragraph>
          )}

          {trangThaiTroChoi === 'thua' && (
            <Paragraph type="danger">
              <Text strong>
                Bạn đã dùng hết lượt nhưng vẫn chưa tìm ra số bí mật. Con số đúng là {soBiMat}.
              </Text>
            </Paragraph>
          )}

          <Paragraph strong>Lịch sử các lần bạn đã đoán</Paragraph>

          {lichSuDoan.length === 0 ? (
            <Text type="secondary">Bạn chưa thực hiện lần đoán nào.</Text>
          ) : (
            <ul style={{ paddingLeft: 20 }}>
              {lichSuDoan.map((banGhi) => (
                <li key={banGhi.soLanThu}>
                  Lần {banGhi.soLanThu}: bạn đoán{' '}
                  <Text strong>{banGhi.soNguoiDoan}</Text> -{' '}
                  {banGhi.ketQua === 'chinh_xac' ? (
                    <Text type="success">ĐOÁN CHÍNH XÁC</Text>
                  ) : banGhi.ketQua === 'thap_hon' ? (
                    <Text type="warning">THẤP hơn số bí mật</Text>
                  ) : (
                    <Text type="warning">CAO hơn số bí mật</Text>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default Bai1;