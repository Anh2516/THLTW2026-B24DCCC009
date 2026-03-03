import React, { useState, useMemo } from 'react';
import { useModel } from 'umi';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  message,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import CreateOrderForm from './components/CreateOrderForm';
import OrderDetailModal from './components/OrderDetailModal';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const QuanLyDonHang: React.FC = () => {
  const { orders, updateOrderStatus } = useModel('orderModel');
  const { products, updateProductQuantity } = useModel('productModel');

  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Lọc đơn hàng
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchText) {
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        order.id.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        const startDate = new Date(start);
        const endDate = new Date(end);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    return filtered;
  }, [orders, searchText, selectedStatus, dateRange]);

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Số sản phẩm',
      key: 'productCount',
      render: (_: any, record: any) => record.products.length,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => amount.toLocaleString('vi-VN') + ' VND',
      sorter: (a: any, b: any) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          'Chờ xử lý': 'blue',
          'Đang giao': 'orange',
          'Hoàn thành': 'green',
          'Đã hủy': 'red',
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Select
            defaultValue={record.status}
            style={{ width: 120 }}
            onChange={(value) => handleStatusChange(record.id, value)}
          >
            <Option value="Chờ xử lý">Chờ xử lý</Option>
            <Option value="Đang giao">Đang giao</Option>
            <Option value="Hoàn thành">Hoàn thành</Option>
            <Option value="Đã hủy">Đã hủy</Option>
          </Select>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setIsDetailModalVisible(true);
            }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const oldStatus = order.status;

    // Cập nhật trạng thái đơn hàng
    updateOrderStatus(orderId, newStatus as any);

    // Xử lý số lượng tồn kho khi trạng thái thay đổi
    if (newStatus === 'Hoàn thành' && oldStatus !== 'Hoàn thành') {
      // Trừ số lượng tồn kho
      order.products.forEach(item => {
        updateProductQuantity(item.productId, -item.quantity);
      });
      message.success(`Đã cập nhật trạng thái đơn hàng thành "Hoàn thành" và trừ số lượng tồn kho`);
    } else if (newStatus === 'Đã hủy' && oldStatus !== 'Đã hủy') {
      // Hoàn trả số lượng tồn kho nếu đơn hàng đã được xử lý trước đó
      if (oldStatus === 'Hoàn thành') {
        order.products.forEach(item => {
          updateProductQuantity(item.productId, item.quantity);
        });
        message.success(`Đã hủy đơn hàng và hoàn trả số lượng tồn kho`);
      } else {
        message.success(`Đã hủy đơn hàng`);
      }
    } else {
      message.success(`Đã cập nhật trạng thái đơn hàng thành "${newStatus}"`);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          Quản lý Đơn hàng
        </Title>

        {/* Bộ lọc */}
        <Row gutter={16} style={{ marginBottom: '20px' }}>
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm theo tên KH hoặc mã đơn"
              allowClear
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={() => handleSearch(searchText)}
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
            >
              <Option value="Chờ xử lý">Chờ xử lý</Option>
              <Option value="Đang giao">Đang giao</Option>
              <Option value="Hoàn thành">Hoàn thành</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: '20px' }}>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              Tạo đơn hàng mới
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          bordered
        />
      </Card>

      <CreateOrderForm
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onCreate={() => {
          setIsCreateModalVisible(false);
          message.success('Tạo đơn hàng thành công!');
        }}
      />
      
      <OrderDetailModal
        visible={isDetailModalVisible}
        order={selectedOrder}
        onCancel={() => setIsDetailModalVisible(false)}
      />
    </div>
  );
};

export default QuanLyDonHang;