import { useState, useEffect, useCallback } from 'react';

export interface OrderProduct {
	productId: number;
	productName: string;
	quantity: number;
	price: number;
}

export interface Order {
	id: string;
	customerName: string;
	phone: string;
	address: string;
	products: OrderProduct[];
	totalAmount: number;
	status: 'Chờ xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';
	createdAt: string;
}

const initialOrders: Order[] = [
	{
		id: 'DH001',
		customerName: 'Nguyễn Văn A',
		phone: '0912345678',
		address: '123 Nguyễn Huệ, Q1, TP.HCM',
		products: [{ productId: 1, productName: 'Laptop Dell XPS 13', quantity: 1, price: 25000000 }],
		totalAmount: 25000000,
		status: 'Chờ xử lý',
		createdAt: '2024-01-15',
	},
];

export default function useOrderModel() {
	const [orders, setOrders] = useState<Order[]>(() => {
		const saved = localStorage.getItem('orders');
		return saved ? JSON.parse(saved) : initialOrders;
	});

	// Khởi tạo localStorage nếu chưa có
	useEffect(() => {
		if (!localStorage.getItem('orders')) {
			localStorage.setItem('orders', JSON.stringify(initialOrders));
		}
	}, []);

	// Lưu vào localStorage khi orders thay đổi
	useEffect(() => {
		localStorage.setItem('orders', JSON.stringify(orders));
	}, [orders]);

	const createOrder = useCallback(
		(orderData: Omit<Order, 'id' | 'createdAt'>) => {
			console.log('Creating order:', orderData);

			// Tạo ID mới
			const orderCount = orders.filter((o) => o.id.startsWith('DH')).length;
			const newId = `DH${(orderCount + 1).toString().padStart(3, '0')}`;

			// Tạo đơn hàng mới
			const newOrder: Order = {
				...orderData,
				id: newId,
				createdAt: new Date().toISOString().split('T')[0],
			};

			// Cập nhật state và localStorage
			const updatedOrders = [...orders, newOrder];
			setOrders(updatedOrders);
			localStorage.setItem('orders', JSON.stringify(updatedOrders));

			return newOrder;
		},
		[orders],
	);

	const updateOrderStatus = useCallback(
		(orderId: string, newStatus: Order['status']) => {
			console.log('Updating order status:', orderId, newStatus);

			const updatedOrders = orders.map((order) => {
				if (order.id === orderId) {
					return { ...order, status: newStatus };
				}
				return order;
			});

			setOrders(updatedOrders);
			localStorage.setItem('orders', JSON.stringify(updatedOrders));
		},
		[orders],
	);

	const getOrderById = useCallback(
		(orderId: string) => {
			return orders.find((order) => order.id === orderId);
		},
		[orders],
	);

	return {
		orders,
		createOrder,
		updateOrderStatus,
		getOrderById,
	};
}
