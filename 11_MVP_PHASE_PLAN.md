# Urban Help - MVP Phase Plan

## 1. MVP Scope Definition

### What's Included in MVP

**Core Customer Flows:**
1. Registration & Authentication
2. Search and Discovery
3. Booking Requests
4. Payment Processing
5. Reviews & Ratings

**Core Business Features:**
1. Basic Profile Setup
2. Booking Management
3. Payment Reception
4. Manual Approval Process

**Core Admin Functions:**
1. Business Approval/Rejection
2. Account Suspension (abuse)
3. Basic Analytics

### What's NOT in MVP

- Mobile app (responsive web only)
- Business registration automated verification
- Admin dashboard analytics
- Advanced search filters
- Favorites/saved businesses
- Booking scheduling system
- Customer support chat
- Emergency services
- Advanced reporting
- Multi-language support

---

## 2. MVP User Stories

### Customer User Stories

#### As a customer, I want to:

**Authentication (US-001 to US-005)**
- US-001: Register with email/phone
- US-002: Verify email and phone
- US-003: Login with credentials
- US-004: Reset forgotten password
- US-005: Update my profile (name, address, phone)

**Search (US-010 to US-015)**
- US-010: Search businesses by service type
- US-011: Filter by suburb or postcode
- US-012: See business details (profile, hours, fees)
- US-013: View business images
- US-014: See business reviews and ratings
- US-015: Sort search results (distance, rating)

**Booking (US-020 to US-025)**
- US-020: Request urgent (ASAP) appointment
- US-021: Schedule appointment for specific date/time
- US-022: View booking status
- US-023: Cancel booking if business hasn't accepted
- US-024: Receive SMS and email updates
- US-025: Pay online when business accepts

**Reviews (US-030 to US-032)**
- US-030: Leave review after completed booking
- US-031: Rate service 1-5 stars
- US-032: View my booking history

### Business User Stories

**Manual Registration (US-100 to US-110)**
- US-100: Register business manually
- US-101: Provide business details (ABN, address)
- US-102: Set service categories
- US-103: Set business hours and fees
- US-104: Upload 3-10 business images
- US-105: Verify email and phone
- US-106: Provide banking details
- US-107: Receive approval notification
- US-108: View approval status
- US-109: Rejection with reason
- US-110: Ability to re-apply after rejection

**Booking Management (US-200 to US-210)**
- US-200: Receive booking request notification
- US-201: View customer booking request details
- US-202: Accept or decline booking
- US-203: Provide confirmation to customer
- US-204: Receive payment notification
- US-205: View completed bookings
- US-206: View upcoming appointments
- US-207: View earnings summary

### Admin User Stories

**Business Approval (US-500 to US-510)**
- US-500: View pending business applications
- US-501: Review business documentation
- US-502: Verify business details
- US-503: Approve business registration
- US-504: Reject with reason
- US-505: View approved businesses

**Oversight (US-510 to US-520)**
- US-510: Suspend abusive users
- US-511: Suspend fraudulent businesses
- US-512: View system metrics
- US-513: View payment summaries

---

## 3. Database Schema (MVP Minimal)

```sql
-- Core tables only
users (id, email, phone, password, first_name, last_name, role, created_at)
customers (id, address, suburb, postcode, state)
businesses (id, name, abn, address, suburb, postcode, state, description)
business_services (id, business_id, service_type, business_hours_fee, out_of_hours_fee)
business_hours (id, business_id, day_of_week, start_time, end_time)
business_images (id, business_id, url, s3_key)
bookings (id, customer_id, business_id, status, appointment_date, call_out_fee)
payments (id, booking_id, amount, commission, status, stripe_charge_id)
reviews (id, booking_id, customer_id, business_id, rating, comment)
notifications (id, recipient_id, type, content, status)

-- Skip for MVP:
-- Audit logs
-- OTP codes
-- Banking details (simplify for MVP)
-- Address history
-- Advanced reporting tables
```

---

## 4. MVP API Endpoints

### Authentication (8 endpoints)
```
POST /auth/register
POST /auth/verify-otp
POST /auth/login
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/logout
GET /customers/profile
```

### Search (4 endpoints)
```
GET /search/businesses
GET /businesses/{id}
GET /address/autocomplete
GET /businesses/{id}/reviews
```

### Bookings (6 endpoints)
```
POST /bookings
GET /bookings/{id}
GET /bookings
PUT /bookings/{id}/cancel
PUT /bookings/{id}/accept (business)
PUT /bookings/{id}/decline (business)
```

### Payments (3 endpoints)
```
POST /payments/create-intent
GET /payments/{bookingId}
POST /webhooks/stripe (webhook)
```

### Reviews (2 endpoints)
```
POST /reviews
GET /businesses/{id}/reviews
```

### Admin (5 endpoints)
```
GET /admin/approvals
PUT /admin/approvals/{id}/approve
PUT /admin/approvals/{id}/reject
PUT /admin/users/{id}/suspend
GET /admin/dashboard
```

**Total: 28 MVP endpoints**

---

## 5. Frontend Pages (MVP)

### Public Pages
1. `/` - Homepage
2. `/auth/login` - Login
3. `/auth/signup` - Sign up
4. `/auth/forgot-password` - Password reset
5. `/auth/verify-otp` - OTP verification
6. `/search` - Search results
7. `/business/[id]` - Business profile

### Customer Pages (Authenticated)
8. `/dashboard` - Customer dashboard
9. `/profile` - Edit profile
10. `/bookings/[id]` - Booking details
11. `/reviews/[bookingId]` - Leave review
12. `/payment` - Payment page (Stripe)

### Business Pages (Authenticated)
13. `/business/register` - Business registration (multi-step)
14. `/business/dashboard` - Booking queue
15. `/business/profile` - Edit profile

### Admin Pages (Authenticated, admin role)
16. `/admin` - Admin dashboard
17. `/admin/approvals` - Pending applications

**Total: 17 pages**

---

## 6. MVP Timeline & Milestones

### Week 1-2: Foundation
- [ ] Setup project structure
- [ ] Create CI/CD pipeline
- [ ] Deploy infrastructure
- [ ] Database schema
- [ ] Basic API structure
- **Milestone: Deployable skeleton**

### Week 2-3: Authentication
- [ ] User registration and login
- [ ] OTP verification (SMS/Email)
- [ ] JWT token management
- [ ] Customer/Business profiles
- [ ] Frontend auth pages
- **Milestone: Full auth flow working**

### Week 3-4: Search
- [ ] Business listing API
- [ ] Address autocomplete
- [ ] Business profile API
- [ ] Business images
- [ ] Frontend search pages
- [ ] Ratings display
- **Milestone: Search flow end-to-end**

### Week 4-5: Bookings
- [ ] Booking creation API
- [ ] Booking status management
- [ ] Accept/decline endpoints
- [ ] Frontend booking form
- [ ] Booking history
- **Milestone: Booking flow working**

### Week 5-6: Payments
- [ ] Stripe integration
- [ ] Payment intent creation
- [ ] Webhook handling
- [ ] Payment confirmation
- [ ] Frontend payment page
- **Milestone: Payment flow end-to-end**

### Week 6-7: Reviews
- [ ] Review submission API
- [ ] Rating calculation
- [ ] Review listing
- [ ] Notifications (SMS + Email)
- [ ] Frontend review pages
- **Milestone: Complete user flow**

### Week 7-8: Admin & Polish
- [ ] Admin approval endpoints
- [ ] Admin dashboard
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Security hardening
- **Milestone: MVP ready for testing**

### Week 8-9: Testing & QA
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E testing
- [ ] Bug fixes
- [ ] User testing
- **Milestone: MVP feature complete and tested**

---

## 7. MVP Success Criteria

### Technical Success Criteria
- [ ] All endpoints functional
- [ ] Database operations working
- [ ] Third-party integrations (Stripe, Twilio, SendGrid) working
- [ ] Authentication/Authorization working
- [ ] API response time < 500ms (p95)
- [ ] 90%+ test coverage
- [ ] Zero critical security issues
- [ ] Page load time < 3 seconds
- [ ] Mobile responsive (375px+)
- [ ] Uptime: 99.5%+

### Business Success Criteria
- [ ] Can register customers
- [ ] Can list businesses
- [ ] Can process bookings
- [ ] Can process payments
- [ ] Can collect reviews
- [ ] Can accept/decline bookings
- [ ] Business can receive payment

### User Success Criteria
- [ ] Smooth sign-up flow (< 2 minutes)
- [ ] Can find a business (< 1 minute)
- [ ] Can request booking (< 2 minutes)
- [ ] Can complete payment (< 2 minutes)
- [ ] Receives timely notifications
- [ ] Can leave review (< 1 minute)

---

## 8. MVP Team & Resources

### Team Size: 8-10 people

**Developers (5-6)**
- 2 Frontend developers
- 2 Backend developers  
- 1 DevOps engineer
- 1 QA engineer

**Support (2-3)**
- 1 Product manager
- 1 UI/UX designer
- 1 Technical writer (documentation)

### Skills Required
- React/Next.js
- Node.js/NestJS
- PostgreSQL
- AWS
- TypeScript
- Stripe API
- Twilio API
- SendGrid API

### Development Tools
- VS Code
- GitHub/GitLab
- Jira/Linear (project management)
- Figma (design)
- Postman (API testing)
- Docker
- AWS Console

---

## 9. MVP Development Costs (Rough Estimate)

| Category | Cost | Notes |
|----------|------|-------|
| **Personnel (3 months)** |
| 5 Developers @ $150/hr | $90,000 | 1200 hours total |
| 1 QA @ $100/hr | $12,000 | 120 hours |
| 1 Product Manager @ $120/hr | $14,400 | 120 hours |
| **AWS Infrastructure** |
| Compute (ECS) | $2,000 | 3 months |
| Database (RDS) | $1,200 | 3 months |
| Storage (S3) | $300 | 3 months |
| **Third-Party Services** |
| Stripe | ~$500 | Processing fees (estimated) |
| Twilio | $500 | SMS costs |
| SendGrid | $400 | Email costs |
| Google Places API | $200 | Address autocomplete |
| Domain & SSL | $300 | 3-year cost |
| **Miscellaneous** |
| Tools (GitHub, Jira, etc.) | $1,000 | 3 months |
| Testing services | $500 |
| **Total | ~$123,400 |  |

---

## 10. MVP Launch Strategy

### Pre-Launch (Week 9)
- [ ] Create landing page
- [ ] Setup analytics (Google Analytics, Mixpanel)
- [ ] Prepare email marketing
- [ ] Setup social media accounts
- [ ] Prepare launch announcement
- [ ] Create help documentation
- [ ] Train support team

### Soft Launch (Week 9)
- [ ] Limit to 100 beta users
- [ ] Gather feedback
- [ ] Fix critical bugs
- [ ] Monitor performance
- [ ] Iterate quickly

### Hard Launch (Week 10)
- [ ] Enable public signup
- [ ] Marketing campaign
- [ ] Social media announcement
- [ ] Email campaign
- [ ] Monitor closely
- [ ] 24/7 support on call

---

## 11. MVP to Production Roadmap

**Post-MVP Features (Q3 2026):**
1. Business self-service registration and approval
2. Emergency services (24/7)
3. Advanced search filters
4. Favorites/saved businesses
5. Booking scheduling system
6. Business analytics dashboard

**Q4 2026:**
1. Mobile app (iOS/Android)
2. Payment method options
3. Customer support chat
4. Multi-language support
5. Advanced reporting

**2027:**
1. Marketplace expansion (more service types)
2. International expansion
3. Business SaaS features
4. Subscription options
5. API for third parties

---

**Document Version:** 1.0
**Last Updated:** June 2026
**Status:** Draft
