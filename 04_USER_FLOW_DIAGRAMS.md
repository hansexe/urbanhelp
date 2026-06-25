# Urban Help - User Flow Diagrams

## 1. Customer Registration Flow

```
┌─────────────────┐
│  Customer Lands  │
│  on Homepage    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Click "Sign Up"│
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│  Enter Registration Form  │
│  - First Name            │
│  - Last Name             │
│  - Email                 │
│  - Mobile                │
│  - Address, Suburb, etc  │
│  - Password              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Frontend Validation      │
│ - Check password strength│
│ - Check email format     │
│ - Check address fields   │
└────────┬─────────────────┘
         │
      Valid?
      │ │
   Yes│ │No
      ▼ ▼
      │ ┌────────────────┐
      │ │Show Error Msgs │
      │ └────────┬───────┘
      │          │
      │ (user corrects)
      │          │
      │◄─────────┘
      │
      ▼
┌──────────────────────────┐
│ POST /auth/register      │
│ (Backend Validation)     │
└────────┬─────────────────┘
         │
      Registered?
      │ │
   Yes│ │No
      ▼ ▼
      │ ┌─────────────────┐
      │ │Show Error       │
      │ │(email already   │
      │ │ used)           │
      │ └────────┬────────┘
      │          │
      │ (user retries)
      │          │
      │◄─────────┘
      │
      ▼
┌──────────────────────────┐
│ Twilio: Send OTP SMS     │
│ "Your OTP: 123456"       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ SendGrid: Send Email     │
│ Verification Link        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Show OTP Verification    │
│ Page                     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ User Enters OTP          │
│ from SMS                 │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ POST /auth/verify-otp    │
└────────┬─────────────────┘
         │
      Valid?
      │ │
   Yes│ │No
      ▼ ▼
      │ ┌────────────────┐
      │ │Show Error      │
      │ │Resend OTP link │
      │ └────────┬───────┘
      │          │
      │ (user retries)
      │          │
      │◄─────────┘
      │
      ▼
┌──────────────────────────┐
│ Mark Email Verified      │
│ Mark Phone Verified      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Issue JWT Token          │
│ Store Refresh Token      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Redirect to Homepage     │
│ Show Welcome Message     │
│ User Logged In           │
└──────────────────────────┘
```

---

## 2. Customer Login Flow

```
┌─────────────────┐
│  Customer on    │
│  Login Page     │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│  Enter Credentials       │
│  - Email/Mobile          │
│  - Password              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ POST /auth/login         │
│ Backend Validation       │
└────────┬─────────────────┘
         │
      Credentials Valid?
      │ │
   Yes│ │No
      ▼ ▼
      │ ┌────────────────┐
      │ │Show Error      │
      │ │Re-prompt Login │
      │ └────────┬───────┘
      │          │
      │          │◄─────────┐
      │          │           │
      │          └─→ (retry) │
      │                      │
      ├──────────────────────┘
      │
      ▼
┌──────────────────────────┐
│ Issue JWT + Refresh      │
│ Token                    │
│ Store in LocalStorage    │
│ Set HTTP-Only Cookie     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Redirect to Dashboard    │
│ or Homepage              │
└──────────────────────────┘
```

---

## 3. Search & Browse Businesses Flow

```
┌─────────────────────────┐
│  Homepage or Search     │
│  Page                   │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Click "Find a          │
│  Professional"           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  User Lands on Search    │
│  Page                    │
└────────┬─────────────────┘
         │
         ├─────────────────────────────┐
         │                             │
         ▼                             ▼
┌──────────────────────┐     ┌──────────────────────┐
│  Select Service Type │     │  Enter Address       │
│  (Dropdown)          │     │  - Type Suburb or    │
│  - Electrician       │     │    Postcode          │
│  - Plumber           │     │  - Autocomplete      │
│  - etc.              │     │    (Google Places)   │
└──────────┬───────────┘     └──────────┬───────────┘
           │                           │
           └────────────┬──────────────┘
                        │
                        ▼
           ┌──────────────────────────┐
           │  Click "Search"          │
           └────────┬─────────────────┘
                    │
                    ▼
           ┌──────────────────────────┐
           │  GET /search/businesses  │
           │  - serviceType           │
           │  - suburb/postcode       │
           │  - radius: 25km default  │
           └────────┬─────────────────┘
                    │
                    ▼
           ┌──────────────────────────┐
           │  Database Query:         │
           │  1. Exact match suburb   │
           │  2. Exact match postcode │
           │  3. Distance calc        │
           │  4. Expand radius        │
           └────────┬─────────────────┘
                    │
                    ▼
           ┌──────────────────────────┐
           │  Display Results         │
           │  - Business Cards        │
           │  - Distance              │
           │  - Rating / Reviews      │
           │  - Service Type          │
           │  - Image                 │
           │  (2 cols on desktop)     │
           └────────┬─────────────────┘
                    │
                    ├──────────────────────────────┐
                    │                              │
                    ▼                              ▼
        ┌───────────────────────┐    ┌─────────────────────────┐
        │  Click Business Card  │    │  Apply Filters/Sort     │
        │  to View Details      │    │  - Sort by Rating       │
        └───────────┬───────────┘    │  - Sort by Distance     │
                    │                │  - Filter by Rating     │
                    │                └────────┬────────────────┘
                    │                         │
                    │         ┌───────────────┘
                    │         │
                    ▼         ▼
           ┌──────────────────────────┐
           │  Display Business Profile│
           │  - Images Gallery        │
           │  - Description           │
           │  - Qualifications        │
           │  - Hours & Fees          │
           │  - Reviews               │
           │  - "Hire Now" Button     │
           └────────┬─────────────────┘
                    │
                    ▼
           ┌──────────────────────────┐
           │  Click "Hire Now"        │
           │  (See Booking Flow)      │
           └──────────────────────────┘
```

---

## 4. Complete Booking Request Flow

```
┌────────────────────────┐
│  Business Profile Page │
│  "Hire Now" Button     │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Show Booking Form     │
│  (Prefill if logged in)│
│  - Problem Description │
│  - Urgent/Scheduled    │
│  - Appointment Date    │
│  - Time Slot (if sched)│
│  - Notes               │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  User Selects:         │
│  1. URGENT (ASAP)      │
│     OR                 │
│  2. SCHEDULE LATER     │
└────────┬───────────────┘
         │
         ├──────────┬──────────┐
         │          │          │
      Urgent?   Scheduled?
         │          │
         ▼          ▼
    ┌────────┐  ┌──────────┐
    │ Use    │  │ Show Date│
    │ Out-of │  │ Picker   │
    │ Hours  │  │ & Time   │
    │ Fee    │  │ Slots    │
    └───┬────┘  └────┬─────┘
        │            │
        │            ▼
        │         ┌─────────┐
        │         │ Business│
        │         │ Hours   │
        │         │ Query   │
        │         └────┬────┘
        │              │
        └──────┬───────┘
               │
               ▼
    ┌──────────────────────┐
    │  User Submits Form   │
    │  + Address Auto-fill │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Calculate Call-Out   │
    │ Fee Based On:        │
    │ - Service Type       │
    │ - Urgent/Scheduled   │
    │ - Business Hours Fee │
    │ - Out-of-Hours Fee   │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ POST /bookings       │
    │ (Create Booking)     │
    │ Status: PENDING      │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Generate Secure Link │
    │ for Business         │
    └────────┬─────────────┘
             │
             ├──────────────────────┬──────────────┐
             │                      │              │
             ▼                      ▼              ▼
    ┌────────────────┐    ┌────────────┐  ┌────────────┐
    │ Twilio SMS     │    │ SendGrid   │  │ Update     │
    │ to Business    │    │ Email to   │  │ Dashboard  │
    │ "New Booking"  │    │ Business   │  │ (Pending)  │
    └────────┬───────┘    └────┬───────┘  └────────────┘
             │                 │
             └────────┬────────┘
                      │
                      ▼
    ┌──────────────────────────┐
    │ Show Confirmation Page   │
    │ "Request Sent"           │
    │ "Awaiting Response"       │
    │ Estimated Fee: $XXX      │
    └────────┬─────────────────┘
             │
    ┌────────┴─────────────────────────┐
    │  Business Now Reviews Booking    │
    │  See Business Response Flow      │
    │                                  │
    │ ┌─────────────────────────────┐  │
    │ │ Business Clicks Link in SMS │  │
    │ └──────────┬──────────────────┘  │
    │            │                     │
    │            ▼                     │
    │ ┌─────────────────────────────┐  │
    │ │ Business Response Page:     │  │
    │ │ - View Details              │  │
    │ │ - Accept / Decline          │  │
    │ └──────────┬──────────────────┘  │
    │            │                     │
    │     ┌──────┴──────┐              │
    │     │             │              │
    │   Accept?       Decline?         │
    │     │             │              │
    │     ▼             ▼              │
    │ ┌────────┐  ┌──────────┐        │
    │ │ Yes    │  │ No       │        │
    │ └───┬────┘  └────┬─────┘        │
    └────┼─────────────┼──────────────┘
         │             │
         ▼             ▼
    ┌──────────┐  ┌──────────────────┐
    │ACCEPTED  │  │ CANCELLED        │
    │          │  │ (See Cancellation)
    │See       │  │ SMS: "Provider   │
    │Payment   │  │ unavailable"     │
    │Flow      │  └──────────────────┘
    └──────────┘
```

---

## 5. Payment Processing Flow

```
┌──────────────────────┐
│  Business Accepts    │
│  Booking             │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Send SMS to Customer │
│ "Booking Accepted"   │
│ Include Payment Link │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Customer Clicks     │
│  Payment Link        │
│  (Email or SMS)      │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Stripe Payment Page │
│  - Secure Checkout   │
│  - Amount: $XXX      │
│  - Card Details      │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  POST /payments/     │
│  create-intent       │
│  (Stripe)            │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Stripe Processes     │
│ Payment              │
└────────┬─────────────┘
         │
      Success?
      │ │
   Yes│ │No
      ▼ ▼
      │ ┌────────────────┐
      │ │Show Error      │
      │ │"Payment Failed"│
      │ │Retry Link      │
      │ └────────┬───────┘
      │          │
      │ (retry)  │
      │          │
      │◄─────────┘
      │
      ▼
┌──────────────────────┐
│ Stripe Webhook:      │
│ charge.succeeded     │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Backend Creates      │
│ Payment Record       │
│ - Amount: $250       │
│ - Commission: $25    │
│ - Payout: $225       │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Update Booking       │
│ Status: CONFIRMED    │
└────────┬─────────────┘
         │
         ├───────────────────────┬──────────────┐
         │                       │              │
         ▼                       ▼              ▼
    ┌─────────┐           ┌──────────┐   ┌──────────┐
    │ SendGrid│           │ SendGrid │   │Twilio SMS│
    │ to      │           │ to       │   │ to       │
    │Customer │           │Business  │   │ Customer │
    │Payment  │           │Payment   │   │Booking   │
    │Confirm  │           │Details   │   │Confirmed │
    └────┬────┘           └────┬─────┘   └────┬─────┘
         │                     │              │
         └──────────┬──────────┴──────────────┘
                    │
                    ▼
    ┌──────────────────────────┐
    │ Business Now Receives:   │
    │ - Customer Name          │
    │ - Customer Phone         │
    │ - Customer Address       │
    │ - Problem Details        │
    │ - Appointment Time       │
    │ - ETA Required           │
    └──────────────────────────┘
```

---

## 6. Business Registration Flow

```
┌────────────────────┐
│ Homepage           │
│ "Join as Business" │
└────────┬───────────┘
         │
         ▼
┌────────────────────────────┐
│ Business Registration Form │
│ Step 1: Basic Details      │
│ - Business Name            │
│ - ABN                      │
│ - Owner Name               │
│ - Email & Mobile           │
│ - Address                  │
│ - Service Radius           │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Step 2: Services & Hours   │
│ - Select Services          │
│ - Business Hours/Fees      │
│ - Out-of-Hours Fee         │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Step 3: Description        │
│ - About Business           │
│ - Experience               │
│ - Qualifications           │
│ - Licences                 │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Step 4: Upload Images      │
│ - Min 3, Max 10            │
│ - Max 500KB each           │
│ - Drag & Drop              │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Step 5: Banking Details    │
│ - Account Name             │
│ - BSB                      │
│ - Account Number           │
│ - Stripe Connect Setup     │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Review All Information     │
│ - Edit Links               │
│ - Commission Notice (10%)  │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ POST /businesses/register  │
│ Backend Validation:        │
│ - Email unique             │
│ - ABN valid (ASIC)         │
│ - Images uploaded          │
└────────┬───────────────────┘
         │
      Validate?
      │ │
   Yes│ │No
      ▼ ▼
      │ ┌─────────────┐
      │ │ Show Error  │
      │ │ (Step X)    │
      │ └────┬────────┘
      │      │
      │      │◄─────┐
      │      │      │
      │      └─ Correct
      │
      ▼
┌────────────────────────────┐
│ Twilio: OTP to Mobile      │
│ "Business OTP: XXXXXX"     │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ SendGrid: Email Link       │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Show Verification Page     │
│ - OTP Input                │
│ - Resend Links             │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Verify OTP & Email         │
│ POST /auth/verify-otp      │
└────────┬───────────────────┘
         │
      Verified?
      │ │
   Yes│ │No
      ▼ ▼
      │ ┌─────────────┐
      │ │ Show Error  │
      │ │ Resend      │
      │ └────┬────────┘
      │      │
      │      │◄─────┐
      │      │      │
      │      └─ Retry
      │
      ▼
┌────────────────────────────┐
│ Create Business Record     │
│ Status: PENDING_APPROVAL   │
│ is_approved: false         │
│ is_verified: false         │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Show Success Page          │
│ "Registration Submitted"   │
│ "Awaiting Admin Review"    │
│ "Can take 24-48 hours"     │
└────────┬───────────────────┘
         │
┌────────┴──────────────────────────┐
│ Admin Review Process:              │
│                                    │
│ ┌────────────────────────────┐    │
│ │ Admin Portal               │    │
│ │ GET /admin/approvals/      │    │
│ │ pending                    │    │
│ └────────┬───────────────────┘    │
│          │                        │
│          ▼                        │
│ ┌────────────────────────────┐    │
│ │ Admin Reviews Details:     │    │
│ │ - Images Quality           │    │
│ │ - Business Legitimacy      │    │
│ │ - Documentation            │    │
│ └────────┬───────────────────┘    │
│          │                        │
│    ┌─────┴─────┐                 │
│    │           │                 │
│  Approve?   Reject?              │
│    │           │                 │
│    ▼           ▼                 │
│ ┌─────┐  ┌──────────┐            │
│ │Yes  │  │No        │            │
│ └──┬──┘  └────┬─────┘            │
└───┼──────────┼─────────────────┘
    │          │
    ▼          ▼
 ┌────────┐ ┌──────────┐
 │Approved│ │Rejected  │
 │        │ │          │
 │SendGrid│ │SendGrid  │
 │Email   │ │Rejection │
 │        │ │Email     │
 └────────┘ └──────────┘
```

---

## 7. Review & Rating Flow

```
┌────────────────────┐
│ Booking Completed  │
│ (Status: COMPLETED)│
└────────┬───────────┘
         │
         ▼
┌────────────────────────┐
│  Customer Receives     │
│  SMS & Email:          │
│  "How was your        │
│   experience?"        │
│  + Review Link        │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Click Review Link or  │
│  Navigate to Dashboard │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Review Form:          │
│  - Star Rating (1-5)   │
│  - Optional Comment    │
│  - Submit              │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  POST /reviews         │
│  (Store Review)        │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Backend Updates:      │
│  - Business Rating     │
│  - Review Count        │
│  - Rating Distribution │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  SendGrid Email:       │
│  Business:             │
│  "New Review Received" │
│  ★★★★★ "Great work!"  │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Show Success Page     │
│  "Thanks for Review"   │
│  "Rating: 4.8/5"       │
│  Display on Profile    │
└────────────────────────┘
```

---

## 8. Business Decline Booking Flow

```
┌─────────────────────────┐
│ Business Receives       │
│ Booking Request         │
│ in Email/SMS            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Business Clicks Link    │
│ in SMS/Email            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Business Response Page  │
│ - Accept / Decline      │
│ Buttons                 │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Click "Decline"         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Confirmation Modal:     │
│ "Are you sure you want  │
│  to decline this        │
│  booking?"              │
│ [Yes] [Cancel]          │
└────────┬────────────────┘
         │
      Confirm?
      │ │
   Yes│ │No
      ▼ ▼
      │ ┌─────────────┐
      │ │ Close Modal │
      │ │ Return to   │
      │ │ Booking     │
      │ └────────┬────┘
      │          │
      │          │ (back to page)
      │          │
      │◄─────────┘
      │
      ▼
┌─────────────────────────┐
│ PUT /bookings/{id}/     │
│ decline                 │
│ - reason: (optional)    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Backend Updates:        │
│ - Booking.status =      │
│   DECLINED              │
│ - Cancellation reason   │
│ - Timestamp             │
└────────┬────────────────┘
         │
         ├──────────────────┬──────────────┐
         │                  │              │
         ▼                  ▼              ▼
    ┌─────────┐        ┌─────────┐  ┌─────────┐
    │ Twilio  │        │SendGrid │  │Business │
    │ SMS to  │        │ Email   │  │ Success │
    │Customer │        │ to      │  │ Message │
    │"Provider│        │Customer │  │"Booking │
    │ Not     │        │"Provider│  │Declined"│
    │Avail"   │        │ Unavail"│  └────┬────┘
    └────┬────┘        └────┬────┘       │
         │                  │             │
         └──────────┬───────┴─────────────┘
                    │
                    ▼
    ┌──────────────────────────────┐
    │ Customer Can Now:            │
    │ 1. Browse Other Providers    │
    │ 2. Request Another Business  │
    │ 3. Similar Services Page     │
    └──────────────────────────────┘
```

---

## 9. Admin Approval Workflow

```
┌──────────────────────┐
│ Business Submitted   │
│ Registration         │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Admin Portal Dashboard       │
│ GET /admin/approvals/pending │
│ Shows:                       │
│ - Business Name              │
│ - Submission Date            │
│ - Documents Status           │
│ - Action Buttons             │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Admin Clicks to View Details │
│ - All Information            │
│ - Images                     │
│ - Documents                  │
│ - Verification Status        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Admin Decision:              │
│ ┌──────────────┐             │
│ │  Approve     │ (if valid)  │
│ │  Reject      │ (if issues) │
│ │  Request More│ (if needed) │
│ │  Information │             │
│ └──────────────┘             │
└────────┬─────────────────────┘
         │
    ┌────┴────────────────────┐
    │                         │
    ▼                         ▼
┌──────────────┐          ┌──────────────┐
│  APPROVED    │          │   REJECTED   │
│              │          │              │
│ Update:      │          │ Update:      │
│ - is_approved│          │ - rejection_ │
│   = true     │          │   reason     │
│ - approval_  │          │ - status =   │
│   status =   │          │   REJECTED   │
│   APPROVED   │          └────────┬─────┘
│ - Display in │                  │
│   Search     │         SendGrid Email:
│ - SendGrid   │         "Application
│   Email to   │          Rejected"
│   Business   │         + Reason +
│   Success    │         Contact Info
│   Message    │
└──────────────┘
```

---

## 10. User State Diagram

```
                    ┌─────────────────┐
                    │  NOT_REGISTERED │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   User Enters   │
                    │ Registration    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ REGISTERED_     │
                    │ UNVERIFIED      │
                    │                 │
                    │ - Email Pending │
                    │ - Phone Pending │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    Verify Email         Both Verified      Verify Phone
         │                   │                   │
         ▼                   ▼                   ▼
    ┌────────┐          ┌────────┐          ┌────────┐
    │ PARTIAL│          │ ACTIVE │          │ PARTIAL│
    │VERIFIED│          │        │          │VERIFIED│
    └────────┘          └───┬────┘          └────────┘
         │                  │                   │
         └──────────────────┼───────────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
                Suspend          Deactivate
                    │                │
                    ▼                ▼
              ┌──────────┐      ┌──────────┐
              │SUSPENDED │      │INACTIVE  │
              │          │      │          │
              └──────────┘      └──────────┘
```

---

**Document Version:** 1.0
**Last Updated:** June 2026
**Status:** Draft
