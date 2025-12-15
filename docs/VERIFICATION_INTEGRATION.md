# Document Verification Integration Guide

## Overview

CollEco uses an automated document verification system to validate partner applications. The system is provider-agnostic and can integrate with any third-party verification service.

## Current Implementation

**Status**: Mock verification enabled for development  
**Location**: `server/services/documentVerification.js`  
**Environment**: `VERIFICATION_PROVIDER=mock` (default)

## Verification Workflow

```
Partner uploads document
    ↓
Frontend → Backend API
    ↓
DocumentVerificationService.verifyDocument()
    ↓
Third-party provider (Onfido/Trulioo/Azure/etc.)
    ↓
Async verification processing
    ↓
Webhook callback or polling
    ↓
Update document status (Accepted/Pending/Rejected)
    ↓
Admin review (if needed)
```

## Document Types Verified

### Standard Partner Documents (All Partners)

1. **Business Registration Certificate** (CIPC)
   - Registration number validation
   - Business name verification
   - Director verification
   - Active status check

2. **Tax Clearance Certificate** (SARS)
   - Tax number validation
   - Expiry date check
   - Compliance status

3. **Public Liability Insurance**
   - Policy number validation
   - Coverage amount (min R5M)
   - Expiry date check
   - Insurer verification

4. **ID/Passport** (Directors/Owners)
   - Document authenticity
   - Face matching
   - Liveness detection
   - Home Affairs verification (SA)

5. **Banking Details**
   - Account ownership verification
   - Bank verification

6. **B-BBEE Certificate** (optional)
   - Certificate authenticity
   - BEE level verification

### Transport Operator Specific Documents

7. **Operating License** (Department of Transport)
   - License number validation
   - Expiry date check
   - Route/area authorization
   - Vehicle capacity limits
   - Authority: Provincial Transport Authority

8. **Tourist Transport Permit** (for tour operators)
   - Permit number validation (TTP-XXXX-YYYY format)
   - Expiry date check
   - Vehicle registration numbers
   - Authority: Department of Tourism / Provincial Tourism Board

9. **Public Road Passenger Permit (PrDP)**
   - Operating license for paid passenger transport
   - Permit number validation
   - Route authorization
   - Vehicle list verification
   - Authority: Provincial Operating License Board (POLB)

10. **Professional Driving Permit (PrDP)** (per driver)
    - Driver's license with PrDP endorsement
    - Expiry date check
    - Valid for correct vehicle category
    - Authority: Department of Transport

11. **Vehicle Roadworthiness Certificate** (per vehicle)
    - Certificate of Fitness (CoF)
    - Valid within 60 days for registration
    - Annual renewals required
    - Issued by: Authorized testing stations

12. **Vehicle Registration Documents** (per vehicle)
    - License disk validity
    - Owner/lease verification
    - Vehicle description matches permit
    - Authority: Dept of Transport / eNaTIS

13. **Passenger Liability Insurance** (Transport-specific)
    - Minimum R10M coverage for transport operators
    - Per-passenger coverage verification
    - Vehicle list matches policy
    - Excess liability coverage

14. **Cross-Border Permit** (if operating to neighboring countries)
    - SADC permit for cross-border tours
    - Customs clearance documentation
    - Vehicle authorization
    - Authority: SA Revenue Service / Department of Home Affairs

### Trade & Industry Certifications

15. **Trade License / Tourism Registration**
    - SATSA membership (Southern Africa Tourism Services Association)
    - TGCSA registration (Tourism Grading Council of SA)
    - ASATA membership (Association of South African Travel Agents)
    - License expiry validation

## Transport Operator Compliance Requirements

### Who Needs What Permits?

**Shuttle & Airport Transfer Operators**:
- ✅ Operating License (Provincial Transport Authority)
- ✅ Public Road Passenger Permit (PrDP)
- ✅ Professional Driving Permit (all drivers)
- ✅ Vehicle Roadworthiness Certificates (all vehicles)
- ✅ Passenger Liability Insurance (R10M min)
- ✅ Vehicle Registration Documents

**Tour Operators with Transport**:
- ✅ All shuttle operator requirements PLUS:
- ✅ Tourist Transport Permit
- ✅ Trade License (SATSA/TGCSA)
- ✅ Cross-Border Permit (if applicable)

**Private Vehicle Tours** (no paid passenger transport):
- ⚠️ May not require PrDP if guide drives own vehicle
- ✅ Still need: Insurance, roadworthy, trade license

### Regulatory Authorities (South Africa)

| Authority | Responsibility | Contact |
|-----------|---------------|---------|
| **Provincial Transport Authority** | Operating licenses, route authorization | Per province |
| **Provincial Operating License Board (POLB)** | Public Road Passenger Permits (PrDP) | Per province |
| **Department of Tourism** | Tourist transport permits, tourism grading | +27 86 122 7468 |
| **CIPC** | Business registration | +27 86 100 2472 |
| **SARS** | Tax compliance | +27 800 00 7277 |
| **eNaTIS** | Vehicle registration, license renewals | https://www.enatis.com/ |
| **CBRTA** | Cross-border road transport | +27 12 309 3000 |

### Automated Verification Strategy

**Tier 1: Azure OCR** (R0.027/doc)
- Extract all text from transport permits
- Verify expiry dates, permit numbers, vehicle lists
- Flag expired or expiring-soon documents

**Tier 2: Government API Integration** (FREE where available)
- **eNaTIS API**: Vehicle registration verification (if API access granted)
- **CIPC API**: Business registration verification
- **SARS eFiling**: Tax clearance status (requires eFiling integration)

**Tier 3: Manual Admin Review** (Required for high-risk)
- Cross-reference vehicle lists across all documents
- Verify driver PrDP matches vehicle categories
- Confirm insurance covers all listed vehicles
- Check route authorization matches operational area

### Document Cross-Validation Rules

Transport operators require **cross-document validation**:

1. **Vehicle List Consistency**:
   - Operating License vehicles MUST match PrDP permit vehicles
   - Tourist Transport Permit vehicles MUST match insurance policy
   - All vehicles MUST have valid roadworthy certificates
   - All vehicles MUST have valid registration documents

2. **Driver Authorization**:
   - Each driver MUST have PrDP for correct vehicle category
   - PrDP category MUST match vehicle type (e.g., C1 for 12-16 seater)
   - Driver ID MUST be verified against Home Affairs

3. **Route Authorization**:
   - Operating License routes MUST include all advertised destinations
   - Cross-border permit MUST list all international destinations

4. **Insurance Coverage**:
   - Minimum R10M (vs R5M for non-transport partners)
   - All vehicles on permits MUST be listed on policy
   - Per-passenger coverage MUST be adequate

### Cost for Transport Operator Verification

**Standard Transport Operator** (15 documents):
- 1× Business Registration: R0.027
- 1× Tax Clearance: R0.027
- 1× Operating License: R0.027
- 1× Tourist Transport Permit: R0.027
- 1× PrDP Permit: R0.027
- 3× PrDP Driver (3 drivers): R0.081 (3 × R0.027)
- 3× Vehicle Roadworthy (3 vehicles): R0.081
- 3× Vehicle Registration (3 vehicles): R0.081
- 1× Passenger Liability Insurance: R0.027
- 1× Cross-Border Permit: R0.027

**Total: R0.43/operator** (Azure OCR only)

**With manual cross-validation**: +2 hours admin time (automated flags reduce this)

### 🏆 1. Azure Cognitive Services (BEST VALUE - Recommended)
- **Use Case**: OCR, document text extraction, form recognition, ID card reading
- **Coverage**: Global, excellent for SA documents
- **Pricing**: R27/1000 pages (~R0.027/document)
- **Why**: Most cost-effective, great OCR accuracy, Microsoft SA support
- **Integration**: Azure SDK
- **Docs**: https://azure.microsoft.com/en-us/services/cognitive-services/

**Setup**:
```bash
npm install @azure/ai-form-recognizer @azure/cognitiveservices-computervision
```

```env
VERIFICATION_PROVIDER=azure
VERIFICATION_API_KEY=your_azure_key
VERIFICATION_API_URL=https://your-resource.cognitiveservices.azure.com/
```

**Cost Breakdown** (per partner application):
- 7 documents × R0.027 = **R0.19/partner**
- 100 partners/month = **R19/month**

### 2. CIPC API (FREE - SA Business Registry)
- **Use Case**: South African company registration verification
- **Coverage**: South Africa only
- **Pricing**: FREE for basic lookups
- **Why**: Direct government source, most accurate for SA businesses
- **Integration**: REST API (requires registration)
- **Contact**: http://www.cipc.co.za/ | Email: CIPCCCentre@cipc.co.za

**How to Register**:
1. Email CIPC requesting API access
2. Provide business details and use case
3. Complete compliance forms
4. Receive API credentials (usually 2-4 weeks)

**Setup**:
```env
VERIFICATION_PROVIDER=cipc
CIPC_API_KEY=your_cipc_key
CIPC_API_URL=https://eservices.cipc.co.za/api
```

### 3. Home Affairs API (FREE - ID Verification)
- **Use Case**: South African ID number verification
- **Coverage**: South Africa only
- **Pricing**: FREE for verified organizations
- **Why**: Official government verification, no cost
- **Integration**: Department of Home Affairs API
- **Contact**: https://www.dha.gov.za/

**Note**: Requires formal application and compliance with POPIA.

### 4. Smile Identity (Africa-Focused, Budget-Friendly)
- **Use Case**: ID verification, selfie matching, liveness detection
- **Coverage**: Africa (20+ countries including SA)
- **Pricing**: R36-90/verification (~50% cheaper than Onfido)
- **Why**: Africa-optimized, better SA ID recognition
- **Integration**: REST API + Mobile SDKs
- **Docs**: https://docs.smileidentity.com/

**Setup**:
```bash
npm install smile-identity-core
```

```env
VERIFICATION_PROVIDER=smile
SMILE_PARTNER_ID=your_partner_id
SMILE_API_KEY=your_api_key
SMILE_SID_SERVER=https://api.smileidentity.com/v1
```

**Cost**: R36/ID check (vs R90+ for Onfido)

### 5. Tessera (SA-Based Alternative)
- **Use Case**: Document verification, OCR, compliance checks
- **Coverage**: South Africa, compliance with POPIA/FICA
- **Pricing**: R45-120/check (negotiable for volume)
- **Why**: Local support, FICA/POPIA compliant out-of-box
- **Contact**: https://www.tessera.co.za/

### ❌ NOT Recommended for Cost

**Onfido**: R90-180/check (too expensive for MVP)  
**Trulioo**: R360-720/check (enterprise pricing, overkill)  
**Jumio**: R120-200/check (premium tier)

## Integration Steps

### 1. Choose Provider

Evaluate based on:
- **Document types** you need to verify
- **Geographic coverage** (SA vs global)
- **Cost** per verification
- **Compliance** requirements (POPIA, GDPR)
- **Integration complexity**

### 2. Configure Environment

```env
# .env
VERIFICATION_PROVIDER=onfido  # or trulioo, azure, google, cipc
VERIFICATION_API_KEY=your_api_key
VERIFICATION_API_URL=https://api.provider.com
VERIFICATION_WEBHOOK_SECRET=your_webhook_secret
VERIFICATION_CALLBACK_URL=https://yourdomain.com/api/verification/webhook
```

### 3. Implement Provider-Specific Logic

Edit `server/services/documentVerification.js`:

```javascript
async verifyWithOnfido(document) {
  const onfido = require('@onfido/api');
  
  const client = new onfido.Onfido({
    apiToken: this.apiKey,
    region: onfido.Region.EU
  });

  // 1. Create applicant
  const applicant = await client.applicant.create({
    firstName: document.metadata.firstName,
    lastName: document.metadata.lastName
  });

  // 2. Upload document
  const uploadedDoc = await client.document.upload({
    applicantId: applicant.id,
    file: document.fileBuffer,
    type: 'national_identity_card'
  });

  // 3. Create check
  const check = await client.check.create({
    applicantId: applicant.id,
    reportNames: ['document', 'facial_similarity_photo']
  });

  return {
    jobId: check.id,
    status: 'pending',
    applicantId: applicant.id
  };
}
```

### 4. Set Up Webhooks

Register your webhook URL with the provider:

```
POST https://api.onfido.com/v3/webhooks
{
  "url": "https://yourdomain.com/api/verification/webhook",
  "enabled": true,
  "events": ["check.completed", "check.failed"]
}
```

Handle webhooks in your backend:

```javascript
// server/routes/verification.js
router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-signature'];
  const payload = req.body;

  const verificationService = require('../services/documentVerification').getInstance();
  
  try {
    const result = await verificationService.handleWebhook(payload, signature);
    
    // Update database with verification result
    await updateDocumentStatus(result.jobId, result.status, result.result);
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});
```

### 5. Update Backend API Endpoint

Edit `server/server.js` to use verification service:

```javascript
const verificationService = require('./services/documentVerification').getInstance({
  provider: process.env.VERIFICATION_PROVIDER,
  apiKey: process.env.VERIFICATION_API_KEY,
  apiUrl: process.env.VERIFICATION_API_URL
});

app.post('/api/partners/:id/documents', upload.single('document'), async (req, res) => {
  const { type, applicationId } = req.body;
  const file = req.file;

  // Upload to storage (S3/Azure Blob/etc.)
  const fileUrl = await uploadToStorage(file);

  // Start verification
  const verification = await verificationService.verifyDocument({
    id: generateId(),
    type,
    url: fileUrl,
    applicantId: applicationId,
    metadata: {
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype
    }
  });

  res.json({
    documentId: verification.jobId,
    status: verification.status,
    uploadedAt: new Date().toISOString()
  });
});
```

## Testing

### Mock Mode (Development)

```bash
VERIFICATION_PROVIDER=mock npm run server
```

Mock mode returns simulated verification results after 2-second delay.

### Testing Real Provider

```bash
# Use provider sandbox/test environment
VERIFICATION_PROVIDER=onfido
VERIFICATION_API_KEY=test_api_key_xyz
VERIFICATION_API_URL=https://api.onfido.com/v3
npm run server
```

## Cost Estimation (ZAR - Cost-Effective Strategy)

### 🎯 Recommended Setup (Hybrid Approach)

**Tier 1: Automated Pre-Screening (Azure + CIPC)**
- Azure OCR: All 7 documents
- CIPC API: Business registration verification
- **Cost**: R0.19/partner

**Tier 2: High-Risk Verification (Smile Identity)**
- Only for flagged applications or high-value partners
- ID verification with liveness check
- **Cost**: R36/verification (only when needed)

### Cost Breakdown Table

| Provider | ID Docs | Business Docs | Total/Partner |
|----------|---------|---------------|---------------|
| **Azure OCR** (Recommended) | R0.027/doc | R0.027/doc | **R0.19** (7 docs) |
| **CIPC API** (Recommended) | N/A | FREE | **FREE** |
| **Smile Identity** (Optional) | R36/check | N/A | R36 (if needed) |
| Tessera | R45/check | R45/check | R315 (7 docs) |
| Onfido | R90/check | N/A | R90+ |
| Trulioo | R360/check | R720/check | R1,080+ |

### Monthly Cost Estimates (100 partners/month)

**Budget Strategy** (Azure + CIPC only):
- Azure OCR: 100 × R0.19 = **R19/month**
- CIPC API: FREE
- **Total: R19/month** ✅

**Balanced Strategy** (Azure + CIPC + Smile for 20% flagged):
- Azure OCR: 100 × R0.19 = R19
- CIPC API: FREE
- Smile Identity: 20 × R36 = R720
- **Total: R739/month** (R7.39/partner) ✅

**Premium Strategy** (Smile Identity for all):
- Smile Identity: 100 × R36 = R3,600
- Azure OCR: 100 × R0.19 = R19
- **Total: R3,619/month** (R36.19/partner)

**Expensive Alternative** (Onfido - NOT recommended):
- Onfido: 100 × R90 = R9,000/month ❌

### 💰 Recommended: Budget Strategy (R19/month)

**What you get**:
- ✅ Azure OCR extracts text from all documents
- ✅ CIPC verifies business registration for FREE
- ✅ Automated checks: file type, size, expiry dates, data validation
- ✅ 95%+ automation rate
- ✅ Manual admin override for edge cases

**When to upgrade**:
- High fraud risk detected
- Large transaction values (>R50k)
- Regulatory audit requirements
- Partner complaints about verification delays

## Security & Compliance

1. **POPIA Compliance** (SA):
   - Store only verification results, not raw documents (unless required)
   - Encrypt documents at rest (AES-256)
   - Document retention policy (delete after approval/rejection)

2. **PCI DSS** (Banking details):
   - Never store full bank account numbers
   - Use tokenization for sensitive data

3. **Data Privacy**:
   - Obtain explicit consent for verification
   - Allow users to request data deletion
   - Audit log all verification activities

## Next Steps (Cost-Effective Roadmap)

### Phase 1: MVP Testing (Current)
- ✅ Mock verification (FREE)
- ✅ Test all workflows
- **Cost**: R0/month

### Phase  & Resources

### South African Providers
- **CIPC**: callcentre@cipc.co.za | +27 86 100 2472
- **Home Affairs**: https://www.dha.gov.za/
- **Tessera**: info@tessera.co.za | https://www.tessera.co.za/
- **Smile Identity**: support@smileidentity.com | https://www.smileidentity.com/

### Global Providers (SA Support)
- **Azure**: azure-support@microsoft.com | Microsoft SA: +27 11 245 0000
- **Google Cloud**: https://cloud.google.com/support (SA region available)

### Free Resources
- **Azure Free Tier**: R200 credits/month for first 12 months
- **CIPC Online Portal**: Free manual lookups at https://eservices.cipc.co.za/
- **Home Affairs ID Verification**: https://secure.dha.gov.za/

## Key Contacts for API Access

**CIPC API Application**:
1. Email: CIPCCCentre@cipc.co.za
2. Subject: "API Access Request - Partner Verification System"
3. Include: Company details, CIPC registration, intended use case
4. Expected response: 2-4 weeks

**Home Affairs API** (for high-volume):
1. Email: https://www.dha.gov.za/index.php/contact-us
2. Requires: POPIA compliance documentation
3. Expected response: 4-8 weeksartners/month)
- ✅ Azure OCR (scales linearly)
- ✅ CIPC API live
- ✅ **Smile Identity** for flagged applications only (20% = R144-576/month)
- **Cost**: R38-595/month depending on volume

### Phase 4: Scale (200+ partners/month)
- Consider enterprise pricing with Smile Identity
- Negotiate bulk rates with Tessera
- Implement ML-based fraud detection to reduce manual reviews
- **Cost**: Negotiate custom pricing

### Immediate Actions

1. **Week 1**: Apply for CIPC API access (free, takes 2-4 weeks)
2. **Week 1**: Create Azure account and set up Form Recognizer (R200 free credits)
3. **Week 2**: Test Azure OCR with sample documents
4. **Week 3**: Integrate Azure into verification service
5. **Week 4**: Go live with Azure + manual review hybrid

## Support

For integration help:
- Onfido: support@onfido.com
- Trulioo: support@trulioo.com
- Azure: azure-support@microsoft.com
- CIPC: callcentre@cipc.co.za
