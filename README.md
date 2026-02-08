# 🛒 Hoodie Man - E-commerce Store

A modern, full-featured e-commerce web application for selling hoodies, t-shirts, and apparel online. Built with Next.js 14, TypeScript, Prisma, and Tailwind CSS.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Core E-commerce
- **Product Catalog**: Browse extensive collection with 8+ sample products
- **Advanced Filtering**: Filter by category, price range, size, color, and stock status
- **Smart Search**: Search products with real-time results
- **Product Categories**: Dedicated pages for Hoodies, T-Shirts, and Apparel
- **Product Details**: Enhanced pages with image gallery, zoom, size/color selection
- **Shopping Cart**: Full cart management with quantity updates and persistence
- **Wishlist**: Save favorite products for later
- **Checkout Flow**: Complete checkout with form validation

### User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Loading States**: Skeleton screens for better perceived performance
- **Mobile Menu**: Dedicated mobile navigation
- **Social Sharing**: Share products on social media
- **Related Products**: Smart product recommendations
- **Featured Products**: Highlighted items on homepage

### User Account
- **Authentication**: Secure login/register with NextAuth.js
- **User Dashboard**: Order history, profile management, and wishlist
- **Order Tracking**: View order status and details

### Business Features
- **Product Reviews**: Rating and review system (schema ready)
- **Discount System**: Support for promo codes and product discounts
- **Newsletter**: Email subscription with API
- **Contact Page**: Customer support form with business information

### Developer & SEO
- **TypeScript**: Full type safety throughout
- **Prisma ORM**: Type-safe database access
- **Database Schema**: PostgreSQL-ready with 8 models
- **API Routes**: RESTful API for products, orders, and newsletter
- **SEO Optimized**: Meta tags, Open Graph, Twitter Cards
- **Sitemap**: Auto-generated XML sitemap
- **Error Handling**: Custom 404 and error pages
- **Security**: Rate limiting, input validation, sanitization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- PostgreSQL database (for production)

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hoodie-man.git
cd hoodie-man
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Set up the database:
```bash
# Push schema to database
npx prisma db push

# Seed with sample data
npx prisma db seed

# (Optional) Open Prisma Studio
npx prisma studio
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
hoodie-man/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts               # Database seeding script
│   └── migrations/           # Database migrations
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── api/             # API routes
│   │   │   ├── auth/       # NextAuth endpoints
│   │   │   ├── newsletter/ # Newsletter subscription
│   │   │   ├── orders/     # Order management
│   │   │   └── products/   # Product API
│   │   ├── cart/           # Shopping cart page
│   │   ├── checkout/       # Checkout flow
│   │   ├── contact/        # Contact form
│   │   ├── dashboard/      # User dashboard
│   │   ├── hoodies/        # Hoodie category
│   │   ├── t-shirts/       # T-shirt category
│   │   ├── apparel/        # Apparel category
│   │   ├── wishlist/       # Wishlist page
│   │   ├── search/         # Search results
│   │   ├── privacy/        # Privacy policy
│   │   ├── terms/          # Terms & conditions
│   │   ├── returns/        # Return policy
│   │   ├── error.tsx       # Error boundary
│   │   ├── not-found.tsx   # 404 page
│   │   ├── layout.tsx      # Root layout
│   │   ├── sitemap.ts      # XML sitemap
│   │   └── robots.ts       # Robots.txt
│   ├── components/         # React components
│   │   ├── CategoryProducts.tsx   # Category view
│   │   ├── Footer.tsx            # Site footer
│   │   ├── LoadingSkeletons.tsx  # Loading states
│   │   ├── MobileMenu.tsx        # Mobile navigation
│   │   ├── Navbar.tsx            # Header navigation
│   │   ├── NewsletterSignup.tsx  # Newsletter form
│   │   ├── ProductCard.tsx       # Product cards
│   │   ├── ProductFilters.tsx    # Filter UI
│   │   ├── Providers.tsx         # Context providers
│   │   └── ShareButtons.tsx      # Social sharing
│   ├── context/           # React Context
│   │   ├── CartContext.tsx      # Cart state
│   │   └── WishlistContext.tsx  # Wishlist state
│   ├── lib/              # Utilities
│   │   ├── api.ts       # API helpers
│   │   ├── auth.ts      # NextAuth config
│   │   ├── prisma.ts    # Prisma client
│   │   ├── products.ts  # Product helpers
│   │   ├── rateLimit.ts # Rate limiting
│   │   └── validation.ts # Input validation
│   └── types/           # TypeScript types
│       └── product.ts   # Type definitions
├── public/              # Static assets
├── .env.example         # Environment template
├── DEPLOYMENT.md        # Deployment guide
└── package.json         # Dependencies
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling
- **Lucide React**: Modern icon library
- **React Context**: State management

### Backend
- **Next.js API Routes**: Serverless functions
- **Prisma ORM**: Database toolkit
- **NextAuth.js v5**: Authentication
- **PostgreSQL**: Production database (SQLite for dev)

### DevOps & Tools
- **Vercel**: Deployment platform (recommended)
- **Git**: Version control
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 📦 Available Scripts

```bash
npm run dev      # Start development server (with Turbopack)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
npx prisma db push       # Push schema changes
npx prisma db seed       # Seed database
```

## 🗄️ Database Schema

### Models
- **User**: Customer accounts with authentication
- **Product**: Product catalog with pricing, inventory
- **Order**: Customer orders with status tracking
- **OrderItem**: Individual items in orders
- **Review**: Product reviews and ratings
- **Wishlist**: User saved products
- **PromoCode**: Discount codes system
- **Newsletter**: Email subscriptions

See [prisma/schema.prisma](prisma/schema.prisma) for full schema.

## 🔒 Security Features

- **Rate Limiting**: API endpoint protection
- **Input Validation**: Server-side validation for all inputs
- **Sanitization**: XSS protection via input sanitization
- **Authentication**: Secure credential-based auth
- **CORS**: Proper origin handling
- **HTTPS**: SSL/TLS in production
- **Environment Variables**: Sensitive data protection

## 🎨 Key Features Explained

### Cart Management
React Context with localStorage persistence. Real-time updates, size/color variants, quantity management.

### Wishlist System
Save products for later viewing. Persists across sessions with localStorage and database sync.

### Product Filtering
Advanced filtering by:
- Price range (slider)
- Sizes (multiple selection)
- Colors (visual selection)
- Stock status
- Sort by: Featured, Price (Low/High), Newest, Name

### Search Functionality
Full-text search across product names, descriptions, and categories with instant results.

### User Dashboard
- Order history with status tracking
- Profile information
- Wishlist management
- Account settings

### Newsletter System
Email collection with:
- Rate limiting (3 signups/hour)
- Duplicate prevention
- Email validation
- Database storage

## 🚀 Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guide covering:
- Environment setup
- Database migration
- Stripe integration
- Email service configuration
- Security checklist
- Performance optimization
- Monitoring setup

### Quick Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Or connect your GitHub repository in the Vercel dashboard.

## 🧪 Testing

### Manual Testing Checklist
- [ ] Browse products and filter
- [ ] Add items to cart
- [ ] Update cart quantities
- [ ] Add/remove wishlist items
- [ ] Search products
- [ ] Complete checkout flow
- [ ] Subscribe to newsletter
- [ ] Submit contact form
- [ ] Test responsive design
- [ ] Verify authentication

## 📝 Configuration

### Environment Variables

Required for production:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl"
STRIPE_SECRET_KEY="sk_live_..."
RESEND_API_KEY="re_..."
```

See [.env.example](.env.example) for complete list.

### SEO Configuration

Update these files with your domain:
- `src/app/layout.tsx` - Meta tags and Open Graph
- `src/app/sitemap.ts` - Sitemap URLs
- `src/app/robots.ts` - Robots.txt rules

## 🎯 Roadmap

### Completed ✅
- [x] Product catalog and filtering
- [x] Shopping cart and wishlist
- [x] User authentication
- [x] Database schema
- [x] Search functionality
- [x] Responsive design
- [x] SEO optimization
- [x] Legal pages
- [x] Error handling

### In Progress 🚧
- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Product reviews (UI)
- [ ] Admin dashboard

### Planned 📋
- [ ] Real-time inventory
- [ ] Order tracking with shipping
- [ ] Product recommendations (AI)
- [ ] Multi-currency support
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Prisma for the database toolkit
- Tailwind CSS for the styling system

## 📞 Support

- **Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/hoodie-man/issues)
- **Email**: support@hoodieman.com

---

**Made with ❤️ using Next.js and TypeScript**

**Happy Shopping! 🛍️**

