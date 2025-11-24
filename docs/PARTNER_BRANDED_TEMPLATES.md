# Partner Branded Invoice Templates - Complete Guide

## Overview

CollEco Travel's **multi-tenant branding system** allows each partner (tour operator, travel agency, hotel, etc.) to create and manage their own **branded invoice templates**. This means every partner can generate professional quotes and invoices with:

- ✅ **Their own company logo**
- ✅ **Their business details** (name, registration, tax numbers)
- ✅ **Their banking information** for payments
- ✅ **Custom terms & conditions**
- ✅ **Brand colors and styling**
- ✅ **Multiple templates** for different services

## Key Features

### 1. Multi-Template Support
- Create unlimited branded templates
- Save multiple templates for different purposes
  - Example: "Safari Package Template", "Conference Template", "Luxury Travel Template"
- Set one template as default
- Switch between templates when creating quotes

### 2. Complete Branding Control
- Upload your company logo (PNG, JPG, max 2MB)
- Enter all legal business information
- Customize banking details for client payments
- Write custom terms and conditions
- Choose brand colors
- Control what appears on invoices

### 3. Template Reusability
- Save templates once, use forever
- Duplicate existing templates for variations
- Edit templates anytime
- All quotes automatically use selected template

## How It Works

### For Partners (Tour Operators/Service Providers)

#### Step 1: Create Your First Template

1. **Navigate to Templates**
   - Click "🎨 Manage Templates" button on Quote Generator page
   - Or go directly to `/partner/templates`

2. **Click "Create New Template"**

3. **Fill in Template Details:**

   **Basic Info:**
   - Template Name: "Safari Adventures Main Template"
   - Set as Default: ✅ (check for your primary template)

   **Company Information:**
   - Company Name: "Safari Adventures"
   - Legal Name: "Safari Adventures (PTY) Ltd"
   - Registration Number: "Reg: 2020/123456/07"
   - Tax Number: "Tax: 9055225222"
   - VAT Number: "VAT: 4123456789"
   - CSD Number: "CSD: MAAA07802746" (if applicable)
   - Physical Address: "123 Safari Road, Durban, 4001"
   - Phone: "(031) 123 4567"
   - Email: "info@safariventures.com"
   - Website: "www.safariventures.com"

   **Upload Logo:**
   - Click "Choose File"
   - Select your company logo (PNG or JPG)
   - Recommended size: 300x100px
   - Max file size: 2MB
   - Preview appears on the right

   **Banking Details:**
   - Bank Name: "FNB"
   - Account Name: "Safari Adventures (PTY) Ltd"
   - Account Number: "1234567890"
   - Branch Code: "250655"
   - Account Type: "Business"

   **Terms & Conditions:**
   - Default terms are pre-filled
   - Edit any term by clicking in the text box
   - Add new terms with "+ Add Term" button
   - Remove terms with ✕ button
   - Customize to match your business policies

   Example terms:
   ```
   1. Payment terms: 50% deposit required, balance due 7 days before travel.
   2. Cancellation policy: Cancellations within 14 days incur 50% fee.
   3. Prices valid for 14 days from quote date.
   4. Subject to availability at time of booking.
   5. Travel insurance strongly recommended.
   6. Safari experiences subject to weather and animal activity.
   ```

   **Layout & Styling:**
   - Primary Color: Choose your brand color
   - Logo Position: Top Left, Top Right, or Top Center
   - Footer Text: "Thank you for choosing Safari Adventures!"
   - Checkboxes:
     - ✅ Show Logo
     - ✅ Show Banking Details
     - ✅ Show Terms & Conditions

4. **Save Template**
   - Click "💾 Save Template"
   - Template appears in sidebar
   - Preview shows how invoices will look

#### Step 2: Create More Templates (Optional)

Create variations for different services:

**Example: Luxury Safari Template**
- Different branding/colors
- Premium terms
- Different footer message

**Example: Corporate Conference Template**
- More formal styling
- Corporate payment terms
- Venue-specific conditions

**To create:**
1. Click "+ Create New Template" for blank
2. Or click "Copy" on existing template to duplicate
3. Modify as needed
4. Save with new name

#### Step 3: Generate Branded Quotes

1. **Go to Quote Builder** (`/quotes`)

2. **Select Your Template**
   - Top of page shows template selector
   - Choose from dropdown: "Safari Adventures Main Template"
   - Shows: "Using: Safari Adventures branding"

3. **Create Invoice** (Using AI, Quick Add, or Manual)
   
   **Option A - AI Generation:**
   ```
   5 day Kruger Safari for 4 people R8,500 per person, 
   4 nights luxury lodge accommodation R4,200 per night, 
   game drives R1,200 per person, 
   airport transfers R650 per person
   ```
   Click "Generate Items" ✨

   **Option B - Quick Add:**
   - Click "📋 Quick Add"
   - Select "Safari/Game Drive"
   - Edit price and quantity

   **Option C - Manual:**
   - Click "+ Add Item"
   - Enter details manually

4. **Fill Client Details:**
   - Client Name: "Umzion Municipality"
   - Address, Phone, Email, VAT (optional)

5. **Generate PDF**
   - Click "📄 Generate PDF"
   - PDF is created with YOUR branding:
     - YOUR logo
     - YOUR company details
     - YOUR banking information
     - YOUR terms & conditions
     - YOUR colors

6. **Result:**
   Professional invoice showing:
   ```
   [YOUR LOGO]                    INVOICE
   
   Safari Adventures
   Safari Adventures (PTY) Ltd
   123 Safari Road, Durban, 4001
   (031) 123 4567 | info@safariventures.com
   Reg: 2020/123456/07
   
   BILL TO:
   Umzion Municipality
   ...
   
   [YOUR ITEMS TABLE]
   
   BANKING DETAILS:
   Bank: FNB
   Account: Safari Adventures (PTY) Ltd
   Account Number: 1234567890
   ...
   
   TERMS & CONDITIONS:
   1. Payment terms: 50% deposit...
   [YOUR CUSTOM TERMS]
   
   Thank you for choosing Safari Adventures!
   ```

### For CollEco Admin

Templates are stored per partner:
- `localStorage: partner_templates_{partnerId}`
- Each partner sees only their templates
- Partners cannot see other partners' templates
- CollEco default template always available as fallback

## Use Cases

### Use Case 1: Multi-Brand Tour Operator

**Scenario:** You run 3 different brands under one company

**Solution:**
1. Create 3 templates:
   - "Luxury Safari Adventures" (high-end)
   - "Budget Safari Tours" (affordable)
   - "Corporate Safari Events" (business)
2. Each has different:
   - Logo
   - Branding colors
   - Terms (luxury has stricter cancellation)
   - Banking (can be same or different)
3. Select appropriate template per client
4. Generate branded quote instantly

### Use Case 2: White-Label Services

**Scenario:** You provide services for other companies

**Solution:**
1. Create template for each client company
2. Use their branding, your banking
3. Generate quotes on their behalf
4. They receive professional quote with their branding
5. Payments come to your account

### Use Case 3: Seasonal Campaigns

**Scenario:** Running special Christmas/Summer promotions

**Solution:**
1. Duplicate your main template
2. Name it "Christmas Special 2025"
3. Update terms with special offer conditions
4. Use for seasonal quotes
5. Switch back to main template after campaign

## Template Management

### Creating Templates

**From Scratch:**
```
1. Click "+ Create New Template"
2. Fill all fields
3. Save
```

**From Existing:**
```
1. Find template in sidebar
2. Click "Copy"
3. Modify copy
4. Save with new name
```

### Editing Templates

```
1. Click template in sidebar
2. Click "Edit" button
3. Modify any field
4. Save changes
```

**Note:** Changes apply to future invoices only. Existing PDFs don't change.

### Deleting Templates

```
1. Find template in sidebar
2. Click "Delete"
3. Confirm deletion
```

**Warning:** Cannot delete if it's the only template. Cannot undo.

### Setting Default Template

```
1. Edit template
2. Check "Set as Default Template"
3. Save
```

Default template is auto-selected when creating new quotes.

## Logo Guidelines

### Recommended Specifications:
- **Format:** PNG (with transparent background) or JPG
- **Size:** 300 x 100 pixels (3:1 ratio)
- **File Size:** Under 2MB
- **Resolution:** 150 DPI or higher
- **Colors:** High contrast works best on white background

### Logo Positions:
- **Top Right:** Most common, professional
- **Top Left:** Traditional placement
- **Top Center:** Modern, bold

### Tips:
- Use high-quality logo file
- Transparent PNG looks most professional
- Test preview before saving
- Logo appears at reasonable size in PDF

## Banking Details

### Why Include Banking?
- Clients can pay immediately
- Reduces payment delays
- Professional appearance
- Clear payment instructions

### What to Include:
- ✅ Bank name (FNB, Standard Bank, Capitec, etc.)
- ✅ Account name (legal business name)
- ✅ Account number
- ✅ Branch code
- ✅ Account type (Business, Cheque, etc.)

### Security Note:
Banking details only appear on PDFs you generate. They're not shared publicly or with other partners.

## Terms & Conditions

### Why Custom Terms?
- Legal protection
- Set clear expectations
- Define your policies
- Reduce disputes

### What to Include:

**Payment Terms:**
```
Payment terms: 50% deposit required upon booking confirmation, 
balance due 7 days before travel date.
```

**Cancellation Policy:**
```
Cancellation policy: 
- 30+ days before travel: Full refund minus 10% admin fee
- 14-30 days: 50% refund
- Less than 14 days: No refund
```

**Validity:**
```
Prices valid for 14 days from quote date.
Subject to availability and confirmation at time of booking.
```

**Insurance:**
```
Travel and medical insurance strongly recommended and client's responsibility.
```

**Liability:**
```
All services subject to supplier terms and conditions.
Company not liable for weather-related changes or natural events.
```

**Specific to Your Industry:**
- Safari: Weather and animal activity disclaimers
- Adventure: Safety and fitness requirements
- Luxury: Dress codes and special requirements
- Corporate: Cancellation for groups

### Tips:
- Keep terms clear and concise
- Use numbered list for easy reference
- Update terms as business policies change
- Review with legal advisor if needed

## Troubleshooting

### Logo Not Showing
- Check file size (must be under 2MB)
- Ensure it's an image file (PNG/JPG)
- Try different logo file
- Check "Show Logo" is enabled in layout settings

### Template Not Appearing in Quote Generator
- Ensure template is saved
- Refresh page
- Check you're logged in as correct partner
- Verify template list loads in sidebar

### Banking Details Missing on PDF
- Check "Show Banking Details" is enabled
- Verify all banking fields are filled
- Regenerate PDF

### Wrong Template Used
- Check template selector dropdown
- Verify correct template is selected
- Default template auto-selects if nothing chosen

### Can't Edit Template
- Ensure you own the template
- Try refreshing page
- Check you have partner role

## Best Practices

### Professional Templates:
1. **Use high-quality logo**
2. **Fill all company information completely**
3. **Write clear, professional terms**
4. **Test template before using with clients**
5. **Keep banking details up-to-date**

### Organization:
1. **Name templates descriptively**
   - ❌ "Template 1", "Test"
   - ✅ "Safari Main", "Corporate Events", "Luxury Packages"

2. **Use default wisely**
   - Set your most-used template as default
   - Saves time when creating quotes

3. **Create variations strategically**
   - Don't duplicate unnecessarily
   - Use different templates for genuinely different needs

### Branding Consistency:
1. **Use same logo across all templates**
2. **Match brand colors**
3. **Maintain professional tone in terms**
4. **Keep footer messages appropriate**

## Advanced Features

### Multiple Companies
If you run multiple legal entities:
1. Create separate templates for each
2. Use correct banking for each
3. Select appropriate template per booking

### Dynamic Terms
Terms can reference quote data:
```
This quote (#{invoiceNumber}) is valid for 14 days.
```
(Currently placeholder - can be enhanced)

### Template Versioning
When updating terms:
1. Duplicate template
2. Add version to name: "Main Template v2"
3. Update terms
4. Set as new default
5. Keep old template for records

## Data Storage

### Where Templates Are Stored:
- Browser localStorage
- Key: `partner_templates_{partnerId}`
- Only you can see your templates
- Survives browser refresh
- Lost if browser data cleared

### Future Enhancements:
- Cloud sync across devices
- Team collaboration (share templates with staff)
- Template marketplace
- Analytics (which template generates most bookings)

## FAQ

**Q: Can I use different templates for different quotes?**
A: Yes! Select from dropdown when creating each quote.

**Q: Can I change my logo later?**
A: Yes, edit template and upload new logo anytime.

**Q: Will old invoices change if I edit my template?**
A: No, only new PDFs use updated template.

**Q: Can I delete the default template?**
A: Yes, but another template becomes default automatically.

**Q: How many templates can I create?**
A: Unlimited.

**Q: Can other partners see my templates?**
A: No, templates are private to each partner.

**Q: What happens if I don't create a template?**
A: CollEco default template is used (CollEco branding).

**Q: Can I export/import templates?**
A: Not yet (future feature).

**Q: Do templates work on mobile?**
A: Yes, fully responsive.

**Q: Can I use my template for itineraries too?**
A: Coming soon - currently for quotes/invoices only.

## Support

Need help with templates?
- Email: partners@colleco.travel
- Portal: /admin/chat
- Video tutorial: (coming soon)

---

**Version:** 1.0  
**Last Updated:** November 2025  
**Author:** CollEco Development Team
