import { useState } from 'react';
import { Button, Card, Col, Row, Typography, Space } from 'antd';
import { ScissorOutlined, ThunderboltOutlined, BorderOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

type LuaChon = 'keo' | 'bua' | 'bao';
type KetQua = 'thang' | 'thua' | 'hoa';

const CAC_LUA_CHON: { id: LuaChon; ten: string; icon: React.ReactNode }[] = [
  { id: 'keo', ten: 'Kéo', icon: <ScissorOutlined /> },
  { id: 'bua', ten: 'Búa', icon: <ThunderboltOutlined /> },
  { id: 'bao', ten: 'Bao', icon: <BorderOutlined /> },
];

interface BanGhiLichSu {
  lan: number;
  nguoiChoi: LuaChon;
  mayChoi: LuaChon;
  ketQua: KetQua;
}

const layLuaChonNgauNhien = (): LuaChon => {
  const choices: LuaChon[] = ['keo', 'bua', 'bao'];
  return choices[Math.floor(Math.random() * choices.length)];
};

const tenLuaChon = (lc: LuaChon): string => CAC_LUA_CHON.find((c) => c.id === lc)?.ten ?? lc;

const tinhKetQua = (nguoiChoi: LuaChon, mayChoi: LuaChon): KetQua => {
  if (nguoiChoi === mayChoi) return 'hoa';
  if (
    (nguoiChoi === 'keo' && mayChoi === 'bao') ||
    (nguoiChoi === 'bua' && mayChoi === 'keo') ||
    (nguoiChoi === 'bao' && mayChoi === 'bua')
  ) {
    return 'thang';
  }
  return 'thua';
};

const Bai1 = () => {
  const [soVanDaChoi, setSoVanDaChoi] = useState(0);
  const [lichSu, setLichSu] = useState<BanGhiLichSu[]>([]);

  const choi = (luaChonNguoi: LuaChon) => {
    const luaChonMay = layLuaChonNgauNhien();
    const ketQua = tinhKetQua(luaChonNguoi, luaChonMay);
    const lanMoi = soVanDaChoi + 1;

    setSoVanDaChoi(lanMoi);
    setLichSu((ds) => [
      ...ds,
      { lan: lanMoi, nguoiChoi: luaChonNguoi, mayChoi: luaChonMay, ketQua },
    ]);
  };

  return (
    <Row justify="center" style={{ padding: 24 }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card>
          <Title level={3}>Bài 1: Trò chơi Oẳn Tù Tì</Title>

          <Paragraph>
            Bạn chọn một trong ba: <Text strong>Kéo</Text>, <Text strong>Búa</Text>,{' '}
            <Text strong>Bao</Text>. Máy cũng chọn ngẫu nhiên một trong ba. So sánh để xác định{' '}
            <Text strong>thắng</Text>, <Text strong>thua</Text> hoặc <Text strong>hòa</Text>.
          </Paragraph>

          <Paragraph strong>Bạn chọn:</Paragraph>
          <Space wrap size="middle" style={{ marginBottom: 24 }}>
            {CAC_LUA_CHON.map(({ id, ten, icon }) => (
              <Button
                key={id}
                type="primary"
                size="large"
                icon={icon}
                onClick={() => choi(id)}
              >
                {ten}
              </Button>
            ))}
          </Space>

          <Paragraph strong>Lịch sử kết quả các ván đã chơi</Paragraph>
          {lichSu.length === 0 ? (
            <Text type="secondary">Bạn chưa chơi ván nào.</Text>
          ) : (
            <ul style={{ paddingLeft: 20 }}>
              {lichSu.map((banGhi) => (
                <li key={banGhi.lan}>
                  Ván {banGhi.lan}: Bạn chọn <Text strong>{tenLuaChon(banGhi.nguoiChoi)}</Text>, máy
                  chọn <Text strong>{tenLuaChon(banGhi.mayChoi)}</Text> —{' '}
                  {banGhi.ketQua === 'thang' && <Text type="success">Bạn thắng</Text>}
                  {banGhi.ketQua === 'thua' && <Text type="danger">Bạn thua</Text>}
                  {banGhi.ketQua === 'hoa' && <Text type="warning">Hòa</Text>}
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
