# Urban Help - API Design Specification

## 1. API Overview

**Base URL:** `https://api.urbanhelp.com.au/v1`

**Version:** 1.0

**Response Format:** JSON

**Authentication:** JWT Bearer Token + OTP for sensitive operations

## 2. Global Response Format

### Success Response (200, 201)
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response (400, 401, 403, 404, 500)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## 3. Authentication & Authorization

### JWT Token Structure
```
Header: Authorization: Bearer <jwt_token>
Expiry: 1 hour
Refresh: Using refresh token (7 days)
```

### Header Requirements
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
X-Request-ID: uuid (for tracking)
```

### Role-Based Access
- **customer**: Can access customer endpoints
- **business**: Can access business endpoints
- **admin**: Can access admin endpoints

---

## 4. Authentication Endpoints

### 4.1 Customer Registration
```
POST /auth/register

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobile": "+61412345678",
  "password": "SecurePass123!",
  "address": "123 Main St",
  "suburb": "North Melbourne",
  "postcode": "3051",
  "state": "VIC"
}

Response (201):
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "message": "Registration successful. OTP sent to mobile."
  }
}
```

### 4.2 Verify OTP
```
POST /auth/verify-otp

Request:
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "code": "123456",
  "type": "registration"
}

Response (200):
{
  "success": true,
  "data": {
    "verified": true,
    "message": "Phone verified successfully"
  }
}
```

### 4.3 Login
```
POST /auth/login

Request:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

OR

{
  "mobile": "+61412345678",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

### 4.4 Refresh Token
```
POST /auth/refresh

Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200):
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

### 4.5 Forgot Password
```
POST /auth/forgot-password

Request:
{
  "email": "john@example.com"
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Reset code sent to email"
  }
}
```

### 4.6 Reset Password
```
POST /auth/reset-password

Request:
{
  "email": "john@example.com",
  "resetCode": "ABC123",
  "newPassword": "NewPass123!"
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

### 4.7 Logout
```
POST /auth/logout

Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## 5. Customer Profile Endpoints

### 5.1 Get Profile
```
GET /customers/profile

Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile": "+61412345678",
    "address": "123 Main St",
    "suburb": "North Melbourne",
    "postcode": "3051",
    "state": "VIC",
    "phoneVerified": true,
    "emailVerified": true,
    "createdAt": "2026-06-24T10:30:00Z"
  }
}
```

### 5.2 Update Profile
```
PUT /customers/profile

Headers: Authorization: Bearer <token>

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "address": "456 New St",
  "suburb": "North Melbourne",
  "postcode": "3051",
  "state": "VIC"
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Profile updated successfully"
  }
}
```

### 5.3 Change Email
```
PUT /customers/email

Headers: Authorization: Bearer <token>

Request:
{
  "newEmail": "newemail@example.com"
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Verification code sent to new email"
  }
}
```

### 5.4 Change Phone
```
PUT /customers/phone

Headers: Authorization: Bearer <token>

Request:
{
  "newPhone": "+61487654321"
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Verification code sent to new phone"
  }
}
```

### 5.5 Change Password
```
PUT /customers/password

Headers: Authorization: Bearer <token>

Request:
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewPass123!"
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

---

## 6. Search & Discovery Endpoints

### 6.1 Search Businesses
```
GET /search/businesses

Query Parameters:
  - serviceType: electrician, plumber, builder, carpenter, locksmith, handyman
  - suburb: North Melbourne
  - postcode: 3051
  - latitude: -37.8012
  - longitude: 144.9499
  - radius: 25 (kilometers)
  - page: 1
  - limit: 20
  - sortBy: distance|rating|reviews

Response (200):
{
  "success": true,
  "data": {
    "businesses": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "ABC Electrical",
        "serviceType": "electrician",
        "distance": 0.5,
        "rating": 4.8,
        "reviewCount": 235,
        "imageUrl": "https://s3.amazonaws.com/...",
        "isVerified": true,
        "avgRating": 4.8,
        "businessHoursFee": 150.00,
        "outOfHoursFee": 250.00
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

### 6.2 Get Business Profile
```
GET /businesses/{businessId}

Response (200):
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "ABC Electrical",
    "abn": "11111111111",
    "ownerName": "John Smith",
    "description": "Professional electrical services",
    "experience": "15 years in residential and commercial",
    "qualifications": "Licensed electrician",
    "licences": "EC123456",
    "serviceType": "electrician",
    "businessHoursFee": 150.00,
    "outOfHoursFee": 250.00,
    "serviceRadius": 25,
    "suburb": "North Melbourne",
    "postcode": "3051",
    "distance": 0.5,
    "avgRating": 4.8,
    "totalReviews": 235,
    "isVerified": true,
    "images": [
      {
        "id": "img-001",
        "url": "https://s3.amazonaws.com/...",
        "isPrimary": true
      }
    ],
    "businessHours": [
      {
        "day": 0,
        "startTime": "09:00",
        "endTime": "17:00",
        "isAvailable": true
      }
    ],
    "reviews": [
      {
        "id": "rev-001",
        "customername": "Jane Doe",
        "rating": 5,
        "comment": "Great service!",
        "createdAt": "2026-06-20T10:00:00Z"
      }
    ]
  }
}
```

### 6.3 Address Autocomplete
```
GET /address/autocomplete

Query Parameters:
  - query: "North" or "3051"
  - state: "VIC" (optional)

Response (200):
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "suburb": "North Melbourne",
        "postcode": "3051",
        "state": "VIC",
        "latitude": -37.8012,
        "longitude": 144.9499
      },
      {
        "suburb": "North Coburg",
        "postcode": "3058",
        "state": "VIC",
        "latitude": -37.7368,
        "longitude": 144.9167
      }
    ]
  }
}
```

---

## 7. Booking Endpoints

### 7.1 Create Booking Request
```
POST /bookings

Headers: Authorization: Bearer <token>

Request:
{
  "businessId": "550e8400-e29b-41d4-a716-446655440000",
  "requestType": "urgent",
  "appointmentDate": "2026-06-25",
  "appointmentTime": "14:00",
  "problemDescription": "Urgent electrical fault",
  "notes": "Please call before arrival"
}

Response (201):
{
  "success": true,
  "data": {
    "bookingId": "booking-001",
    "status": "pending",
    "businessNotified": true,
    "estimatedFee": {
      "amount": 250.00,
      "currency": "AUD"
    },
    "message": "Booking request sent to business. Awaiting response."
  }
}
```

### 7.2 Get Booking Details
```
GET /bookings/{bookingId}

Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": "booking-001",
    "businessId": "550e8400-e29b-41d4-a716-446655440000",
    "businessName": "ABC Electrical",
    "status": "accepted",
    "requestType": "urgent",
    "appointmentDate": "2026-06-25",
    "appointmentTime": "14:00",
    "problemDescription": "Urgent electrical fault",
    "callOutFee": 250.00,
    "commission": 25.00,
    "paymentStatus": "pending",
    "paymentUrl": "https://payment.urbanhelp.com.au/pay/booking-001",
    "createdAt": "2026-06-24T10:00:00Z",
    "acceptedAt": "2026-06-24T10:15:00Z"
  }
}
```

### 7.3 Get Booking History
```
GET /bookings

Headers: Authorization: Bearer <token>

Query Parameters:
  - status: pending, accepted, confirmed, completed, cancelled
  - page: 1
  - limit: 20

Response (200):
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking-001",
        "businessName": "ABC Electrical",
        "status": "completed",
        "appointmentDate": "2026-06-20",
        "callOutFee": 250.00,
        "createdAt": "2026-06-19T10:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

### 7.4 Cancel Booking
```
PUT /bookings/{bookingId}/cancel

Headers: Authorization: Bearer <token>

Request:
{
  "reason": "Found another provider",
  "refundReason": "Customer initiated cancellation"
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Booking cancelled successfully",
    "refundStatus": "processing"
  }
}
```

---

## 8. Business Endpoints

### 8.1 Business Registration
```
POST /businesses/register

Request:
{
  "businessName": "ABC Electrical",
  "abn": "11111111111",
  "ownerName": "John Smith",
  "businessEmail": "contact@abcelectrical.com",
  "businessMobile": "+61412345678",
  "businessAddress": "123 Main St",
  "suburb": "North Melbourne",
  "postcode": "3051",
  "state": "VIC",
  "serviceRadius": 25,
  "websiteUrl": "https://abcelectrical.com.au",
  "description": "Professional electrical services",
  "experience": "15 years",
  "qualifications": "Licensed electrician",
  "licences": "EC123456",
  "businessHoursFee": 150.00,
  "outOfHoursFee": 250.00,
  "services": ["electrician"],
  "businessHours": [
    {
      "day": 0,
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true
    }
  ],
  "bankingDetails": {
    "accountName": "John Smith",
    "bsb": "123456",
    "accountNumber": "123456789"
  }
}

Response (201):
{
  "success": true,
  "data": {
    "businessId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending_approval",
    "message": "Business registered. Awaiting admin approval."
  }
}
```

### 8.2 Upload Business Images
```
POST /businesses/{businessId}/images

Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Request:
{
  "images": [File, File, File]
}

Response (200):
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "img-001",
        "url": "https://s3.amazonaws.com/..."
      }
    ],
    "uploadedCount": 3
  }
}
```

### 8.3 Get Business Dashboard
```
GET /businesses/dashboard

Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "businessInfo": { /* business details */ },
    "stats": {
      "totalBookings": 150,
      "completedBookings": 145,
      "avgRating": 4.8,
      "totalReviews": 145,
      "totalEarnings": 15000.00,
      "pendingPayouts": 500.00
    },
    "recentBookings": [ /* last 5 bookings */ ],
    "pendingApprovals": 2
  }
}
```

### 8.4 Update Business Profile
```
PUT /businesses/{businessId}

Headers: Authorization: Bearer <token>

Request:
{
  "description": "Updated description",
  "experience": "20 years",
  "businessHoursFee": 160.00,
  "outOfHoursFee": 260.00
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Business profile updated"
  }
}
```

### 8.5 Accept Booking
```
PUT /bookings/{bookingId}/accept

Headers: Authorization: Bearer <token>

Request:
{
  "businessNotes": "Can be there by 2 PM"
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Booking accepted. Customer notified.",
    "paymentRequired": true,
    "expectedPayment": 250.00
  }
}
```

### 8.6 Decline Booking
```
PUT /bookings/{bookingId}/decline

Headers: Authorization: Bearer <token>

Request:
{
  "reason": "Currently unavailable"
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Booking declined. Customer notified."
  }
}
```

---

## 9. Payment Endpoints

### 9.1 Create Payment Intent
```
POST /payments/create-intent

Headers: Authorization: Bearer <token>

Request:
{
  "bookingId": "booking-001"
}

Response (200):
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_xyz",
    "amount": 250.00,
    "currency": "AUD",
    "setupIntentId": "seti_123..."
  }
}
```

### 9.2 Get Payment Status
```
GET /payments/{bookingId}

Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "bookingId": "booking-001",
    "status": "completed",
    "amount": 250.00,
    "commission": 25.00,
    "payoutAmount": 225.00,
    "paymentDate": "2026-06-24T15:00:00Z",
    "payoutDate": "2026-06-25T09:00:00Z"
  }
}
```

### 9.3 Webhook: Payment Completed
```
POST /webhooks/stripe/payment-completed

Headers: Stripe-Signature: t=<timestamp>,v1=<signature>

{
  "id": "evt_1234567890",
  "type": "charge.succeeded",
  "data": {
    "object": {
      "id": "ch_1234567890",
      "amount": 25000,
      "metadata": {
        "bookingId": "booking-001"
      }
    }
  }
}

Response (200):
{
  "success": true,
  "received": true
}
```

---

## 10. Review & Rating Endpoints

### 10.1 Submit Review
```
POST /reviews

Headers: Authorization: Bearer <token>

Request:
{
  "bookingId": "booking-001",
  "businessId": "550e8400-e29b-41d4-a716-446655440000",
  "rating": 5,
  "comment": "Excellent service, highly recommended!"
}

Response (201):
{
  "success": true,
  "data": {
    "reviewId": "rev-001",
    "message": "Review submitted successfully"
  }
}
```

### 10.2 Get Business Reviews
```
GET /businesses/{businessId}/reviews

Query Parameters:
  - page: 1
  - limit: 10
  - sortBy: newest|highest|lowest

Response (200):
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev-001",
        "customerName": "Jane Doe",
        "rating": 5,
        "comment": "Great service!",
        "createdAt": "2026-06-20T10:00:00Z"
      }
    ],
    "avgRating": 4.8,
    "totalReviews": 145,
    "ratingDistribution": {
      "5": 120,
      "4": 20,
      "3": 5
    }
  }
}
```

---

## 11. Admin Endpoints

### 11.1 Get Pending Approvals
```
GET /admin/approvals/pending

Headers: Authorization: Bearer <admin_token>

Query Parameters:
  - page: 1
  - limit: 20
  - type: business

Response (200):
{
  "success": true,
  "data": {
    "pendingApprovals": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "type": "business",
        "name": "ABC Electrical",
        "abn": "11111111111",
        "submittedAt": "2026-06-23T10:00:00Z"
      }
    ],
    "total": 12,
    "page": 1
  }
}
```

### 11.2 Approve Business
```
PUT /admin/approvals/{businessId}/approve

Headers: Authorization: Bearer <admin_token>

Request:
{
  "notes": "All documents verified"
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Business approved successfully"
  }
}
```

### 11.3 Reject Business
```
PUT /admin/approvals/{businessId}/reject

Headers: Authorization: Bearer <admin_token>

Request:
{
  "reason": "Invalid ABN"
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Business rejected. Business owner notified."
  }
}
```

### 11.4 Suspend Account
```
PUT /admin/users/{userId}/suspend

Headers: Authorization: Bearer <admin_token>

Request:
{
  "reason": "Fraudulent activity detected"
}

Response (200):
{
  "success": true,
  "data": {
    "message": "User account suspended"
  }
}
```

### 11.5 Get Analytics
```
GET /admin/analytics

Headers: Authorization: Bearer <admin_token>

Query Parameters:
  - startDate: 2026-06-01
  - endDate: 2026-06-30
  - metrics: revenue, bookings, reviews, users

Response (200):
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2026-06-01",
      "endDate": "2026-06-30"
    },
    "metrics": {
      "totalBookings": 450,
      "completedBookings": 445,
      "totalRevenue": 45000.00,
      "commission": 4500.00,
      "newBusinesses": 25,
      "newCustomers": 150,
      "avgRating": 4.7
    }
  }
}
```

---

## 12. Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| AUTHENTICATION_FAILED | 401 | Invalid credentials |
| UNAUTHORIZED | 403 | Access denied |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| PAYMENT_FAILED | 402 | Payment processing failed |
| EXTERNAL_SERVICE_ERROR | 500 | Third-party service error |
| INTERNAL_SERVER_ERROR | 500 | Server error |

---

## 13. Rate Limiting

**Global Limits:**
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user
- 10 payment requests per minute per user

**Reset Window:** Rolling 60 seconds

**Headers Returned:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1624530065
```

---

## 14. Pagination

All list endpoints support pagination:

```
Query Parameters:
  - page: Page number (1-based)
  - limit: Items per page (1-100, default: 20)
  - sortBy: Sort field
  - order: asc|desc

Response:
{
  "data": { /* items */ },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true,
    "totalPages": 8
  }
}
```

---

**Document Version:** 1.0
**Last Updated:** June 2026
**API Version:** 1.0
**Status:** Draft
