# Urban Help - Database Schema and Entity Relationship Diagram

## 1. Entity Relationship Diagram (Text Representation)

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ mobile (UNIQUE)     │
│ password_hash       │
│ first_name          │
│ last_name           │
│ role                │◄─────────────┐
│ is_active           │              │
│ is_verified         │              │
│ created_at          │              │
│ updated_at          │              │
└─────────────────────┘              │
        │                            │
        ├─────────────┬─────────────┤
        │             │             │
        ▼             ▼             ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   customers     │ │  businesses  │ │   admin_users    │
├─────────────────┤ ├──────────────┤ ├──────────────────┤
│ id (PK, FK)     │ │ id (PK, FK)  │ │ id (PK, FK)      │
│ address         │ │ name         │ │ permissions      │
│ suburb          │ │ abn          │ │ approval_count   │
│ postcode        │ │ owner_name   │ │ suspension_count │
│ latitude        │ │ business_email
│ longitude       │ │ business_mobile
│ phone_verified  │ │ business_address
│ email_verified  │ │ suburb
│                 │ │ postcode
└─────────────────┘ │ state
        │           │ latitude
        │           │ longitude
        │           │ service_radius
        │           │ website_url
        │           │ description
        │           │ experience
        │           │ qualifications
        │           │ licences
        │           │ business_hours
        │           │ avg_rating
        │           │ total_reviews
        │           │ is_verified
        │           │ is_approved
        │           │ approval_status
        │           │ is_suspended
        │           │ created_at
        │           │ updated_at
        │           └──────────────┘
        │                  │
        │                  ├──────────────────┐
        │                  │                  │
        │                  ▼                  ▼
        │           ┌──────────────────┐  ┌─────────────────┐
        │           │ business_services│  │ business_hours  │
        │           ├──────────────────┤  ├─────────────────┤
        │           │ id (PK)          │  │ id (PK)         │
        │           │ business_id (FK) │  │ business_id(FK) │
        │           │ service_type     │  │ day_of_week     │
        │           │ is_active        │  │ start_time      │
        │           └──────────────────┘  │ end_time        │
        │                                  │ is_available    │
        │                                  └─────────────────┘
        │
        ├───────────────────────────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐              ┌──────────────────┐
│    bookings      │              │ booking_details  │
├──────────────────┤              ├──────────────────┤
│ id (PK)          │◄─────┬───────│ id (PK)          │
│ customer_id (FK) │      │       │ booking_id (FK)  │
│ business_id (FK) │      └──────┘ │ problem_desc     │
│ status           │              │ appointment_type │
│ request_type     │              │ appointment_date │
│ appointment_date │              │ appointment_time │
│ appointment_time │              │ notes            │
│ customer_name    │              └──────────────────┘
│ customer_address │
│ call_out_fee     │
│ commission_amount│
│ created_at       │
│ updated_at       │
└──────────────────┘
        │
        ├──────────────────────┐
        │                      │
        ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│    payments      │  │     reviews      │
├──────────────────┤  ├──────────────────┤
│ id (PK)          │  │ id (PK)          │
│ booking_id (FK)  │  │ booking_id (FK)  │
│ customer_id (FK) │  │ customer_id (FK) │
│ business_id (FK) │  │ business_id (FK) │
│ amount           │  │ rating           │
│ commission       │  │ comment          │
│ payout_amount    │  │ is_verified      │
│ status           │  │ created_at       │
│ stripe_payment_id
│ stripe_connect_id
│ created_at       │  └──────────────────┘
│ updated_at       │
└──────────────────┘

┌──────────────────────────────────────┐
│      notifications (generic)         │
├──────────────────────────────────────┤
│ id (PK)                              │
│ recipient_id (FK to users)           │
│ type (SMS/Email/Push)                │
│ subject                              │
│ content                              │
│ status                               │
│ sent_at                              │
│ opened_at                            │
│ created_at                           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│      business_images                 │
├──────────────────────────────────────┤
│ id (PK)                              │
│ business_id (FK)                     │
│ image_url                            │
│ s3_key                               │
│ display_order                        │
│ is_primary                           │
│ created_at                           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│      audit_logs                      │
├──────────────────────────────────────┤
│ id (PK)                              │
│ user_id (FK)                         │
│ entity_type                          │
│ entity_id                            │
│ action                               │
│ changes (JSON)                       │
│ ip_address                           │
│ created_at                           │
└──────────────────────────────────────┘
```

## 2. Detailed Table Specifications

### 2.1 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    -- Roles: 'customer', 'business', 'admin'
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT role_check CHECK (role IN ('customer', 'business', 'admin')),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

### 2.2 Customers Table

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    address VARCHAR(500) NOT NULL,
    suburb VARCHAR(100) NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    state VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    preferred_contact_method VARCHAR(50) DEFAULT 'sms',
    
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT state_check CHECK (state IN ('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'))
);

CREATE INDEX idx_customers_location ON customers USING GIST (
    ll_to_earth(latitude, longitude)
);
CREATE INDEX idx_customers_suburb ON customers(suburb);
CREATE INDEX idx_customers_postcode ON customers(postcode);
```

### 2.3 Businesses Table

```sql
CREATE TABLE businesses (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    abn VARCHAR(20) NOT NULL UNIQUE,
    owner_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255) NOT NULL,
    business_mobile VARCHAR(20) NOT NULL,
    business_address VARCHAR(500) NOT NULL,
    suburb VARCHAR(100) NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    state VARCHAR(50) NOT NULL,
    service_radius INTEGER NOT NULL DEFAULT 25,
    -- in kilometers
    website_url VARCHAR(255),
    description TEXT,
    experience TEXT,
    qualifications TEXT,
    licences TEXT,
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    approval_status VARCHAR(50) DEFAULT 'pending',
    -- pending, approved, rejected
    rejection_reason TEXT,
    is_suspended BOOLEAN DEFAULT false,
    suspension_reason TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT state_check CHECK (state IN ('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT')),
    CONSTRAINT approval_status_check CHECK (approval_status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_businesses_suburb ON businesses(suburb);
CREATE INDEX idx_businesses_postcode ON businesses(postcode);
CREATE INDEX idx_businesses_is_approved ON businesses(is_approved);
CREATE INDEX idx_businesses_is_suspended ON businesses(is_suspended);
CREATE INDEX idx_businesses_location ON businesses USING GIST (
    ll_to_earth(latitude, longitude)
);
```

### 2.4 Business Services Table

```sql
CREATE TABLE business_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    -- electrician, plumber, builder, carpenter, locksmith, handyman, other
    business_hours_fee DECIMAL(10, 2) NOT NULL,
    out_of_hours_fee DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT service_type_check CHECK (service_type IN (
        'electrician', 'plumber', 'builder', 'carpenter', 
        'locksmith', 'handyman', 'other'
    )),
    CONSTRAINT fee_check CHECK (business_hours_fee > 0 AND out_of_hours_fee > 0)
);

CREATE INDEX idx_business_services_business_id ON business_services(business_id);
CREATE INDEX idx_business_services_service_type ON business_services(service_type);
```

### 2.5 Business Hours Table

```sql
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL,
    -- 0=Monday, 6=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT day_check CHECK (day_of_week BETWEEN 0 AND 6),
    CONSTRAINT time_check CHECK (start_time < end_time)
);

CREATE INDEX idx_business_hours_business_id ON business_hours(business_id);
```

### 2.6 Bookings Table

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    business_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- pending, accepted, payment_pending, confirmed, completed, cancelled, declined
    request_type VARCHAR(50) NOT NULL,
    -- urgent, scheduled
    appointment_date DATE NOT NULL,
    appointment_time TIME,
    customer_name VARCHAR(255) NOT NULL,
    customer_address VARCHAR(500) NOT NULL,
    customer_phone VARCHAR(20),
    problem_description TEXT NOT NULL,
    business_notes TEXT,
    call_out_fee DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT,
    CONSTRAINT status_check CHECK (status IN (
        'pending', 'accepted', 'payment_pending', 'confirmed', 
        'completed', 'cancelled', 'declined'
    )),
    CONSTRAINT request_type_check CHECK (request_type IN ('urgent', 'scheduled')),
    CONSTRAINT fee_check CHECK (call_out_fee > 0 AND commission_amount >= 0)
);

CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_business_id ON bookings(business_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_appointment_date ON bookings(appointment_date);
```

### 2.7 Payments Table

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    business_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    payout_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- pending, completed, failed, refunded
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    stripe_connect_account_id VARCHAR(255),
    payout_status VARCHAR(50) DEFAULT 'pending',
    payout_date TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT,
    CONSTRAINT status_check CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    CONSTRAINT payout_status_check CHECK (payout_status IN ('pending', 'in_transit', 'completed', 'failed')),
    CONSTRAINT amount_check CHECK (amount > 0 AND commission_amount >= 0 AND payout_amount > 0),
    CONSTRAINT commission_check CHECK (commission_amount = amount * 0.10)
);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_business_id ON payments(business_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_stripe_charge_id ON payments(stripe_charge_id);
```

### 2.8 Reviews Table

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    business_id UUID NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT rating_check CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
```

### 2.9 Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    -- sms, email, push
    subject VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- pending, sent, failed, opened
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    external_id VARCHAR(255),
    -- Twilio SID, SendGrid Message ID, etc.
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT type_check CHECK (type IN ('sms', 'email', 'push')),
    CONSTRAINT status_check CHECK (status IN ('pending', 'sent', 'failed', 'opened'))
);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### 2.10 Business Images Table

```sql
CREATE TABLE business_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    display_order INTEGER NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT display_order_check CHECK (display_order > 0)
);

CREATE INDEX idx_business_images_business_id ON business_images(business_id);
CREATE UNIQUE INDEX idx_business_images_primary ON business_images(business_id) 
    WHERE is_primary = true;
```

### 2.11 Business Banking Details Table

```sql
CREATE TABLE business_banking_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL UNIQUE,
    account_name VARCHAR(255) NOT NULL,
    bsb VARCHAR(10) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    stripe_connect_account_id VARCHAR(255) UNIQUE,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX idx_banking_details_business_id ON business_banking_details(business_id);
```

### 2.12 Audit Logs Table

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    -- create, update, delete, approve, reject, suspend
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT action_check CHECK (action IN (
        'create', 'update', 'delete', 'approve', 'reject', 'suspend', 'login', 'payment'
    ))
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 2.13 OTP Codes Table

```sql
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(50) NOT NULL,
    -- registration, login, password_reset, email_change, phone_change
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT type_check CHECK (type IN (
        'registration', 'login', 'password_reset', 'email_change', 'phone_change'
    ))
);

CREATE INDEX idx_otp_codes_user_id ON otp_codes(user_id);
CREATE INDEX idx_otp_codes_code ON otp_codes(code);
CREATE INDEX idx_otp_codes_expires_at ON otp_codes(expires_at);
```

## 3. Key Relationships

| From | To | Type | Cardinality | On Delete |
|------|-----|------|-------------|-----------|
| customers | users | FK | 1:1 | CASCADE |
| businesses | users | FK | 1:1 | CASCADE |
| business_services | businesses | FK | 1:M | CASCADE |
| business_hours | businesses | FK | 1:M | CASCADE |
| business_images | businesses | FK | 1:M | CASCADE |
| business_banking_details | businesses | FK | 1:1 | CASCADE |
| bookings | customers | FK | 1:M | CASCADE |
| bookings | businesses | FK | 1:M | RESTRICT |
| payments | bookings | FK | 1:1 | CASCADE |
| payments | customers | FK | 1:M | RESTRICT |
| payments | businesses | FK | 1:M | RESTRICT |
| reviews | bookings | FK | 1:1 | CASCADE |
| reviews | customers | FK | 1:M | CASCADE |
| reviews | businesses | FK | 1:M | CASCADE |
| notifications | users | FK | 1:M | CASCADE |
| audit_logs | users | FK | 1:M | SET NULL |
| otp_codes | users | FK | 1:M | CASCADE |

## 4. Indexes Strategy

### High-Frequency Query Indexes
- `users.email`, `users.mobile` - Authentication
- `customers.postcode`, `customers.suburb` - Search
- `businesses.is_approved`, `businesses.is_suspended` - Display filtering
- `bookings.customer_id`, `bookings.status` - Status tracking
- `payments.status`, `payments.stripe_charge_id` - Payment processing

### Geospatial Index
- Location-based search using PostGIS `ll_to_earth()` for distance calculations

## 5. Data Constraints & Validations

### Business Rules
1. Commission is always 10% of call-out fee
2. Out-of-hours fee >= Business hours fee
3. Only one primary image per business
4. Only one banking detail per business
5. Only one review per booking
6. Service radius must be 5-100 km
7. Business must be approved before appearing in search
8. Bookings must have appointment date >= today

## 6. Archiving Strategy

- Keep 12 months of completed bookings online
- Archive older data to separate tables or S3
- Maintain referential integrity constraints

---

**Document Version:** 1.0
**Last Updated:** June 2026
**Database Type:** PostgreSQL 14+
**Status:** Draft
