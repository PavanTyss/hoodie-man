# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Database Migration
```bash
# Run Prisma migrations
npx prisma migrate deploy

# Seed the database with initial data
npx prisma db seed
```

### 2. Environment Variables Setup
Copy `.env.example` to `.env.local` and fill in all required values:

#### Required Variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your production domain
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` - From Stripe Dashboard
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard
- `RESEND_API_KEY` or email service credentials

#### Recommended:
- `NEXT_PUBLIC_GA_ID` - Google Analytics tracking
- `SENTRY_DSN` - Error tracking
- AWS/Cloudinary credentials for image hosting

### 3. Security Configuration

#### Update CORS Settings
Check API routes for proper CORS headers in production.

#### Rate Limiting
Install rate limiting package:
```bash
npm install express-rate-limit
```

#### Content Security Policy
Add to `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
      ],
    },
  ];
}
```

### 4. Database Setup (PostgreSQL)

#### Option A: Vercel Postgres
1. Go to Vercel Dashboard → Storage → Create Database
2. Select Postgres
3. Copy connection string to `DATABASE_URL`

#### Option B: Supabase
1. Create project at supabase.com
2. Go to Settings → Database
3. Copy connection string (Transaction mode)
4. Add to `DATABASE_URL`

#### Option C: Railway
1. Create project at railway.app
2. Add Postgres service
3. Copy `DATABASE_URL` from variables

### 5. Payment Setup (Stripe)

1. Create Stripe account at stripe.com
2. Get API keys from Dashboard → Developers → API keys
3. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 6. Email Service Setup

#### Option A: Resend (Recommended)
```bash
npm install resend
```
1. Sign up at resend.com
2. Verify your domain
3. Get API key
4. Add to `RESEND_API_KEY`

#### Option B: SendGrid
```bash
npm install @sendgrid/mail
```
1. Sign up at sendgrid.com
2. Create API key
3. Add to `SENDGRID_API_KEY`

### 7. Image Optimization

#### Update Product Images
1. Upload images to CDN (Cloudinary/AWS S3)
2. Update product image URLs in database
3. Enable Next.js Image Optimization:

In `next.config.ts`:
```typescript
images: {
  domains: ['your-cdn-domain.com'],
  formats: ['image/avif', 'image/webp'],
}
```

### 8. Build & Test
```bash
# Build for production
npm run build

# Test production build locally
npm start
```

### 9. Deployment Platforms

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

Or connect GitHub repository in Vercel dashboard.

#### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

#### AWS/DigitalOcean/Custom Server
```bash
# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "hoodie-man" -- start

# Or use Docker
docker build -t hoodie-man .
docker run -p 3000:3000 hoodie-man
```

### 10. Post-Deployment Tasks

#### Set Up Monitoring
- [ ] Add Google Analytics (update GA_ID)
- [ ] Configure Sentry for error tracking
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)

#### SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Verify domain ownership
- [ ] Create/upload `og-image.jpg` (1200x630px)
- [ ] Update Twitter/OpenGraph meta tags with real handles

#### Testing
- [ ] Test checkout flow with Stripe test cards
- [ ] Verify email delivery (order confirmations)
- [ ] Check responsive design on real devices
- [ ] Test payment webhooks
- [ ] Verify SSL certificate

#### Performance
- [ ] Run Lighthouse audit (target 90+ score)
- [ ] Enable CDN for static assets
- [ ] Configure Redis for session storage (optional)

#### Legal
- [ ] Update Privacy Policy with actual business info
- [ ] Update Terms & Conditions with company details
- [ ] Update contact information on contact page
- [ ] Add cookie consent banner if required by region

### 11. Domain Configuration

Update these files with your actual domain:
- [ ] `src/app/layout.tsx` - metadataBase URL
- [ ] `src/app/sitemap.ts` - baseUrl
- [ ] `src/app/robots.ts` - baseUrl
- [ ] `.env.local` - NEXTAUTH_URL, NEXT_PUBLIC_APP_URL

### 12. Database Backup

Set up automated backups:
```bash
# PostgreSQL backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Schedule with cron (daily at 2 AM)
0 2 * * * /path/to/backup-script.sh
```

## Environment-Specific Commands

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Database Commands
```bash
# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Deploy migrations
npx prisma migrate deploy

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify database connection
- Check for TypeScript errors: `npm run build`

### Database Connection Issues
- Verify DATABASE_URL format
- Check SSL settings for production databases
- Ensure IP whitelisting (if required)

### Stripe Webhooks Not Working
- Verify webhook URL is publicly accessible
- Check webhook secret matches
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Images Not Loading
- Check Next.js image domains configuration
- Verify CDN CORS settings
- Check image URLs in database

## Performance Optimization

### Caching Strategy
Add to API routes:
```typescript
export const revalidate = 3600; // Revalidate every hour
```

### Database Indexing
```sql
CREATE INDEX idx_products_category ON "Product"(category);
CREATE INDEX idx_orders_user ON "Order"("userId");
CREATE INDEX idx_orders_created ON "Order"("createdAt");
```

### CDN Configuration
- Enable caching for static assets (30 days)
- Configure image optimization
- Use compression (Gzip/Brotli)

## Security Best Practices

1. **Never commit `.env` files** to Git
2. **Rotate secrets** regularly (NEXTAUTH_SECRET, API keys)
3. **Enable HTTPS** only in production
4. **Validate all user inputs** on server side
5. **Use prepared statements** (Prisma handles this)
6. **Implement rate limiting** on API routes
7. **Add CAPTCHA** to forms if spam is an issue
8. **Monitor for vulnerabilities**: `npm audit`

## Support & Maintenance

### Regular Tasks
- [ ] Monitor error logs weekly
- [ ] Review analytics monthly
- [ ] Update dependencies: `npm update`
- [ ] Security audit: `npm audit fix`
- [ ] Backup database weekly
- [ ] Test checkout flow monthly

### Scaling Considerations
- Consider Redis for session management
- Implement database read replicas
- Use CDN for static assets
- Add load balancer for multiple instances
- Consider serverless functions for API routes

---

## Quick Reference

### Essential URLs
- Production: `https://yourdomain.com`
- Vercel Dashboard: `https://vercel.com/dashboard`
- Stripe Dashboard: `https://dashboard.stripe.com`
- Database: Check your provider's dashboard
- Analytics: `https://analytics.google.com`

### Support Resources
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Stripe Docs: https://stripe.com/docs
- Vercel Support: https://vercel.com/support

---

**Last Updated**: January 2024
**Maintainer**: Update with your contact info
