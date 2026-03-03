import React from 'react';
import { useModel } from 'umi';
import { Card, Row, Col, Statistic, Typography, Progress, Table } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const ThongKe: React.FC = () => {
  const { products } = useModel('productModel');
  const { orders } = useModel('orderModel');

  // Tính toán các số liệu
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce(
    (sum, product) => sum + (product.price * product.quantity), 
    0
  );
  const totalOrders = orders.length;
  const revenue = orders
    .filter(order => order.status === 'Hoàn thành')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  // Số đơn hàng theo trạng thái
  const orderStatusCount = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = [
    { status: 'Chờ xử lý', count: orderStatusCount['Chờ xử lý'] || 0, color: '#1890ff' },
    { status: 'Đang giao', count: orderStatusCount['Đang giao'] || 0, color: '#faad14' },
    { status: 'Hoàn thành', count: orderStatusCount['Hoàn thành'] || 0, color: '#52c41a' },
    { status: 'Đã hủy', count: orderStatusCount['Đã hủy'] || 0, color: '#ff4d4f' },
  ];

  const topProducts = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng tồn',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN') + ' VND',
    },
    {
      title: 'Tổng giá trị',
      key: 'totalValue',
      render: (_: any, record: any) => 
        (record.price * record.quantity).toLocaleString('vi-VN') + ' VND',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
        Thống kê tổng quan
      </Title>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số sản phẩm"
              value={totalProducts}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng giá trị tồn kho"
              value={totalInventoryValue}
              prefix={<DollarOutlined />}
              formatter={(value) => `${Number(value).toLocaleString('vi-VN')} VND`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số đơn hàng"
              value={totalOrders}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={revenue}
              prefix={<DollarOutlined />}
              formatter={(value) => `${Number(value).toLocaleString('vi-VN')} VND`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="Đơn hàng theo trạng thái">
            {statusData.map(item => (
              <div key={item.status} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {item.status === 'Chờ xử lý' && <ClockCircleOutlined style={{ color: item.color }} />}
                    {item.status === 'Đang giao' && <CarOutlined style={{ color: item.color }} />}
                    {item.status === 'Hoàn thành' && <CheckCircleOutlined style={{ color: item.color }} />}
                    {item.status === 'Đã hủy' && <CloseCircleOutlined style={{ color: item.color }} />}
                    <span style={{ marginLeft: 8 }}>{item.status}</span>
                  </span>
                  <span>{item.count} đơn</span>
                </div>
                <Progress 
                  percent={totalOrders > 0 ? (item.count / totalOrders) * 100 : 0} 
                  strokeColor={item.color} 
                  showInfo={false} 
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top sản phẩm tồn kho">
            <Table
              dataSource={topProducts}
              columns={columns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ThongKe;