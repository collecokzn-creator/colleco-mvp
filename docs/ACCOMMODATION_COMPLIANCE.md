# Accommodation Provider Compliance Guide

**Complete verification requirements for hotels, lodges, guesthouses, and B&Bs in South Africa**

---

## Overview

This guide covers all compliance requirements for accommodation providers on the CollEco platform. Requirements are based on SA Tourism grading standards, municipal regulations, and insurance industry best practices.

**Cost-effective verification**: Azure OCR (R0.027/document) + free government APIs = R0.27-0.51 per property depending on type.

---

## 1. Partner Types & Document Counts

### 1.1 Small B&B / Guesthouse (1-5 rooms)
**Total documents**: 10
**Verification cost**: R0.270 (10 docs × R0.027)

### 1.2 Standard Hotel / Lodge (6-30 rooms)
**Total documents**: 14
**Verification cost**: R0.378 (14 docs × R0.027)

### 1.3 Large Hotel / Resort (30+ rooms)
**Total documents**: 19
**Verification cost**: R0.513 (19 docs × R0.027)

---

## 2. Required Documents

### 2.1 Standard Business Documents (All accommodation)

1. **Business Registration** (CIPC) - **FREE verification via CIPC API**
   - Type: CK1, CK2, or sole proprietor registration
   - Validates: Business name, directors, registration number
   - Format: YYYY/NNNNNN/23 or K{year}/{sequential}
   - Issue: Companies and Intellectual Property Commission (CIPC)
   - Application: https://eservices.cipc.co.za/
   - Cost: R175 (sole prop) to R500 (Pty Ltd)
   - Processing: 1-5 days

2. **Tax Clearance Certificate** (SARS)
   - Type: Income tax compliance certificate
   - Validity: 12 months
   - Validates: VAT registration, tax compliance
   - Issue: South African Revenue Service (SARS)
   - Application: https://www.sars.gov.za/
   - Cost: FREE (requires tax compliance)
   - Processing: 7-21 days

3. **ID Document** (Owner/Director) - **FREE verification via Home Affairs API**
   - Type: SA ID card or passport
   - Validates: Identity, address proof
   - Cross-check: Director match with business registration
   - Issue: Department of Home Affairs
   - Cost: R140 (ID card), R400 (passport)

4. **Banking Details & Proof**
   - Type: Bank letter or stamped statement
   - Validates: Account ownership, account number, branch code
   - Cross-check: Account holder name matches business name
   - Age: <3 months old
   - Cost: FREE (from bank)

5. **B-BBEE Certificate** (Optional, encouraged)
   - Type: B-BBEE verification certificate
   - Level: 1-8 or EME/QSE affidavit
   - Validates: Empowerment status, preferential procurement
   - Issue: SANAS-accredited verification agency
   - Application: Through accredited agencies
   - Cost: R5,000-15,000 (depends on turnover)
   - Validity: 12 months
   - Processing: 30-60 days

### 2.2 Tourism & Grading Documents (All accommodation)

6. **Tourism Grading Certificate** (SA Tourism)
   - Type: Official star grading certificate (1-5 stars)
   - Categories: Hotel, Guest House, Lodge, B&B, Self-catering
   - Validates: Quality standards, facility standards
   - Issue: SA Tourism Grading Council
   - Application: https://www.tourismgrading.co.za/
   - Cost: R3,000-8,000 (assessment + annual fee)
   - Validity: 2 years
   - Processing: 30-90 days (includes on-site assessment)
   - **RED FLAG**: Operating without grading is legal but reduces credibility
   - **Format**: TG-[CATEGORY]-[NUMBER]-[YEAR] (e.g., TG-HOTEL-12345-2024)

7. **Tourism Business License** (Provincial tourism authority)
   - Type: Provincial tourism registration
   - Validates: Legal operation, provincial compliance
   - Issue: Provincial tourism authority (e.g., Gauteng Tourism)
   - Application: Via provincial tourism website
   - Cost: R500-2,000/year
   - Validity: 12 months
   - Processing: 30-60 days
   - **NOTE**: Requirements vary by province

### 2.3 Health & Safety Documents (All accommodation)

8. **Certificate of Acceptability** (CoA) - Municipal health inspection
   - Type: Health inspection certificate
   - Validates: Kitchen hygiene, water quality, waste disposal
   - Issue: Municipal health department
   - Inspection areas: Food prep areas, bathrooms, pool, water supply
   - Cost: R500-1,500 (inspection fee)
   - Validity: 12 months
   - Processing: 14-30 days (includes on-site inspection)
   - **CRITICAL**: Required for food service (breakfast, restaurant)
   - **RED FLAG**: Operating without CoA = R10,000+ fine + closure

9. **Fire Safety Certificate** (Fire Department)
   - Type: Fire safety compliance certificate
   - Validates: Fire extinguishers, escape routes, smoke detectors, emergency lighting
   - Issue: Municipal fire department
   - Inspection requirements:
     - Fire extinguishers (1 per 200m²)
     - Smoke detectors (1 per room + corridors)
     - Emergency lighting (all exits)
     - Fire escape routes (signage + clear access)
   - Cost: R1,000-3,000 (inspection + compliance)
   - Validity: 12 months
   - Processing: 30-60 days (includes on-site inspection)
   - **CRITICAL**: Required for accommodation with >5 rooms
   - **RED FLAG**: No fire certificate = insurance void + liability exposure

10. **Public Liability Insurance**
    - Type: Public liability insurance policy
    - Coverage: R5M minimum (small), R10M standard (hotels)
    - Validates: Guest injury coverage, property damage, legal liability
    - Covers: Slip/fall injuries, food poisoning, property damage, theft claims
    - Issue: Commercial insurance provider (Santam, Hollard, OUTsurance)
    - Cost: R3,000-12,000/year (depends on room count + coverage)
    - Validity: 12 months
    - Processing: 1-7 days
    - **CRITICAL**: Required before accepting first guest
    - **RED FLAG**: No insurance = personal liability in millions

### 2.4 Additional Documents (Medium/Large Properties)

11. **Liquor License** (If serving alcohol)
    - Type: On-consumption liquor license
    - Categories: Hotel/Restaurant/Guest House/Special Event
    - Validates: Legal alcohol sales, operating hours
    - Issue: Provincial Liquor Authority
    - Application: Via provincial liquor board
    - Requirements:
      - Police clearance (owner/manager)
      - Zoning certificate (commercial/residential)
      - Public participation (notify neighbors)
    - Cost: R2,000-10,000 (application + annual renewal)
    - Validity: 12 months
    - Processing: 60-180 days (includes public participation period)
    - **NOTE**: B&Bs can serve complimentary wine, but NOT sell

12. **Pool Safety Certificate** (If pool on property)
    - Type: Pool safety compliance certificate
    - Validates: Pool fencing, depth markers, safety equipment, lifeguard (if required)
    - Requirements:
      - Fence: 1.2m min height, self-closing gate
      - Depth markers: Clearly visible
      - Safety equipment: Life ring, rescue hook
      - Lifeguard: Required for pools >100m² during operating hours
    - Issue: Municipal building inspector
    - Cost: R500-1,500 (inspection)
    - Validity: 12 months
    - Processing: 14-30 days
    - **RED FLAG**: Non-compliant pool = R20,000 fine + drowning liability

13. **Food Business License** (If restaurant/breakfast service)
    - Type: Food business registration
    - Validates: Food handler training, kitchen standards
    - Issue: Municipal health department (same as CoA but separate registration)
    - Requirements:
      - Food handler certificates (all kitchen staff)
      - Kitchen equipment standards
      - Pest control contract
    - Cost: R300-1,000/year
    - Validity: 12 months
    - Processing: 14-30 days
    - **CROSS-CHECK**: Must match Certificate of Acceptability

14. **Building Compliance Certificate** (Occupancy certificate)
    - Type: Certificate of occupancy
    - Validates: Building approved for accommodation use, zoning compliance
    - Issue: Municipal building inspector
    - Requirements:
      - Approved building plans
      - Electrical compliance (CoC)
      - Plumbing compliance
      - Zoning: Residential/commercial approval
    - Cost: R1,000-5,000 (depends on property size)
    - Validity: Permanent (unless alterations)
    - Processing: 30-90 days
    - **CRITICAL**: Required before first occupancy
    - **RED FLAG**: No occupancy cert = illegal operation + closure

### 2.5 Large Property Additional Documents (30+ rooms)

15. **Electrical Certificate of Compliance** (CoC)
    - Type: Electrical installation compliance certificate
    - Validates: Electrical wiring, DB boards, earthing, lighting
    - Issue: Registered electrician (ECSA)
    - Testing: Full electrical installation test
    - Cost: R2,000-8,000 (depends on property size)
    - Validity: 2 years (or on change of ownership/major renovations)
    - Processing: 7-14 days
    - **CRITICAL**: Required for insurance validation
    - **RED FLAG**: No CoC = insurance void + fire risk

16. **Gas Installation Certificate** (If gas kitchen/heating)
    - Type: Gas installation compliance certificate
    - Validates: Gas lines, regulators, ventilation, safety shutoffs
    - Issue: Registered gas installer (LPGSASA)
    - Testing: Pressure test, leak test
    - Cost: R1,500-5,000
    - Validity: 12 months
    - Processing: 7-14 days
    - **CRITICAL**: Required for commercial gas use
    - **RED FLAG**: No gas cert = explosion risk + criminal liability

17. **Lift/Elevator Inspection Certificate** (If multi-story with lift)
    - Type: Lift safety inspection certificate
    - Validates: Lift machinery, emergency systems, weight limits
    - Issue: Department of Employment and Labour (lift inspector)
    - Inspection: Annual full inspection
    - Cost: R2,000-5,000/year
    - Validity: 12 months
    - Processing: 30-60 days
    - **CRITICAL**: Required by Occupational Health & Safety Act
    - **RED FLAG**: No lift cert = R50,000 fine + closure

18. **Emergency Evacuation Plan** (Fire safety plan)
    - Type: Emergency evacuation procedure document
    - Validates: Evacuation routes, assembly points, fire drills, staff training
    - Issue: Fire safety consultant or in-house
    - Requirements:
      - Floor plans with exit routes
      - Assembly point locations
      - Staff responsibilities
      - Guest notification procedures
    - Cost: R1,000-3,000 (consultant)
    - Validity: Updated annually
    - Processing: 7-14 days
    - **CROSS-CHECK**: Must align with fire safety certificate

19. **Employee Certificates** (For large properties with staff)
    - Type: Employment contracts, UIF registration, Bargaining Council compliance
    - Validates: Legal employment, UIF payments, wage compliance
    - Issue: Department of Labour, Hospitality Bargaining Council
    - Documents:
      - UIF registration (company + employees)
      - Employment contracts
      - Wage sheets (minimum wage compliance)
      - Bargaining Council membership (if applicable)
    - Cost: UIF 2% of salary, Bargaining Council R50-150/employee/month
    - Validity: Ongoing
    - Processing: 14-30 days (initial registration)
    - **CROSS-CHECK**: Number of employees must align with property size

---

## 3. Document Validation Rules

### 3.1 Expiry Checks (Automated)

| Document | Expiry Period | Warning Threshold |
|----------|---------------|-------------------|
| Tax Clearance | 12 months | 60 days |
| Tourism Grading | 24 months | 90 days |
| Tourism License | 12 months | 60 days |
| CoA (Health) | 12 months | 60 days |
| Fire Safety | 12 months | 60 days |
| Public Liability | 12 months | 60 days |
| Liquor License | 12 months | 60 days |
| Pool Safety | 12 months | 60 days |
| Food License | 12 months | 60 days |
| Electrical CoC | 24 months | 90 days |
| Gas Certificate | 12 months | 60 days |
| Lift Inspection | 12 months | 60 days |

### 3.2 Format Validation

- **Tourism Grading Number**: `TG-[CATEGORY]-[5 digits]-[YEAR]`
  - Example: `TG-HOTEL-12345-2024`
  - Categories: HOTEL, GUESTHOUSE, LODGE, BNB, SELFCATERING
  
- **Liquor License Number**: `[PROVINCE]-[TYPE]-[NUMBER]/[YEAR]`
  - Example: `GP-HOTEL-5678/2024`
  - Provinces: GP, WC, KZN, EC, NC, NW, FS, MP, LP

- **Food License Number**: Municipal format varies by municipality

### 3.3 Cross-Validation Rules

1. **Business Name Consistency**
   - Business registration name = Tax clearance name = Banking proof name
   - Trading name (if different) must be noted on registration
   - **Flag if mismatch**: Hold verification pending clarification

2. **Director/Owner Match**
   - ID document name matches director on business registration
   - Banking proof account holder matches business name
   - **Reject if mismatch**: Identity fraud risk

3. **Property Size Validation**
   - Tourism grading certificate room count = declared room count
   - Fire safety certificate capacity = declared capacity
   - **Flag if mismatch**: Hold pending site verification

4. **Coverage Alignment**
   - Public liability coverage ≥ R5M (small), R10M (standard)
   - Pool liability included if pool on property
   - Liquor liability included if liquor license present
   - **Reject if insufficient**: Insurance inadequate

5. **Food Service Requirements**
   - If "breakfast included" OR "restaurant on-site":
     - Certificate of Acceptability required
     - Food Business License required
   - **Reject if missing**: Food safety risk

6. **Alcohol Service Requirements**
   - If "bar" OR "wine service" OR "alcohol sales":
     - Liquor license required
   - **Allow**: Complimentary wine at B&Bs (no license needed)
   - **Reject if selling without license**: Illegal operation

7. **Pool Safety Requirements**
   - If "pool" listed in amenities:
     - Pool safety certificate required
   - **Reject if missing**: Drowning risk + liability

8. **Multi-Story Requirements**
   - If property >2 floors:
     - Fire safety certificate required
     - Emergency evacuation plan required
   - If lift present:
     - Lift inspection certificate required
   - **Reject if missing**: Safety risk

---

## 4. Cost Breakdown by Property Type

### 4.1 Small B&B / Guesthouse (1-5 rooms)

| Document | Azure OCR Cost | Govt API Cost | Total |
|----------|----------------|---------------|-------|
| Business Registration | R0.027 | FREE (CIPC) | R0.027 |
| Tax Clearance | R0.027 | - | R0.027 |
| ID Document | R0.027 | FREE (Home Affairs) | R0.027 |
| Banking Proof | R0.027 | - | R0.027 |
| Tourism Grading | R0.027 | - | R0.027 |
| Tourism License | R0.027 | - | R0.027 |
| CoA (Health) | R0.027 | - | R0.027 |
| Fire Safety | R0.027 | - | R0.027 |
| Public Liability | R0.027 | - | R0.027 |
| B-BBEE (Optional) | R0.027 | - | R0.027 |
| **TOTAL** | **R0.270** | - | **R0.270** |

### 4.2 Standard Hotel / Lodge (6-30 rooms)

Add to above:
- Liquor License: R0.027
- Pool Safety: R0.027
- Food License: R0.027
- Building Compliance: R0.027

**TOTAL: R0.378**

### 4.3 Large Hotel / Resort (30+ rooms)

Add to standard:
- Electrical CoC: R0.027
- Gas Certificate: R0.027
- Lift Inspection: R0.027
- Emergency Plan: R0.027
- Employee Certificates: R0.027

**TOTAL: R0.513**

### 4.4 Monthly Operating Costs (100 properties)

**Small B&Bs**: 100 × R0.270 = R27.00/month  
**Standard Hotels**: 100 × R0.378 = R37.80/month  
**Large Resorts**: 100 × R0.513 = R51.30/month  

**Mixed portfolio (40 small, 50 standard, 10 large)**: R38.94/month

---

## 5. Compliance Workflow

### 5.1 Initial Verification (New Partner)

```
Partner uploads documents → Azure OCR extraction → Automated validation →
  ├─ PASS: All documents valid → Approve listing
  ├─ FLAG: Minor issues (expiry soon, format unclear) → Admin review
  └─ REJECT: Critical issues (expired, missing, mismatch) → Partner notification
```

### 5.2 Automated Checks

1. **Document extraction** (Azure OCR, R0.027/doc)
   - Extract text from all uploaded documents
   - Identify document type automatically
   - Extract key fields (names, dates, numbers, addresses)

2. **Expiry validation**
   - Check issue date + validity period
   - Flag if <60 days until expiry
   - Reject if already expired

3. **Format validation**
   - Check grading number format (TG-HOTEL-12345-2024)
   - Check liquor license format (GP-HOTEL-5678/2024)
   - Check business registration format (YYYY/NNNNNN/23)

4. **Cross-validation**
   - Match business name across all docs
   - Match director/owner ID with registration
   - Match room count across grading + fire safety
   - Match declared amenities with certificates (pool, liquor, food)

5. **Coverage validation**
   - Public liability ≥ R5M (small) or R10M (standard)
   - Liquor liability included if license present
   - Pool liability included if pool present

### 5.3 Annual Renewal Checks

- **60 days before expiry**: Email reminder to partner
- **30 days before expiry**: Platform notification + listing flag
- **Expiry date**: Listing suspended until renewed
- **30 days after expiry**: Listing delisted

---

## 6. Common Mistakes & Red Flags

### 6.1 Common Mistakes

1. **Confusing tourism grading with tourism license**
   - Grading = quality/star rating (optional but recommended)
   - License = legal operation permit (required in some provinces)
   - **Both may be needed** depending on province

2. **Operating without Certificate of Acceptability**
   - Required for ANY food service (including breakfast)
   - **Penalty**: R10,000 fine + immediate closure
   - **Fix**: Apply for health inspection BEFORE offering food

3. **Insufficient public liability coverage**
   - R1M-2M coverage inadequate for accommodation
   - **Minimum**: R5M for small B&Bs, R10M for hotels
   - **Fix**: Upgrade insurance before listing

4. **No fire safety certificate**
   - Required for properties >5 rooms
   - **Penalty**: Insurance void + criminal liability if fire injury/death
   - **Fix**: Commission fire safety inspection (R1,000-3,000)

5. **Selling alcohol without liquor license**
   - **Legal**: Complimentary wine at B&Bs (no charge)
   - **Illegal**: Selling wine, charging corkage, running a bar
   - **Penalty**: R50,000 fine + 12-month closure + criminal record
   - **Fix**: Apply for liquor license (60-180 days) OR stop selling

### 6.2 Auto-Reject Conditions

- ❌ Tax clearance expired → REJECT (tax non-compliance)
- ❌ Fire safety expired (properties >5 rooms) → REJECT (safety risk)
- ❌ Public liability expired → REJECT (insurance risk)
- ❌ CoA expired + offering food → REJECT (food safety risk)
- ❌ Liquor license expired + selling alcohol → REJECT (illegal operation)
- ❌ Pool listed but no pool safety cert → REJECT (drowning risk)
- ❌ Business name mismatch (registration vs banking) → REJECT (fraud risk)
- ❌ Room count mismatch (grading vs declared) → REJECT (misrepresentation)
- ❌ Insufficient liability coverage (<R5M small, <R10M standard) → REJECT (insurance inadequate)
- ❌ Operating without building compliance (occupancy) → REJECT (illegal building use)

---

## 7. Regulatory Authorities & Contacts

| Authority | Jurisdiction | Contact |
|-----------|-------------|---------|
| **SA Tourism Grading Council** | Tourism grading | https://www.tourismgrading.co.za/, info@tourismgrading.co.za, 011 895 3000 |
| **CIPC** | Business registration | https://eservices.cipc.co.za/, callcentre@cipc.co.za, 086 100 2472 |
| **SARS** | Tax compliance | https://www.sars.gov.za/, 0800 00 7277 |
| **Gauteng Tourism** | Provincial tourism license (GP) | https://www.gauteng.net/tourism/, info@gauteng.net, 011 639 1600 |
| **Cape Town Tourism** | Provincial tourism license (WC) | https://www.capetown.travel/, info@capetown.travel, 021 487 6800 |
| **KZN Tourism** | Provincial tourism license (KZN) | https://www.zulu.org.za/, info@zulu.org.za, 031 366 7500 |
| **Municipal Health Dept** | Certificate of Acceptability, Food License | Contact local municipality |
| **Municipal Fire Dept** | Fire safety certificate | Contact local municipality |
| **Provincial Liquor Board** | Liquor licenses | Contact provincial liquor authority |
| **ECSA** | Electrical CoC | https://www.ecsa.co.za/, 011 607 9500 |
| **LPGSASA** | Gas installation | https://www.lpgsasa.co.za/, info@lpgsasa.co.za, 011 555 5950 |
| **Dept of Employment & Labour** | Lift inspections, employee compliance | https://www.labour.gov.za/, 012 309 5000 |

---

## 8. Compliance Checklist (Admin Review)

### Pre-Approval Checklist

- [ ] Business registration valid and matches tax clearance
- [ ] Tax clearance valid (<12 months old)
- [ ] ID document matches director/owner on registration
- [ ] Banking proof matches business name
- [ ] Tourism grading present (or waived for ungraded properties)
- [ ] Tourism license present (if required by province)
- [ ] Certificate of Acceptability valid (if food service)
- [ ] Fire safety certificate valid (if >5 rooms)
- [ ] Public liability insurance ≥ R5M (small) or R10M (standard)
- [ ] Public liability insurance valid (<12 months old)
- [ ] Liquor license valid (if selling alcohol)
- [ ] Pool safety certificate valid (if pool on property)
- [ ] Food license valid (if food service)
- [ ] Building compliance certificate present
- [ ] Room count matches across documents
- [ ] Declared amenities have supporting certificates (pool, liquor, food)
- [ ] No expired documents
- [ ] No business name mismatches
- [ ] Coverage adequate for property size and activities

---

## 9. Setup Timeline & Costs

### 9.1 Small B&B / Guesthouse Setup

**Timeline**: 90-180 days (tourism grading is longest)

| Milestone | Days | Cost (ZAR) |
|-----------|------|------------|
| Business registration | 1-5 | R175-500 |
| Tax registration (VAT, PAYE) | 7-14 | FREE |
| Banking setup | 1-7 | FREE |
| Tourism grading application | 30-90 | R3,000-5,000 |
| Tourism license application | 30-60 | R500-1,000 |
| Health inspection (CoA) | 14-30 | R500-1,000 |
| Fire safety inspection | 30-60 | R1,000-2,000 |
| Public liability insurance | 1-7 | R3,000-5,000 |
| **TOTAL SETUP** | **90-180 days** | **R8,175-14,500** |

### 9.2 Standard Hotel / Lodge Setup

Add to above:
- Liquor license: 60-180 days, R2,000-10,000
- Pool safety: 14-30 days, R500-1,500
- Food license: 14-30 days, R300-1,000
- Building compliance: 30-90 days, R1,000-5,000

**TOTAL: 90-180 days, R12,000-32,000**

### 9.3 Large Hotel / Resort Setup

Add to standard:
- Electrical CoC: 7-14 days, R2,000-8,000
- Gas certificate: 7-14 days, R1,500-5,000
- Lift inspection: 30-60 days, R2,000-5,000
- Emergency plan: 7-14 days, R1,000-3,000
- Employee compliance: 14-30 days, R500-2,000

**TOTAL: 90-180 days, R19,000-55,000**

### 9.4 Annual Renewal Costs

**Small B&B**: R5,000-8,000/year  
**Standard Hotel**: R8,000-15,000/year  
**Large Resort**: R12,000-25,000/year  

---

## 10. Integration Roadmap

### Phase 1: Manual Verification (Current)
- Partners upload PDF/JPG documents via PartnerVerification.jsx
- Admin reviews manually in admin dashboard
- Binary approve/reject decision
- **Cost**: R0/month (manual labor intensive)

### Phase 2: Azure OCR + Automated Validation (Recommended)
- Install `@azure/ai-form-recognizer` SDK
- Extract text from documents automatically
- Validate expiry dates, formats, cross-references
- Flag issues for admin review
- **Cost**: R27-51/month for 100 properties (99% automation)

### Phase 3: Government API Integration (Future)
- CIPC API for business verification (FREE)
- Home Affairs API for ID verification (FREE)
- SA Tourism API for grading verification (pending availability)
- Municipal API for health/fire certificates (pending availability)
- **Cost**: R0-10/month (mostly free government APIs)

### Phase 4: Real-Time Monitoring (Advanced)
- Webhook notifications when documents expire
- Automatic reminder emails 60 days before expiry
- Listing auto-suspension on expiry
- Partner portal for renewal uploads
- **Cost**: R27-51/month + notification costs

---

## 11. Cost Comparison: Automated vs Manual

### Manual Verification (Current)
- Admin time: 30 minutes per property
- 100 properties = 50 hours/month
- Cost: R500/hour × 50 = R25,000/month
- **Error rate**: 5-10% (human error, fatigue)

### Automated Verification (Azure OCR)
- Azure OCR: R0.27-0.51 per property
- 100 properties = R27-51/month
- Admin review (flagged only): 2-5 hours/month
- Cost: R51 + (R500/hour × 5) = R2,551/month
- **Error rate**: <1% (automated validation)
- **Savings**: R22,449/month (90% reduction)

---

## 12. Comparison: Accommodation vs Other Partner Types

| Partner Type | Documents | Cost/Partner | Monthly (100) |
|--------------|-----------|--------------|---------------|
| Small B&B | 10 | R0.270 | R27.00 |
| Standard Hotel | 14 | R0.378 | R37.80 |
| Large Resort | 19 | R0.513 | R51.30 |
| Shuttle Service | 17 | R0.459 | R45.90 |
| Tour Operator | 20 | R0.540 | R54.00 |
| Professional Guide | 10 | R0.270 | R27.00 |

**Accommodation is MOST cost-effective** for verification (fewest specialist certifications).

---

## END OF ACCOMMODATION COMPLIANCE GUIDE

**Next steps**:
1. Install Azure Form Recognizer SDK: `npm install @azure/ai-form-recognizer`
2. Apply for CIPC API access: CIPCCCentre@cipc.co.za
3. Update `documentVerification.js` with accommodation document types
4. Test with sample accommodation provider documents
5. Deploy automated verification workflow
