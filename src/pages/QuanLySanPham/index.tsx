import React, { useState, useMemo } from 'react';
import { useModel } from 'umi';
import {
  Card,
  Table,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  message,
  Row,
  Col,
  Space,
  Typography,
  Tag
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  CloseOutlined,
  SaveOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const QuanLySanPham: React.FC = () => {
  const {
    products,
    searchText,
    setSearchText,
    addProduct,
    deleteProduct
  } = useModel('quanly_sanpham');

  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá (VND)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN'),
      align: 'right' as const,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa sản phẩm này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
          >
            Xóa
          </Button>
        </Popconfirm>
      ),
      align: 'center' as const,
    },
  ];

  const handleAdd = () => {
    form.validateFields()
      .then((values) => {
        setLoading(true);
        
        // Chuẩn hóa dữ liệu từ form
        const productData = {
          name: values.name.trim(),
          price: Number(values.price) || 0,
          quantity: Number(values.quantity) || 0
        };
        
        if (!productData.name || productData.price <= 0 || productData.quantity <= 0) {
          message.error('Vui lòng nhập đầy đủ thông tin hợp lệ!');
          setLoading(false);
          return;
        }
        
        try {
          addProduct(productData);
          
          message.success('Thêm sản phẩm thành công!');
          
          form.resetFields();
          setDrawerVisible(false);
          
          setSearchText('');
        } catch (error) {
          message.error('Có lỗi xảy ra khi thêm sản phẩm!');
          console.error('Error adding product:', error);
        } finally {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleDelete = (id: number) => {
    deleteProduct(id);
    message.success('Xóa sản phẩm thành công!');
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return products;
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [products, searchText]);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          Quản lý Sản phẩm
        </Title>

        <Row gutter={16} style={{ marginBottom: '20px' }}>
          <Col span={18}>
            <Search
              placeholder="Tìm kiếm sản phẩm theo tên..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
            />
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setDrawerVisible(true)}
            >
              Thêm sản phẩm
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={false}
          bordered
        />
      </Card>

      <Drawer
        title="Thêm sản phẩm mới"
        placement="right"
        onClose={() => {
          form.resetFields();
          setDrawerVisible(false);
        }}
        visible={drawerVisible}
        width={520}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => {
                form.resetFields();
                setDrawerVisible(false);
              }}
              icon={<CloseOutlined />}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleAdd}
              loading={loading}
              icon={<SaveOutlined />}
            >
              Thêm mới
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ quantity: 1, price: 1000 }}
        >
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên sản phẩm!' },
              { min: 3, message: 'Tên sản phẩm phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giá (VND)"
                name="price"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá sản phẩm!' },
                  {
                    type: 'number',
                    min: 1,
                    message: 'Giá phải lớn hơn 0!'
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                  min={0}
                  step={1000}
                  addonAfter="₫"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng!' },
                  {
                    type: 'number',
                    min: 1,
                    message: 'Số lượng phải lớn hơn 0!'
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  step={1}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default QuanLySanPham;