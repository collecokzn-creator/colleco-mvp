# CollEco Travel - Quote/Invoice PDF Generator Usage Guide

## Overview
The PDF generator (`generateQuotePdf`) creates professional invoices and quotes matching the CollEco Travel template exactly. **All fields are fully editable** including company details, banking information, terms and conditions, and client information.

## Basic Usage

```javascript
import { generateQuotePdf } from '../utils/pdfGenerators';

// Generate a quote/invoice
await generateQuotePdf(quoteObject);
```

## Complete Quote Object Structure

```javascript
const quoteObject = {
  // INVOICE IDENTIFICATION
  invoiceNumber: '104',           // Invoice number (shown as "INVOICE NO")
  orderNumber: '852516',          // Order number (shown as "ORDER NO")
  reference: 'REF-2024-001',      // Alternative reference
  status: 'Sent',                 // Draft, Sent, Accepted, etc.
  
  // DATES
  createdAt: new Date(),          // Invoice date
  updatedAt: new Date(),          // Last updated
  
  // CLIENT INFORMATION (Invoice To)
  clientName: 'Umzion Municipality',
  clientAddress: 'Cnr Bram Fischer & Williamson Street, Scottburgh, 4180',
  clientPhone: '(039) 976 1202',
  clientEmail: 'dclive@umzion.gov.za',
  clientVAT: '4240193872',        // VAT number
  
  // ITEMS/SERVICES
  items: [
    {
      title: 'Flight: FlySafair',
      description: 'Departure King Shaka airport, Time 14:00pm, Date 30/10/2023. Return PE airport, Time 16:00pm, Date 01/11/2023',
      quantity: 1,
      unitPrice: 9450.00
    },
    // Add more items...
  ],
  
  // PRICING
  currency: 'R',                  // Currency symbol (R, $, €, etc.)
  taxRate: 15,                    // VAT percentage (15 for South Africa)
  
  // CUSTOM COMPANY INFO (Optional - overrides defaults)
  companyInfo: {
    name: 'CollEco Travel',
    legalName: 'COLLECO SUPPLY & PROJECTS (PTY) Ltd',
    tagline: 'The Odyssey of Adventure',
    registration: 'Reg: 2013/147893/07',
    taxNumber: 'Tax: 9055225222',
    csd: 'CSD: MAAA07802746',
    phone: 'Cell: 073 3994 708',
    email: 'collecokzn@gmail.com',
    website: 'www.collecotravel.com',
    address: '6 Avenue Umtenweni 4234'
  },
  
  // BANKING DETAILS (Optional - overrides defaults)
  banking: {
    bankName: 'Capitec Business',
    branchName: 'Relationship Suite',
    accountType: 'Capitec Business Account',
    accountNumber: '1052106919',
    branchCode: '450105'
  },
  
  // TERMS AND CONDITIONS (Optional - overrides defaults)
  terms: [
    'All payments to be done electronically into provided account.',
    'All bookings are subjected to availability.',
    'All bookings are subjected to a non-refund cancelation policy once confirmed by the client.',
    'All flight bookings are standard and if any changes are required there will be an additional cost.',
    'All car rentals are subject to a returnable deposit payment upon collection.',
    'All damages and extra costs accumulated during the car hire, the driver will be liable for them.'
  ]
};

// Generate the PDF
await generateQuotePdf(quoteObject);
```

## Default Company Information

If you don't provide custom `companyInfo`, the generator uses these defaults:

```javascript
{
  name: 'CollEco Travel',
  legalName: 'COLLECO SUPPLY & PROJECTS (PTY) Ltd',
  tagline: 'The Odyssey of Adventure',
  registration: 'Reg: 2013/147893/07',
  taxNumber: 'Tax: 9055225222',
  csd: 'CSD: MAAA07802746',
  email: 'collecokzn@gmail.com',
  phone: 'Cell: 073 3994 708',
  address: '6 Avenue Umtenweni 4234',
  website: 'www.collecotravel.com'
}
```

## Default Banking Details

```javascript
{
  bankName: 'Capitec Business',
  branchName: 'Relationship Suite',
  accountType: 'Capitec Business Account',
  accountNumber: '1052106919',
  branchCode: '450105'
}
```

## Editing Company Details

### Option 1: Edit the defaults (affects all invoices)
Edit `src/utils/pdfGenerators.js` and modify the `COMPANY_INFO` constant at the top of the file.

### Option 2: Override per invoice
Pass custom values in the quote object:

```javascript
await generateQuotePdf({
  ...quoteData,
  companyInfo: {
    name: 'My Custom Company',
    email: 'custom@email.com',
    // ... other fields
  }
});
```

## Editing Banking Details

```javascript
await generateQuotePdf({
  ...quoteData,
  banking: {
    bankName: 'Different Bank',
    accountNumber: '987654321',
    // ... other fields
  }
});
```

## Editing Terms and Conditions

```javascript
await generateQuotePdf({
  ...quoteData,
  terms: [
    'Custom term 1',
    'Custom term 2',
    'Custom term 3'
  ]
});
```

## Complete Example

```javascript
// Example: Generate invoice for a flight booking
const invoice = {
  invoiceNumber: '104',
  orderNumber: '852516',
  clientName: 'Umzion Municipality',
  clientAddress: 'Cnr Bram Fischer & Williamson Street, Scottburgh, 4180',
  clientPhone: '(039) 976 1202',
  clientEmail: 'dclive@umzion.gov.za',
  clientVAT: '4240193872',
  
  items: [
    {
      title: 'Flight: FlySafair',
      description: 'Departure King Shaka airport, Time 14:00pm, Date 30/10/2023. Return PE airport, Time 16:00pm, Date 01/11/2023',
      quantity: 1,
      unitPrice: 9450.00
    }
  ],
  
  currency: 'R',
  taxRate: 15,
  status: 'Sent',
  createdAt: new Date('2025-11-20')
};

// Generate PDF with defaults
await generateQuotePdf(invoice);

// Or generate with custom company details
await generateQuotePdf({
  ...invoice,
  companyInfo: {
    name: 'CollEco Travel - Cape Town',
    phone: 'Cell: 021 555 1234',
    // Override only what you need
  }
});
```

## PDF Output Features

The generated PDF includes:

1. **Header Section:**
   - Company logo (top right)
   - "INVOICE" title
   - Date
   - Company details (name, registration, tax, contact)

2. **Invoice Details:**
   - Invoice number
   - Order number

3. **Client Section:**
   - "INVOICE TO" with client name, address, phone, email, VAT

4. **Items Table:**
   - Item number, description, quantity, unit price, total price
   - Professional grid layout

5. **Totals:**
   - Cost price (subtotal)
   - VAT (15%)
   - Total cost
   - Boxed layout matching template

6. **Banking Details:**
   - Complete bank account information

7. **Terms and Conditions:**
   - Comprehensive terms list

8. **Footer:**
   - Company address and website
   - "Thank you for your business" message

## Logo Customization

To change the logo:
1. Replace `/src/assets/colleco-logo.png` with your new logo
2. Or update `LOGO_PATH` in `pdfGenerators.js`

## Colors

The PDF uses CollEco brand colors:
- Orange: #F47C20 (headers, highlights)
- Brown: #3A2C1A (text)
- Gold: #E6B422 (accents)
- Cream: #FFF8F1 (backgrounds)

## Notes

- All monetary values are formatted according to the specified currency
- VAT is calculated automatically based on `taxRate`
- PDF filename is auto-generated from invoice number or client name
- All text fields support multi-line content
- Company logo is automatically positioned in top right
