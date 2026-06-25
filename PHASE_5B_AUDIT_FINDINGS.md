# Phase 5B Audit - Booking System Hardening

## Status: IN PROGRESS

### Issues Found

#### CRITICAL Issues

1. **No Transaction Safety**
   - `createBooking()` - Single write but validates pre-conditions (acceptable)
   - `cancelBooking()` - Multiple writes to booking + payment tables
   - `completeBooking()` - Multiple writes 
   - `confirmBooking()` - Multiple writes
   - **Risk:** Partial failures can leave inconsistent state

2. **Missing Business Hours Validation**
   - Creates bookings without checking if business is available at scheduled time
   - No validation against `business_hours` table
   - Risk: Bookings allowed outside business hours

3. **Incomplete Schedule Conflict Detection**
   - Only checks CONFIRMED bookings
   - Should also check PENDING bookings to prevent double-booking
   - Between() logic may have off-by-one errors with duration calculation
   - Risk: Multiple confirmed bookings at same time possible

4. **No Ownership Verification on Read Operations**
   - `getBooking()` endpoint has NO authorization check
   - Customer can view ANY booking in system by ID
   - Business can view ANY business booking by ID
   - Risk: Information disclosure vulnerability

#### HIGH Priority Issues

1. **Status Transition Rules Not Enforced**
   - No validation that NO_SHOW cannot be reversed
   - COMPLETED bookings can theoretically be updated
   - CANCELLED bookings could be modified
   - Missing formal state machine definition

2. **Invalid Status Transitions Possible**
   - Booking can go COMPLETED → PENDING (via updateBooking if not validated)
   - No immutable field protection on status
   - updateBooking() doesn't validate current status against allowed transitions

3. **Booking Acceptance Flow Incomplete**
   - Creates new status `requires_payment` not in BookingStatus enum
   - Status machine has 5 defined states but code uses 6+ states
   - Inconsistent with main booking service

4. **Update Permission Anomaly**
   - Only CUSTOMER can update booking (correct)
   - But BUSINESS can confirm/complete/no-show (correct)
   - However, updateBooking() allows changing dates that could affect conflict detection

#### MEDIUM Priority Issues

1. **Error Response Inconsistency**
   - Some errors return BadRequestException for authorization (should be ForbiddenException)
   - Some errors use generic messages

2. **No Idempotency Key for Concurrent Operations**
   - Multiple simultaneous booking requests could create duplicates
   - No deduplication mechanism

3. **Cancellation Refund Calculation**
   - Creates payment records but doesn't integrate with Stripe refund flow
   - Refund status shows 'succeeded' without actually calling Stripe API
   - Risk: Refunds not actually processed

### Fixes Required (Phase 5B Scope)

**MUST FIX (Blocking):**
1. Add transaction wrappers to multi-table operations
2. Add ownership verification to read operations (getBooking)
3. Add business hours validation in createBooking
4. Improve schedule conflict detection (check both PENDING and CONFIRMED)
5. Enforce formal status transition rules
6. Fix authorization exception types (ForbiddenException)

**SHOULD FIX (High):**
1. Validate immutable fields (cannot change status via updateBooking)
2. Reconcile booking acceptance flow with BookingStatus enum
3. Add validation that only certain transitions are allowed

**NICE TO HAVE (Can defer):**
1. Add idempotency key support
2. Improve refund integration (marked as TODO, not critical for MVP)
3. Add comprehensive error messages with remediation advice

