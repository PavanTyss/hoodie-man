import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (order of dependencies)
  await prisma.auditLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.storeManager.deleteMany();
  await prisma.adminScope.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.promoCode.deleteMany();
  // Keep User, DeliveryAddress, Account, Session

  // Ensure super@hoodie.local exists with known password (so login always works after seed)
  const superAdminPassword = await hash('SuperAdmin1!', 12);
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'super@hoodie.local' },
    update: { role: 'super_admin', password: superAdminPassword, name: 'Super Admin' },
    create: {
      email: 'super@hoodie.local',
      name: 'Super Admin',
      password: superAdminPassword,
      role: 'super_admin',
    },
  });
  const ownerId = superAdminUser.id;

  // Create store
  const store = await prisma.store.upsert({
    where: { slug: 'main-store' },
    update: {},
    create: {
      name: 'Main Store',
      slug: 'main-store',
      createdById: ownerId,
    },
  });

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
      images: JSON.stringify(['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500']),
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
      data: { ...product, storeId: store.id },
    });
  }

  // Seed promo codes for testing checkout
  const now = new Date();
  const validFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.promoCode.createMany({
    data: [
      { code: 'WELCOME10', discount: 10, minAmount: 0, validFrom, validUntil, active: true },
      { code: 'SAVE20', discount: 20, minAmount: 50, validFrom, validUntil, active: true },
    ],
  });

  // Seed test users for admin/store_manager/delivery_agent (idempotent; password reset on update so logins always work)
  const testPassword = await hash('TestUser1!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@hoodie.local' },
    update: { role: 'admin', password: testPassword },
    create: { email: 'admin@hoodie.local', name: 'Admin User', password: testPassword, role: 'admin' },
  });
  const mgrUser = await prisma.user.upsert({
    where: { email: 'manager@hoodie.local' },
    update: { role: 'store_manager', password: testPassword },
    create: { email: 'manager@hoodie.local', name: 'Store Manager', password: testPassword, role: 'store_manager' },
  });
  const agentUser = await prisma.user.upsert({
    where: { email: 'delivery@hoodie.local' },
    update: { role: 'delivery_agent', password: testPassword },
    create: { email: 'delivery@hoodie.local', name: 'Delivery Agent', password: testPassword, role: 'delivery_agent' },
  });
  await prisma.storeManager.upsert({
    where: { userId_storeId: { userId: mgrUser.id, storeId: store.id } },
    update: {},
    create: { userId: mgrUser.id, storeId: store.id },
  });
  await prisma.storeManager.upsert({
    where: { userId_storeId: { userId: agentUser.id, storeId: store.id } },
    update: {},
    create: { userId: agentUser.id, storeId: store.id },
  });

  console.log('✅ Database seeded successfully!');
  console.log('Test logins: super@hoodie.local / SuperAdmin1! (super_admin), admin@hoodie.local / TestUser1!, manager@hoodie.local / TestUser1!, delivery@hoodie.local / TestUser1!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
