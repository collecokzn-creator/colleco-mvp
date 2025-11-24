# AI-Powered Quote & Invoice Generator

## Overview

The CollEco AI Invoice Generator allows you to create professional invoices and quotes in three ways:

1. **AI-Powered Generation** - Describe services in natural language and AI creates the invoice items automatically
2. **Quick Add Templates** - Add common travel items from pre-built templates
3. **Manual Entry** - Add and edit items manually with full control

## Features

### ✨ AI Generation

Simply describe what you need to invoice in plain English, and the AI parser will extract:
- Service types (flights, hotels, car rentals, tours, etc.)
- Quantities (nights, days, people)
- Prices automatically

**Example Prompts:**
```
Flight from Durban to Cape Town on FlySafair for R4,500, 3 nights hotel accommodation at R1,200 per night, airport transfer for R450
```

```
Return flight Johannesburg to Zanzibar R8,500, 5 nights beachfront resort R2,800 per night, scuba diving tour R1,200
```

```
Conference venue hire R15,000, catering for 50 people R350 per person, AV equipment R2,500
```

### 📋 Quick Add Templates

Pre-built templates for common travel services:

**Flights**
- Domestic Flight
- International Flight
- Return Flight

**Accommodation**
- Hotel - Standard Room
- Hotel - Deluxe Room
- Guesthouse
- Resort/Lodge

**Transport**
- Airport Transfer
- Car Rental
- Private Chauffeur

**Activities**
- City Tour
- Safari/Game Drive
- Cultural Experience

**Services**
- Travel Insurance
- Visa Assistance
- Concierge Service

### 💾 Save & Manage Quotes

- **Auto-save**: Save quotes to work on them later
- **Load existing**: Resume work on any saved quote
- **Auto-numbering**: Invoice numbers generated automatically
- **Status tracking**: Draft, Sent, Accepted, Paid, Cancelled

### 📄 Professional PDF Generation

Once your quote is ready, generate a professional PDF that includes:
- Company logo and full business details
- Client information
- Itemized services with quantities and prices
- Subtotal, VAT (15%), and total
- Banking details for payment
- Terms and conditions
- Professional layout matching CollEco branding

## How to Use

### Method 1: AI Generation

1. Click on **Quote Builder** in the navigation
2. In the AI Generation box, describe your services:
   ```
   Flight from Durban to Johannesburg R3,200, 2 nights hotel R900 per night, car rental 3 days R650 per day
   ```
3. Click **✨ Generate Invoice Items**
4. Review the generated items - edit quantities, prices, descriptions as needed
5. Fill in client details
6. Click **📄 Generate PDF**

### Method 2: Quick Add Templates

1. Click **📋 Quick Add** button
2. Browse categories (Flights, Accommodation, Transport, Activities, Services)
3. Click on any item to add it to your invoice
4. Edit the prices and quantities
5. Fill in client details
6. Click **📄 Generate PDF**

### Method 3: Manual Entry

1. Click **+ Add Item** to add a blank line item
2. Fill in:
   - **Title**: e.g., "Flight: FlySafair"
   - **Description**: Full details
   - **Quantity**: Number of units
   - **Unit Price**: Price per unit
3. Repeat for all items
4. Fill in client details
5. Click **📄 Generate PDF**

## Managing Quotes

### Save a Quote
- Fill in at least the **Client Name**
- Click **💾 Save Quote**
- Quote appears in the sidebar for future access

### Load a Saved Quote
- Click on any quote in the left sidebar
- All details load automatically
- Continue editing or generate PDF

### Delete a Quote
- Click the **✕** button on any saved quote
- Confirm deletion

### Create New Quote
- Click **+ New Quote** button at the top
- Starts fresh with blank fields

## Invoice Fields

### Required Fields
- **Client Name**: Who the invoice is for

### Optional Fields
- **Invoice Number**: Auto-generated if left blank (e.g., INV-123456)
- **Order Number**: Reference number for your records
- **Client Address**: Full address
- **Client Phone**: Contact number
- **Client Email**: Email address
- **Client VAT**: VAT registration number
- **Status**: Draft, Sent, Accepted, Paid, Cancelled

## Item Fields

Each invoice item has:
- **Title**: Short name (e.g., "Flight Booking")
- **Description**: Full details (e.g., "FlySafair from Durban to Cape Town, 15 Dec 2025")
- **Quantity**: Number of units (e.g., 1 flight, 3 nights, 5 people)
- **Unit Price**: Price per unit in Rands
- **Total**: Automatically calculated (Quantity × Unit Price)

## AI Parser Capabilities

The AI parser recognizes:

### Flight Patterns
- "flight from X to Y for R___"
- "FlySafair flight R___"
- "return flight R___"

### Hotel Patterns
- "3 nights hotel at R___ per night"
- "hotel accommodation 5 nights R___"
- "resort stay R___"

### Car Rental Patterns
- "car rental 3 days at R___ per day"
- "vehicle hire R___"

### Tour/Activity Patterns
- "safari R___"
- "city tour R___"
- "excursion R___"

### Transfer Patterns
- "airport transfer R___"
- "shuttle service R___"

### Event Patterns
- "conference venue R___"
- "catering for X people at R___ per person"

## Tips for Best Results

### AI Generation Tips
1. **Be specific**: Include provider names, routes, dates
2. **Use clear prices**: "R4,500" or "4500"
3. **Specify quantities**: "3 nights", "5 people", "2 days"
4. **Separate items**: Use commas or new lines between different services
5. **Review output**: Always check and edit generated items

### Example of Good Prompt
```
FlySafair flight Durban to Cape Town R4,200
Southern Sun hotel 3 nights at R1,150 per night
Avis car rental 2 days R720 per day
Table Mountain cable car R360
Airport transfer R480
```

### Manual Editing
- Always review AI-generated items
- Adjust prices as needed
- Add detailed descriptions
- Verify quantities
- Check client information

## Auto-Generation at Any Stage

Yes! You can generate a PDF at any time:

1. **During booking**: Create quote immediately
2. **After booking**: Generate invoice with confirmed details
3. **For modifications**: Update items and regenerate
4. **For different clients**: Save template, change client, regenerate

The system allows you to:
- **Add items** at any time (+ Add Item button)
- **Remove items** (✕ button on each item)
- **Edit items** (click on any field to modify)
- **Regenerate PDF** as many times as needed

## Workflow Examples

### Scenario 1: Quick Quote During Call
```
1. Client calls: "How much for weekend in Cape Town?"
2. You type: "Return flight R3,500, 2 nights hotel R1,100 per night, car rental 2 days R650 per day"
3. Click "Generate Items"
4. Enter client name
5. Click "Generate PDF"
6. Email quote to client
Total time: 2 minutes
```

### Scenario 2: Complex Package
```
1. Click "+ Add Item" multiple times
2. Manually enter:
   - International flights
   - Multiple hotels
   - Tours and activities
   - Transfers
   - Insurance
3. Review totals (auto-calculated)
4. Save quote (Draft status)
5. Send to client for approval
6. Update status to "Sent"
7. After approval, update to "Accepted"
8. Regenerate PDF as invoice
9. Update status to "Paid" when received
```

### Scenario 3: Template for Repeat Clients
```
1. Create quote for popular package
2. Save with generic client name "Template - Cape Town Weekend"
3. When new client books:
   - Load the template
   - Update client details
   - Adjust prices if needed
   - Generate PDF
```

## API Integration (Future Enhancement)

The system is designed to integrate with:
- Real-time flight pricing APIs
- Hotel booking systems
- Car rental platforms
- Payment gateways

Currently uses manual/AI-assisted entry with full editability.

## Customization

All company details, banking information, and terms are pulled from the PDF generator configuration. See `docs/QUOTE_PDF_USAGE.md` for customization options.

## Storage

- Quotes saved to browser **localStorage**
- Survives page refreshes
- Separate per browser/device
- Future: Cloud sync for multi-device access

## Troubleshooting

### AI didn't detect items correctly
- Try rephrasing with clearer price indicators
- Use "R" or "for" before prices
- Separate items with commas
- Manually add/edit items after generation

### Invoice number not showing
- Leave blank for auto-generation
- Or enter manually (e.g., INV-001)

### PDF not generating
- Ensure Client Name is filled in
- Ensure at least one item exists
- Check browser console for errors

### Saved quotes not loading
- Check localStorage is enabled
- Try clearing browser cache
- Re-save quotes

## Support

For issues or feature requests:
- Email: support@colleco.travel
- Portal: /admin/chat

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Author**: CollEco Development Team
