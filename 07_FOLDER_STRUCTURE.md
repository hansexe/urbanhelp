# Urban Help - Folder Structure & Project Organization

## 1. Root Directory Structure

```
urban-help/
├── frontend/                    # Next.js React application
├── backend/                     # NestJS API server
├── infrastructure/              # Terraform, Docker, deployment configs
├── documentation/               # Project documentation
├── scripts/                     # Utility and setup scripts
├── .github/                     # GitHub Actions CI/CD
├── .gitignore
├── README.md
├── docker-compose.yml
├── package.json                 # Root workspace
├── lerna.json                   # Monorepo configuration
└── tsconfig.json                # TypeScript base config
```

---

## 2. Frontend (Next.js) Structure

```
frontend/
├── pages/                       # Next.js pages (auto-routing)
│   ├── index.tsx                # Homepage
│   ├── auth/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   └── verify-otp.tsx
│   ├── search/
│   │   └── [searchType].tsx     # Dynamic search page
│   ├── business/
│   │   ├── [businessId].tsx     # Business profile
│   │   └── register/
│   │       ├── step1.tsx
│   │       ├── step2.tsx
│   │       ├── step3.tsx
│   │       ├── step4.tsx
│   │       └── step5.tsx
│   ├── bookings/
│   │   ├── index.tsx            # Booking history
│   │   ├── [bookingId].tsx      # Booking details
│   │   └── [bookingId]/confirm.tsx
│   ├── dashboard/
│   │   ├── index.tsx            # Main dashboard
│   │   ├── customer/
│   │   │   ├── index.tsx
│   │   │   └── profile.tsx
│   │   └── business/
│   │       ├── index.tsx
│   │       ├── profile.tsx
│   │       └── earnings.tsx
│   ├── admin/
│   │   ├── index.tsx
│   │   ├── approvals.tsx
│   │   ├── users.tsx
│   │   ├── bookings.tsx
│   │   ├── payments.tsx
│   │   └── analytics.tsx
│   ├── api/
│   │   └── [route].ts           # API routes (webhooks)
│   ├── _app.tsx                 # Global app wrapper
│   ├── _document.tsx            # Custom document
│   └── 404.tsx
│
├── components/
│   ├── layouts/
│   │   ├── MainLayout.tsx       # Main layout wrapper
│   │   ├── AuthLayout.tsx       # Auth pages layout
│   │   ├── AdminLayout.tsx      # Admin layout
│   │   └── Header.tsx           # Sticky header
│   │
│   ├── common/                  # Reusable components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── Form/
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Radio.tsx
│   │   │   ├── Textarea.tsx
│   │   │   └── FormGroup.tsx
│   │   ├── Navigation/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Breadcrumb.tsx
│   │   └── Images/
│   │       ├── ImageGallery.tsx
│   │       ├── ImageUpload.tsx
│   │       └── OptimizedImage.tsx
│   │
│   ├── auth/                    # Auth-specific components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── OTPInput.tsx
│   │   └── PasswordReset.tsx
│   │
│   ├── search/                  # Search components
│   │   ├── SearchFilters.tsx
│   │   ├── SearchResults.tsx
│   │   ├── BusinessCard.tsx
│   │   ├── AddressAutocomplete.tsx
│   │   └── Pagination.tsx
│   │
│   ├── business/                # Business components
│   │   ├── BusinessProfile.tsx
│   │   ├── BusinessGallery.tsx
│   │   ├── BusinessHours.tsx
│   │   ├── ReviewsList.tsx
│   │   ├── RatingStars.tsx
│   │   └── BookingButton.tsx
│   │
│   ├── booking/                 # Booking components
│   │   ├── BookingForm.tsx
│   │   ├── BookingDetails.tsx
│   │   ├── BookingTimePicker.tsx
│   │   ├── BookingHistory.tsx
│   │   └── BookingStatus.tsx
│   │
│   ├── payment/                 # Payment components
│   │   ├── PaymentForm.tsx
│   │   ├── StripeCheckout.tsx
│   │   ├── PaymentStatus.tsx
│   │   └── InvoiceDownload.tsx
│   │
│   ├── admin/                   # Admin components
│   │   ├── ApprovalQueue.tsx
│   │   ├── UserManagement.tsx
│   │   ├── PaymentDashboard.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   └── ReportGenerator.tsx
│   │
│   └── dashboard/               # Dashboard components
│       ├── StatsCard.tsx
│       ├── QuickStats.tsx
│       ├── RecentActivity.tsx
│       └── Chart.tsx
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts              # Auth state and methods
│   ├── useApi.ts               # API call wrapper
│   ├── useForm.ts              # Form handling
│   ├── usePagination.ts        # Pagination logic
│   ├── useGeolocation.ts       # Location services
│   ├── useLocalStorage.ts      # Local storage
│   └── useDebounce.ts          # Debounce utility
│
├── contexts/                    # React contexts
│   ├── AuthContext.tsx         # Auth state provider
│   ├── UserContext.tsx         # User state
│   ├── NotificationContext.tsx # Notification state
│   └── ThemeContext.tsx        # Theme provider (future)
│
├── lib/                         # Utilities and helpers
│   ├── api.ts                  # API client (axios/fetch)
│   ├── auth.ts                 # Auth utilities
│   ├── validators.ts           # Form validators
│   ├── formatters.ts           # Data formatting
│   ├── constants.ts            # App constants
│   ├── errors.ts               # Error handlers
│   └── helpers/
│       ├── date.ts             # Date utilities
│       ├── string.ts           # String utilities
│       ├── number.ts           # Number utilities
│       └── geo.ts              # Geolocation utilities
│
├── services/                    # Business logic
│   ├── authService.ts          # Authentication logic
│   ├── businessService.ts      # Business operations
│   ├── bookingService.ts       # Booking operations
│   ├── paymentService.ts       # Payment handling
│   ├── searchService.ts        # Search logic
│   ├── notificationService.ts  # Notifications
│   └── uploadService.ts        # File uploads
│
├── store/                       # State management (Redux)
│   ├── index.ts
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── userSlice.ts
│   │   ├── bookingSlice.ts
│   │   ├── searchSlice.ts
│   │   └── uiSlice.ts
│   └── middleware/
│       ├── apiMiddleware.ts
│       └── persistMiddleware.ts
│
├── styles/                      # Global styles
│   ├── globals.css             # Global CSS
│   ├── variables.css           # CSS variables (colors, spacing)
│   ├── typography.css          # Font definitions
│   ├── animations.css          # Keyframe animations
│   └── tailwind.config.js      # Tailwind CSS config
│
├── public/                      # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero/
│   │   └── icons/
│   ├── fonts/
│   │   ├── Inter/
│   │   └── Poppins/
│   └── manifest.json
│
├── config/
│   ├── environment.ts          # Environment config
│   ├── api.config.ts           # API configuration
│   └── stripe.config.ts        # Stripe setup
│
├── types/                       # TypeScript type definitions
│   ├── index.ts                # Re-export all types
│   ├── api.ts                  # API response types
│   ├── models.ts               # Data model types
│   ├── auth.ts                 # Auth types
│   ├── booking.ts              # Booking types
│   ├── business.ts             # Business types
│   └── common.ts               # Common types
│
├── __tests__/                   # Test files
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── __fixtures__/           # Test data
│
├── next.config.js              # Next.js config
├── tsconfig.json               # TypeScript config
├── .env.example                # Example env variables
├── .env.local                  # Local env (gitignored)
├── jest.config.js              # Jest testing config
├── package.json
└── README.md
```

---

## 3. Backend (NestJS) Structure

```
backend/
├── src/
│   ├── main.ts                 # Application entry point
│   │
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── verify-otp.dto.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── otp.guard.ts
│   │   └── decorators/
│   │       ├── current-user.decorator.ts
│   │       └── roles.decorator.ts
│   │
│   ├── customers/
│   │   ├── customers.controller.ts
│   │   ├── customers.service.ts
│   │   ├── customers.module.ts
│   │   ├── entities/
│   │   │   └── customer.entity.ts
│   │   └── dto/
│   │       ├── create-customer.dto.ts
│   │       ├── update-customer.dto.ts
│   │       └── customer.dto.ts
│   │
│   ├── businesses/
│   │   ├── businesses.controller.ts
│   │   ├── businesses.service.ts
│   │   ├── businesses.module.ts
│   │   ├── entities/
│   │   │   ├── business.entity.ts
│   │   │   ├── business-service.entity.ts
│   │   │   ├── business-hours.entity.ts
│   │   │   └── business-image.entity.ts
│   │   └── dto/
│   │       ├── create-business.dto.ts
│   │       ├── update-business.dto.ts
│   │       └── business.dto.ts
│   │
│   ├── search/
│   │   ├── search.controller.ts
│   │   ├── search.service.ts
│   │   ├── search.module.ts
│   │   └── filters/
│   │       └── search-filter.ts
│   │
│   ├── bookings/
│   │   ├── bookings.controller.ts
│   │   ├── bookings.service.ts
│   │   ├── bookings.module.ts
│   │   ├── entities/
│   │   │   └── booking.entity.ts
│   │   └── dto/
│   │       ├── create-booking.dto.ts
│   │       ├── update-booking.dto.ts
│   │       └── booking.dto.ts
│   │
│   ├── payments/
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   ├── payments.module.ts
│   │   ├── entities/
│   │   │   └── payment.entity.ts
│   │   └── dto/
│   │       ├── create-payment.dto.ts
│   │       └── payment-webhook.dto.ts
│   │
│   ├── reviews/
│   │   ├── reviews.controller.ts
│   │   ├── reviews.service.ts
│   │   ├── reviews.module.ts
│   │   ├── entities/
│   │   │   └── review.entity.ts
│   │   └── dto/
│   │       ├── create-review.dto.ts
│   │       └── review.dto.ts
│   │
│   ├── notifications/
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   ├── notifications.module.ts
│   │   ├── entities/
│   │   │   └── notification.entity.ts
│   │   └── providers/
│   │       ├── twilio.provider.ts
│   │       ├── sendgrid.provider.ts
│   │       └── firebase.provider.ts
│   │
│   ├── admin/
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   ├── admin.module.ts
│   │   ├── dto/
│   │   │   └── admin-stats.dto.ts
│   │   └── services/
│   │       ├── approval.service.ts
│   │       ├── analytics.service.ts
│   │       └── reporting.service.ts
│   │
│   ├── uploads/
│   │   ├── uploads.controller.ts
│   │   ├── uploads.service.ts
│   │   ├── uploads.module.ts
│   │   └── providers/
│   │       └── s3.provider.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── transform.decorator.ts
│   │   │   └── validate.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts
│   │   │   └── parse-uuid.pipe.ts
│   │   └── middleware/
│   │       ├── logger.middleware.ts
│   │       ├── cors.middleware.ts
│   │       └── rate-limit.middleware.ts
│   │
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 001_init_schema.sql
│   │   │   └── ...
│   │   ├── seeds/
│   │   │   ├── seed.module.ts
│   │   │   └── seed.service.ts
│   │   └── orm-config.ts
│   │
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── stripe.config.ts
│   │   ├── twilio.config.ts
│   │   ├── sendgrid.config.ts
│   │   └── aws.config.ts
│   │
│   ├── constants/
│   │   ├── app.constants.ts
│   │   ├── error.constants.ts
│   │   └── message.constants.ts
│   │
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── helpers.ts
│   │   ├── password.util.ts
│   │   ├── jwt.util.ts
│   │   └── geo.util.ts
│   │
│   ├── queue/
│   │   ├── jobs/
│   │   │   ├── send-sms.job.ts
│   │   │   ├── send-email.job.ts
│   │   │   └── process-payment.job.ts
│   │   ├── queue.module.ts
│   │   └── queue.service.ts
│   │
│   └── app.module.ts            # Root module
│
├── test/                        # Integration tests
│   ├── auth.e2e-spec.ts
│   ├── bookings.e2e-spec.ts
│   ├── payments.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example
├── .env.test
├── .env.development
├── .env.production
│
├── docker-compose.dev.yml       # Development database setup
├── tsconfig.json
├── tsconfig.build.json
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── package.json
└── README.md
```

---

## 4. Infrastructure (IaC) Structure

```
infrastructure/
├── terraform/
│   ├── main.tf                 # Main Terraform config
│   ├── variables.tf            # Variable definitions
│   ├── outputs.tf              # Output definitions
│   ├── providers.tf            # Provider config
│   │
│   ├── modules/
│   │   ├── vpc/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── rds/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── ecs/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── alb/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── elasticache/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── s3/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   └── cloudfront/
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       └── outputs.tf
│   │
│   ├── environments/
│   │   ├── dev.tfvars
│   │   ├── staging.tfvars
│   │   └── production.tfvars
│   │
│   └── .terraform.lock.hcl
│
├── docker/
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx.Dockerfile
│
├── kubernetes/
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   ├── backend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── configmap.yaml
│   ├── database/
│   │   ├── statefulset.yaml
│   │   └── service.yaml
│   └── kustomization.yaml
│
├── scripts/
│   ├── deploy.sh
│   ├── rollback.sh
│   ├── health-check.sh
│   └── setup-prod.sh
│
├── monitoring/
│   ├── cloudwatch-alarms.tf
│   ├── dashboards.tf
│   └── logs.tf
│
└── README.md
```

---

## 5. Database Structure

```
database/
├── migrations/
│   ├── V001__initial_schema.sql
│   ├── V002__add_indexes.sql
│   ├── V003__add_constraints.sql
│   └── V004__add_audit_logs.sql
│
├── seeds/
│   ├── 01_service_categories.sql
│   ├── 02_states.sql
│   └── 03_test_data.sql
│
└── scripts/
    ├── backup.sh
    ├── restore.sh
    └── optimize.sh
```

---

## 6. GitHub Actions CI/CD

```
.github/
├── workflows/
│   ├── frontend-test.yml       # Frontend tests
│   ├── backend-test.yml        # Backend tests
│   ├── frontend-build.yml      # Frontend build
│   ├── backend-build.yml       # Backend build
│   ├── deploy-staging.yml      # Deploy to staging
│   ├── deploy-prod.yml         # Deploy to production
│   ├── security-scan.yml       # Security scanning
│   └── performance.yml         # Performance testing
│
└── CODEOWNERS                  # Code review assignments
```

---

## 7. Documentation Structure

```
documentation/
├── README.md                   # Documentation index
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── DEPLOYMENT.md
├── CONTRIBUTING.md
├── TESTING.md
├── SECURITY.md
├── TROUBLESHOOTING.md
│
├── guides/
│   ├── getting-started.md
│   ├── development-setup.md
│   ├── deployment-guide.md
│   └── testing-guide.md
│
├── api/
│   ├── authentication.md
│   ├── customers.md
│   ├── businesses.md
│   ├── bookings.md
│   ├── payments.md
│   └── admin.md
│
└── design/
    ├── design-system.md
    ├── components.md
    └── patterns.md
```

---

## 8. Naming Conventions

### Files
- **Components**: PascalCase (e.g., `BusinessCard.tsx`)
- **Services/Utils**: camelCase (e.g., `authService.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Tests**: `<name>.test.ts` or `<name>.spec.ts`
- **Styles**: camelCase matching component (e.g., `businessCard.module.css`)

### Variables & Functions
- **Constants**: UPPER_SNAKE_CASE
- **Variables**: camelCase
- **Functions**: camelCase
- **Classes**: PascalCase
- **Interfaces/Types**: PascalCase with `I` prefix (optional)

### Database
- **Tables**: snake_case, plural (e.g., `business_services`)
- **Columns**: snake_case, singular (e.g., `service_type`)
- **Indexes**: `idx_<table>_<column>`
- **Constraints**: `<type>_<table>_<column>`

### Branches
- Feature: `feature/feature-name`
- Fix: `fix/bug-name`
- Release: `release/v1.0.0`
- Hotfix: `hotfix/issue-name`

---

## 9. File Size Guidelines

| File Type | Max Size | Target |
|-----------|----------|--------|
| Component | 300 lines | 150-200 lines |
| Service | 500 lines | 300-400 lines |
| Controller | 200 lines | 100-150 lines |
| Module | 50 lines | 30-40 lines |
| Page | 300 lines | 150-200 lines |

---

## 10. Import Organization

```typescript
// 1. External modules
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

// 2. Internal modules
import { AuthContext } from '@/contexts';
import { Button, Card } from '@/components';
import { authService } from '@/services';

// 3. Types
import type { User, Business } from '@/types';

// 4. Styles
import styles from './Component.module.css';
```

---

**Document Version:** 1.0
**Last Updated:** June 2026
**Status:** Draft
