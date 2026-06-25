# Urban Help - System Architecture

## 1. High-Level Architecture Overview

Urban Help is a marketplace platform connecting customers with service providers. The architecture follows a modern, scalable design with separation of concerns across frontend, backend, database, and third-party services.

### Architecture Diagram (Text Representation)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├──────────────────────────────┬──────────────────────────────────┤
│     Web Browser              │      Mobile Browser               │
│  (Next.js SPA + SSR)         │   (Responsive Next.js)           │
└──────────────────────────────┴──────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
┌───────────────▼─────────────────┐  ┌──────▼───────────────────────┐
│   API Gateway / Load Balancer   │  │   CDN (CloudFront)           │
│   (AWS ALB)                     │  │   - Static Assets             │
│   - SSL/TLS Termination         │  │   - Images                    │
│   - Rate Limiting               │  │   - CSS/JS Bundle            │
└───────────────┬─────────────────┘  └──────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────────┐
│                  APPLICATION LAYER (AWS ECS)                     │
├──────────────────────────────┬──────────────────────────────────┤
│   Backend API Server          │   Background Job Worker          │
│   (NestJS + Node.js)          │   (Bull Queue)                   │
│   - Authentication Service    │   - SMS Notifications           │
│   - Business Service          │   - Email Notifications         │
│   - Customer Service          │   - Payment Processing          │
│   - Booking Service           │   - Report Generation           │
│   - Search Service            │   - Image Processing            │
│   - Admin Service             │                                  │
│   - Payment Service           │                                  │
│   (Stripe Connect Integration)│                                  │
└──────────────┬────────────────────────────────┬─────────────────┘
               │                                │
    ┌──────────▼──────────┐         ┌──────────▼──────────┐
    │   PostgreSQL DB     │         │   Redis Cache       │
    │   (RDS)             │         │   (ElastiCache)     │
    │   - Primary DB      │         │   - Session Store   │
    │   - Read Replicas   │         │   - Rate Limit Keys │
    │   - Automated       │         │   - Search Cache    │
    │     Backups         │         └─────────────────────┘
    └────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
├─────────────────────┬──────────────────┬──────────────────────┤
│  Stripe Connect     │  Twilio SMS      │  Google Places API   │
│  - Payment Process. │  - OTP Delivery  │  - Address Lookup    │
│  - Payouts          │  - Notifications │  - Autocomplete      │
│  - Webhooks         │  - Webhooks      │                      │
├─────────────────────┼──────────────────┼──────────────────────┤
│  AWS S3             │  SendGrid Email  │  AWS CloudWatch      │
│  - Image Storage    │  - Email Notif.  │  - Logs & Metrics    │
│  - Secure Upload    │  - Templates     │  - Alarms            │
│  - CDN Delivery     │  - Webhooks      │  - Dashboards        │
└─────────────────────┴──────────────────┴──────────────────────┘
```

## 2. Architecture Components

### 2.1 Frontend Layer

**Technology Stack:**
- Next.js 13+ (React framework with SSR/SSG)
- TypeScript (type safety)
- Tailwind CSS (responsive styling)
- React Query (state management & API calls)
- Redux (if needed for complex state)
- Stripe.js (payment handling)

**Key Features:**
- Server-side rendering for SEO
- Static site generation for static pages
- Client-side hydration for interactivity
- Image optimization
- Automatic code splitting
- Mobile-first responsive design

**Deployment:**
- AWS CloudFront CDN for static assets
- Vercel or AWS S3 + CloudFront for SSR hosting
- Environment-specific configurations

### 2.2 Backend Layer

**Technology Stack:**
- Node.js runtime
- NestJS framework (TypeScript-first)
- Express.js (via NestJS)
- PostgreSQL driver (TypeORM or Prisma)

**Core Modules:**
1. **Authentication Module**
   - JWT token generation
   - OTP service integration
   - Session management
   - Role-based access control

2. **Customer Module**
   - Profile management
   - Address management
   - Booking history
   - Reviews and ratings

3. **Business Module**
   - Business registration
   - Profile management
   - Service categories
   - Operating hours
   - Availability management

4. **Search Module**
   - Elasticsearch for fast searching (optional, for scale)
   - Location-based queries
   - Filter and sort operations
   - Distance calculation

5. **Booking Module**
   - Booking creation and management
   - Status transitions
   - Business acceptance/decline
   - Appointment scheduling

6. **Payment Module**
   - Stripe Connect integration
   - Payment processing
   - Commission calculation
   - Payout management
   - Webhook handling

7. **Notification Module**
   - SMS (Twilio)
   - Email (SendGrid)
   - Push notifications (Firebase - future)
   - Template management

8. **Admin Module**
   - Business approval workflows
   - User suspension
   - Payment management
   - Analytics and reporting

### 2.3 Database Layer

**Technology:** PostgreSQL 14+

**Key Components:**
- Primary database with read replicas for scaling
- Automated backups (daily)
- Point-in-time recovery
- Connection pooling (pgBouncer)

**Major Tables:**
- users (customers, businesses, admins)
- businesses
- business_services
- bookings
- payments
- reviews
- notifications
- audit_logs

### 2.4 Cache Layer

**Technology:** Redis (AWS ElastiCache)

**Use Cases:**
- Session storage
- Rate limiting keys
- Search result caching
- Business profile caching
- Real-time availability

### 2.5 File Storage

**Technology:** AWS S3

**Buckets:**
- `urban-help-images-prod` (business/profile images)
- `urban-help-uploads-prod` (customer uploads)
- Lifecycle policies for image optimization

**Features:**
- CloudFront CDN integration
- Image resizing on upload
- Secure signed URLs for downloads

### 2.6 Message Queue

**Technology:** Bull Queue (Redis-backed)

**Jobs:**
- SMS notifications
- Email notifications
- Image processing
- Payment reminders
- Admin notifications
- Report generation

## 3. Data Flow Architecture

### 3.1 Customer Registration Flow
```
Customer Input
    ↓
Frontend Validation
    ↓
API Endpoint (POST /auth/register)
    ↓
Backend Validation & Hashing
    ↓
Database Insert (users table)
    ↓
OTP Generation & SMS Send (Twilio)
    ↓
Email Verification Sent (SendGrid)
    ↓
Frontend: Verification Page
```

### 3.2 Booking Creation Flow
```
Customer Clicks "Hire Now"
    ↓
Booking Form Submission
    ↓
Payment Not Required Yet
    ↓
Booking Created (status: pending)
    ↓
Business Notification (SMS + Email)
    ↓
Business Reviews & Accepts/Declines
    ↓
If Accepted: Payment Link Sent to Customer
    ↓
Customer Completes Payment (Stripe)
    ↓
Commission Deducted (10%)
    ↓
Payout Queued for Business
    ↓
Business Receives Full Contact Details
```

### 3.3 Payment & Payout Flow
```
Customer Pays via Stripe
    ↓
Stripe Webhook → Backend
    ↓
Payment Record Created
    ↓
Commission Calculated (10%)
    ↓
Payout Created in Stripe Connect
    ↓
Business Account Credited
    ↓
Email Confirmations Sent
```

## 4. Security Architecture

### 4.1 Network Security
- HTTPS/TLS 1.3 everywhere
- WAF (AWS WAF) for protection
- VPC isolation
- Security groups with minimal permissions

### 4.2 Authentication & Authorization
- JWT tokens with 1-hour expiry
- Refresh tokens (7 days)
- OTP for sensitive operations
- Role-based access control (RBAC)
- API key rate limiting

### 4.3 Data Security
- Passwords: bcrypt (12 rounds)
- Data encryption at rest (RDS encryption)
- Data encryption in transit (TLS)
- Sensitive field encryption (customer phone numbers)

### 4.4 Application Security
- CSRF protection (SameSite cookies)
- Input validation & sanitization
- SQL injection prevention (parameterized queries)
- Rate limiting (Redis-backed)
- DDoS protection (AWS Shield)

### 4.5 Compliance
- GDPR readiness (user data export)
- Australian Privacy Act compliance
- OWASP Top 10 protection

## 5. Scalability Architecture

### 5.1 Horizontal Scaling
- ECS Auto Scaling Groups (2-10 containers)
- Load Balancer distribution
- Stateless backend services
- Database connection pooling

### 5.2 Database Scaling
- Read replicas for search queries
- Connection pooling
- Query optimization
- Caching layer (Redis)
- Eventual consistency for non-critical reads

### 5.3 Performance Optimization
- Image compression and CDN delivery
- API response caching
- Lazy loading
- Pagination for large datasets
- ElasticSearch for full-text search (optional)

## 6. Monitoring & Logging

### 6.1 Monitoring
- CloudWatch metrics
- APM: New Relic or Datadog
- Database performance monitoring
- Real user monitoring (RUM)

### 6.2 Logging
- Centralized logging (CloudWatch Logs)
- Log aggregation for analysis
- Audit trails for compliance
- Error tracking (Sentry)

### 6.3 Alerting
- CPU usage > 70%
- Error rates > 1%
- Payment processing failures
- Database connectivity issues
- Authentication failures

## 7. Disaster Recovery

### 7.1 Backup Strategy
- Database: Daily automated backups with 30-day retention
- S3 versioning enabled
- Cross-region replication for critical data

### 7.2 Recovery Procedures
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour
- Regular disaster recovery drills
- Documented runbooks

## 8. Integration Points

### 8.1 Third-Party Services
| Service | Purpose | Authentication | Webhook Support |
|---------|---------|-----------------|-----------------|
| Stripe | Payments | API Key + Webhook Secret | Yes |
| Twilio | SMS | Account SID + Auth Token | Yes |
| SendGrid | Email | API Key | Yes |
| Google Places | Address Search | API Key | No |
| AWS Services | Infrastructure | IAM Roles | Yes |

### 8.2 Webhook Management
- Stripe payment webhooks
- Twilio delivery receipts
- SendGrid bounce/delivery
- Retry logic with exponential backoff
- Signature verification

## 9. Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js, React, TypeScript, Tailwind | User Interface |
| Backend | Node.js, NestJS, TypeScript | API & Business Logic |
| Database | PostgreSQL 14+ | Data Persistence |
| Cache | Redis (ElastiCache) | Performance |
| Queue | Bull (Redis) | Async Processing |
| Storage | AWS S3 | File Storage |
| CDN | CloudFront | Static Asset Delivery |
| Auth | JWT + OTP | Security |
| Payments | Stripe Connect | Marketplace Payments |
| SMS | Twilio | Notifications |
| Email | SendGrid | Notifications |
| Hosting | AWS ECS/Fargate | Container Orchestration |
| Infrastructure | AWS | Cloud Platform |

## 10. Deployment Strategy

### Environment Configuration
- **Development**: Local or Docker Compose
- **Staging**: AWS (pre-production clone)
- **Production**: AWS (Multi-AZ setup)

### CI/CD Pipeline
- GitHub/GitLab for version control
- Automated tests on PR
- Build Docker images
- Push to ECR
- Deploy to ECS

### Rollback Procedures
- Keep previous version available
- Health checks before marking as healthy
- Canary deployments for production
- Automated rollback on failure

---

**Document Version:** 1.0
**Last Updated:** June 2026
**Status:** Draft
