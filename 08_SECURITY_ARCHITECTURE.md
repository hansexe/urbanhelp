# Urban Help - Security Architecture

## 1. Security Overview

Urban Help implements defense-in-depth security strategy with multiple layers of protection:

1. **Network Security**: TLS/HTTPS, WAF, DDoS protection
2. **Application Security**: Input validation, authentication, authorization
3. **Data Security**: Encryption at rest and in transit
4. **Infrastructure Security**: VPC isolation, security groups, IAM roles
5. **Compliance**: GDPR, Privacy Act, OWASP Top 10

---

## 2. Network Security

### 2.1 HTTPS/TLS

**Requirements:**
- TLS 1.3 minimum
- Valid SSL certificates from trusted CA (AWS Certificate Manager)
- Automatic renewal 30 days before expiration
- HSTS enabled (Strict-Transport-Security header)
- HSTS max-age: 31536000 (1 year)
- includeSubDomains: true

**Implementation:**
```
All traffic redirected HTTP (80) → HTTPS (443)
Mixed content blocked (no HTTP resources on HTTPS pages)
Certificate pinning: Public key pins for critical domains
```

### 2.2 Web Application Firewall (WAF)

**AWS WAF Rules:**
- Rate limiting: 2000 requests per 5 minutes per IP
- Geo-blocking: Allow only Australian IPs (except API clients)
- SQL injection protection
- XSS (Cross-Site Scripting) protection
- CSRF token validation
- Bot control (AWS Managed Rules)

**Custom Rules:**
- Block requests with malicious patterns
- Block requests to sensitive paths without auth
- Enforce JSON Content-Type for APIs
- Validate request sizes

### 2.3 DDoS Protection

**AWS Shield Standard:** Automatic layer 3/4 protection

**AWS Shield Advanced (Recommended for production):**
- Layer 7 DDoS protection
- Real-time attack notifications
- DDoS Response Team (24/7)
- Cost protection for scaling

### 2.4 Network Isolation

**VPC Structure:**
```
Public Subnets:
  - NAT Gateway (egress traffic)
  - Load Balancer

Private Subnets:
  - ECS Containers (backend)
  - RDS Database
  - ElastiCache Redis
  - Bastion Host (admin access)
```

**Security Groups:**
```
ALB Security Group:
  - Inbound: 80 (HTTP), 443 (HTTPS) from 0.0.0.0/0
  - Outbound: All to ECS SG

ECS Security Group:
  - Inbound: 3000, 8000 from ALB SG
  - Outbound: All

RDS Security Group:
  - Inbound: 5432 from ECS SG
  - Outbound: None

ElastiCache Security Group:
  - Inbound: 6379 from ECS SG
  - Outbound: None
```

---

## 3. Authentication & Authorization

### 3.1 JWT Authentication

**JWT Token Structure:**
```json
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "sub": "user-id",
  "email": "user@example.com",
  "role": "customer",
  "iat": 1234567890,
  "exp": 1234571490
}

Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

**Token Configuration:**
- **Algorithm**: HS256 (or RS256 for higher security)
- **Expiry**: 1 hour (access token)
- **Refresh Token Expiry**: 7 days
- **Secret Key**: Min 256-bit (32 bytes) from AWS Secrets Manager
- **Stored In**: HttpOnly cookie + localStorage (for redundancy)

**Implementation:**
```typescript
// NestJS passport-jwt strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: extractJwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

### 3.2 OTP (One-Time Password)

**SMS OTP Flow:**
1. User requests OTP (registration, login, phone change)
2. 6-digit code generated, valid for 10 minutes
3. Sent via Twilio to verified phone
4. User submits OTP
5. Backend validates, marks as used, expires old codes

**Email OTP Flow:**
- Similar to SMS but for email verification
- 8-character alphanumeric code
- Valid for 24 hours

**OTP Security:**
- Generated using cryptographically secure random (crypto.randomBytes)
- Stored as salted hash in database
- Rate limited: Max 3 attempts per OTP, 5 OTP requests per hour
- Auto-delete after expiry

### 3.3 Role-Based Access Control (RBAC)

**Roles:**
1. **Customer**: Can search, book services, leave reviews
2. **Business**: Can accept bookings, manage profile, receive payments
3. **Admin**: Full access to all resources and operations

**Implementation:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'business')
@Controller('admin')
export class AdminController {}
```

**Permissions Table:**

| Resource | Customer | Business | Admin |
|----------|----------|----------|-------|
| Get Profile | Own only | Own only | Any |
| Edit Profile | Own only | Own only | Any |
| Search Businesses | Yes | Yes | Yes |
| View Business Profile | Yes | Own only | Yes |
| Create Booking | Yes | No | No |
| Accept Booking | No | Own only | No |
| View Payments | Own only | Own only | Yes |
| Access Admin | No | No | Yes |

### 3.4 Session Management

**Session Storage:**
- Redis (ElastiCache)
- Session timeout: 24 hours idle
- Logout: Delete session + invalidate tokens

**Session Data:**
```javascript
{
  userId: "550e8400-...",
  role: "customer",
  email: "user@example.com",
  loginTime: 1234567890,
  lastActivity: 1234567890,
  ipAddress: "203.0.113.0",
  userAgent: "Mozilla/5.0..."
}
```

---

## 4. Password Security

### 4.1 Password Requirements

**Validation Rules:**
- Minimum 8 characters, maximum 20 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)
- No dictionary words
- Different from email/username

**Examples:**
- ✓ SecurePass123!
- ✗ password123 (no uppercase, no special char)
- ✗ ALLCAPS123! (no lowercase)
- ✗ 12345678 (no letters, no special char)

### 4.2 Password Hashing

**Algorithm:** bcrypt

**Configuration:**
- Salt rounds: 12
- Complexity: O(2^12) = 4096 iterations

**Implementation:**
```typescript
import * as bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 4.3 Password Reset

**Flow:**
1. User requests password reset
2. Email sent with reset token (valid 15 minutes)
3. Reset token: Cryptographically random 32-byte value
4. User clicks link, enters new password
5. Verify reset token still valid
6. Hash new password, update DB
7. Invalidate all existing sessions
8. Send confirmation email

---

## 5. Data Encryption

### 5.1 Encryption at Rest

**RDS Encryption:**
- AWS KMS encryption enabled
- Default AWS managed key (aws/rds)
- Or: Customer managed CMK for higher control
- Automatic key rotation annually

**S3 Encryption:**
- Default: AES-256 (SSE-S3)
- Recommended: SSE-KMS with customer CMK
- Block public access enabled

**Sensitive Fields:**
- Customer phone numbers
- Business banking details
- Stripe Connect tokens
- API keys

```typescript
// Encrypt sensitive data
@BeforeInsert()
@BeforeUpdate()
encryptSensitiveFields() {
  if (this.phone) {
    this.phone = encrypt(this.phone);
  }
  if (this.accountNumber) {
    this.accountNumber = encrypt(this.accountNumber);
  }
}
```

### 5.2 Encryption in Transit

- TLS 1.3 for all HTTP(S) traffic
- TLS for database connections
- TLS for Redis connections
- API authentication: Bearer token over HTTPS

---

## 6. Input Validation & Sanitization

### 6.1 Frontend Validation

**Client-Side:**
```typescript
// React form validation
const [errors, setErrors] = useState({});

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  // Australian phone format
  const phoneRegex = /^(\+61|0)[0-9]{9,10}$/;
  return phoneRegex.test(phone);
};

const handleSubmit = (e) => {
  e.preventDefault();
  const newErrors = {};
  
  if (!validateEmail(email)) {
    newErrors.email = 'Invalid email';
  }
  if (!validatePhone(phone)) {
    newErrors.phone = 'Invalid phone';
  }
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  
  // Submit form
};
```

### 6.2 Backend Validation

**Server-Side (NestJS):**
```typescript
import { IsEmail, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber('AU')
  mobile: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// Validation pipe
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,  // Remove unknown properties
  forbidNonWhitelisted: true,  // Throw error if unknown properties
  transform: true,  // Transform to DTO class
  transformOptions: { enableImplicitConversion: true },
}));
```

### 6.3 Sanitization

**XSS Prevention:**
```typescript
// Remove scripts and dangerous HTML
import { sanitize } from 'isomorphic-dompurify';

const cleanContent = sanitize(userInput);

// In NestJS
import { getConnection } from 'typeorm';

// Parameterized queries (always use)
const user = await repository.findOne({ 
  where: { email },
  // Never concatenate strings
});

// Bad: const users = query(`SELECT * FROM users WHERE email = '${email}'`);
// Good: const users = query('SELECT * FROM users WHERE email = ?', [email]);
```

---

## 7. SQL Injection Prevention

**Best Practices:**

1. **Use ORM (TypeORM/Prisma):** Parameterized queries automatically
2. **Prepared Statements:** Compile query once with placeholders
3. **Input Validation:** Validate type and format
4. **Least Privilege:** DB user has minimal permissions

```typescript
// TypeORM (Safe)
const user = await userRepository.findOne({
  where: { email },
});

// SQL (Safe with parameterization)
const query = 'SELECT * FROM users WHERE email = $1';
const result = await pool.query(query, [email]);

// Avoid (Vulnerable)
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

---

## 8. CSRF Protection

**Implementation:**
```typescript
// NestJS CSRF middleware
import { CsrfMiddleware } from '@nest-modules/csrf';

app.use(CsrfMiddleware.create({
  secret: configService.get('CSRF_SECRET'),
  header: 'X-CSRF-Token',
  cookie: 'XSRF-TOKEN',
}));

// Frontend
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
  },
  body: JSON.stringify(data),
});
```

**Cookie Settings:**
```
SameSite: Strict (or Lax)
HttpOnly: true
Secure: true (HTTPS only)
Path: /
Domain: .urbanhelp.com.au
```

---

## 9. Rate Limiting

### 9.1 API Rate Limiting

**Global Limits:**
- Anonymous: 100 requests/min per IP
- Authenticated: 1000 requests/hour per user
- Payment endpoints: 10 requests/min per user
- Login attempts: 5 per 15 minutes per email

**Implementation:**
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,
  limit: 10,
}),

@UseGuards(ThrottlerGuard)
@Post('login')
login() {}
```

### 9.2 Redis Rate Limiting

```typescript
// Custom rate limiter using Redis
async checkRateLimit(key: string, limit: number, window: number) {
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, window);
  }
  if (current > limit) {
    throw new Error('Rate limit exceeded');
  }
}
```

---

## 10. Audit Logging

**Logged Events:**
- Login (success/failure)
- Password change
- Email/phone change
- Business registration/approval
- Booking creation/acceptance
- Payment processing
- Admin actions (approval, suspension, deletion)
- Data access by admins

**Audit Log Structure:**
```typescript
{
  id: UUID,
  userId: UUID,
  entityType: 'user' | 'business' | 'booking' | 'payment',
  entityId: UUID,
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject',
  changes: {
    field: { old: 'value', new: 'value' }
  },
  ipAddress: '203.0.113.0',
  userAgent: 'Mozilla/5.0...',
  createdAt: timestamp
}
```

**Retention:** 7 years (compliance requirement)

---

## 11. File Upload Security

### 11.1 File Validation

```typescript
// Validate file type
const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedMimes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}

// Validate file size
const maxSize = 500 * 1024; // 500 KB
if (file.size > maxSize) {
  throw new Error('File too large');
}

// Check file signature (magic bytes)
const fileSignature = await getFileSignature(file.buffer);
if (!isValidImageSignature(fileSignature)) {
  throw new Error('Invalid file signature');
}
```

### 11.2 S3 Upload Security

```typescript
// Signed upload URLs (limited time access)
const signedUrl = await s3.getSignedUrl('putObject', {
  Bucket: 'urban-help-images',
  Key: `${userId}/business-${Date.now()}.jpg`,
  Expires: 3600, // 1 hour
  ContentType: 'image/jpeg',
});

// S3 Bucket Policy
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::urban-help-images/*",
      "Condition": {
        "StringNotEquals": {
          "aws:username": "cloudfront"
        }
      }
    }
  ]
}
```

---

## 12. Third-Party Integration Security

### 12.1 Stripe Integration

- API Key: Stored in AWS Secrets Manager, rotated annually
- Webhook Signature Verification: Verify `stripe-signature` header
- PCI Compliance: Never store full card numbers
- Use Stripe Connect for marketplace payments

```typescript
// Verify Stripe webhook signature
const sig = req.headers['stripe-signature'];
let event;

try {
  event = stripe.webhooks.constructEvent(
    req.rawBody,
    sig,
    configService.get('STRIPE_WEBHOOK_SECRET')
  );
} catch (error) {
  throw new Error('Webhook signature verification failed');
}
```

### 12.2 Twilio Integration

- Account SID & Auth Token: AWS Secrets Manager
- Verify incoming SMS: Validate Twilio signature
- Rate limit OTP requests
- Log all OTP attempts

### 12.3 SendGrid Integration

- API Key: AWS Secrets Manager
- Use dedicated sender for transactional emails
- Verify sender domain (DKIM, SPF)
- Webhook signature verification for bounce/unsubscribe

---

## 13. Secrets Management

**AWS Secrets Manager:**
```
- JWT Secret
- Database Password
- Stripe API Keys
- Twilio Account SID & Token
- SendGrid API Key
- CSRF Secret
- Encryption Keys
```

**Rotation Policy:**
- JWT Secret: Annual rotation with grace period
- Database Password: Every 90 days
- API Keys: Every 180 days
- Master Keys: Every year

**Access Control:**
```
Dev Environment: All developers
Staging Environment: Lead developers + DevOps
Production Environment: DevOps team only (with 2FA)
```

---

## 14. Compliance & Standards

### 14.1 GDPR Compliance

**Requirements:**
- Right to access: Users can download their data
- Right to deletion: "Delete my account" functionality
- Data minimization: Collect only necessary data
- Purpose limitation: Use data only for stated purpose
- Consent management: Clear opt-in/opt-out
- Data breach notification: Within 72 hours

**Implementation:**
```typescript
// Export user data (GDPR requirement)
@Get('export')
async exportUserData(@CurrentUser() user: User) {
  const data = {
    profile: user,
    bookings: await this.bookingService.find(user.id),
    reviews: await this.reviewService.find(user.id),
    payments: await this.paymentService.find(user.id),
  };
  return data;
}

// Delete user account
@Delete('account')
async deleteAccount(@CurrentUser() user: User) {
  // Anonymize data instead of deletion
  await this.userService.anonymize(user.id);
}
```

### 14.2 Australian Privacy Act

**Requirements:**
- Australian Privacy Principles (APPs) compliance
- Privacy Collection Notice
- Privacy Policy
- User access to personal information
- Correction procedures

### 14.3 OWASP Top 10

| Risk | Mitigation |
|------|-----------|
| Injection | Parameterized queries, input validation |
| Broken Auth | JWT + OTP, session management |
| Sensitive Data | Encryption at rest/transit, field masking |
| XML External Entities | Disable external entity processing |
| Broken Access Control | RBAC, permission checks on all endpoints |
| Security Misconfiguration | Config management, security headers |
| XSS | Input sanitization, CSP headers |
| Insecure Deserialization | Avoid unsafe deserialization, validate input |
| Component Vulnerabilities | Dependency scanning, regular updates |
| Logging & Monitoring | Audit logs, CloudWatch, alerting |

---

## 15. Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## 16. Incident Response

**Security Incident Procedure:**
1. **Detect**: Monitor CloudWatch logs, security alerts
2. **Respond**: Isolate affected systems, notify team
3. **Investigate**: Root cause analysis, affected data
4. **Remediate**: Patch vulnerability, update systems
5. **Notify**: User notification if data exposed
6. **Review**: Post-incident analysis, process improvement

**Contact Information:**
- Security Lead: security@urbanhelp.com.au
- Incident Hotline: +61 2 XXXX XXXX
- Disclosure: security.txt (/.well-known/security.txt)

---

**Document Version:** 1.0
**Last Updated:** June 2026
**Status:** Draft
**Security Review Date:** Quarterly
