# Restaurant & Catering Compliance Guide

**Complete verification requirements for restaurants, catering services, and dining experience providers in South Africa**

---

## Overview

This guide covers all compliance requirements for restaurant and catering operators on the CollEco platform. Requirements are based on National Health Act, Municipal bylaws, and Liquor Act regulations.

**Cost-effective verification**: Azure OCR (R0.027/document) + free government APIs = R0.30-0.43 per restaurant depending on type.

---

## 1. Partner Types & Document Counts

### 1.1 Small Restaurant / Café (No alcohol, <20 seats)
**Total documents**: 11
**Verification cost**: R0.297 (11 docs × R0.027)

### 1.2 Standard Restaurant (Liquor license, 20-100 seats)
**Total documents**: 14
**Verification cost**: R0.378 (14 docs × R0.027)

### 1.3 Large Restaurant / Catering (Full bar, >100 seats, catering services)
**Total documents**: 16
**Verification cost**: R0.432 (16 docs × R0.027)

---

## 2. Required Documents

### 2.1 Standard Business Documents (All restaurants)

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
   - Cost: R5,000-15,000 (depends on turnover)
   - Validity: 12 months

### 2.2 Food Safety & Health Documents (All restaurants)

6. **Certificate of Acceptability** (CoA) - Municipal health inspection
   - Type: Health inspection certificate for food premises
   - Validates: Kitchen hygiene, food storage, water supply, waste disposal, pest control
   - Issue: Municipal Environmental Health Department
   - Inspection areas:
     - Kitchen layout and equipment (stainless steel surfaces, separate prep areas)
     - Food storage (fridges 0-4°C, freezers -18°C, dry storage ventilated)
     - Water supply (potable water, hand washing facilities)
     - Waste disposal (bins with lids, waste removal contract)
     - Pest control (contract with pest control company)
     - Staff facilities (toilets, hand washing, changing rooms)
   - Cost: R500-2,000 (inspection fee)
   - Validity: 12 months
   - Processing: 14-45 days (includes on-site inspection)
   - **CRITICAL**: Required before opening to public
   - **RED FLAG**: Operating without CoA = R10,000 fine + immediate closure + criminal charges
   - **Format**: CoA-[MUNICIPALITY]-[NUMBER]/[YEAR]

7. **Food Business License** (Food premises registration)
   - Type: Food business registration certificate
   - Validates: Registered food business, health compliance
   - Issue: Municipal Environmental Health Department (same as CoA but separate registration)
   - Requirements:
     - Food handler certificates (all kitchen staff)
     - Food safety plan (HACCP-based)
     - Allergen management procedures
     - Temperature control logs
   - Cost: R300-1,500/year (depends on municipality)
   - Validity: 12 months
   - Processing: 14-30 days
   - **CROSS-CHECK**: Business name matches CoA
   - **RED FLAG**: No food license = R5,000 fine

8. **Food Handler Certificates** (All kitchen staff)
   - Type: Food hygiene training certificate
   - Validates: Food safety knowledge, hygiene practices
   - Topics:
     - Personal hygiene (hand washing, hair nets, clean uniforms)
     - Cross-contamination prevention
     - Temperature control (danger zone 5-60°C)
     - Allergen awareness
     - Cleaning and sanitization
   - Issue: Accredited training provider (CATHSSETA, private training companies)
   - Cost: R150-500 per person (1-day course)
   - Validity: 3 years
   - Processing: 1 day (training) + 7 days (certificate)
   - **CRITICAL**: ALL kitchen staff (chefs, cooks, prep staff, dishwashers) must have certificate
   - **CROSS-CHECK**: Number of certificates matches declared staff count
   - **RED FLAG**: Staff without certificates = R2,000 fine per person + CoA suspended

9. **Pest Control Contract** (Ongoing service)
   - Type: Pest control service agreement
   - Validates: Regular pest control, rodent prevention, insect control
   - Service frequency: Monthly minimum (weekly for high-risk areas)
   - Issue: Licensed pest control company (SAPCA registered)
   - Documents:
     - Service contract (12-month minimum)
     - Monthly service reports
     - Pest control certificate (SAPCA registration)
   - Cost: R500-2,000/month (depends on restaurant size)
   - Validity: Ongoing (contract must be active)
   - Processing: 1-7 days (contract setup)
   - **CRITICAL**: Required for CoA approval and renewal
   - **CROSS-CHECK**: Service reports dated within last 30 days

10. **Public Liability Insurance**
    - Type: Public liability insurance policy
    - Coverage: R5M minimum (small), R10M standard (large restaurants)
    - Validates: Customer injury coverage, food poisoning coverage, property damage
    - Covers:
      - Food poisoning claims
      - Slip/fall injuries
      - Allergic reactions
      - Burns (hot food/drink)
      - Property damage
    - Issue: Commercial insurance provider (Santam, Hollard, OUTsurance)
    - Cost: R3,000-15,000/year (depends on seating capacity + coverage)
    - Validity: 12 months
    - Processing: 1-7 days
    - **CRITICAL**: Required before opening
    - **RED FLAG**: No insurance = personal liability in millions

11. **Fire Safety Certificate** (Fire Department)
    - Type: Fire safety compliance certificate
    - Validates: Fire extinguishers, escape routes, smoke detectors, emergency lighting, kitchen suppression system
    - Issue: Municipal fire department
    - Inspection requirements:
      - Fire extinguishers: 1 per 200m², kitchen has CO2 + foam
      - Kitchen suppression system: Wet chemical system above cooking equipment
      - Smoke detectors: Kitchen, dining area, storage
      - Emergency lighting: All exits illuminated
      - Fire escape routes: Signage + unobstructed access
      - Emergency exits: Panic bars, outward opening
    - Cost: R1,000-5,000 (inspection + compliance equipment)
    - Validity: 12 months
    - Processing: 30-60 days (includes on-site inspection)
    - **CRITICAL**: Required for seating >20 people OR any commercial kitchen
    - **RED FLAG**: No fire certificate = insurance void + criminal liability if fire

### 2.3 Liquor License Documents (If serving alcohol)

12. **Liquor License** (Provincial liquor authority)
    - Type: On-consumption liquor license (restaurant/pub/hotel)
    - Categories:
      - **Restaurant Liquor License**: Serve alcohol with meals only
      - **Pub/Tavern License**: Serve alcohol with or without meals
      - **Special Event License**: Temporary license (1-7 days)
    - Validates: Legal alcohol sales, operating hours, age verification procedures
    - Issue: Provincial Liquor Authority
    - Application requirements:
      - Police clearance (owner/manager) - <12 months old
      - Zoning certificate (commercial zoning confirmed)
      - Public participation (notify neighbors, 30-day objection period)
      - Approved building plans
      - Fire safety certificate
      - Proof of ownership or lease agreement
    - Cost: R2,000-12,000 (application + annual renewal)
    - Validity: 12 months (annual renewal)
    - Processing: 90-240 days (includes public participation + hearing if objections)
    - **CRITICAL**: Required to sell OR serve alcohol (even complimentary drinks)
    - **RED FLAG**: Selling alcohol without license = R100,000 fine + 12-month closure + criminal record
    - **Format**: [PROVINCE]-[TYPE]-[NUMBER]/[YEAR]
      - Example: `GP-REST-5678/2024` (Gauteng, Restaurant, 5678, 2024)

13. **Liquor Manager Registration** (Responsible person)
    - Type: Liquor manager registration certificate
    - Validates: Designated responsible person for liquor compliance
    - Issue: Provincial liquor authority
    - Requirements:
      - 18+ years old
      - No criminal record (alcohol-related offenses)
      - Liquor management training (recommended)
    - Cost: R500-1,500 (registration)
    - Validity: 12 months OR tied to liquor license
    - Processing: 14-30 days
    - **CROSS-CHECK**: Manager name on license matches registration

14. **Police Clearance** (Owner/Manager) - For liquor license
    - Type: Police clearance certificate
    - Validates: No criminal record (especially alcohol, assault, theft offenses)
    - Issue: South African Police Service (SAPS)
    - Cost: R100-140
    - Validity: 12 months (for liquor license purposes)
    - Age: <12 months old
    - Processing: 14-30 days (fingerprint + background check)
    - **CRITICAL**: Required for liquor license application
    - **RED FLAG**: Criminal record = liquor license denied

### 2.4 Additional Documents (Large Restaurants / Catering)

15. **Zoning Certificate** (Commercial zoning)
    - Type: Zoning certificate or consent use
    - Validates: Property approved for restaurant/commercial use
    - Issue: Municipal town planning department
    - Required when:
      - Property originally residential (need consent use)
      - Change of use (e.g., office to restaurant)
      - New building (zoning confirmation)
    - Cost: R500-3,000 (application)
    - Validity: Permanent (unless property use changes)
    - Processing: 60-120 days (may require public participation)
    - **CRITICAL**: Required for liquor license application
    - **RED FLAG**: Operating restaurant in residential zone without consent = R20,000 fine + closure

16. **Building Compliance Certificate** (Occupancy certificate)
    - Type: Certificate of occupancy
    - Validates: Building approved for commercial use, structural compliance, plumbing, electrical
    - Issue: Municipal building inspector
    - Requirements:
      - Approved building plans (alterations, kitchen, toilets)
      - Electrical Certificate of Compliance (CoC)
      - Plumbing Certificate of Compliance
      - Structural approval (load-bearing walls, mezzanine)
    - Cost: R2,000-10,000 (depends on building size + alterations)
    - Validity: Permanent (unless alterations)
    - Processing: 60-120 days
    - **CRITICAL**: Required before opening + for liquor license
    - **RED FLAG**: Operating without occupancy cert = illegal building use + closure

### 2.5 Catering Service Additional Documents

17. **Catering License** (Mobile food service)
    - Type: Catering/mobile food service license
    - Validates: Off-site food preparation and service
    - Issue: Municipal Environmental Health Department
    - Requirements:
      - Central kitchen approved (CoA)
      - Food transport procedures (insulated containers, temperature control)
      - Mobile unit compliance (if food truck/trailer)
      - Event-specific permits (per venue)
    - Cost: R500-2,000/year
    - Validity: 12 months
    - Processing: 30-60 days
    - **NOTE**: Separate from restaurant CoA if catering off-site

18. **Vehicle Registration & Roadworthy** (If food truck/mobile catering)
    - Type: Vehicle registration + roadworthy certificate
    - Validates: Vehicle legal, roadworthy, licensed
    - Issue: eNaTIS (registration) + authorized testing station (roadworthy)
    - Cost: R500-1,500/year
    - Validity: 12 months (roadworthy), ongoing (registration)
    - Processing: 1 day (roadworthy test)
    - **CROSS-CHECK**: Vehicle listed matches catering license

---

## 3. Document Validation Rules

### 3.1 Expiry Checks (Automated)

| Document | Expiry Period | Warning Threshold |
|----------|---------------|-------------------|
| Tax Clearance | 12 months | 60 days |
| Certificate of Acceptability | 12 months | 60 days |
| Food Business License | 12 months | 60 days |
| Food Handler Certificates | 3 years | 90 days |
| Pest Control Contract | Ongoing | 30 days (last service report) |
| Public Liability Insurance | 12 months | 60 days |
| Fire Safety Certificate | 12 months | 60 days |
| Liquor License | 12 months | 60 days |
| Police Clearance | 12 months | 60 days |
| Catering License | 12 months | 60 days |
| Vehicle Roadworthy | 12 months | 60 days |

### 3.2 Format Validation

- **CoA Number**: `CoA-[MUNICIPALITY]-[NUMBER]/[YEAR]`
  - Example: `CoA-JHB-12345/2024`
  
- **Liquor License Number**: `[PROVINCE]-[TYPE]-[NUMBER]/[YEAR]`
  - Example: `GP-REST-5678/2024`
  - Provinces: GP, WC, KZN, EC, NC, NW, FS, MP, LP
  - Types: REST (Restaurant), PUB (Pub), HOTEL (Hotel), SPECIAL (Special Event)

- **Food Handler Certificate**: Varies by training provider

### 3.3 Cross-Validation Rules

1. **Business Name Consistency**
   - Business registration = Tax clearance = CoA = Food license = Liquor license
   - Trading name (if different) must be noted on registration
   - **Flag if mismatch**: Hold verification pending clarification

2. **Director/Owner Match**
   - ID document name matches director on business registration
   - Police clearance name matches liquor license applicant
   - **Reject if mismatch**: Identity fraud risk

3. **Food Handler Staff Count**
   - Number of food handler certificates ≥ declared kitchen staff count
   - **Minimum**: 2 certificates (chef + assistant) even for small café
   - **Flag if insufficient**: Hold pending additional staff certification

4. **Pest Control Service Recency**
   - Last service report <30 days old
   - **Flag if >30 days**: Hold pending latest service report
   - **Reject if >90 days**: Pest control lapsed

5. **Liquor License Alignment**
   - If "alcohol served" OR "bar" OR "wine list":
     - Liquor license required
     - Police clearance required (owner/manager)
     - Liquor manager registration required
   - **Reject if missing**: Illegal alcohol service

6. **Seating Capacity Validation**
   - Declared seating capacity matches:
     - Fire safety certificate occupancy limit
     - Building compliance certificate occupancy
   - **Flag if mismatch**: Hold pending clarification
   - **Reject if exceeded**: Safety risk + illegal overcrowding

7. **Catering vs Restaurant Distinction**
   - If "catering" OR "mobile food service":
     - Catering license required
     - Vehicle registration required (if food truck)
   - If only restaurant (no off-site):
     - Catering license NOT required
   - **Cross-check**: Service type matches licenses

8. **Insurance Coverage Adequacy**
   - Public liability ≥ R5M (small, <20 seats)
   - Public liability ≥ R10M (standard, 20-100 seats)
   - Public liability ≥ R10M (large, >100 seats OR catering)
   - Food poisoning coverage included
   - **Reject if insufficient**: Insurance inadequate

---

## 4. Cost Breakdown by Restaurant Type

### 4.1 Small Restaurant / Café (<20 seats, no alcohol)

| Document | Azure OCR Cost | Govt API Cost | Total |
|----------|----------------|---------------|-------|
| Business Registration | R0.027 | FREE (CIPC) | R0.027 |
| Tax Clearance | R0.027 | - | R0.027 |
| ID Document | R0.027 | FREE (Home Affairs) | R0.027 |
| Banking Proof | R0.027 | - | R0.027 |
| Certificate of Acceptability | R0.027 | - | R0.027 |
| Food Business License | R0.027 | - | R0.027 |
| Food Handler Certificates (2) | R0.054 | - | R0.054 |
| Pest Control Contract | R0.027 | - | R0.027 |
| Public Liability (R5M) | R0.027 | - | R0.027 |
| Fire Safety Certificate | R0.027 | - | R0.027 |
| B-BBEE (Optional) | R0.027 | - | R0.027 |
| **TOTAL** | **R0.297** | - | **R0.297** |

### 4.2 Standard Restaurant (20-100 seats, liquor license)

Add to small:
- Liquor License: R0.027
- Liquor Manager Registration: R0.027
- Police Clearance: R0.027

**TOTAL: R0.378**

### 4.3 Large Restaurant / Catering (>100 seats, catering)

Add to standard:
- Zoning Certificate: R0.027
- Building Compliance: R0.027

**TOTAL: R0.432**

### 4.4 Monthly Operating Costs (100 restaurants)

**Small Cafés**: 100 × R0.297 = R29.70/month  
**Standard Restaurants**: 100 × R0.378 = R37.80/month  
**Large Restaurants**: 100 × R0.432 = R43.20/month  

**Mixed portfolio (40 small, 50 standard, 10 large)**: R35.64/month

---

## 5. Compliance Workflow

### 5.1 Initial Verification (New Partner)

```
Partner uploads documents → Azure OCR extraction → Automated validation →
  ├─ PASS: All documents valid → Approve listing
  ├─ FLAG: Minor issues (expiry soon, staff count low) → Admin review
  └─ REJECT: Critical issues (no CoA, no liquor license but serving alcohol, expired food handlers) → Partner notification
```

### 5.2 Automated Checks

1. **Document extraction** (Azure OCR, R0.027/doc)
2. **Expiry validation** (CoA, food license, liquor license, food handlers, pest control)
3. **Format validation** (CoA number, liquor license number)
4. **Business name consistency** (across all documents)
5. **Liquor service validation** (if alcohol served, license + police clearance required)
6. **Staff certificate count** (food handlers ≥ declared kitchen staff)
7. **Pest control recency** (last service <30 days)
8. **Insurance coverage** (≥R5M small, ≥R10M standard/large)
9. **Seating capacity** (declared vs fire safety vs building compliance)

### 5.3 Annual Renewal Checks

- **60 days before expiry**: Email reminder (CoA, food license, liquor license, food handlers)
- **30 days before expiry**: Platform notification + listing flag
- **Expiry date**: Listing suspended until renewed
- **30 days after expiry**: Listing delisted

---

## 6. Common Mistakes & Red Flags

### 6.1 Common Mistakes

1. **Operating without Certificate of Acceptability**
   - **Penalty**: R10,000 fine + immediate closure + criminal charges + food destroyed
   - **Fix**: Apply for health inspection BEFORE opening (14-45 days)

2. **Serving alcohol without liquor license**
   - **Legal**: BYOB (bring your own bottle) with corkage fee allowed WITHOUT license
   - **Illegal**: Selling wine, beer, spirits without on-consumption license
   - **Penalty**: R100,000 fine + 12-month closure + criminal record
   - **Fix**: Apply for liquor license (90-240 days) OR stop selling alcohol

3. **Kitchen staff without food handler certificates**
   - **Requirement**: ALL kitchen staff (chefs, cooks, prep, dishwashers)
   - **Penalty**: R2,000 fine per person + CoA suspended
   - **Fix**: Staff training (1 day, R150-500 per person)

4. **Lapsed pest control contract**
   - **Requirement**: Monthly service minimum + recent service report (<30 days)
   - **Penalty**: CoA renewal denied + forced closure
   - **Fix**: Reinstate pest control contract (R500-2,000/month)

5. **Insufficient public liability insurance**
   - R1M-2M coverage inadequate for restaurant
   - **Minimum**: R5M small, R10M standard/large
   - **Fix**: Upgrade insurance before listing

### 6.2 Auto-Reject Conditions

- ❌ Certificate of Acceptability expired → REJECT (illegal food service)
- ❌ Food business license expired → REJECT (unregistered food business)
- ❌ Food handler certificates expired (>3 years) → REJECT (food safety risk)
- ❌ Pest control contract lapsed (>90 days since last service) → REJECT (hygiene risk)
- ❌ Public liability insurance expired → REJECT (insurance risk)
- ❌ Fire safety certificate expired (>20 seats) → REJECT (safety risk)
- ❌ Liquor license expired + serving alcohol → REJECT (illegal alcohol service)
- ❌ Serving alcohol without liquor license → REJECT (illegal operation)
- ❌ Police clearance expired (liquor license requirement) → REJECT (non-compliance)
- ❌ Insufficient food handler certificates (<2 minimum) → REJECT (insufficient trained staff)
- ❌ Business name mismatch (registration vs CoA) → REJECT (fraud risk)
- ❌ Seating capacity exceeded (vs fire safety limit) → REJECT (safety risk)

---

## 7. Regulatory Authorities & Contacts

| Authority | Jurisdiction | Contact |
|-----------|-------------|---------|
| **CIPC** | Business registration | https://eservices.cipc.co.za/, callcentre@cipc.co.za, 086 100 2472 |
| **SARS** | Tax compliance | https://www.sars.gov.za/, 0800 00 7277 |
| **Municipal Environmental Health** | CoA, Food license, health inspections | Contact local municipality |
| **Provincial Liquor Board** | Liquor licenses | Contact provincial liquor authority |
| **Municipal Fire Department** | Fire safety certificate | Contact local municipality |
| **SAPCA** | Pest control company accreditation | https://www.sapca.org.za/, info@sapca.org.za, 011 792 3240 |
| **CATHSSETA** | Food handler training accreditation | https://www.cathsseta.org.za/, info@cathsseta.org.za, 011 217 0600 |
| **Gauteng Liquor Board** | Liquor licenses (GP) | https://gpg.gov.za/departments/liquor, 011 355 7300 |
| **Western Cape Liquor Authority** | Liquor licenses (WC) | https://www.westerncape.gov.za/dept/liquor-authority, 021 483 4800 |
| **KZN Liquor Licensing** | Liquor licenses (KZN) | https://www.kznonline.gov.za/liquor, 033 264 2500 |

---

## 8. Compliance Checklist (Admin Review)

### Pre-Approval Checklist

- [ ] Business registration valid and matches tax clearance
- [ ] Tax clearance valid (<12 months old)
- [ ] ID document matches director/owner on registration
- [ ] Banking proof matches business name
- [ ] Certificate of Acceptability valid (<12 months old)
- [ ] Food business license valid (<12 months old)
- [ ] Food handler certificates valid (<3 years old) and count ≥ 2 minimum
- [ ] Pest control contract active (last service <30 days ago)
- [ ] Public liability insurance ≥ R5M (small) or R10M (standard/large)
- [ ] Public liability insurance valid (<12 months old)
- [ ] Fire safety certificate valid (if >20 seats)
- [ ] Liquor license valid (if serving alcohol)
- [ ] Liquor manager registration valid (if liquor license)
- [ ] Police clearance valid (<12 months, if liquor license)
- [ ] Zoning certificate present (if required for liquor license)
- [ ] Building compliance certificate present (if required)
- [ ] Catering license present (if offering catering services)
- [ ] Vehicle registration/roadworthy present (if food truck)
- [ ] Business name consistent across all documents
- [ ] Seating capacity matches fire safety + building compliance
- [ ] No expired documents
- [ ] Coverage adequate for restaurant size

---

## 9. Setup Timeline & Costs

### 9.1 Small Restaurant / Café Setup (<20 seats, no alcohol)

**Timeline**: 60-120 days (CoA is longest)

| Milestone | Days | Cost (ZAR) |
|-----------|------|------------|
| Business registration | 1-5 | R175-500 |
| Tax registration (VAT) | 7-14 | FREE |
| Banking setup | 1-7 | FREE |
| CoA application + inspection | 14-45 | R500-2,000 |
| Food business license | 14-30 | R300-1,500 |
| Food handler training (2 staff) | 1 | R300-1,000 |
| Pest control contract | 1-7 | R500-2,000 (first month) |
| Public liability insurance (R5M) | 1-7 | R3,000-8,000 |
| Fire safety (if >20 seats) | 30-60 | R1,000-5,000 |
| **TOTAL SETUP** | **60-120 days** | **R5,775-20,000** |

### 9.2 Standard Restaurant Setup (20-100 seats, liquor license)

Add to above:
- Liquor license application: 90-240 days, R2,000-12,000
- Police clearance: 14-30 days, R100-140
- Liquor manager registration: 14-30 days, R500-1,500
- Zoning certificate: 60-120 days, R500-3,000
- Building compliance: 60-120 days, R2,000-10,000

**TOTAL: 90-240 days, R10,875-46,640**

### 9.3 Large Restaurant / Catering Setup (>100 seats, catering)

Add to standard:
- Catering license: 30-60 days, R500-2,000
- Vehicle registration (if food truck): 1 day, R500-1,500
- Additional insurance (catering): 1-7 days, R2,000-5,000

**TOTAL: 90-240 days, R13,875-55,140**

### 9.4 Annual Renewal Costs

**Small Café**: R5,000-12,000/year  
**Standard Restaurant**: R10,000-25,000/year  
**Large Restaurant/Catering**: R15,000-35,000/year  

---

## 10. Integration Roadmap

### Phase 1: Manual Verification (Current)
- Partners upload PDF/JPG documents
- Admin reviews manually
- Binary approve/reject decision
- **Cost**: R0/month (manual labor intensive)

### Phase 2: Azure OCR + Automated Validation (Recommended)
- Install `@azure/ai-form-recognizer` SDK
- Extract text automatically
- Validate expiry dates, staff count, pest control recency
- Flag issues for admin review
- **Cost**: R30-43/month for 100 restaurants (98% automation)

### Phase 3: Government API Integration (Future)
- CIPC API for business verification (FREE)
- Home Affairs API for ID verification (FREE)
- Municipal API for CoA verification (pending availability)
- **Cost**: R0-10/month (mostly free government APIs)

### Phase 4: Real-Time Monitoring (Advanced)
- Webhook notifications when documents expire
- Automatic reminder emails 60 days before expiry
- Listing auto-suspension on expiry
- Partner portal for renewal uploads
- **Cost**: R30-43/month + notification costs

---

## 11. Cost Comparison: Restaurants vs Other Partners

| Partner Type | Documents | Cost/Partner | Monthly (100) |
|--------------|-----------|--------------|---------------|
| Small Café | 11 | R0.297 | R29.70 |
| Standard Restaurant | 14 | R0.378 | R37.80 |
| Large Restaurant/Catering | 16 | R0.432 | R43.20 |
| Small B&B | 10 | R0.270 | R27.00 |
| Standard Hotel | 14 | R0.378 | R37.80 |
| Shuttle Service | 17 | R0.459 | R45.90 |
| Tour Operator | 20 | R0.540 | R54.00 |
| Professional Guide | 10 | R0.270 | R27.00 |
| Grade 2 Activity | 17 | R0.459 | R45.90 |

**Restaurants are moderate cost** - similar to hotels, cheaper than transport/activities.

---

## END OF RESTAURANT COMPLIANCE GUIDE

**Next steps**:
1. Install Azure Form Recognizer SDK: `npm install @azure/ai-form-recognizer`
2. Apply for CIPC API access: CIPCCCentre@cipc.co.za
3. Update `documentVerification.js` with restaurant document types
4. Test with sample restaurant documents
5. Deploy automated verification workflow
