import { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Black Hoodie',
    description:
      'Premium quality cotton blend hoodie with a comfortable fit. Perfect for everyday wear.',
    price: 49.99,
    category: 'hoodies',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Charcoal'],
    stock: 50,
    featured: true,
  },
  {
    id: '2',
    name: 'Navy Blue Zip Hoodie',
    description: 'Stylish zip-up hoodie with side pockets. Great for layering.',
    price: 54.99,
    category: 'hoodies',
    images: ['https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Royal Blue'],
    stock: 35,
    featured: true,
  },
  {
    id: '3',
    name: 'Grey Pullover Hoodie',
    description: 'Soft fleece hoodie with adjustable drawstring. Ultimate comfort.',
    price: 44.99,
    category: 'hoodies',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Grey', 'Light Grey'],
    stock: 60,
  },
  {
    id: '4',
    name: 'White Essential T-Shirt',
    description: 'Classic crew neck t-shirt made from premium cotton. Wardrobe essential.',
    price: 24.99,
    category: 't-shirts',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Off-White'],
    stock: 100,
    featured: true,
  },
  {
    id: '5',
    name: 'Black Graphic Tee',
    description: 'Trendy graphic print t-shirt. Bold design, comfortable fit.',
    price: 29.99,
    category: 't-shirts',
    images: ['https://images.unsplash.com/photo-1503341338985-c77d3e6960ec?w=500'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black'],
    stock: 75,
  },
  {
    id: '6',
    name: 'Striped Long Sleeve',
    description: 'Classic striped long sleeve shirt. Perfect for casual outings.',
    price: 34.99,
    category: 't-shirts',
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy/White', 'Black/Grey'],
    stock: 40,
  },
  {
    id: '7',
    name: 'Sport Joggers',
    description: 'Comfortable joggers with elastic waistband. Great for workouts or lounging.',
    price: 39.99,
    category: 'apparel',
    images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Grey', 'Navy'],
    stock: 55,
  },
  {
    id: '8',
    name: 'Denim Jacket',
    description: 'Classic denim jacket with button closure. Timeless style.',
    price: 79.99,
    category: 'apparel',
    images: ['https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black'],
    stock: 25,
    featured: true,
  },
];

export const getProducts = () => products;

export const getProductById = (id: string) => products.find((product) => product.id === id);

export const getProductsByCategory = (category: Product['category']) =>
  products.filter((product) => product.category === category);

export const getFeaturedProducts = () => products.filter((product) => product.featured);
