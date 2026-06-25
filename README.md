# Urban Help - Local Services Marketplace

A production-ready, full-stack marketplace platform for connecting customers with local service businesses in Australia.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Testing](#testing)
- [Deployment Checklist](#deployment-checklist)
- [Critical Features](#critical-features)
- [Contributing](#contributing)
- [Support](#support)

---

## Overview

Urban Help is a full-featured marketplace platform that enables:

- **Customers** to discover, book, and pay for local services (cleaning, plumbing, electrical, tutoring, etc.)
- **Service Providers** to register businesses, manage bookings, and receive payments directly
- **Platform** to process payments securely, manage commissions, and facilitate transactions

### Key Differentiators

✅ **Production-Ready Security**: Stripe webhook verification, JWT authentication, bcrypt password hashing, SQL injection prevention, XSS protection

✅ **Payment Safety**: Idempotency keys prevent duplicate charges, transaction atomicity ensures no partial payments, webhook compensation for edge cases

✅ **Scalability**: Redis caching, connection pooling, database indexing, async task queues

✅ **Compliance**: ABN validation, Australian address autocomplete, tax-compliant payout handling

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Payment**: Stripe.js
- **Maps**: Google Places API
- **Language**: TypeScript

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: TypeORM
- **Payments**: Stripe API
- **SMS**: Twilio
- **Email**: SendGrid
- **File Storage**: AWS S3
- **Task Queue**: Bull + BullMQ
- **Authentication**: JWT + Passport.js

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Cloud**: AWS (RDS, ElastiCache, S3, CloudFront, ECS)
- **CI/CD**: GitHub Actions
- **Monitoring**: CloudWatch, Sentry

---

## Features

### 🔐 Security (Critical Path)
- [x] Stripe webhook signature verification (HMAC-SHA256)
- [x] Idempotency keys prevent duplicate payment intents
- [x] Password reset tokens expire in 15 minutes
- [x] Database transaction atomicity (SERIALIZABLE isolation)
- [x] Input validation DTOs (class-validator)
- [x] Account lockout after 5 failed login attempts
- [x] Rate limiting per endpoint
- [x] JWT refresh token rotation
- [x] Bcrypt password hashing (rounds: 12)

### 💳 Payment Processing
- [x] Stripe Connect marketplace model (10% commission)
- [x] Payment intent creation with idempotency
- [x] Webhook event handling (payment success, failure, refund)
- [x] Refund processing with time-based percentages
- [x] Monthly business payouts via Stripe transfers
- [x] Payment audit trail and reconciliation

### 📱 Customer Features
- [x] Email/SMS/Social login
- [x] Business discovery with filters
- [x] Real-time booking availability
- [x] Secure payment processing
- [x] Order history and tracking
- [x] Service reviews and ratings
- [x] Saved addresses and payment methods
- [x] Push notifications for updates

### 🏢 Business Features
- [x] ABN verification via Australian ASIC database
- [x] Business profile management
- [x] Service and pricing setup
- [x] Business hours configuration
- [x] Booking management dashboard
- [x] Revenue analytics and reporting
- [x] Stripe Connect account setup
- [x] Bank account details for payouts

### 📊 Admin Features
- [x] Business approval workflow
- [x] Commission tracking and reporting
- [x] Dispute resolution tools
- [x] User management
- [x] Platform analytics
- [x] Audit logging

---

## Project Structure

```
urbanhelp/
├── frontend/                      # Next.js React application
│   ├── src/
│   │   ├── app/                   # Next.js app router (if using App Router)
│   │   ├── pages/                 # Page components
│   │   │   ├── _app.tsx
│   │   │   ├── index.tsx
│   │   │   ├── auth/
│   │   │   ├── search/
│   │   │   ├── business/
│   │   │   └── bookings/
│   │   ├── components/            # Reusable components
│   │   │   ├── Navigation.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ...
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useApi.ts
│   │   │   └── ...
│   │   ├── services/              # API clients and services
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   └── ...
│   │   ├── store/                 # Zustand state management
│   │   │   ├── authStore.ts
│   │   │   ├── searchStore.ts
│   │   │   └── ...
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── styles/                # Global CSS
│   │   └── utils/                 # Utility functions
│   ├── public/                    # Static assets
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── Dockerfile
│
├── backend/                       # NestJS API
│   ├── src/
│   │   ├── main.ts                # Bootstrap file
│   │   ├── app.module.ts          # Root module
│   │   ├── config/                # Configuration
│   │   │   ├── config.ts
│   │   │   ├── database.config.ts
│   │   │   └── ...
│   │   ├── entities/              # TypeORM entities (database models)
│   │   │   ├── user.entity.ts
│   │   │   ├── business.entity.ts
│   │   │   ├── booking.entity.ts
│   │   │   ├── payment.entity.ts
│   │   │   └── ...
│   │   ├── dtos/                  # Data Transfer Objects (DTOs)
│   │   │   ├── auth/
│   │   │   ├── business/
│   │   │   ├── booking/
│   │   │   ├── payment/
│   │   │   └── ...
│   │   ├── modules/               # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── strategies/
│   │   │   ├── payments/
│   │   │   ├── bookings/
│   │   │   ├── businesses/
│   │   │   ├── customers/
│   │   │   ├── reviews/
│   │   │   ├── notifications/
│   │   │   └── ...
│   │   └── common/                # Shared utilities
│   │       ├── guards/            # Authentication guards
│   │       ├── decorators/        # Custom decorators
│   │       ├── filters/           # Exception filters
│   │       ├── interceptors/      # HTTP interceptors
│   │       ├── pipes/             # Validation pipes
│   │       ├── middlewares/       # HTTP middlewares
│   │       ├── services/          # Shared services (Redis, Stripe, etc.)
│   │       ├── enums/             # TypeScript enums
│   │       └── utils/             # Utility functions
│   ├── test/                      # Integration and e2e tests
│   ├── database/                  # Database migrations and seeds
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml             # Local development environment
├── .env.example                   # Environment variables template
├── README.md                      # This file
├── CONTRIBUTING.md                # Contribution guidelines
└── LICENSE                        # MIT License

```

---

## Prerequisites

### Required
- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 15+ (or via Docker)
- Redis 7+ (or via Docker)

### External Services (Required for Production)
- Stripe account (payments)
- Twilio account (SMS)
- SendGrid account (email)
- AWS account (S3, CloudFront)
- Google Cloud Project (Places API)
- Australian ABN Lookup API

### Development Tools (Recommended)
- Git
- VS Code with extensions:
  - ESLint
  - Prettier
  - PostgreSQL
  - Thunder Client or Postman (API testing)

---

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/urbanhelp.git
cd urbanhelp
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your development credentials:

```env
DB_USER=urbanhelp_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
# ... other env vars
```

### 3. Start Services with Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- Redis cache
- Backend API (NestJS)
- Frontend (Next.js)
- Nginx reverse proxy

### 4. Initialize Database

```bash
# Run migrations
docker-compose exec backend npm run db:migrate

# Seed test data (optional)
docker-compose exec backend npm run db:seed
```

### 5. Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **Database**: postgresql://localhost:5432/urbanhelp_dev

### 6. Stop Services

```bash
docker-compose down

# Keep volumes (database data persists)
docker-compose down -v

# Remove all data
docker-compose down -v --remove-orphans
```

---

## Production Deployment

### AWS ECS Deployment (via GitHub Actions)

1. **Setup AWS Resources**
   ```bash
   cd infrastructure
   terraform init
   terraform plan
   terraform apply
   ```

2. **Configure GitHub Secrets**
   ```
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   AWS_ECR_REGISTRY
   DOCKER_USERNAME
   DOCKER_PASSWORD
   SLACK_WEBHOOK
   ```

3. **Push to Main Branch**
   ```bash
   git push origin main
   ```

4. **GitHub Actions Pipeline Runs**
   - Test (backend + frontend)
   - Build (Docker images)
   - Push to ECR
   - Deploy to ECS (blue-green)
   - Run smoke tests
   - Notify Slack

### Manual Deployment

```bash
# Build Docker images
docker build -t urbanhelp-backend:latest ./backend
docker build -t urbanhelp-frontend:latest ./frontend

# Push to registry
docker push youregistry/urbanhelp-backend:latest
docker push youregistry/urbanhelp-frontend:latest

# Deploy to ECS/Kubernetes
kubectl apply -f k8s/production/
```

---

## API Documentation

### Swagger/OpenAPI

API documentation is auto-generated from NestJS decorators:

- **Development**: http://localhost:3001/api/docs
- **Production**: https://api.urbanhelp.com.au/api/docs

### Key Endpoints

```
# Authentication
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login with email/phone
POST   /api/auth/verify-otp        - Verify OTP code
POST   /api/auth/refresh           - Refresh JWT token
POST   /api/auth/logout            - Logout

# Businesses
POST   /api/businesses/register    - Register business
GET    /api/businesses/:id         - Get business profile
PUT    /api/businesses/:id         - Update business
GET    /api/businesses/search      - Search businesses

# Bookings
POST   /api/bookings               - Create booking
GET    /api/bookings/:id           - Get booking details
GET    /api/bookings/mine          - Get my bookings
PUT    /api/bookings/:id           - Update booking
DELETE /api/bookings/:id           - Cancel booking

# Payments
POST   /api/payments/create-intent - Create payment intent
POST   /api/payments/confirm       - Confirm payment
GET    /api/payments/history       - Payment history

# Webhooks
POST   /api/webhooks/stripe        - Stripe webhook receiver
```

---

## Database

### Schema

13 tables with proper relationships and indexes:

- **users** - User accounts (customers, businesses, admins)
- **customers** - Customer profiles
- **businesses** - Business profiles
- **bookings** - Service bookings
- **payments** - Payment records
- **reviews** - Service reviews and ratings
- **business_services** - Services offered
- **business_hours** - Operating hours
- **business_images** - Business photos
- **business_banking_details** - Stripe Connect account info
- **notifications** - User notifications
- **otp_codes** - OTP verification codes
- **audit_logs** - Security audit trail

### Migrations

```bash
# Create new migration
docker-compose exec backend npm run db:migrate:create -- -n MigrationName

# Run pending migrations
docker-compose exec backend npm run db:migrate

# Revert last migration
docker-compose exec backend npx typeorm migration:revert
```

### Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U urbanhelp_user urbanhelp_dev > backup.sql

# Restore database
docker-compose exec postgres psql -U urbanhelp_user urbanhelp_dev < backup.sql
```

---

## Testing

### Run All Tests

```bash
# Backend tests
cd backend
npm test                    # Unit tests
npm run test:cov           # Coverage report
npm run test:e2e           # End-to-end tests

# Frontend tests
cd frontend
npm test                    # Jest tests
npm run test:watch         # Watch mode
```

### Critical Path Tests

All 5 critical path security fixes have comprehensive tests:

```bash
# Run critical path tests only
npm test -- critical-path
```

**Test Coverage:**
- ✅ Stripe webhook verification
- ✅ Idempotency key deduplication
- ✅ Password reset token expiry
- ✅ Database transaction atomicity
- ✅ Input validation DTOs

---

## Deployment Checklist

### Pre-Launch Security

- [ ] Environment variables configured (no secrets in code)
- [ ] HTTPS/SSL certificates installed
- [ ] JWT secrets rotated and strong
- [ ] Database password complex (16+ chars, mixed case, numbers, symbols)
- [ ] Rate limiting configured
- [ ] CORS whitelist configured
- [ ] Security headers set (HSTS, X-Frame-Options, etc.)
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

### Pre-Launch Operations

- [ ] Database backups configured (automated daily)
- [ ] Monitoring and alerting set up (CloudWatch, Sentry)
- [ ] Log aggregation configured
- [ ] CDN configured for static assets
- [ ] Health check endpoints verified
- [ ] Load testing completed (JMeter, k6)
- [ ] Penetration testing completed
- [ ] Disaster recovery plan documented
- [ ] Runbook for common issues created

### Pre-Launch Business

- [ ] Terms of Service reviewed by legal
- [ ] Privacy Policy compliant (Privacy Act 1988)
- [ ] ABN validation API credentials activated
- [ ] Stripe production account activated
- [ ] Twilio SMS rates confirmed
- [ ] SendGrid email limits increased
- [ ] AWS costs estimated and budgeted
- [ ] Payment processing fees calculated
- [ ] Commission structure approved

---

## Critical Features

### Production Hardening Implemented

1. **Stripe Webhook Verification** (CRITICAL_FIX_001)
   - HMAC-SHA256 signature validation
   - Trusted event types only
   - Transactional event processing
   - Audit logging on failures

2. **Stripe Idempotency Keys** (CRITICAL_FIX_002)
   - Deterministic key generation (SHA256 hash)
   - Redis caching (24-hour TTL)
   - Duplicate payment prevention
   - Amount validation on retries

3. **Password Reset Expiry** (CRITICAL_FIX_003)
   - 15-minute token expiration
   - Bcrypt token hashing
   - One-time use enforcement
   - Email enumeration prevention

4. **Transaction Atomicity** (CRITICAL_FIX_004)
   - SERIALIZABLE isolation level
   - Pessimistic row locking
   - Webhook compensation for edge cases
   - All-or-nothing payment processing

5. **Input Validation DTOs** (CRITICAL_FIX_005)
   - Class-validator decorators
   - Enum type checking
   - Whitelist/forbid unknown properties
   - Custom validators for business logic

---

## Monitoring & Alerting

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Database
curl http://localhost:3001/health/db

# Redis
curl http://localhost:3001/health/redis
```

### Metrics

Monitor these KPIs:
- API response time (target: <200ms p95)
- Database query time (target: <100ms p95)
- Payment success rate (target: >99%)
- Error rate (target: <0.1%)
- Webhook delivery success (target: 100%)

### Alerts

Critical alerts triggered for:
- Payment webhook failures
- Database connection loss
- Redis connection loss
- High error rate (>1%)
- High latency (p95 > 500ms)
- Failed login attempts spike
- Webhook compensation triggered

---

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and add tests
3. Commit: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open Pull Request

### Code Style

- ESLint for linting
- Prettier for formatting
- TypeScript strict mode
- Commit message format: `type(scope): message`

---

## Support

### Documentation
- API Docs: http://localhost:3001/api/docs
- Architecture: See `docs/ARCHITECTURE.md`
- Database: See `docs/DATABASE.md`
- Deployment: See `docs/DEPLOYMENT.md`

### Getting Help
- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Email: support@urbanhelp.com.au

### Security
Report security vulnerabilities to: security@urbanhelp.com.au

---

## License

MIT License - See LICENSE file

---

## Acknowledgments

Built with production-grade security, scalability, and reliability in mind.

**Status**: ✅ Production Ready
**Last Updated**: 2024
**Maintained By**: Urban Help Team
