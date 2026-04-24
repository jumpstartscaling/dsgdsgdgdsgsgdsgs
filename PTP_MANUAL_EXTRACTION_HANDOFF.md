# PTP Manual Data Extraction Handoff

## Overview
This document provides detailed instructions for manually extracting alloy specifications from PTP (Product Testing Procedures) PDFs and organizing the data for database insertion with complete PDF source tracking.

## Project Context
- **Goal**: Extract accurate chemistry specifications from all PTP PDFs
- **Problem**: OCR extraction failed (e.g., F75: "ABI | osmax | 1.0mex | 1.0max | 267-308 | 010max | 4857.18 | 0.5max | BAL")
- **Solution**: Manual extraction with structured data format and PDF source tracking
- **Output Format**: JSON (recommended) or SQL with source metadata

## PTP Files to Process

### Primary PTP Files
```
/Users/christopheramaya/Downloads/PTP/
├── PTP1.pdf  (5.6 MB)  → SP88LB
├── PTP2.pdf  (7.2 MB)  → SP46
├── PTP3.pdf  (5.6 MB)  → NI30
├── PTP4.pdf  (5.6 MB)  → F75
├── PTP5.pdf  (2.5 MB)  → SP46
├── PTP6.pdf  (4.7 MB)  → SP44
├── PTP7.pdf  (5.6 MB)  → SP46M
├── PTP8.pdf  (5.2 MB)  → SP45
├── PTP9.pdf  (3.0 MB)  → SP50G
└── PDS-3 Cobalt 21 Data Sheet Rev A dtd 05-27-2021.pdf (0.5 MB) → Co21
```

## Database Schema Reference

### Core Tables
```sql
-- Elements reference table
elements (element_sym, element_name, atomic_number)

-- Alloys master table  
alloys (alloy_id, description, alloy_family, is_active)

-- Specifications table with source tracking
alloy_specifications (
    alloy_id, 
    element_sym, 
    low_limit, 
    high_limit, 
    aim_value, 
    is_balance, 
    is_impurity,
    pdf_source_file,
    pdf_page_number,
    extraction_date,
    extraction_method
)
```

### Recommended Enhanced Schema
```sql
-- Add source tracking table
CREATE TABLE pdf_sources (
    source_id SERIAL PRIMARY KEY,
    pdf_filename VARCHAR(255) NOT NULL,
    pdf_page_number INTEGER NOT NULL,
    alloy_id VARCHAR(50),
    extraction_date TIMESTAMP DEFAULT NOW(),
    extracted_by VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- Link specifications to sources
ALTER TABLE alloy_specifications 
ADD COLUMN pdf_source_id INTEGER REFERENCES pdf_sources(source_id);
```

## Extraction Instructions

### 1. Chemistry Table Location
Look for sections titled:
- "Chemistry (% by weight)"
- "Chemical Composition"
- "Alloy Chemistry"

### 2. Data Format Requirements

#### Element Symbols (Standard)
Use exact element symbols from periodic table:
- C, Cr, Ni, Co, Mo, W, Fe, Mn, Si, B, P, Al, Ti, Nb, V, Cu, Ce, S, N, O

#### Value Formats
- **Ranges**: "26.7-30.8" → low=26.7, high=30.8, aim=28.75
- **Maximum**: "0.5max" → low=0.0, high=0.5, aim=0.0, is_impurity=TRUE
- **Minimum**: "1.0min" → low=1.0, high=100.0, aim=1.0
- **Balance**: "BAL" or "BALANCE" → is_balance=TRUE, low=0.0, high=0.0, aim=0.0
- **Single values**: "0.5" → low=0.5, high=0.5, aim=0.5

### 3. Special Handling

#### Balance Elements
- Mark as `is_balance: true`
- Set `low_limit: 0.0`, `high_limit: 0.0`, `aim_value: 0.0`
- Usually the last element (typically Co or Fe)

#### Impurity Elements
- Elements marked with "max" are impurities
- Set `is_impurity: true`
- Set `low_limit: 0.0`

#### Decimal Points
- Use decimal points, not commas (e.g., "26.7" not "26,7")
- OCR errors: "267-308" should be "26.7-30.8"

## Output Format Options

### Option 1: JSON (Recommended)
```json
{
  "extraction_metadata": {
    "extracted_by": "AI Assistant",
    "extraction_date": "2026-04-23T22:00:00Z",
    "total_alloys": 10,
    "pdf_sources": [
      {
        "pdf_filename": "PTP4.pdf",
        "alloy_id": "F75",
        "pages_processed": [7, 16, 17],
        "notes": "F75 SLM Powder specification"
      }
    ]
  },
  "alloys": {
    "F75": {
      "description": "F75 Cobalt Alloy SLM Powder",
      "pdf_source": "PTP4.pdf",
      "pdf_page": 7,
      "specifications": [
        {
          "element": "C",
          "low_limit": 0.15,
          "high_limit": 0.35,
          "aim_value": 0.25,
          "is_balance": false,
          "is_impurity": false
        },
        {
          "element": "Cr",
          "low_limit": 27.0,
          "high_limit": 30.0,
          "aim_value": 28.5,
          "is_balance": false,
          "is_impurity": false
        },
        {
          "element": "Co",
          "low_limit": 0.0,
          "high_limit": 0.0,
          "aim_value": 0.0,
          "is_balance": true,
          "is_impurity": false
        }
      ]
    }
  }
}
```

### Option 2: SQL with Source Tracking
```sql
-- Insert PDF source metadata
INSERT INTO pdf_sources (pdf_filename, pdf_page_number, alloy_id, extracted_by, notes) VALUES
('PTP4.pdf', 7, 'F75', 'AI Assistant', 'F75 SLM Powder - Chemistry table');

-- Get the source_id (assume it returns 1)
-- Then insert specifications with source tracking
INSERT INTO alloy_specifications 
(alloy_id, element_sym, low_limit, high_limit, aim_value, is_balance, is_impurity, pdf_source_id) VALUES
('F75', 'C', 0.15, 0.35, 0.25, FALSE, FALSE, 1),
('F75', 'Cr', 27.0, 30.0, 28.5, FALSE, FALSE, 1),
('F75', 'Co', 0.0, 0.0, 0.0, TRUE, FALSE, 1);
```

## Known Alloy Mappings

```javascript
const PTP_ALLOY_MAP = {
  'PTP1': 'SP88LB',    // Stellite 88 Low Carbon
  'PTP2': 'SP46',      // Stellite 46
  'PTP3': 'NI30',      // Nickel 30
  'PTP4': 'F75',       // F75 Cobalt Alloy
  'PTP5': 'SP46',      // Stellite 46 (different form)
  'PTP6': 'SP44',      // Stellite 44
  'PTP7': 'SP46M',     // Stellite 46 Modified
  'PTP8': 'SP45',      // Stellite 45
  'PTP9': 'SP50G',     // Stellite 50G
  'PDS-3': 'Co21'      // Cobalt 21
};
```

## Common Element Orders by Alloy Family

### Nickel-Based Alloys (SP46, SP88, etc.)
```
C, Mn, Si, Cr, Fe, Ni, Mo, W, Co, B, P
```

### Cobalt-Based Alloys (F75, etc.)
```
C, Mn, Si, Ni, Cr, W, Mo, Fe, Co
```

### Reduced Alloys (SP44, SP45)
```
C, Si, Cr, Ni, B
```

## Quality Control Checklist

### For Each Alloy:
- [ ] Verify alloy ID matches PTP mapping
- [ ] Check all element symbols are valid
- [ ] Confirm decimal points are correct
- [ ] Validate ranges (low ≤ high)
- [ ] Identify balance element correctly
- [ ] Mark impurities (max values) correctly
- [ ] Calculate aim values for ranges: aim = (low + high) / 2
- [ ] Record PDF filename and page number
- [ ] Add extraction notes for ambiguities

### Cross-Reference Checks:
- [ ] Compare with existing database entries
- [ ] Flag significant differences (>5% variance)
- [ ] Note any missing elements from expected families
- [ ] Verify total composition makes sense (balance + other elements ≈ 100%)

## Common OCR Errors to Fix

| OCR Error | Correct Value | Context |
|-----------|---------------|---------|
| "267-308" | "26.7-30.8" | F75 Chromium range |
| "4857.18" | "4.85-7.18" | F75 Molybdenum range |
| "ABI" | "C" | F75 Carbon (OCR misread) |
| "osmax" | "Mnmax" | F75 Manganese maximum |
| "010max" | "0.10max" | Various elements |
| "BAL." | "BAL" | Balance element |

## Database Connection

```python
# Connection details for vim_production database
DB_CONFIG = {
    'host': 'localhost',
    'dbname': 'vim_production',
    'user': 'vim_app',
    'password': '',
    'port': 5432
}
```

## Verification Steps

1. **Data Validation**: Run queries to check for:
   - Missing balance elements
   - Invalid element symbols
   - Impossible ranges (low > high)
   - Duplicate specifications

2. **Source Tracking**: Verify each spec has:
   - PDF filename
   - Page number
   - Extraction date
   - Extractor identifier

3. **Cross-Reference**: Compare with:
   - Existing manual specs in `parse_ptp_specs.py`
   - Industry standard compositions
   - Manufacturer data sheets

## Deliverables

1. **Primary**: JSON file with all extracted specifications and source metadata
2. **Secondary**: SQL script for database insertion
3. **Documentation**: Extraction notes and any ambiguities encountered
4. **Quality Report**: Summary of validations and any issues found

## Next Steps After Extraction

1. Load data into `vim_production.alloy_specifications` table
2. Update existing `parse_ptp_specs.py` with corrected manual specs
3. Test API endpoints: `/api/alloys/:alloyId/specifications`
4. Verify frontend displays correct values
5. Archive PDFs with extraction metadata for future reference

---

**Important**: Maintain traceability back to exact PDF page for every specification value. This enables future verification and audit trails.
