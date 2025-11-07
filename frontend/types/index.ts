export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  imageUrl: string | null;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
  images?: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  stripePaymentIntentId: string;
  shippingAddress: Address;
  billingAddress: Address;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}
