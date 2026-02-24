export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'hoodies' | 't-shirts' | 'apparel';
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured?: boolean;
  /** Average rating 0–5 (from Review model or stored on product) */
  rating?: number;
  /** Number of reviews (from Review model or stored on product) */
  reviewCount?: number;
  /** Percentage discount (0–100) */
  discount?: number;
  /** ISO date string from API */
  createdAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
