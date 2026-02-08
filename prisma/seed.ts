import { prisma } from '../src/lib/prisma';

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  
  // Create products
  const products = [
    {
      name: 'Classic Black Hoodie',
      description: 'Premium quality cotton blend hoodie with a comfortable fit. Perfect for everyday wear.',
      price: 49.99,
      category: 'hoodies',
      images: JSON.stringify(['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Black', 'Charcoal']),
      stock: 50,
      featured: true,
    },
    {
      name: 'Navy Blue Zip Hoodie',
      description: 'Stylish zip-up hoodie with side pockets. Great for layering.',
      price: 54.99,
      category: 'hoodies',
      images: JSON.stringify(['https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Navy', 'Royal Blue']),
      stock: 35,
      featured: true,
    },
    {
      name: 'Grey Pullover Hoodie',
      description: 'Soft fleece hoodie with adjustable drawstring. Ultimate comfort.',
      price: 44.99,
      category: 'hoodies',
      images: JSON.stringify(['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Grey', 'Light Grey']),
      stock: 60,
      featured: false,
    },
    {
      name: 'White Essential T-Shirt',
      description: 'Classic crew neck t-shirt made from premium cotton. Wardrobe essential.',
      price: 24.99,
      category: 't-shirts',
      images: JSON.stringify(['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500']),
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['White', 'Off-White']),
      stock: 100,
      featured: true,
    },
    {
      name: 'Black Graphic Tee',
      description: 'Trendy graphic print t-shirt. Bold design, comfortable fit.',
      price: 29.99,
      category: 't-shirts',
      images: JSON.stringify(['https://images.unsplash.com/photo-1503341338985-c77d3e6960ec?w=500']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Black']),
      stock: 75,
      featured: false,
    },
    {
      name: 'Striped Long Sleeve',
      description: 'Classic striped long sleeve shirt. Perfect for casual outings.',
      price: 34.99,
      category: 't-shirts',
      images: JSON.stringify(['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Navy/White', 'Black/Grey']),
      stock: 40,
      featured: false,
    },
    {
      name: 'Sport Joggers',
      description: 'Comfortable joggers with elastic waistband. Great for workouts or lounging.',
      price: 39.99,
      category: 'apparel',
      images: JSON.stringify(['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Black', 'Grey', 'Navy']),
      stock: 55,
      featured: false,
    },
    {
      name: 'Denim Jacket',
      description: 'Classic denim jacket with button closure. Timeless style.',
      price: 79.99,
      category: 'apparel',
      images: JSON.stringify(['https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Blue', 'Black']),
      stock: 25,
      featured: true,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
