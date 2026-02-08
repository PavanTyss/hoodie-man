# Database Migration Guide

This guide will help you set up and migrate your database from SQLite (development) to PostgreSQL (production).

## Current Status

Your Prisma schema is defined in `prisma/schema.prisma` with 8 models:
- User
- Product
- Order
- OrderItem
- Review
- Wishlist
- PromoCode
- Newsletter

## Development (SQLite)

### Initial Setup
```bash
# Install dependencies
npm install

# Create SQLite database and apply schema
npx prisma db push

# Seed with sample data
npx prisma db seed
```

### View Database
```bash
# Open Prisma Studio (visual database editor)
npx prisma studio
```

Access at: http://localhost:5555

## Production (PostgreSQL)

### Step 1: Set Up PostgreSQL Database

#### Option A: Vercel Postgres
1. Go to https://vercel.com/dashboard
2. Select your project → Storage → Create Database
3. Choose "Postgres"
4. Copy the `DATABASE_URL` connection string
5. Add to `.env.local`:
   ```env
   DATABASE_URL="postgres://username:password@host.vercel.app:5432/database"
   ```

#### Option B: Supabase
1. Create project at https://supabase.com
2. Go to Project Settings → Database
3. Copy connection string (Transaction mode)
4. Add to `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:[password]@[host].supabase.co:5432/postgres"
   ```

#### Option C: Railway
1. Create project at https://railway.app
2. Add "PostgreSQL" service
3. Copy `DATABASE_URL` from Variables tab
4. Add to `.env.local`

#### Option D: Self-Hosted
Install PostgreSQL and create database:
```bash
# Create database
createdb hoodieman

# Connection string format:
# postgresql://username:password@localhost:5432/hoodieman
```

### Step 2: Update Prisma Configuration

Your `schema.prisma` should already be configured for PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

If it says `provider = "sqlite"`, change it to `"postgresql"`.

### Step 3: Create Initial Migration

This generates SQL migration files:

```bash
# Create migration from current schema
npx prisma migrate dev --name init
```

This will:
1. Create `prisma/migrations/` folder
2. Generate SQL migration file
3. Apply migration to database
4. Generate Prisma Client

### Step 4: Seed Database

```bash
# Run seed script
npx prisma db seed
```

This will populate your database with sample products.

### Step 5: Verify

```bash
# Open Prisma Studio to verify data
npx prisma studio
```

## Migration Commands Reference

### Development
```bash
# Apply schema changes without migration
npx prisma db push

# Create a new migration
npx prisma migrate dev --name description_of_changes

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset
```

### Production
```bash
# Deploy all pending migrations
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Generate Prisma Client
npx prisma generate
```

## Common Migration Scenarios

### Adding a New Field
1. Edit `prisma/schema.prisma`
2. Add the new field:
   ```prisma
   model Product {
     // ... existing fields
     newField String? // ? makes it optional
   }
   ```
3. Create migration:
   ```bash
   npx prisma migrate dev --name add_new_field
   ```

### Changing Field Type
```bash
# Example: changing price from Int to Float
# Edit schema.prisma, then:
npx prisma migrate dev --name change_price_to_float
```

### Adding Index for Performance
```prisma
model Product {
  // ... fields
  
  @@index([category])
  @@index([createdAt])
}
```

```bash
npx prisma migrate dev --name add_indexes
```

## Troubleshooting

### Error: "Database does not exist"
Create the database first:
```bash
# PostgreSQL
createdb hoodieman

# Or use SQL:
# CREATE DATABASE hoodieman;
```

### Error: "Connection refused"
Check:
1. PostgreSQL is running
2. Connection string is correct
3. Firewall allows connection
4. SSL settings match (add `?sslmode=require` if needed)

### Error: "Migration failed"
```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back <migration-name>

# Try again
npx prisma migrate dev
```

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

## Data Migration (SQLite to PostgreSQL)

If you have existing SQLite data to migrate:

### Option 1: Export/Import via Prisma Studio
1. Open SQLite database in Prisma Studio
2. Export data as JSON (manually copy)
3. Switch to PostgreSQL
4. Import data via Studio

### Option 2: Custom Script
Create `prisma/migrate-data.ts`:

```typescript
import { PrismaClient as SQLiteClient } from '@prisma/client'
import { PrismaClient as PostgresClient } from '@prisma/client'

const sqlite = new SQLiteClient({
  datasources: { db: { url: 'file:./dev.db' } }
})

const postgres = new PostgresClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

async function migrateData() {
  // Migrate products
  const products = await sqlite.product.findMany()
  for (const product of products) {
    await postgres.product.create({ data: product })
  }
  
  // Migrate other models...
  
  console.log('Migration complete!')
}

migrateData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

Run: `npx ts-node prisma/migrate-data.ts`

## Best Practices

### 1. Always Backup Before Migration
```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore if needed
psql $DATABASE_URL < backup-20240115.sql
```

### 2. Test Migrations Locally First
Never run migrations directly in production without testing.

### 3. Use Migration Names That Describe Changes
```bash
# Good:
npx prisma migrate dev --name add_product_reviews

# Bad:
npx prisma migrate dev --name update
```

### 4. Version Control Migrations
Commit migration files to Git:
```bash
git add prisma/migrations/
git commit -m "Add product reviews migration"
```

### 5. Production Deployment
In your CI/CD pipeline or deployment script:
```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Deploy migrations
npx prisma migrate deploy

# 3. Build application
npm run build
```

## Environment-Specific Configuration

### .env.local (Development)
```env
DATABASE_URL="file:./dev.db"  # SQLite for local dev
```

### .env.production (Production)
```env
DATABASE_URL="postgresql://user:password@host:5432/db"
```

### Railway/Vercel
Add environment variables in the dashboard. The DATABASE_URL is usually provided automatically.

## Monitoring

### Check Database Size
```sql
-- PostgreSQL
SELECT pg_size_pretty(pg_database_size('hoodieman'));
```

### View Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Performance Optimization

### Add Indexes
```prisma
model Product {
  @@index([category, createdAt])
  @@index([featured])
}

model Order {
  @@index([userId, createdAt])
  @@index([status])
}
```

### Connection Pooling
For production, use connection pooling:
```env
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=10&pool_timeout=10"
```

Or use Prisma Accelerate for advanced connection pooling.

## Need Help?

- Prisma Docs: https://www.prisma.io/docs
- Migration Guide: https://www.prisma.io/docs/guides/migrate
- Prisma Discord: https://pris.ly/discord

---

**Last Updated:** January 2024
