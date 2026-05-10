import { useState, useEffect, useCallback } from 'react';

export interface Product {
	id: number;
	name: string;
	category: string;
	price: number;
	quantity: number;
}

const initialProducts: Product[] = [
	{ id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
	{ id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
	{ id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
	{ id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
	{ id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
	{ id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
	{ id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
	{ id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

export default function useProductModel() {
	const [products, setProducts] = useState<Product[]>(() => {
		const saved = localStorage.getItem('products');
		return saved ? JSON.parse(saved) : initialProducts;
	});

	const [searchText, setSearchText] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('Tất cả');
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
	const [selectedStatus, setSelectedStatus] = useState<string>('');

	// Lưu vào localStorage khi products thay đổi
	useEffect(() => {
		localStorage.setItem('products', JSON.stringify(products));
	}, [products]);

	const addProduct = (newProduct: Omit<Product, 'id'>) => {
		console.log('Adding product:', newProduct);
		const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

		const productWithId: Product = {
			id: newId,
			...newProduct,
		};

		const updatedProducts = [...products, productWithId];
		setProducts(updatedProducts);
		localStorage.setItem('products', JSON.stringify(updatedProducts));

		return productWithId;
	};

	const deleteProduct = (id: number) => {
		const updatedProducts = products.filter((product) => product.id !== id);
		setProducts(updatedProducts);
		localStorage.setItem('products', JSON.stringify(updatedProducts));
	};

	const updateProduct = (id: number, updatedData: Partial<Product>) => {
		console.log('Updating product:', id, updatedData);
		const updatedProducts = products.map((p) => (p.id === id ? { ...p, ...updatedData } : p));
		setProducts(updatedProducts);
		localStorage.setItem('products', JSON.stringify(updatedProducts));
	};

	const getProductById = (id: number) => {
		return products.find((p) => p.id === id);
	};

	const updateProductQuantity = (productId: number, quantityChange: number) => {
		const product = getProductById(productId);
		if (product) {
			const newQuantity = Math.max(0, product.quantity + quantityChange);
			updateProduct(productId, { quantity: newQuantity });
		}
	};

	const getProductStatus = useCallback((quantity: number) => {
		if (quantity > 10) return { text: 'Còn hàng', color: 'green' };
		if (quantity >= 1 && quantity <= 10) return { text: 'Sắp hết', color: 'orange' };
		return { text: 'Hết hàng', color: 'red' };
	}, []);

	const getFilteredProducts = useCallback(() => {
		let filtered = products;

		// Lọc theo tên
		if (searchText.trim()) {
			filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()));
		}

		// Lọc theo danh mục
		if (selectedCategory && selectedCategory !== 'Tất cả') {
			filtered = filtered.filter((p) => p.category === selectedCategory);
		}

		// Lọc theo khoảng giá
		filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

		// Lọc theo trạng thái
		if (selectedStatus) {
			filtered = filtered.filter((p) => {
				const status = getProductStatus(p.quantity);
				return status.text === selectedStatus;
			});
		}

		return filtered;
	}, [products, searchText, selectedCategory, priceRange, selectedStatus, getProductStatus]);

	// Lấy danh sách danh mục duy nhất
	const categories = ['Tất cả', ...Array.from(new Set(products.map((p) => p.category)))];

	return {
		products,
		searchText,
		setSearchText,
		selectedCategory,
		setSelectedCategory,
		priceRange,
		setPriceRange,
		selectedStatus,
		setSelectedStatus,
		addProduct,
		deleteProduct,
		updateProduct,
		updateProductQuantity,
		getProductById,
		getFilteredProducts,
		getProductStatus,
		categories,
	};
}
