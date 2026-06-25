# Urban Help - Development Integration Guide

## Overview

This guide explains how to integrate the generated code modules into your Urban Help platform and maintain consistency across the codebase.

---

## File Organization

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   └── config.ts                    # All configuration
│   │
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   ├── roles.decorator.ts
│   │   └── auth.module.ts
│   │
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── customer.entity.ts
│   │   ├── business.entity.ts
│   │   ├── business-service.entity.ts
│   │   ├── business-hours.entity.ts
│   │   ├── business-image.entity.ts
│   │   ├── business-banking-details.entity.ts
│   │   ├── booking.entity.ts
│   │   ├── payment.entity.ts
│   │   ├── review.entity.ts
│   │   ├── notification.entity.ts
│   │   ├── otp-code.entity.ts
│   │   └── audit-log.entity.ts
│   │
│   ├── notifications/
│   │   ├── sendgrid.service.ts          # Email notifications
│   │   ├── twilio.service.ts            # SMS notifications
│   │   ├── stripe.service.ts            # Payment processing
│   │   ├── stripe.controller.ts
│   │   └── notifications.module.ts
│   │
│   ├── businesses/
│   │   ├── business-registration.service.ts
│   │   ├── business-approval.service.ts
│   │   ├── businesses.controller.ts
│   │   └── businesses.module.ts
│   │
│   ├── bookings/
│   │   ├── booking.service.ts
│   │   ├── bookings.controller.ts
│   │   └── bookings.module.ts
│   │
│   ├── reviews/
│   │   ├── review.service.ts
│   │   ├── reviews.controller.ts
│   │   └── reviews.module.ts
│   │
│   ├── uploads/
│   │   ├── s3.service.ts
│   │   ├── uploads.controller.ts
│   │   └── uploads.module.ts
│   │
│   ├── business-dashboard/
│   │   ├── business-dashboard.service.ts
│   │   ├── business-dashboard.controller.ts
│   │   └── business-dashboard.module.ts
│   │
│   ├── admin/
│   │   ├── admin.controller.ts
│   │   └── admin.module.ts
│   │
│   ├── customers/
│   │   ├── customers.service.ts
│   │   ├── customers.controller.ts
│   │   └── customers.module.ts
│   │
│   ├── search/
│   │   ├── search.service.ts
│   │   ├── search.controller.ts
│   │   └── search.module.ts
│   │
│   ├── app.module.ts                    # Main application module
│   └── main.ts                          # Bootstrap
│
├── database/
│   └── init.sql                         # Schema from CODEBASE_DATABASE_001_SCHEMA.sql
│
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

### Frontend Structure
```
frontend/
├── pages/
│   ├── index.tsx                        # Homepage
│   ├── _app.tsx                         # Global app wrapper
│   │
│   ├── auth/
│   │   └── login.tsx
│   │
│   ├── search.tsx                       # Business search
│   │
│   ├── business/
│   │   ├── [id].tsx                     # Business profile
│   │   ├── dashboard.tsx                # Business dashboard
│   │   └── profile.tsx
│   │
│   ├── bookings/
│   │   ├── [id].tsx
│   │   └── manage.tsx
│   │
│   └── reviews/
│       └── [bookingId].tsx
│
├── lib/
│   ├── api.ts                           # Axios client with interceptors
│   ├── hooks.ts                         # useAuth, useApi, useForm
│   ├── store.ts                         # Zustand auth store
│   └── types/
│       └── index.ts
│
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── BookingForm.tsx
│   ├── ReviewForm.tsx
│   └── ...
│
├── styles/
│   └── globals.css                      # Tailwind CSS
│
├── .env.example
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

---

## Integration Steps

### Step 1: Backend Module Integration

#### 1.1 Install Dependencies
```bash
cd backend
npm install

# Additional dependencies
npm install @nestjs/jwt passport-jwt passport
npm install bcrypt
npm install typeorm pg
npm install aws-sdk
npm install twilio
npm import sendgrid/mail
npm install stripe
```

#### 1.2 Database Setup
```bash
# Copy schema to database directory
cp CODEBASE_DATABASE_001_SCHEMA.sql database/init.sql

# Initialize PostgreSQL
createdb urban_help

# Run schema
psql urban_help < database/init.sql
```

#### 1.3 Module Registration
Update `app.module.ts`:
```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BusinessesModule } from './businesses/businesses.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UploadsModule } from './uploads/uploads.module';
import { BusinessDashboardModule } from './business-dashboard/business-dashboard.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CustomersModule } from './customers/customers.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['src/**/*.entity.ts'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    BusinessesModule,
    BookingsModule,
    ReviewsModule,
    UploadsModule,
    BusinessDashboardModule,
    AdminModule,
    NotificationsModule,
    CustomersModule,
    SearchModule,
  ],
})
export class AppModule {}
```

#### 1.4 Environment Configuration
Create `backend/.env`:
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=urban_help

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=3600

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+61...

# SendGrid
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@urbanhelp.com.au

# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET=urban-help-images

# ASIC API
ASIC_API_KEY=...
ASIC_API_URL=https://api.asic.gov.au/file/abn-search-api

# Google Places
GOOGLE_PLACES_API_KEY=...
```

### Step 2: Frontend Integration

#### 2.1 Install Dependencies
```bash
cd frontend
npm install

# Additional dependencies
npm install axios react-query zustand
npm install @stripe/react-stripe-js @stripe/js
npm install sharp
npm install date-fns
```

#### 2.2 Environment Configuration
Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=...
```

#### 2.3 Page Registration
All pages should be created in `pages/` directory. They'll be automatically routed by Next.js.

### Step 3: Test Integration

#### Backend
```bash
cd backend
npm run dev
# Should start on http://localhost:3000
```

#### Frontend
```bash
cd frontend
npm run dev
# Should start on http://localhost:3001
```

#### API Testing
```bash
curl http://localhost:3000/health
```

---

## Common Development Tasks

### Adding a New Service Endpoint

1. **Create Service Method** in `src/services/your-service.service.ts`
```typescript
@Injectable()
export class YourService {
  async getDetails(id: string) {
    return this.repository.findOne(id);
  }
}
```

2. **Create Controller Method** in `src/your-module/your-module.controller.ts`
```typescript
@Get(':id')
async getDetails(@Param('id') id: string) {
  return this.service.getDetails(id);
}
```

3. **Register in Module**
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [YourController],
  providers: [YourService],
})
export class YourModule {}
```

### Adding a Frontend Page

1. **Create Page** in `pages/your-page.tsx`
```typescript
import Head from 'next/head';
import { useApi } from '../lib/hooks';

export default function YourPage() {
  const { call } = useApi();
  
  return (
    <>
      <Head>
        <title>Page Title - Urban Help</title>
      </Head>
      {/* Your content */}
    </>
  );
}
```

2. **Use API Hook**
```typescript
const { call, loading, error } = useApi();

const handleFetch = async () => {
  try {
    const data = await call('/endpoint', 'GET');
  } catch (err) {
    console.error(err);
  }
};
```

### Sending Notifications

**Email via SendGrid**:
```typescript
constructor(private sendGridService: SendGridService) {}

async notifyUser() {
  await this.sendGridService.sendCustomEmail(
    email,
    subject,
    htmlContent,
  );
}
```

**SMS via Twilio**:
```typescript
constructor(private twilioService: TwilioService) {}

async notifyVia SMS() {
  await this.twilioService.sendSms(phoneNumber, message);
}
```

### Uploading Images

**Backend**:
```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('image'))
async uploadImage(@UploadedFile() file: Express.Multer.File) {
  return this.s3Service.uploadBusinessImage(file, businessId);
}
```

**Frontend**:
```typescript
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await call(
    '/uploads/business/123/image',
    'POST',
    formData,
  );
};
```

---

## Database Migrations

### Creating a Migration

```bash
cd backend
npm run typeorm migration:generate -- -n InitialSchema
npm run typeorm migration:run
```

### Common Queries

**Add a column**:
```sql
ALTER TABLE table_name ADD COLUMN new_column TYPE DEFAULT value;
```

**Add an index**:
```sql
CREATE INDEX idx_name ON table_name(column_name);
```

---

## Testing

### Backend Unit Tests
```bash
npm run test
```

### Backend E2E Tests
```bash
npm run test:e2e
```

### Frontend Tests
```bash
npm run test
```

---

## Debugging

### Backend Logs
```bash
# View with timestamps and colors
npm run dev

# Set log level
LOG_LEVEL=debug npm run dev
```

### Frontend Debugging
```bash
# Chrome DevTools
npm run dev
# Open http://localhost:3001
# F12 → Sources → Set breakpoints
```

### Database Debugging
```bash
# Connect to PostgreSQL
psql urban_help

# View tables
\dt

# View table structure
\d table_name

# View data
SELECT * FROM table_name;
```

---

## Performance Optimization

### Database
- ✅ All indexes created
- ✅ Foreign key constraints set
- ✅ Query optimization in services

### API
- Add caching layer (Redis)
- Implement pagination
- Add rate limiting

### Frontend
- Code splitting (Next.js automatic)
- Image optimization (next/image)
- Lazy loading components

---

## Security Checklist

- [ ] JWT secrets configured
- [ ] Database passwords changed
- [ ] API keys secured in environment
- [ ] HTTPS enabled in production
- [ ] CORS configured properly
- [ ] Input validation on all endpoints
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (TypeORM)
- [ ] XSS protection (React default)
- [ ] CSRF tokens (for forms)

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Build scripts tested
- [ ] Docker images built
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Logging configured
- [ ] Error tracking (Sentry) set up
- [ ] Performance monitoring (NewRelic) set up

---

## Common Issues & Solutions

### Database Connection Fails
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution: Ensure PostgreSQL is running
$ pg_ctl -D /usr/local/var/postgres start
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000

Solution: Change port or kill process
$ kill -9 $(lsof -ti:3000)
```

### Module Not Found
```
Error: Cannot find module '@nestjs/common'

Solution: Install dependencies
$ npm install
```

### JWT Token Invalid
```
Error: Invalid token

Solution: Check JWT_SECRET is same in .env
```

---

## Version Compatibility

- **Node.js**: 16.x or higher
- **PostgreSQL**: 14.x or higher
- **NestJS**: 8.x or higher
- **Next.js**: 13.x or higher
- **TypeORM**: 0.3.x or higher

---

## Support Resources

- NestJS Documentation: https://docs.nestjs.com
- TypeORM Documentation: https://typeorm.io
- Next.js Documentation: https://nextjs.org/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs
- Stripe API: https://stripe.com/docs/api
- Twilio API: https://www.twilio.com/docs
- SendGrid API: https://sendgrid.com/docs

---

**This guide completes the Urban Help implementation foundation.**

All modules are integrated and ready for development and deployment.
