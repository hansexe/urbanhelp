# Urban Help - Wireframes & Layout Specifications

## 1. Homepage - Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER (Sticky)                                                     │
│ [Logo] Urban Help                    [Login] [Sign Up]              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                  ┌───────────────────────────────────────┐          │
│                  │      HERO SECTION                     │          │
│                  │   Large Background Image              │          │
│                  │   (Tradespeople working)              │          │
│                  │                                       │          │
│                  │   "Need a trusted local tradesperson? │          │
│                  │    Find verified electricians,        │          │
│                  │    plumbers, locksmiths near you"    │          │
│                  │                                       │          │
│                  │   [Find a Professional] [Join as Biz] │          │
│                  │                                       │          │
│                  └───────────────────────────────────────┘          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        HOW IT WORKS SECTION                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    │
│  │   Step1  │    │   Step2  │    │   Step3  │    │   Step4  │    │
│  │  Search  │───▶│ Request  │───▶│  Payment │───▶│Complete  │    │
│  │          │    │ Booking  │    │          │    │ & Review │    │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    │
├─────────────────────────────────────────────────────────────────────┤
│                   WHY CHOOSE URBAN HELP SECTION                     │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
│  │  ✓ Verified     │  │  ✓ 24/7 Support  │  │  ✓ Fair Pricing │   │
│  │    Tradespeople │  │    Available     │  │    10%           │   │
│  └─────────────────┘  └──────────────────┘  └─────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                    EMERGENCY SERVICES SECTION                       │
│  Urgent repairs needed? We connect you with emergency services     │
│  Available 24/7 - Call now or book online                          │
│  [Emergency Bookings]                                              │
├─────────────────────────────────────────────────────────────────────┤
│                   SERVICE CATEGORIES SECTION                        │
│  [Electrician] [Plumber] [Builder] [Carpenter] [Locksmith]        │
│  [Handyman]   [Other]                                              │
├─────────────────────────────────────────────────────────────────────┤
│                    CUSTOMER REVIEWS SECTION                         │
│  ⭐⭐⭐⭐⭐ "Amazing service!" - John D.                            │
│  ⭐⭐⭐⭐⭐ "Highly recommend!" - Sarah M.                          │
│  ⭐⭐⭐⭐⭐ "Professional & quick" - Mike T.                        │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                              │
│ About | Contact | Privacy | Terms | FAQs    Copyright © 2026      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Homepage - Mobile Layout

```
┌──────────────────────────┐
│ HEADER (Sticky)          │
│ [≡] [Logo] [👤]          │
├──────────────────────────┤
│    HERO SECTION          │
│  (Tall Portrait Image)   │
│                          │
│  "Need a trusted        │
│   local tradesperson?   │
│   Find verified         │
│   professionals near    │
│   you."                 │
│                          │
│  [Find Professional]    │
│  [Join as Business]     │
├──────────────────────────┤
│  HOW IT WORKS            │
│                          │
│  Step 1: Search          │
│  Step 2: Request         │
│  Step 3: Payment         │
│  Step 4: Review          │
├──────────────────────────┤
│  WHY CHOOSE US           │
│                          │
│  ✓ Verified              │
│    Professionals        │
│                          │
│  ✓ 24/7 Support         │
│                          │
│  ✓ Fair Pricing         │
├──────────────────────────┤
│  EMERGENCY SERVICES      │
│                          │
│  Available 24/7          │
│  [Book Emergency]        │
├──────────────────────────┤
│  CATEGORIES              │
│                          │
│  [Electrician]           │
│  [Plumber]               │
│  [Builder]               │
│  [Carpenter]             │
│  [Locksmith]             │
│  [More...]               │
├──────────────────────────┤
│  REVIEWS                 │
│                          │
│  ⭐⭐⭐⭐⭐             │
│  "Amazing!"              │
│  - John D.               │
│                          │
│  ⭐⭐⭐⭐⭐             │
│  "Highly recommend"      │
│  - Sarah M.              │
├──────────────────────────┤
│ FOOTER (Compact)         │
│ About | Contact | Terms  │
│ © 2026 Urban Help        │
└──────────────────────────┘
```

---

## 3. Search Results Page - Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER (Sticky)                                                     │
│ [Logo] Urban Help           [User Name ▼] [Logout]                  │
├─────────────────────────────────────────────────────────────────────┤
│  SEARCH REFINEMENT BAR (Horizontal)                                 │
│  [Service Type ▼] [Suburb/Postcode] [Radius 25km ▼] [Search]      │
│  [Filters ▼] [Sort by ▼]                                            │
├─────────────────────────────────────────────────────────────────────┤
│ RESULTS: 45 businesses found                        Page 1 of 3    │
├──────────────────────────────┬──────────────────────────────────────┤
│                              │                                      │
│   BUSINESS CARD              │   BUSINESS CARD                      │
│  ┌──────────────────────────┐│┌──────────────────────────────────┐ │
│  │ 0.5 km    Electrician ↗  ││ 2.3 km    Electrician ↗           │ │
│  │                          ││                                    │ │
│  │   [BUSINESS IMAGE]       ││   [BUSINESS IMAGE]                │ │
│  │                          ││                                    │ │
│  │  ABC Electrical          ││  XYZ Services                      │ │
│  │  ⭐⭐⭐⭐⭐ 4.8 (235)    ││  ⭐⭐⭐⭐☆ 4.5 (128)              │ │
│  └──────────────────────────┘│└──────────────────────────────────┘ │
│                              │                                      │
│   BUSINESS CARD              │   BUSINESS CARD                      │
│  ┌──────────────────────────┐│┌──────────────────────────────────┐ │
│  │ 3.1 km    Electrician ↗  ││ 5.2 km    Electrician ↗           │ │
│  │                          ││                                    │ │
│  │   [BUSINESS IMAGE]       ││   [BUSINESS IMAGE]                │ │
│  │                          ││                                    │ │
│  │  Pro Electric            ││  Elite Trades                      │ │
│  │  ⭐⭐⭐⭐⭐ 4.7 (189)    ││  ⭐⭐⭐⭐⭐ 4.6 (95)               │ │
│  └──────────────────────────┘│└──────────────────────────────────┘ │
│                              │                                      │
├──────────────────────────────┴──────────────────────────────────────┤
│ [Prev] Page 1 of 3 [Next]     Showing 4 of 45 results              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Search Results - Mobile

```
┌──────────────────────────┐
│ HEADER (Sticky)          │
│ [≡] [Logo] [👤]          │
├──────────────────────────┤
│ FILTERS (Collapsible)    │
│ ┌──────────────────────┐ │
│ │Service: Electrician ✓│ │
│ │Suburb: North Melb  ✓ │ │
│ │ Radius: 25km         │ │
│ │[Clear] [Apply]       │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ Results: 45 found        │
│                          │
│ BUSINESS CARD            │
│ ┌──────────────────────┐ │
│ │ 0.5 km               │ │
│ │ [IMAGE]              │ │
│ │                      │ │
│ │ ABC Electrical       │ │
│ │ ⭐ 4.8 (235)        │ │
│ │ [View Details]       │ │
│ └──────────────────────┘ │
│                          │
│ BUSINESS CARD            │
│ ┌──────────────────────┐ │
│ │ 2.3 km               │ │
│ │ [IMAGE]              │ │
│ │                      │ │
│ │ XYZ Services         │ │
│ │ ⭐ 4.5 (128)        │ │
│ │ [View Details]       │ │
│ └──────────────────────┘ │
│                          │
│ [Load More...]           │
├──────────────────────────┤
│ FOOTER                   │
│ © 2026 Urban Help        │
└──────────────────────────┘
```

---

## 5. Business Profile Page - Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER (Sticky)                                                     │
│ [Logo] Urban Help           [User Name ▼] [Logout]                  │
├─────────────────────────────────────────────────────────────────────┤
│  [Back to Results]                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ BUSINESS HEADER                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  ABC Electrical                                                 │ │
│ │  ⭐⭐⭐⭐⭐ 4.8 out of 5 (235 reviews)    ✓ Verified              │ │
│ │  Distance: 0.5 km  | Service: Electrician                       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  IMAGE GALLERY                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         [Main Image Display - Large]                         │  │
│  │                                                              │  │
│  │     [Thumbnail1] [Thumbnail2] [Thumbnail3] [Thumbnail4]    │  │
│  └──────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│ LEFT COLUMN                    │ RIGHT COLUMN                       │
├─────────────────────────────┬───┼────────────────────────────────────┤
│ ABOUT BUSINESS              │   │ CALL-OUT FEES                     │
│                             │   │                                   │
│ "Professional electrical    │   │ Business Hours Fee:    $150.00   │
│  services for residential   │   │ Out-of-Hours Fee:      $250.00   │
│  and commercial properties. │   │ Emergency Available:   YES       │
│  15+ years experience."     │   │                                   │
│                             │   │ SERVICE AREAS                     │
│ EXPERIENCE                  │   │ North Melbourne, Coburg,         │
│ 15+ years in residential    │   │ Northcote, Carlton (25km radius) │
│ and commercial              │   │                                   │
│                             │   │ BUSINESS HOURS                   │
│ QUALIFICATIONS              │   │ Mon-Fri: 9:00 AM - 5:00 PM      │
│ - Licensed Electrician      │   │ Sat: 9:00 AM - 1:00 PM          │
│ - Level 2 Electrical        │   │ Sun: Closed                      │
│                             │   │ (24/7 Emergency Available)      │
│ LICENCES                    │   │                                   │
│ EC123456                    │   │ [HIRE NOW - Fixed Bottom Button] │
│                             │   │                                   │
└─────────────────────────────┴───┴────────────────────────────────────┤
│ REVIEWS SECTION                                                     │
│ Filter: [All] [5★] [4★] [3★]                                      │
│                                                                     │
│ Review 1                           Review 2                         │
│ ┌──────────────────┐              ┌──────────────────────┐         │
│ │⭐⭐⭐⭐⭐        │              │⭐⭐⭐⭐☆          │         │
│ │"Great service!"  │              │"Professional & quick"│         │
│ │John D. - Jun 20  │              │Sarah M. - Jun 18     │         │
│ └──────────────────┘              └──────────────────────┘         │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Booking Form - Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER (Sticky)                                                     │
│ [Logo] Urban Help           [User Name ▼] [Logout]                  │
├─────────────────────────────────────────────────────────────────────┤
│ BOOKING REQUEST FORM - ABC Electrical                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  REQUEST TYPE                                                       │
│  ○ Urgent / ASAP (Use Out-of-Hours Fee)                           │
│  ○ Schedule Appointment (Choose Date & Time)                       │
│                                                                     │
│  PROBLEM DESCRIPTION *                                             │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Describe your issue in detail...                             │ │
│  │                                                              │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  APPOINTMENT DATE *        │  APPOINTMENT TIME *                   │
│  ┌──────────────────────┐  │  ┌──────────────────────────────┐   │
│  │ Select Date ▼        │  │  │ Select Time Slot ▼          │   │
│  │ 2026-06-25           │  │  │ 9:00 AM - 11:00 AM         │   │
│  │ (Min: Today)         │  │  │ 11:00 AM - 1:00 PM         │   │
│  └──────────────────────┘  │  │ 1:00 PM - 3:00 PM          │   │
│                             │  │ 3:00 PM - 5:00 PM          │   │
│                             │  └──────────────────────────────┘   │
│                                                                     │
│  ADDITIONAL NOTES (Optional)                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Any special instructions? (e.g., gate code, access notes)   │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ESTIMATED COST                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Service Fee: $250.00                                         │ │
│  │ (Urban Help 10% Commission already included in estimate)     │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  CUSTOMER INFORMATION (Prefilled if logged in)                      │
│  Name: John Doe                    │  Phone: +61412345678          │
│  Address: 123 Main St, North Melb  │                              │
│                                                                     │
│  ☑ I agree to the Terms of Service                                │
│                                                                     │
│  [Cancel]  [Request Booking]                                       │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Booking Form - Mobile

```
┌──────────────────────────┐
│ HEADER                   │
│ [≡] [Logo] [👤]          │
├──────────────────────────┤
│ BOOKING REQUEST          │
│ ABC Electrical           │
├──────────────────────────┤
│ REQUEST TYPE             │
│ ○ Urgent / ASAP         │
│ ○ Schedule Later         │
├──────────────────────────┤
│ PROBLEM *                │
│ ┌──────────────────────┐ │
│ │ Describe your issue..│ │
│ │                      │ │
│ │                      │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ APPOINTMENT DATE *       │
│ [Select Date ▼]          │
│ 2026-06-25               │
├──────────────────────────┤
│ APPOINTMENT TIME *       │
│ [Select Time ▼]          │
│ 9:00 AM - 11:00 AM      │
├──────────────────────────┤
│ NOTES (Optional)         │
│ ┌──────────────────────┐ │
│ │ Special instructions │ │
│ │                      │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ ESTIMATED COST:          │
│ $250.00                  │
│ (Incl. fees)             │
├──────────────────────────┤
│ YOUR DETAILS             │
│ Name: John Doe           │
│ Phone: +6141234567       │
│ Address: 123 Main St     │
├──────────────────────────┤
│ ☑ Agree to Terms        │
│                          │
│ [Cancel]                 │
│ [Request Booking]        │
├──────────────────────────┤
│ FOOTER                   │
└──────────────────────────┘
```

---

## 8. Customer Profile Page

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER (Sticky)                                                  │
│ [Logo] Urban Help           [User Name ▼] [Logout]               │
├──────────────────────────────────────────────────────────────────┤
│ PROFILE SETTINGS                                                 │
│ [Profile] [Bookings] [Reviews] [Settings]                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ PERSONAL INFORMATION                                             │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ First Name *           Last Name *                         │  │
│ │ [John            ]     [Doe             ]                 │  │
│ │                                                            │  │
│ │ Email *                                                    │  │
│ │ [john@example.com         ] [Edit] [Verify?]              │  │
│ │                                                            │  │
│ │ Phone *                                                    │  │
│ │ [+61412345678        ] [Edit] [Verify?]                   │  │
│ │                                                            │  │
│ │ Address *                                                  │  │
│ │ [123 Main Street, North Melbourne]                        │  │
│ │                                                            │  │
│ │ Suburb *               Postcode *       State *            │  │
│ │ [North Melb    ]       [3051    ]       [VIC]             │  │
│ │                                                            │  │
│ │ [Update Profile]                                           │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ SECURITY                                                         │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Current Password *                                         │  │
│ │ [*******************]                                      │  │
│ │                                                            │  │
│ │ New Password *                                             │  │
│ │ [*******************]                                      │  │
│ │ (Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 sym) │  │
│ │                                                            │  │
│ │ Confirm New Password *                                     │  │
│ │ [*******************]                                      │  │
│ │                                                            │  │
│ │ [Change Password]                                          │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ACCOUNT ACTIONS                                                  │
│ [Deactivate Account]  [Delete Account]                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Payment Confirmation Page

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                           │
│ [Logo] Urban Help                                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ✓ PAYMENT SUCCESSFUL                         │
│                                                                  │
│  Your booking has been confirmed!                               │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BOOKING DETAILS                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Booking ID: BK-2026-06-24-001                             │ │
│  │ Business: ABC Electrical                                  │ │
│  │ Service: Electrician                                      │ │
│  │ Appointment: Friday, June 25, 2026 at 2:00 PM           │ │
│  │ Location: 123 Main St, North Melbourne                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  PAYMENT DETAILS                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Amount Paid: $250.00 AUD                                  │ │
│  │ Card: Visa ending in 4242                                 │ │
│  │ Transaction ID: ch_1234567890                             │ │
│  │ Date: June 24, 2026 3:45 PM                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  WHAT'S NEXT?                                                   │
│  • The business will contact you by phone before the booking   │ │
│  • SMS updates will be sent to +61412345678                    │ │
│  • You can track the booking in your account                   │ │
│  • After service, you can leave a review                       │ │
│                                                                  │
│  EMAIL: A confirmation has been sent to john@example.com       │ │
│                                                                  │
│  [Back to Dashboard]  [View Booking]                            │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ FOOTER                                                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10. Review Submission Page

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER (Sticky)                                                  │
│ [Logo] Urban Help           [User Name ▼] [Logout]               │
├──────────────────────────────────────────────────────────────────┤
│ LEAVE A REVIEW                                                   │
│ ABC Electrical - June 20, 2026                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HOW WAS YOUR EXPERIENCE?                                        │
│                                                                  │
│  Rating *                                                        │
│  ☆ ☆ ☆ ☆ ☆  (Click to rate)                                    │
│  1 2 3 4 5                                                       │
│                                                                  │
│  COMMENT (Optional)                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Share your experience... (Max 500 characters)              │ │
│  │ "John was very professional and friendly..."              │ │
│  │                                                            │ │
│  │                                                            │ │
│  │                                                            │ │
│  │ Character count: 45 / 500                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ☑ I confirm this is a genuine review based on my experience   │ │
│                                                                  │
│  [Cancel]  [Submit Review]                                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. Business Registration - Step 1 Desktop

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                           │
│ [Logo] Urban Help                                                │
├──────────────────────────────────────────────────────────────────┤
│ BUSINESS REGISTRATION (Step 1 of 5)                              │
│ ▓▓▓░░░░░░░░░░░░░░░░░  20% Complete                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BUSINESS DETAILS                                                │
│                                                                  │
│  Business Name *                                                │
│  [ABC Electrical Services                    ]                  │
│                                                                  │
│  ABN *                                                           │
│  [11111111111            ]                                      │
│  (Will be validated with ASIC)                                 │
│                                                                  │
│  Owner Name *                                                   │
│  [John Smith                 ]                                  │
│                                                                  │
│  Business Email *                                                │
│  [contact@abcelectrical.com    ]                                │
│                                                                  │
│  Business Mobile *                                               │
│  [+61412345678            ]                                     │
│                                                                  │
│  Business Address *                                              │
│  [123 Main Street, North Melbourne]                             │
│                                                                  │
│  Suburb *              Postcode *         State *                │
│  [North Melb    ]      [3051    ]         [VIC ▼]               │
│                                                                  │
│  Service Radius (km) *                                           │
│  [25] (5-100 km)                                                │
│                                                                  │
│  Website URL (Optional)                                          │
│  [https://www.abcelectrical.com.au        ]                     │
│                                                                  │
│  [Next Step]                                                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 12. Business Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER (Sticky)                                                  │
│ [Logo] Urban Help      [Business Name ▼] [Settings] [Logout]     │
├──────────────────────────────────────────────────────────────────┤
│ [Profile] [Bookings] [Reviews] [Earnings] [Messages] [Settings]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  QUICK STATS                                                     │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐  │
│  │ Total        │ Completed    │ Avg Rating   │ Total Earns  │  │
│  │ Bookings     │ Bookings     │              │              │  │
│  │    150       │     145      │     4.8 ★    │   $15,000    │  │
│  └──────────────┴──────────────┴──────────────┴──────────────┘  │
│                                                                  │
│  PENDING BOOKINGS                                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Booking Date      Customer      Amount    Action           │  │
│  │─────────────────────────────────────────────────────────────  │
│  │ Jun 25 2:00 PM    Jane Doe      $250      [Accept][Decline]  │
│  │ Jun 26 10:00 AM   Mike Johnson  $150      [Accept][Decline]  │
│  │ Jun 26 3:00 PM    Sarah Smith   $350      [Accept][Decline]  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  RECENT EARNINGS                                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Date          Customer      Amount    Commission  Payout   │  │
│  │─────────────────────────────────────────────────────────────  │
│  │ Jun 23        John D        $250      $25        $225     │  │
│  │ Jun 22        Sarah M       $350      $35        $315     │  │
│  │ Jun 21        Mike T        $200      $20        $180     │  │
│  │ Pending Payout: $2,500 (Next: June 25)                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  RECENT REVIEWS                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ⭐⭐⭐⭐⭐  "Excellent work!" - John D. (June 20)            │  │
│  │ ⭐⭐⭐⭐⭐  "Highly recommended!" - Sarah M. (June 18)       │  │
│  │ ⭐⭐⭐⭐☆  "Good service" - Mike T. (June 15)              │  │
│  │ [View All Reviews]                                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 13. Key Responsive Breakpoints

### Mobile (320px - 600px)
- Single column layout
- Full-width components
- Stacked forms
- Touch-friendly buttons (min 48x48px)
- Large font sizes
- Collapsible navigation

### Tablet (600px - 1024px)
- 1-2 column layout
- Wider buttons
- Side-by-side form fields where appropriate
- Optimized for landscape and portrait

### Desktop (1024px+)
- 2-3 column layout
- Multi-column grids
- Horizontal navigation
- Optimized spacing

---

**Document Version:** 1.0
**Last Updated:** June 2026
**Status:** Draft
