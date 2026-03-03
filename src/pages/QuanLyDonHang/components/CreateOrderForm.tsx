import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Table,
  Space,
  Typography,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

interface ProductItem {
  key: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  maxQuantity: number;
}

const CreateOrderForm: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onCreate: () => void;
}> = ({ visible, onCancel, onCreate }) => {
  const { products, updateProductQuantity } = useModel('productModel');
  const { createOrder } = useModel('orderModel');
  
  const [form] = Form.useForm();
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState(
    products.filter(p => p.quantity > 0)
  );

  const productColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Số lượng đặt',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value: number, record: ProductItem) => (
        <InputNumber
          min={1}
          max={record.maxQuantity}
          value={value}
          onChange={(newValue) => handleQuantityChange(record.key, newValue || 1)}
        />
      ),
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
      render: (_: any, record: ProductItem) => 
        (record.quantity * record.price).toLocaleString('vi-VN') + ' VND',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ProductItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeProduct(record.key)}
        />
      ),
    },
  ];

  const handleProductSelect = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      message.error('Sản phẩm không tồn tại!');
      return;
    }

    // Kiểm tra sản phẩm đã được thêm chưa
    const existingItem = selectedProducts.find(item => item.productId === productId);
    if (existingItem) {
      message.warning('Sản phẩm đã được thêm vào đơn hàng');
      return;
    }

    // Kiểm tra số lượng tồn kho
    if (product.quantity <= 0) {
      message.error('Sản phẩm đã hết hàng!');
      return;
    }

    // Thêm sản phẩm vào danh sách
    const newItem: ProductItem = {
      key: Date.now(),
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
      maxQuantity: product.quantity,
    };

    setSelectedProducts([...selectedProducts, newItem]);
    message.success(`Đã thêm "${product.name}" vào đơn hàng`);
  };

  const handleQuantityChange = (key: number, quantity: number) => {
    setSelectedProducts(prev =>
      prev.map(item => {
        if (item.key === key) {
          // Kiểm tra số lượng không vượt quá tồn kho
          const maxQty = products.find(p => p.id === item.productId)?.quantity || 0;
          const newQuantity = Math.min(quantity, maxQty);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeProduct = (key: number) => {
    setSelectedProducts(prev => prev.filter(item => item.key !== key));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('Order form values:', values);
      
      if (selectedProducts.length === 0) {
        message.error('Vui lòng chọn ít nhất một sản phẩm');
        return;
      }

      // Kiểm tra số lượng từng sản phẩm
      for (const item of selectedProducts) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          message.error(`Sản phẩm "${item.productName}" không tồn tại!`);
          return;
        }
        if (item.quantity > product.quantity) {
          message.error(`Số lượng "${item.productName}" vượt quá tồn kho (${product.quantity})!`);
          return;
        }
      }

      // Tạo đơn hàng
      const orderData = {
        customerName: values.customerName,
        phone: values.phone,
        address: values.address,
        products: selectedProducts.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: calculateTotal(),
        status: 'Chờ xử lý' as const,
      };

      console.log('Order data to create:', orderData);
      
      try {
        // Tạo đơn hàng
        createOrder(orderData);
        
        // Cập nhật số lượng tồn kho
        selectedProducts.forEach(item => {
          updateProductQuantity(item.productId, -item.quantity);
        });
        
        message.success('Tạo đơn hàng thành công!');
        form.resetFields();
        setSelectedProducts([]);
        onCreate();
      } catch (error) {
        console.error('Error creating order:', error);
        message.error('Có lỗi xảy ra khi tạo đơn hàng!');
      }
    }).catch(errorInfo => {
      console.log('Validate Failed:', errorInfo);
    });
  };

  // Cập nhật danh sách sản phẩm có sẵn khi products thay đổi
  useEffect(() => {
    setAvailableProducts(products.filter(p => p.quantity > 0));
  }, [products]);

  return (
    <Modal
      title="Tạo đơn hàng mới"
      visible={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Tạo đơn hàng
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Title level={4}>Thông tin khách hàng</Title>
        <Form.Item
          label="Tên khách hàng"
          name="customerName"
          rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
        >
          <Input placeholder="Nhập tên khách hàng" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            { pattern: /^\d{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số' }
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
        >
          <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
        </Form.Item>

        <Title level={4}>Danh sách sản phẩm</Title>
        <Form.Item>
          <Select
            placeholder="Chọn sản phẩm"
            style={{ width: '100%', marginBottom: 16 }}
            onChange={handleProductSelect}
          >
            {availableProducts.map(product => (
              <Option key={product.id} value={product.id}>
                {product.name} (Còn: {product.quantity})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedProducts.length > 0 && (
          <>
            <Table
              columns={productColumns}
              dataSource={selectedProducts}
              pagination={false}
              rowKey="key"
              footer={() => (
                <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  Tổng tiền: {calculateTotal().toLocaleString('vi-VN')} VND
                </div>
              )}
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <strong>Tổng cộng: {calculateTotal().toLocaleString('vi-VN')} VND</strong>
            </div>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CreateOrderForm;