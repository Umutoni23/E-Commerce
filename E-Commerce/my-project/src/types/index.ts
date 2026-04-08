export type UserRole = 'ADMIN' | 'USER';

export interface AuthUser {
  id?: number;
  email: string;
  name?: string;
  role: UserRole;
  token?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  title: string;
  name?: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  images: Array<string | { url?: string; imageUrl?: string; src?: string }>;
  category?: Category;
  categoryId?: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id?: number;
  items: CartItem[];
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'MOBILE_MONEY' | 'CASH_ON_DELIVERY';

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  city: string;
  postalCode?: string;
  phoneNumber: string;
  fullName: string;
  createdAt: string;
  items?: CartItem[];
  user?: { email: string; name?: string };
}
