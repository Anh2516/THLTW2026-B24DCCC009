import { useCallback } from 'react';

export default function useDashboardModel() {
  const getStatistics = useCallback((products: any[], orders: any[]) => {
    // Tổng số sản phẩm
    const totalProducts = products.length;
    
    // Tổng giá trị tồn kho
    const totalInventoryValue = products.reduce(
      (sum, product) => sum + (product.price * product.quantity), 
      0
    );
    
    // Tổng số đơn hàng
    const totalOrders = orders.length;
    
    // Doanh thu (tổng tiền các đơn hàng "Hoàn thành")
    const revenue = orders
      .filter(order => order.status === 'Hoàn thành')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Số đơn hàng theo trạng thái
    const orderStatusCount = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProducts,
      totalInventoryValue,
      totalOrders,
      revenue,
      orderStatusCount,
    };
  }, []);

  return {
    getStatistics,
  };
}