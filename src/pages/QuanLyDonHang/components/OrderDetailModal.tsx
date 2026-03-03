import React from 'react';
import {
  Modal,
  Descriptions,
  Table,
  Typography,
} from 'antd';

const { Title } = Typography;

const OrderDetailModal: React.FC<{
  visible: boolean;
  order: any;
  onCancel: () => void;
}> = ({ visible, order, onCancel }) => {
  if (!order) return null;

  const productColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN') + ' VND',
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_: any, record: any) => 
        (record.quantity * record.price).toLocaleString('vi-VN') + ' VND',
    },
  ];

  return (
    <Modal
      title={`Chi tiết đơn hàng: ${order.id}`}
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={null}
    >
      <Descriptions title="Thông tin khách hàng" bordered column={1}>
        <Descriptions.Item label="Tên khách hàng">
          {order.customerName}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {order.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">
          {order.address}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {order.createdAt}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {order.status}
        </Descriptions.Item>
      </Descriptions>

      <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
        Danh sách sản phẩm
      </Title>
      
      <Table
        columns={productColumns}
        dataSource={order.products}
        rowKey="productId"
        pagination={false}
        footer={() => (
          <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
            Tổng tiền: {order.totalAmount.toLocaleString('vi-VN')} VND
          </div>
        )}
      />
    </Modal>
  );
};

export default OrderDetailModal;