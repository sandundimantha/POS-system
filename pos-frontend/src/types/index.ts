export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface User {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  createdAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  stockQuantity: number;
  minStockThreshold: number;
  imagePath?: string;
  categoryId: number;
  categoryName: string;
  supplierId?: number;
  supplierName?: string;
  createdAt?: string;
  updatedAt?: string;
  lowStock: boolean;
}

export type PaymentMode = 'CASH' | 'CARD' | 'MOBILE_PAY';
export type PaymentStatus = 'PAID' | 'PENDING' | 'REFUNDED';
export type TransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  invoiceNumber: string;
  cashierName: string;
  customerName?: string;
  orderDate: string;
  subTotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
}

export interface DailySalesReport {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalDiscount: number;
  totalTax: number;
}

export interface TopProductReport {
  productId: number;
  productName: string;
  totalQuantitySold: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  lowStockCount: number;
  totalProducts: number;
  recentOrders: Order[];
  topProducts: TopProductReport[];
  dailySales: DailySalesReport[];
}
