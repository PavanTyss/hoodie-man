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
