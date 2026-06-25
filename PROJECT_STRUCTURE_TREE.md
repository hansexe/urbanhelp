# Urban Help - Complete Project Structure

## Directory Tree

```
urbanhelp/
│
├── frontend/                                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                                # Next.js App Router (main routing)
│   │   ├── pages/                              # Page components
│   │   │   ├── _app.tsx                        # App root with providers
│   │   │   ├── _document.tsx                   # Document HTML structure
│   │   │   ├── index.tsx                       # Home page
│   │   │   ├── 404.tsx                         # Not found page
│   │   │   ├── api/                            # API routes (if any)
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx                   # Login page
│   │   │   │   ├── register.tsx                # Registration page
│   │   │   │   ├── reset-password.tsx          # Password reset page
│   │   │   │   └── verify-otp.tsx              # OTP verification
│   │   │   ├── search/
│   │   │   │   ├── index.tsx                   # Business search
│   │   │   │   └── [id].tsx                    # Business details
│   │   │   ├── business/
│   │   │   │   ├── register.tsx                # Business registration
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── index.tsx               # Dashboard overview
│   │   │   │   │   ├── services.tsx            # Manage services
│   │   │   │   │   ├── hours.tsx               # Manage hours
│   │   │   │   │   ├── bookings.tsx            # View bookings
│   │   │   │   │   ├── payments.tsx            # Payment history
│   │   │   │   │   └── analytics.tsx           # Revenue analytics
│   │   │   │   └── [id].tsx                    # Public business profile
│   │   │   ├── bookings/
│   │   │   │   ├── index.tsx                   # My bookings
│   │   │   │   ├── [id].tsx                    # Booking details
│   │   │   │   └── create.tsx                  # Create booking
│   │   │   ├── payments/
│   │   │   │   ├── index.tsx                   # Payment history
│   │   │   │   ├── [id].tsx                    # Payment details
│   │   │   │   └── return.tsx                  # Payment return page
│   │   │   ├── reviews/
│   │   │   │   ├── index.tsx                   # My reviews
│   │   │   │   └── create.tsx                  # Leave review
│   │   │   ├── profile/
│   │   │   │   ├── index.tsx                   # My profile
│   │   │   │   ├── settings.tsx                # Settings
│   │   │   │   └── addresses.tsx               # Saved addresses
│   │   │   ├── legal/
│   │   │   │   ├── privacy.tsx                 # Privacy policy
│   │   │   │   ├── terms.tsx                   # Terms of service
│   │   │   │   ├── refunds.tsx                 # Refund policy
│   │   │   │   └── cookies.tsx                 # Cookie policy
│   │   │   └── admin/
│   │   │       ├── index.tsx                   # Admin dashboard
│   │   │       ├── approvals.tsx               # Business approvals
│   │   │       ├── users.tsx                   # User management
│   │   │       └── reports.tsx                 # Platform reports
│   │   │
│   │   ├── components/                         # Reusable React components
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── OtpInput.tsx
│   │   │   ├── Business/
│   │   │   │   ├── BusinessCard.tsx
│   │   │   │   ├── BusinessList.tsx
│   │   │   │   ├── BusinessProfile.tsx
│   │   │   │   ├── ServiceForm.tsx
│   │   │   │   └── HoursSelector.tsx
│   │   │   ├── Booking/
│   │   │   │   ├── BookingForm.tsx
│   │   │   │   ├── BookingCard.tsx
│   │   │   │   ├── BookingList.tsx
│   │   │   │   └── TimeSlotSelector.tsx
│   │   │   ├── Payment/
│   │   │   │   ├── StripePaymentForm.tsx
│   │   │   │   ├── PaymentHistory.tsx
│   │   │   │   └── PaymentStatus.tsx
│   │   │   ├── Review/
│   │   │   │   ├── ReviewForm.tsx
│   │   │   │   ├── ReviewCard.tsx
│   │   │   │   └── RatingStars.tsx
│   │   │   ├── Common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   ├── Error.tsx
│   │   │   │   ├── Pagination.tsx
│   │   │   │   └── SearchBar.tsx
│   │   │   └── Maps/
│   │   │       ├── GooglePlacesInput.tsx
│   │   │       ├── GoogleMap.tsx
│   │   │       └── LocationPicker.tsx
│   │   │
│   │   ├── hooks/                              # Custom React hooks
│   │   │   ├── useAuth.ts                      # Authentication hook
│   │   │   ├── useApi.ts                       # API calls hook
│   │   │   ├── useForm.ts                      # Form handling hook
│   │   │   ├── useLocalStorage.ts              # Local storage hook
│   │   │   ├── usePagination.ts                # Pagination hook
│   │   │   ├── useDebounce.ts                  # Debounce hook
│   │   │   └── useGeolocation.ts               # Geolocation hook
│   │   │
│   │   ├── services/                           # API services
│   │   │   ├── api.ts                          # Axios instance with interceptors
│   │   │   ├── authService.ts                  # Auth endpoints
│   │   │   ├── businessService.ts              # Business endpoints
│   │   │   ├── bookingService.ts               # Booking endpoints
│   │   │   ├── paymentService.ts               # Payment endpoints
│   │   │   ├── reviewService.ts                # Review endpoints
│   │   │   ├── searchService.ts                # Search endpoints
│   │   │   └── uploadService.ts                # File upload
│   │   │
│   │   ├── store/                              # Zustand state management
│   │   │   ├── authStore.ts                    # Auth state
│   │   │   ├── searchStore.ts                  # Search filters
│   │   │   ├── bookingStore.ts                 # Booking state
│   │   │   ├── cartStore.ts                    # Shopping cart
│   │   │   ├── notificationStore.ts            # Toast/notification state
│   │   │   └── uiStore.ts                      # UI state (modals, etc.)
│   │   │
│   │   ├── types/                              # TypeScript type definitions
│   │   │   ├── index.ts                        # All type exports
│   │   │   ├── user.ts
│   │   │   ├── business.ts
│   │   │   ├── booking.ts
│   │   │   ├── payment.ts
│   │   │   ├── review.ts
│   │   │   ├── common.ts
│   │   │   └── api.ts
│   │   │
│   │   ├── utils/                              # Utility functions
│   │   │   ├── validation.ts                   # Form validation
│   │   │   ├── formatting.ts                   # Date, currency formatting
│   │   │   ├── constants.ts                    # App constants
│   │   │   ├── errors.ts                       # Error handling
│   │   │   └── helpers.ts                      # Generic helpers
│   │   │
│   │   ├── styles/                             # Global CSS
│   │   │   ├── globals.css                     # Global styles
│   │   │   ├── variables.css                   # CSS variables
│   │   │   └── tailwind.css                    # Tailwind imports
│   │   │
│   │   └── context/                            # React Context API
│   │       └── AuthContext.tsx
│   │
│   ├── public/                                 # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── favicon.ico
│   │
│   ├── .env.local                              # Frontend env vars
│   ├── .env.example                            # Env template
│   ├── .eslintrc.json                          # ESLint config
│   ├── .prettierrc                             # Prettier config
│   ├── jest.config.js                          # Jest testing config
│   ├── next.config.js                          # Next.js config
│   ├── package.json                            # Frontend dependencies
│   ├── tsconfig.json                           # TypeScript config
│   ├── Dockerfile                              # Frontend Docker image
│   └── README.md                               # Frontend documentation
│
├── backend/                                    # NestJS Backend API
│   ├── src/
│   │   ├── main.ts                             # Bootstrap file
│   │   │
│   │   ├── app.module.ts                       # Root module (imports all modules)
│   │   │
│   │   ├── config/                             # Configuration
│   │   │   ├── config.ts                       # Main config with all env vars
│   │   │   ├── database.config.ts              # Database connection
│   │   │   ├── stripe.config.ts                # Stripe configuration
│   │   │   ├── twilio.config.ts                # Twilio configuration
│   │   │   ├── sendgrid.config.ts              # SendGrid configuration
│   │   │   └── aws.config.ts                   # AWS S3 configuration
│   │   │
│   │   ├── entities/                           # TypeORM Database Entities
│   │   │   ├── user.entity.ts
│   │   │   ├── customer.entity.ts
│   │   │   ├── business.entity.ts
│   │   │   ├── business-service.entity.ts
│   │   │   ├── business-hours.entity.ts
│   │   │   ├── business-image.entity.ts
│   │   │   ├── business-banking-details.entity.ts
│   │   │   ├── booking.entity.ts
│   │   │   ├── payment.entity.ts
│   │   │   ├── review.entity.ts
│   │   │   ├── notification.entity.ts
│   │   │   ├── otp-code.entity.ts
│   │   │   └── audit-log.entity.ts
│   │   │
│   │   ├── dtos/                               # Data Transfer Objects
│   │   │   ├── auth/
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── verify-otp.dto.ts
│   │   │   │   └── reset-password.dto.ts
│   │   │   ├── business/
│   │   │   │   ├── register-business.dto.ts
│   │   │   │   ├── update-business.dto.ts
│   │   │   │   └── business-banking.dto.ts
│   │   │   ├── booking/
│   │   │   │   ├── create-booking.dto.ts
│   │   │   │   ├── update-booking.dto.ts
│   │   │   │   └── cancel-booking.dto.ts
│   │   │   ├── payment/
│   │   │   │   ├── create-payment-intent.dto.ts
│   │   │   │   ├── confirm-payment.dto.ts
│   │   │   │   └── refund-payment.dto.ts
│   │   │   ├── review/
│   │   │   │   ├── create-review.dto.ts
│   │   │   │   └── update-review.dto.ts
│   │   │   └── common/
│   │   │       ├── pagination.dto.ts
│   │   │       └── filter.dto.ts
│   │   │
│   │   ├── modules/                            # Feature Modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   └── local.strategy.ts
│   │   │   │   └── guards/
│   │   │   │       ├── jwt-auth.guard.ts
│   │   │   │       └── roles.guard.ts
│   │   │   │
│   │   │   ├── businesses/
│   │   │   │   ├── businesses.module.ts
│   │   │   │   ├── businesses.service.ts
│   │   │   │   ├── businesses.controller.ts
│   │   │   │   ├── abn-validation.service.ts
│   │   │   │   └── business-approval.service.ts
│   │   │   │
│   │   │   ├── bookings/
│   │   │   │   ├── bookings.module.ts
│   │   │   │   ├── bookings.service.ts
│   │   │   │   ├── bookings.controller.ts
│   │   │   │   └── booking-acceptance.service.ts
│   │   │   │
│   │   │   ├── payments/
│   │   │   │   ├── payments.module.ts
│   │   │   │   ├── payment.service.ts
│   │   │   │   ├── stripe-payment.service.ts
│   │   │   │   ├── stripe-webhook.service.ts
│   │   │   │   ├── stripe-payout.service.ts
│   │   │   │   ├── payments.controller.ts
│   │   │   │   └── stripe-webhook.controller.ts
│   │   │   │
│   │   │   ├── reviews/
│   │   │   │   ├── reviews.module.ts
│   │   │   │   ├── reviews.service.ts
│   │   │   │   └── reviews.controller.ts
│   │   │   │
│   │   │   ├── customers/
│   │   │   │   ├── customers.module.ts
│   │   │   │   ├── customers.service.ts
│   │   │   │   ├── customers.controller.ts
│   │   │   │   └── customer-dashboard.service.ts
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── notifications.module.ts
│   │   │   │   ├── sendgrid.service.ts
│   │   │   │   ├── twilio.service.ts
│   │   │   │   └── notification-queue.service.ts
│   │   │   │
│   │   │   ├── search/
│   │   │   │   ├── search.module.ts
│   │   │   │   ├── search.service.ts
│   │   │   │   └── search.controller.ts
│   │   │   │
│   │   │   ├── upload/
│   │   │   │   ├── upload.module.ts
│   │   │   │   ├── s3.service.ts
│   │   │   │   └── upload.controller.ts
│   │   │   │
│   │   │   ├── location/
│   │   │   │   ├── location.module.ts
│   │   │   │   ├── google-places.service.ts
│   │   │   │   ├── geolocation.service.ts
│   │   │   │   └── location.controller.ts
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── admin.module.ts
│   │   │       ├── admin.service.ts
│   │   │       └── admin.controller.ts
│   │   │
│   │   └── common/                             # Shared Utilities
│   │       ├── guards/
│   │       │   ├── jwt-auth.guard.ts
│   │       │   ├── roles.guard.ts
│   │       │   └── api-key.guard.ts
│   │       │
│   │       ├── decorators/
│   │       │   ├── roles.decorator.ts
│   │       │   ├── current-user.decorator.ts
│   │       │   ├── public.decorator.ts
│   │       │   └── throttle.decorator.ts
│   │       │
│   │       ├── filters/
│   │       │   ├── http-exception.filter.ts
│   │       │   ├── validation-exception.filter.ts
│   │       │   └── all-exceptions.filter.ts
│   │       │
│   │       ├── interceptors/
│   │       │   ├── logging.interceptor.ts
│   │       │   ├── transform.interceptor.ts
│   │       │   ├── error.interceptor.ts
│   │       │   └── timeout.interceptor.ts
│   │       │
│   │       ├── pipes/
│   │       │   ├── validation.pipe.ts
│   │       │   └── parse-uuid.pipe.ts
│   │       │
│   │       ├── middlewares/
│   │       │   ├── rate-limit.middleware.ts
│   │       │   ├── request-id.middleware.ts
│   │       │   ├── cors.middleware.ts
│   │       │   └── security-headers.middleware.ts
│   │       │
│   │       ├── services/
│   │       │   ├── redis.service.ts
│   │       │   ├── audit.service.ts
│   │       │   ├── email-queue.service.ts
│   │       │   ├── sms-queue.service.ts
│   │       │   ├── payout-queue.service.ts
│   │       │   └── account-lockout.service.ts
│   │       │
│   │       ├── enums/
│   │       │   ├── user-role.enum.ts
│   │       │   ├── booking-status.enum.ts
│   │       │   ├── payment-status.enum.ts
│   │       │   ├── business-status.enum.ts
│   │       │   └── business-category.enum.ts
│   │       │
│   │       └── utils/
│   │           ├── validators/
│   │           │   ├── abn.validator.ts
│   │           │   ├── phone.validator.ts
│   │           │   ├── postcode.validator.ts
│   │           │   └── bsb.validator.ts
│   │           ├── helpers/
│   │           │   ├── hashing.ts
│   │           │   ├── jwt.ts
│   │           │   ├── pagination.ts
│   │           │   └── response.ts
│   │           └── constants.ts
│   │
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 1000000000000-CreateUsersTable.ts
│   │   │   ├── 1000000000001-CreateBusinessesTable.ts
│   │   │   ├── 1000000000002-CreateBookingsTable.ts
│   │   │   └── ...
│   │   ├── seeds/
│   │   │   ├── seed.ts
│   │   │   ├── users.seed.ts
│   │   │   ├── businesses.seed.ts
│   │   │   └── ...
│   │   └── schema.sql
│   │
│   ├── test/
│   │   ├── critical-path.real-integration.spec.ts
│   │   ├── auth.service.spec.ts
│   │   ├── bookings.service.spec.ts
│   │   ├── payments.service.spec.ts
│   │   ├── jest-e2e.json
│   │   └── e2e/
│   │       ├── auth.e2e.spec.ts
│   │       ├── bookings.e2e.spec.ts
│   │       └── payments.e2e.spec.ts
│   │
│   ├── .env.local                              # Backend env vars
│   ├── .env.example                            # Env template
│   ├── .eslintrc.js                            # ESLint config
│   ├── .prettierrc                             # Prettier config
│   ├── jest.config.js                          # Jest testing config
│   ├── nest-cli.json                           # NestJS CLI config
│   ├── package.json                            # Backend dependencies
│   ├── tsconfig.json                           # TypeScript config
│   ├── tsconfig.build.json                     # Build TypeScript config
│   ├── Dockerfile                              # Backend Docker image
│   └── README.md                               # Backend documentation
│
├── infrastructure/                             # Infrastructure as Code (Terraform)
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── vpc.tf
│   ├── rds.tf
│   ├── elasticache.tf
│   ├── ecs.tf
│   ├── alb.tf
│   ├── s3.tf
│   ├── iam.tf
│   ├── security-groups.tf
│   └── terraform.tfvars.example
│
├── .github/
│   ├── workflows/
│   │   ├── test.yml                            # Run tests on PR
│   │   ├── build.yml                           # Build Docker images
│   │   └── deploy.yml                          # Deploy to AWS ECS
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       ├── feature_request.md
│       └── security_issue.md
│
├── nginx/
│   ├── nginx.conf                              # Nginx configuration
│   └── ssl/
│       ├── cert.pem                            # SSL certificate (local dev)
│       └── key.pem                             # SSL key (local dev)
│
├── docs/
│   ├── ARCHITECTURE.md                         # System architecture
│   ├── DATABASE.md                             # Database schema documentation
│   ├── API.md                                  # API endpoints and examples
│   ├── DEPLOYMENT.md                           # Deployment guide
│   ├── SECURITY.md                             # Security considerations
│   ├── CONTRIBUTING.md                         # Contribution guidelines
│   └── TROUBLESHOOTING.md                      # Common issues and solutions
│
├── scripts/
│   ├── setup.sh                                # Local development setup
│   ├── seed-db.sh                              # Seed database with test data
│   ├── backup-db.sh                            # Backup production database
│   ├── restore-db.sh                           # Restore database from backup
│   └── migrate.sh                              # Run database migrations
│
├── .env.example                                # Root environment template
├── .env.local                                  # Local environment vars (not in git)
├── .gitignore                                  # Git ignore file
├── .editorconfig                               # Editor configuration
├── docker-compose.yml                          # Docker Compose for local dev
├── docker-compose.prod.yml                     # Docker Compose for production-like
├── package.json                                # Root package.json (optional monorepo)
├── turbo.json                                  # Turbo repo config (optional)
├── README.md                                   # Main README
├── LICENSE                                     # MIT License
├── SECURITY.md                                 # Security policy
└── CHANGELOG.md                                # Version history
```

---

## File Count Summary

| Directory | Count | Purpose |
|-----------|-------|---------|
| Backend Source | 100+ | API, services, middleware, entities |
| Frontend Source | 80+ | Pages, components, hooks, services |
| Config Files | 15+ | Database, Docker, environment |
| Tests | 50+ | Integration, unit, e2e tests |
| Documentation | 10+ | Architecture, API, deployment guides |
| Infrastructure | 10+ | Terraform IaC for AWS |
| CI/CD | 5+ | GitHub Actions workflows |

**Total: 280+ files**

---

## Key Files by Category

### Configuration Files
- `backend/package.json` - Backend dependencies
- `frontend/package.json` - Frontend dependencies
- `backend/tsconfig.json` - Backend TypeScript config
- `frontend/tsconfig.json` - Frontend TypeScript config
- `backend/nest-cli.json` - NestJS CLI configuration
- `frontend/next.config.js` - Next.js configuration
- `docker-compose.yml` - Local development services
- `.env.example` - Environment variables template

### Entry Points
- `backend/src/main.ts` - Backend bootstrap
- `frontend/src/pages/_app.tsx` - Frontend app root
- `frontend/pages/index.tsx` - Frontend home page

### Database
- `backend/src/entities/*` - 13 TypeORM entities
- `backend/database/migrations/*` - Database migrations
- `backend/database/seeds/*` - Seed data

### Authentication & Security
- `backend/src/modules/auth/*` - Auth service and controller
- `backend/src/modules/auth/strategies/*` - JWT strategy
- `backend/src/common/guards/*` - Auth guards
- `backend/src/common/decorators/*` - Custom decorators

### Payment Processing (Critical)
- `backend/src/modules/payments/stripe-webhook.service.ts` - Webhook verification
- `backend/src/modules/payments/stripe-payment.service.ts` - Payment intents & idempotency
- `backend/src/modules/payments/payment.service.ts` - Transaction handling
- `backend/src/dtos/payment/*.dto.ts` - Input validation

### Notifications
- `backend/src/modules/notifications/sendgrid.service.ts` - Email
- `backend/src/modules/notifications/twilio.service.ts` - SMS
- `backend/src/common/services/email-queue.service.ts` - Email queue

### Business Logic
- `backend/src/modules/businesses/*` - Business registration
- `backend/src/modules/bookings/*` - Booking system
- `backend/src/modules/reviews/*` - Review system
- `backend/src/modules/search/*` - Search functionality

### Testing
- `backend/test/critical-path.real-integration.spec.ts` - Integration tests
- `backend/test/*.spec.ts` - Unit tests
- `frontend/src/__tests__/*` - Frontend tests

### Infrastructure
- `infrastructure/main.tf` - AWS infrastructure
- `.github/workflows/*.yml` - CI/CD pipelines
- `docker-compose.yml` - Docker Compose

---

## Module Dependencies

```
AppModule (root)
├── AuthModule
│   └── JwtModule
├── BusinessesModule
│   └── AbnValidationService
├── BookingsModule
├── PaymentsModule
│   ├── StripePaymentService
│   ├── StripeWebhookService
│   └── StripePayoutService
├── ReviewsModule
├── CustomersModule
├── NotificationsModule
│   ├── SendGridService
│   └── TwilioService
├── SearchModule
├── UploadModule
│   └── S3Service
├── LocationModule
│   ├── GooglePlacesService
│   └── GeolocationService
├── AdminModule
├── ConfigModule
├── DatabaseModule
├── RedisModule
├── BullModule (Task Queues)
├── PassportModule
└── CommonModule
    ├── AuditService
    ├── RateLimitingMiddleware
    ├── JwtStrategy
    └── Guards & Decorators
```

---

## Environment Configuration Hierarchy

```
.env.example (template, in git)
        ↓
.env (local, git-ignored)
        ↓
docker-compose.yml (reads .env)
        ↓
Backend (NODE_ENV=development)
        ↓
Frontend (NEXT_PUBLIC_* prefixed vars)
```

---

## Deployment File Structure

For production deployment, only these directories are needed:

```
production/
├── backend/dist/               # Compiled JavaScript
├── frontend/.next/             # Next.js build output
├── docker-compose.prod.yml
├── nginx.conf
├── .env                        # Production env vars
└── infrastructure/             # Terraform configs
```

---

## File Size Estimates

| Component | Size |
|-----------|------|
| Backend source | ~800 KB |
| Frontend source | ~600 KB |
| Backend dist (compiled) | ~2 MB |
| Frontend .next (built) | ~5 MB |
| node_modules | ~1 GB |
| Docker images | ~600 MB |

---

## Critical Files for Launch

Must be configured before production deployment:

1. `.env` - All production secrets
2. `backend/package.json` - All dependencies
3. `frontend/package.json` - All dependencies
4. `docker-compose.yml` - Service configuration
5. `backend/src/config/config.ts` - Environment validation
6. `nginx/nginx.conf` - Reverse proxy setup
7. `infrastructure/*.tf` - AWS resources
8. `.github/workflows/deploy.yml` - CI/CD pipeline

---

## Recommended IDE Setup

**VS Code Extensions:**
- ESLint
- Prettier
- PostgreSQL
- Docker
- Kubernetes
- Thunder Client
- GitLens
- Better Comments

**.vscode/settings.json:**
```json
{
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["javascript", "typescript"],
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  }
}
```

---

## Monorepo Considerations

To convert to monorepo structure with Turbo:

```
root/
├── apps/
│   ├── api/           (backend)
│   └── web/           (frontend)
├── packages/
│   ├── ui/            (shared UI components)
│   ├── db/            (shared database config)
│   ├── config/        (shared config)
│   └── types/         (shared types)
├── turbo.json
└── package.json
```

This structure enables:
- Shared type definitions
- Shared UI components
- Code reuse
- Dependency management

---

**Status:** ✅ Production-Ready Structure
**Last Updated:** 2024
**Maintainer:** Urban Help Team
