# Multi-Supplier Booking System — Complete Integration Guide

## Overview

CollEco Travel now supports multiple suppliers (Beekman, Premier, etc.) with independent commission models, payment terms, and cancellation policies. Each booking automatically inherits the supplier's specific terms.

## Supported Service Types

### Beekman Holidays
- `accommodation` — Hotel rooms (10% commission)
- `groups` — Group bookings (10% commission)
- `conference` — Conference packages (10% commission)
- `banqueting` — Meals & banqueting (5% commission)
- `corporate` — Corporate rates (2.5% commission)

### Premier Hotels & Resorts
- `accommodation` — Hotel rooms (10% commission)
- `groups_accommodation` — Group accommodation (10% commission)
- `day_conference_packages` — Day conferences (10% commission)
- `formal_banqueting_meals` — Meals & events (5% commission)
- `corporate` — Corporate rates (2.5% commission)

## Commission Models

### Discount Model
Commission is deducted from the wholesale price we get from the supplier.
```
Supplier: R500/night
Commission: 10% (R50)
Customer charged: R500/night
Supplier receives: R450/night
We keep: R50/night
```

### Rebate Model
Commission is paid back to us by the supplier after payment.
```
Supplier: R500/night
Commission: 10% (R50)
Customer charged: R500/night
Supplier receives: R500/night (full)
We receive: R50/night rebate later
```

## API Usage

### Create a Booking (Single Service)

```bash
POST /api/bookings
Content-Type: application/json

{
  "supplierId": "beekman",
  "userId": "user-123",
  "bookingType": "FIT",
  "checkInDate": 1733769600000,
  "checkOutDate": 1733856000000,
  "lineItems": [
    {
      "serviceType": "accommodation",
      "description": "Standard Room",
      "basePrice": 500,
      "retailPrice": 500,
      "quantity": 1,
      "nights": 1
    }
  ]
}
```

Response:
```json
{
  "ok": true,
  "booking": {
    "id": "BK-A1B2C3D4E5F6",
    "supplierId": "beekman",
    "status": "pending",
    "lineItems": [
      {
        "serviceType": "accommodation",
        "description": "Standard Room",
        "commissionRate": "10.0%",
        "commissionModel": "discount",
        "commissionAmount": 50,
        "finalPrice": 500,
        "partnerReceives": 450,
        "nights": 1,
        "quantity": 1
      }
    ],
    "pricing": {
      "baseTotal": 500,
      "retailTotal": 500,
      "commissionTotal": 50,
      "itemCount": 1
    },
    "paymentTerms": {
      "deposit": 1,
      "dueDays": 7,
      "depositDueDate": "2024-12-16T12:00:00.000Z",
      "balanceDueDate": null,
      "depositAmount": 500,
      "balanceAmount": 0
    },
    "paymentStatus": "pending",
    "createdAt": "2024-12-09T10:00:00.000Z"
  }
}
```

### Create a Booking (Multiple Services)

```bash
POST /api/bookings
Content-Type: application/json

{
  "supplierId": "premier",
  "userId": "user-456",
  "bookingType": "Groups",
  "checkInDate": 1733769600000,
  "checkOutDate": 1733856000000,
  "lineItems": [
    {
      "serviceType": "groups_accommodation",
      "description": "25 Rooms for 3 nights",
      "basePrice": 450,
      "retailPrice": 500,
      "quantity": 25,
      "nights": 3
    },
    {
      "serviceType": "day_conference_packages",
      "description": "Conference facilities for 100 delegates",
      "basePrice": 150,
      "retailPrice": 150,
      "quantity": 100
    },
    {
      "serviceType": "formal_banqueting_meals",
      "description": "Gala dinner",
      "basePrice": 200,
      "retailPrice": 200,
      "quantity": 100
    }
  ]
}
```

Response (excerpt):
```json
{
  "ok": true,
  "booking": {
    "id": "BK-X1Y2Z3A4B5C6",
    "lineItems": [
      {
        "serviceType": "groups_accommodation",
        "commissionRate": "10.0%",
        "commissionAmount": 1125,
        "finalPrice": 12500,
        "partnerReceives": 11375,
        "nights": 3,
        "quantity": 25
      },
      {
        "serviceType": "day_conference_packages",
        "commissionRate": "10.0%",
        "commissionAmount": 1500,
        "finalPrice": 15000,
        "partnerReceives": 13500
      },
      {
        "serviceType": "formal_banqueting_meals",
        "commissionRate": "5.0%",
        "commissionAmount": 1000,
        "finalPrice": 20000,
        "partnerReceives": 19000
      }
    ],
    "pricing": {
      "baseTotal": 47400,
      "retailTotal": 47500,
      "commissionTotal": 3625,
      "itemCount": 3
    },
    "paymentTerms": {
      "deposit": 0.25,
      "dueDays": 7,
      "balanceDueDays": 30,
      "depositAmount": 11875,
      "balanceAmount": 35625
    }
  }
}
```

### Retrieve a Booking

```bash
GET /api/bookings/BK-A1B2C3D4E5F6
```

### Calculate Refund (Dry-Run)

```bash
GET /api/bookings/BK-A1B2C3D4E5F6/refund
```

Response:
```json
{
  "ok": true,
  "refund": {
    "bookingId": "BK-A1B2C3D4E5F6",
    "supplierId": "beekman",
    "bookingType": "FIT",
    "checkInDate": "2024-12-10T12:00:00.000Z",
    "daysBefore": 1,
    "refundRate": "0.0%",
    "totalPaid": 500,
    "refundAmount": 0,
    "nonRefundableAmount": 500
  }
}
```

### Cancel a Booking

```bash
POST /api/bookings/BK-A1B2C3D4E5F6/cancel
Content-Type: application/json

{
  "reason": "Customer requested cancellation"
}
```

Response:
```json
{
  "ok": true,
  "booking": {
    "id": "BK-A1B2C3D4E5F6",
    "status": "cancelled",
    "cancelledAt": "2024-12-09T10:30:00.000Z",
    "cancellationReason": "Customer requested cancellation",
    "refund": {
      "refundRate": "0.0%",
      "refundAmount": 0,
      "nonRefundableAmount": 500
    }
  }
}
```

### Get User's Bookings

```bash
GET /api/bookings/user/user-123
```

Response:
```json
{
  "ok": true,
  "bookings": [
    { booking object },
    { booking object }
  ],
  "count": 2
}
```

### Get Supplier's Bookings

```bash
GET /api/bookings/supplier/beekman
```

## Payment Terms by Booking Type

### FIT (Fully Independent Tourist)
**Beekman:**
- 100% due within 7 days
- Short-lead (<30 days): Due within 2 days

**Premier:**
- 100% due within 7 days
- Payment method: VCC (Virtual Credit Card) or EFT
- Short-lead (<30 days): Due within 2 days

### Groups
**Both Suppliers:**
- 25% deposit due within 7 days
- Balance due 30 days before arrival
- Payment method: EFT only

## Cancellation Policies

### FIT
- ≥31 days before check-in: 100% refund
- <30 days: 0% refund (non-refundable)

### Groups
- ≥41 days before check-in: 100% refund
- 40–31 days before check-in: 75% refund
- <30 days: 0% refund (non-refundable)

## Rate Parity Enforcement

Both suppliers enforce rate parity:
- You cannot sell below supplier's retail rate
- Packaging is allowed (can bundle services to hide component rates)
- Best Available Rate (BAR) policies apply per supplier

**Example Error:**
```json
{
  "error": "Rate parity violation on accommodation: Selling price (450) below retail rate (500)"
}
```

## Data & Compliance

**POPIA Act (South Africa):**
- Both suppliers require POPIA compliance
- Data retention: 30 days max
- On termination: Customer data must be destroyed within 30 days
- Both suppliers require proof of destruction (affidavit)

## Webhook Integration

After payment via PayFast/Yoco:
1. Webhook updates booking `paymentStatus` to `paid`
2. Booking is sent to supplier's API (Siteminder)
3. Supplier confirms the booking
4. Booking status transitions from `pending` → `confirmed` → `active`

## Testing Examples

### Test Beekman Accommodation Booking

```bash
curl -X POST http://localhost:4000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "beekman",
    "userId": "test-user-1",
    "bookingType": "FIT",
    "checkInDate": '$(date -d '+5 days' +%s000)',
    "checkOutDate": '$(date -d '+7 days' +%s000)',
    "lineItems": [{
      "serviceType": "accommodation",
      "description": "Double Room",
      "basePrice": 600,
      "retailPrice": 600,
      "quantity": 1,
      "nights": 2
    }]
  }'
```

### Test Premier Group Conference

```bash
curl -X POST http://localhost:4000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "premier",
    "userId": "test-user-2",
    "bookingType": "Groups",
    "checkInDate": '$(date -d '+10 days' +%s000)',
    "checkOutDate": '$(date -d '+12 days' +%s000)',
    "lineItems": [
      {
        "serviceType": "groups_accommodation",
        "description": "10 rooms",
        "basePrice": 500,
        "retailPrice": 500,
        "quantity": 10,
        "nights": 2
      },
      {
        "serviceType": "day_conference_packages",
        "description": "Conference setup",
        "basePrice": 100,
        "retailPrice": 100,
        "quantity": 1
      }
    ]
  }'
```

## Next Steps

1. **Wire checkout UI** to call POST /api/bookings with user input
2. **Integrate Siteminder** to push confirmed bookings to suppliers
3. **Add email notifications** on booking confirmation and payment
4. **Build reporting** for supplier settlements and commission tracking
