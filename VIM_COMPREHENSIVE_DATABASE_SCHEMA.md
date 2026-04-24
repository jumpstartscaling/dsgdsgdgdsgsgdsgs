# VIM Comprehensive Database Schema & AI Extension Guide

## Executive Summary

This document provides a complete database schema for the Vacuum Induction Melting (VIM) system with **line-level PDF source tracking** and guidelines for AI to extend the schema when discovering additional information in PTP PDFs.

**Core Principle**: Every piece of data in the database must be traceable to its exact source: PDF filename, page number, and line number.

---

## 1. DATABASE ARCHITECTURE OVERVIEW

### 1.1 System Purpose
The VIM system manages:
- **Alloy Specifications** - Chemical composition requirements
- **Inventory Management** - Raw materials, scrap, and finished products
- **Production Planning** - Heat formulation and charge calculations
- **Quality Control** - Test methods and physical properties
- **Complete Audit Trail** - Full traceability to source documents

### 1.2 Data Flow Architecture
```
PTP PDFs → OCR Extraction → Manual Verification → Database → API → Frontend
    ↓           ↓              ↓              ↓        ↓        ↓
Line-Level → Structured → Human Review → Calculations → Reports → UI
Tracking    Data           Validation   & Views   & Alerts
```

### 1.3 Key Calculation Engines
- **Weighted Average Chemistry**: `Σ(weight × %element) / Σ(weight)`
- **Compliance Checking**: `spec_low ≤ calculated ≤ spec_high`
- **Inventory Valuation**: `Σ(current_weight × unit_cost)`
- **Yield Calculations**: `actual_output / theoretical_output`

---

## 2. CORE TABLE STRUCTURES

### 2.1 Reference Data Tables

#### `elements` - Periodic Table Reference
```sql
CREATE TABLE elements (
    element_sym VARCHAR(3) PRIMARY KEY,    -- 'C', 'Cr', 'Ni', etc.
    element_name VARCHAR(50) NOT NULL,     -- 'Carbon', 'Chromium'
    atomic_number INTEGER,                 -- 6, 24, 28
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose**: Prevents typos in element symbols across the system.

#### `alloys` - Master Alloy Catalog
```sql
CREATE TABLE alloys (
    alloy_id VARCHAR(50) PRIMARY KEY,      -- 'F75', 'SP46', 'NI30'
    description TEXT,                      -- 'F75 Cobalt Chrome Alloy'
    alloy_family VARCHAR(50),              -- 'F75 Family', 'Stellite Powder'
    is_active BOOLEAN DEFAULT TRUE,
    aws_specification VARCHAR(100),        -- 'AMS 5897' (EXTENSION POINT)
    ptp_document_id INTEGER REFERENCES pdf_documents(pdf_id),
    product_form VARCHAR(50) DEFAULT 'Powder', -- EXTENSION POINT
    primary_application VARCHAR(100),      -- EXTENSION POINT
    date_approved DATE,                    -- EXTENSION POINT
    approved_by VARCHAR(50),               -- EXTENSION POINT
    revision_number VARCHAR(10),           -- EXTENSION POINT
    pdf_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Specification Tables

#### `alloy_specifications` - Chemistry Requirements
```sql
CREATE TABLE alloy_specifications (
    spec_id SERIAL PRIMARY KEY,
    alloy_id VARCHAR(50) REFERENCES alloys(alloy_id),
    element_sym VARCHAR(3) REFERENCES elements(element_sym),
    low_limit DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
    high_limit DECIMAL(8,4) NOT NULL,
    aim_value DECIMAL(8,4) NOT NULL,
    is_balance BOOLEAN DEFAULT FALSE,       -- Main constituent element
    is_impurity BOOLEAN DEFAULT FALSE,     -- Max limit only (e.g., W in SP77P)
    
    -- LINE-LEVEL PDF SOURCE TRACKING
    source_pdf_id INTEGER REFERENCES pdf_documents(pdf_id),
    source_page INTEGER,
    source_line_start INTEGER,             -- NEW: Line number where found
    source_line_end INTEGER,               -- NEW: End line for multi-line specs
    source_text_snippet TEXT,              -- NEW: Exact text from PDF
    extraction_confidence DECIMAL(3,2),    -- NEW: OCR confidence score
    
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP,
    aws_spec_reference VARCHAR(50),        -- EXTENSION POINT
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alloy_id, element_sym),
    CONSTRAINT chk_limits CHECK (low_limit <= aim_value AND aim_value <= high_limit)
);
```

### 2.3 Inventory Management Tables

#### `inventory_lots` - Physical Inventory
```sql
CREATE TABLE inventory_lots (
    lot_id VARCHAR(50) PRIMARY KEY,
    parent_alloy_id VARCHAR(50) REFERENCES alloys(alloy_id),
    material_category VARCHAR(20) CHECK (material_category IN ('Virgin', 'Scrap', 'Remelt', 'Master Alloy')),
    form_suffix VARCHAR(20),               -- EXTENSION POINT: 'Powder', 'Ingot', 'Bar'
    initial_weight DECIMAL(10,3) NOT NULL,
    current_weight DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    vendor_source VARCHAR(100),
    lot_status VARCHAR(20) DEFAULT 'Quarantined',
    date_received DATE DEFAULT CURRENT_DATE,
    location VARCHAR(50),
    notes TEXT,
    
    -- SOURCE TRACKING FOR INVENTORY DATA
    source_pdf_id INTEGER REFERENCES pdf_documents(pdf_id), -- EXTENSION POINT
    source_page INTEGER,                   -- EXTENSION POINT
    certificate_number VARCHAR(50),        -- EXTENSION POINT
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `elemental_analysis` - Measured Chemistry
```sql
CREATE TABLE elemental_analysis (
    analysis_id SERIAL PRIMARY KEY,
    lot_id VARCHAR(50) REFERENCES inventory_lots(lot_id),
    element_sym VARCHAR(3) REFERENCES elements(element_sym),
    measured_pct DECIMAL(8,4) NOT NULL,
    analysis_date DATE DEFAULT CURRENT_DATE,
    lab_cert_number VARCHAR(50),
    
    -- SOURCE TRACKING FOR LAB RESULTS
    source_pdf_id INTEGER REFERENCES pdf_documents(pdf_id), -- EXTENSION POINT
    source_page INTEGER,                   -- EXTENSION POINT
    test_method VARCHAR(50),               -- EXTENSION POINT
    lab_name VARCHAR(100),                 -- EXTENSION POINT
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lot_id, element_sym)
);
```

### 2.4 Production Tables

#### `heats` - Production Work Orders
```sql
CREATE TABLE heats (
    heat_number VARCHAR(50) PRIMARY KEY,
    target_alloy_id VARCHAR(50) REFERENCES alloys(alloy_id),
    target_weight DECIMAL(10,3) NOT NULL,
    actual_weight DECIMAL(10,3),
    status VARCHAR(20) DEFAULT 'Draft',
    scheduled_date DATE,
    melt_date DATE,
    operator VARCHAR(50),
    furnace_id VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `charge_materials` - Heat Formulation
```sql
CREATE TABLE charge_materials (
    charge_id SERIAL PRIMARY KEY,
    heat_number VARCHAR(50) REFERENCES heats(heat_number),
    lot_id VARCHAR(50) REFERENCES inventory_lots(lot_id),
    weight_added DECIMAL(10,3) NOT NULL,
    sequence_order INTEGER,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by VARCHAR(50)
);
```

---

## 3. PDF SOURCE TRACKING SYSTEM

### 3.1 Document Management Tables

#### `pdf_documents` - Master PDF Registry
```sql
CREATE TABLE pdf_documents (
    pdf_id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,        -- 'PTP4.pdf'
    original_path TEXT,                    -- '/Users/christopheramaya/Downloads/PTP/PTP4.pdf'
    server_path TEXT NOT NULL,             -- '/srv/ptp_documents/PTP4.pdf'
    pdf_type VARCHAR(50) CHECK (pdf_type IN ('PTP', 'PDS', 'COA', 'Other')),
    total_pages INTEGER,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Unprocessed',
    ocr_extraction_date TIMESTAMP,
    file_size_bytes BIGINT,
    md5_hash VARCHAR(32),
    notes TEXT
);
```

#### `pdf_page_lines` - LINE-LEVEL TEXT TRACKING
```sql
CREATE TABLE pdf_page_lines (
    line_id SERIAL PRIMARY KEY,
    pdf_id INTEGER REFERENCES pdf_documents(pdf_id),
    page_number INTEGER NOT NULL,
    line_number INTEGER NOT NULL,          -- Physical line on page
    y_position DECIMAL(8,2),               -- Y-coordinate for visual reference
    original_text TEXT NOT NULL,           -- Exact text from PDF
    cleaned_text TEXT,                     -- Processed text
    ocr_confidence DECIMAL(5,2),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP,
    UNIQUE(pdf_id, page_number, line_number)
);
```

#### `ptp_page_texts` - VERBATIM PAGE TEXT STORAGE
```sql
CREATE TABLE ptp_page_texts (
    text_id SERIAL PRIMARY KEY,
    pdf_id INTEGER REFERENCES pdf_documents(pdf_id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    page_title TEXT,
    verbatim_text TEXT NOT NULL,
    normalized_text TEXT,
    text_hash VARCHAR(64),
    source_format VARCHAR(30) DEFAULT 'verbatim',
    source_path TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pdf_id, page_number)
);
```

**Purpose**: Stores the exact page text for text-first PDF traceability and popup review.

#### `ptp_text_anchors` - SOURCE SPAN / POPUP ANCHORS
```sql
CREATE TABLE ptp_text_anchors (
    anchor_id SERIAL PRIMARY KEY,
    text_id INTEGER REFERENCES ptp_page_texts(text_id) ON DELETE CASCADE,
    anchor_type VARCHAR(40) NOT NULL,
    anchor_label VARCHAR(120) NOT NULL,
    source_text TEXT NOT NULL,
    start_char INTEGER,
    end_char INTEGER,
    line_start INTEGER,
    line_end INTEGER,
    anchor_payload JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Tracks exact source spans for popup/highlight navigation and page-context lookup.

### 3.2 Source Tracking Views

#### Complete Data Lineage View
```sql
CREATE OR REPLACE VIEW view_data_lineage AS
SELECT 
    'alloy_specifications' as table_name,
    asp.spec_id::TEXT as record_id,
    asp.element_sym as field_name,
    asp.low_limit::TEXT as current_value,
    ppl.original_text as source_text,
    pd.filename as pdf_source,
    ppl.page_number,
    ppl.line_number,
    asp.verified_by,
    asp.verified_at
FROM alloy_specifications asp
JOIN pdf_page_lines ppl ON asp.source_pdf_id = ppl.pdf_id 
    AND asp.source_page = ppl.page_number
    AND asp.source_line_start <= ppl.line_number 
    AND asp.source_line_end >= ppl.line_number
JOIN pdf_documents pd ON asp.source_pdf_id = pd.pdf_id
UNION ALL
-- Similar queries for other tables...
```

---

## 4. CALCULATION ENGINES & VIEWS

### 4.1 Chemistry Calculations

#### Weighted Average Heat Chemistry
```sql
CREATE OR REPLACE VIEW view_heat_chemistry AS
WITH HeatTotals AS (
    SELECT heat_number, SUM(weight_added) as total_charge_weight
    FROM charge_materials GROUP BY heat_number
),
ElementContributions AS (
    SELECT 
        cm.heat_number,
        ea.element_sym,
        SUM(cm.weight_added * (ea.measured_pct / 100.0)) as elemental_weight
    FROM charge_materials cm
    JOIN elemental_analysis ea ON cm.lot_id = ea.lot_id
    GROUP BY cm.heat_number, ea.element_sym
)
SELECT 
    ec.heat_number,
    ec.element_sym,
    (ec.elemental_weight / ht.total_charge_weight) * 100.0 AS calculated_pct,
    ht.total_charge_weight,
    e.element_name
FROM ElementContributions ec
JOIN HeatTotals ht ON ec.heat_number = ht.heat_number
JOIN elements e ON ec.element_sym = e.element_sym;
```

**Equation**: `Calculated % = Σ(Lot Weight × Element %) / Σ(Total Weight)`

### 4.2 Compliance Checking

#### Specification Compliance View
```sql
CREATE OR REPLACE VIEW view_heat_compliance AS
SELECT 
    h.heat_number,
    h.target_alloy_id,
    hc.element_sym,
    hc.calculated_pct,
    asp.low_limit,
    asp.high_limit,
    asp.aim_value,
    asp.is_impurity,
    CASE 
        WHEN hc.calculated_pct < asp.low_limit THEN 'BELOW_SPEC'
        WHEN hc.calculated_pct > asp.high_limit THEN 'ABOVE_SPEC'
        ELSE 'IN_SPEC'
    END as compliance_status,
    ppl.original_text as spec_source_text,
    pd.filename as spec_pdf_source
FROM heats h
JOIN view_heat_chemistry hc ON h.heat_number = hc.heat_number
LEFT JOIN alloy_specifications asp ON h.target_alloy_id = asp.alloy_id 
    AND hc.element_sym = asp.element_sym
LEFT JOIN pdf_page_lines ppl ON asp.source_pdf_id = ppl.pdf_id
    AND asp.source_page = ppl.page_number
    AND asp.source_line_start = ppl.line_number
LEFT JOIN pdf_documents pd ON asp.source_pdf_id = pd.pdf_id;
```

---

## 5. TRIGGERS & AUTOMATION

### 5.1 Inventory Updates
```sql
CREATE OR REPLACE FUNCTION update_lot_weight()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE inventory_lots
    SET current_weight = current_weight + NEW.quantity_change,
        updated_at = CURRENT_TIMESTAMP
    WHERE lot_id = NEW.lot_id;
    
    -- Auto-mark as Depleted if weight reaches zero
    UPDATE inventory_lots
    SET lot_status = 'Depleted'
    WHERE lot_id = NEW.lot_id AND current_weight <= 0.001;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_lot_weight
AFTER INSERT ON inventory_transactions
FOR EACH ROW EXECUTE FUNCTION update_lot_weight();
```

### 5.2 Verification Status Updates
```sql
CREATE OR REPLACE FUNCTION update_alloy_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM alloy_specifications 
        WHERE alloy_id = NEW.alloy_id AND is_verified = FALSE
    ) THEN
        UPDATE alloys 
        SET pdf_verified = TRUE, verification_status = 'Verified'
        WHERE alloy_id = NEW.alloy_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. AI SCHEMA EXTENSION GUIDELINES

### 6.1 When to Extend the Schema

**Extend when you find:**
- New data categories not covered by existing tables
- Additional specification types (mechanical, thermal, electrical)
- Process parameters (melting temps, times, pressures)
- Quality requirements beyond chemistry
- Certification or compliance information
- Application-specific data

### 6.2 Extension Decision Tree

```
Is this data about ALLOY PROPERTIES?
├─ Yes → Is it CHEMISTRY?
│   ├─ Yes → Use alloy_specifications
│   └─ No → Is it PHYSICAL (hardness, density)?
│       ├─ Yes → Use physical_property_requirements
│       └─ No → Is it MECHANICAL (strength, fatigue)?
│           ├─ Yes → CREATE NEW: mechanical_property_requirements
│           └─ No → Is it THERMAL (conductivity, expansion)?
│               ├─ Yes → CREATE NEW: thermal_property_requirements
│               └─ No → Continue to next branch
├─ Is this about TEST METHODS?
│   ├─ Yes → Use test_method_requirements
│   └─ No → Continue to next branch
└─ Is this about PROCESSING?
    ├─ Yes → CREATE NEW: processing_parameters
    └─ No → CREATE APPROPRIATE NEW TABLE
```

### 6.3 New Table Template

```sql
-- TEMPLATE FOR NEW EXTENSION TABLES
CREATE TABLE [new_table_name] (
    record_id SERIAL PRIMARY KEY,
    alloy_id VARCHAR(50) REFERENCES alloys(alloy_id),
    
    -- DATA FIELDS (add as needed)
    property_name VARCHAR(50) NOT NULL,
    spec_min DECIMAL(8,4),
    spec_max DECIMAL(8,4),
    aim_value DECIMAL(8,4),
    unit VARCHAR(20),
    test_condition VARCHAR(100),           -- EXTENSION POINT
    
    -- MANDATORY SOURCE TRACKING
    source_pdf_id INTEGER REFERENCES pdf_documents(pdf_id),
    source_page INTEGER,
    source_line_start INTEGER,
    source_line_end INTEGER,
    source_text_snippet TEXT,
    extraction_confidence DECIMAL(3,2),
    
    -- VERIFICATION TRACKING
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP,
    
    -- METADATA
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(alloy_id, property_name)
);

-- ADD INDEXES
CREATE INDEX idx_[table_name]_alloy ON [new_table_name](alloy_id);
CREATE INDEX idx_[table_name]_pdf ON [new_table_name](source_pdf_id);

-- ADD COMMENT
COMMENT ON TABLE [new_table_name] IS '[Description of purpose and source]';
```

### 6.4 Specific Extension Examples

#### Example 1: Finding Mechanical Properties
**If you find in PDF**: "Tensile Strength: 120-150 ksi, Yield: 80-100 ksi"

```sql
CREATE TABLE mechanical_property_requirements (
    prop_req_id SERIAL PRIMARY KEY,
    alloy_id VARCHAR(50) REFERENCES alloys(alloy_id),
    property_name VARCHAR(50) NOT NULL,     -- 'Tensile Strength', 'Yield Strength'
    spec_min DECIMAL(8,4),                  -- 120.0
    spec_max DECIMAL(8,4),                  -- 150.0
    aim_value DECIMAL(8,4),                 -- 135.0
    unit VARCHAR(20),                       -- 'ksi'
    test_temperature_f INTEGER,             -- EXTENSION: test condition
    test_standard VARCHAR(50),              -- EXTENSION: 'ASTM E8'
    
    -- MANDATORY SOURCE TRACKING
    source_pdf_id INTEGER REFERENCES pdf_documents(pdf_id),
    source_page INTEGER,
    source_line_start INTEGER,
    source_line_end INTEGER,
    source_text_snippet TEXT,               -- 'Tensile Strength: 120-150 ksi'
    extraction_confidence DECIMAL(3,2),
    
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alloy_id, property_name)
);
```

#### Example 2: Finding Processing Parameters
**If you find in PDF**: "Melting Range: 2460-2500°F, Pouring Temp: 2550°F"

```sql
CREATE TABLE processing_parameters (
    param_id SERIAL PRIMARY KEY,
    alloy_id VARCHAR(50) REFERENCES alloys(alloy_id),
    parameter_name VARCHAR(50) NOT NULL,    -- 'Melting Range', 'Pouring Temperature'
    min_value DECIMAL(8,4),                 -- 2460.0
    max_value DECIMAL(8,4),                 -- 2500.0
    target_value DECIMAL(8,4),              -- 2550.0
    unit VARCHAR(20),                       -- '°F'
    process_step VARCHAR(50),               -- EXTENSION: 'Melting', 'Pouring'
    
    -- MANDATORY SOURCE TRACKING
    source_pdf_id INTEGER REFERENCES pdf_documents(pdf_id),
    source_page INTEGER,
    source_line_start INTEGER,
    source_line_end INTEGER,
    source_text_snippet TEXT,
    extraction_confidence DECIMAL(3,2),
    
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alloy_id, parameter_name)
);
```

### 6.5 Column Addition Guidelines

**When to add columns vs create new tables:**

- **Add Column**: When adding attributes to existing entities
  - Adding `test_temperature` to `physical_property_requirements`
  - Adding `certification_body` to `alloys`

- **Create New Table**: When adding new data categories
  - Mechanical properties (different from physical properties)
  - Processing parameters (different from specifications)
  - Application data (different from material properties)

**Column Addition Template:**
```sql
ALTER TABLE [existing_table] 
ADD COLUMN IF NOT EXISTS [new_column_name] [data_type] [constraints];

-- Example:
ALTER TABLE alloy_specifications 
ADD COLUMN IF NOT EXISTS test_temperature_f INTEGER;
```

---

## 7. DATA INTERCONNECTIONS

### 7.1 Relationship Map
```
pdf_documents
    ↓ (source tracking)
alloy_specifications ← alloys → heats → charge_materials → inventory_lots
    ↓                           ↓        ↓                    ↓
pdf_page_lines         test_method_requirements  elemental_analysis
    ↓                           ↓                    ↓
data_verification_audit  powder_size_specifications  inventory_transactions
```

### 7.2 Key Foreign Key Relationships
- Every data table references `alloys.alloy_id`
- Every extracted data references `pdf_documents.pdf_id`
- Line-level tracking via `pdf_page_lines.line_id`
- Complete audit trail in `data_verification_audit`

### 7.3 Data Consistency Rules
1. **All elements must exist in `elements` table**
2. **All alloys must have at least one specification**
3. **All inventory must reference a valid alloy**
4. **All extracted data must have PDF source**
5. **All source references must be verifiable**

---

## 8. API INTEGRATION POINTS

### 8.1 Key Endpoints
```javascript
// Alloy specifications with source tracking
GET /api/alloys/:alloyId/specifications
Response: {
  alloy_id: "F75",
  specifications: [
    {
      element: "C",
      low_limit: 0.15,
      high_limit: 0.35,
      aim_value: 0.25,
      source: {
        pdf_file: "PTP4.pdf",
        page: 7,
        line: 15,
        text: "Carbon: 0.15-0.35%"
      }
    }
  ]
}

// Heat chemistry calculations
GET /api/heats/:heatNumber/chemistry
Response: {
  heat_number: "H12345",
  calculated_chemistry: [...],
  compliance_status: [...],
  source_traceability: [...]
}
```

### 8.2 Frontend Data Usage
- **Charge Builder**: Uses specifications for formulation
- **Inventory Dashboard**: Shows current stock with values
- **Quality Reports**: Displays compliance with source references
- **Verification UI**: Shows PDF snippets for data confirmation

---

## 9. QUALITY CONTROL & VERIFICATION

### 9.1 Verification Workflow
1. **OCR Extraction** → Raw text with confidence scores
2. **AI Processing** → Structured data with line references
3. **Human Review** → Verification against PDF images
4. **Database Update** → Mark as verified with auditor
5. **Audit Trail** → Complete change history maintained

### 9.2 Data Quality Metrics
```sql
-- Extraction accuracy by PDF
CREATE VIEW view_extraction_quality AS
SELECT 
    pd.filename,
    COUNT(ppl.line_id) as total_lines,
    AVG(ppl.ocr_confidence) as avg_confidence,
    COUNT(CASE WHEN ppl.is_verified THEN 1 END) as verified_lines,
    COUNT(CASE WHEN NOT ppl.is_verified THEN 1 END) as pending_lines
FROM pdf_documents pd
LEFT JOIN pdf_page_lines ppl ON pd.pdf_id = ppl.pdf_id
GROUP BY pd.filename;
```

---

## 10. AI EXTRACTION INSTRUCTIONS

### 10.1 Extraction Process
1. **Read PDF page by page**
2. **Identify data sections** (Chemistry, Properties, Tests, etc.)
3. **Extract line numbers** for each data point
4. **Map to appropriate table** using decision tree
5. **Create new tables/columns** if needed (following template)
6. **Maintain source tracking** for every piece of data
7. **Flag low confidence** extractions for review

### 10.2 Data Validation Rules
- Element symbols must match `elements` table
- Numeric ranges must be logical (low ≤ aim ≤ high)
- Percentages should sum to ~100% with balance
- Units must be consistent across properties
- Source references must be valid

### 10.3 Output Format
```json
{
  "extraction_session": {
    "pdf_file": "PTP4.pdf",
    "total_pages": 24,
    "extraction_date": "2026-04-23T22:00:00Z",
    "extracted_by": "AI Assistant"
  },
  "new_tables_created": [
    {
      "table_name": "mechanical_property_requirements",
      "reason": "Found tensile strength and yield strength data",
      "sql_ddl": "..."
    }
  ],
  "data_extracted": {
    "alloy_specifications": [...],
    "mechanical_property_requirements": [...],
    "processing_parameters": [...]
  },
  "source_lineage": {
    "F75_C_spec": {
      "pdf_file": "PTP4.pdf",
      "page": 7,
      "line_start": 15,
      "line_end": 15,
      "original_text": "Carbon: 0.15-0.35%"
    }
  }
}
```

---

## 11. IMPLEMENTATION CHECKLIST

### 11.1 Database Setup
- [ ] Create all base tables from schema
- [ ] Set up PDF storage and processing
- [ ] Configure triggers and views
- [ ] Create indexes for performance
- [ ] Set up verification workflow

### 11.2 AI Extraction Preparation
- [ ] Load all PTP PDFs into `pdf_documents`
- [ ] Run OCR extraction to `pdf_page_lines`
- [ ] Prepare extension decision tree
- [ ] Set up validation rules
- [ ] Create output templates

### 11.3 Quality Assurance
- [ ] Test sample extractions
- [ ] Verify source tracking accuracy
- [ ] Validate calculation engines
- [ ] Test API endpoints
- [ ] Verify frontend integration

---

## 12. TROUBLESHOOTING GUIDE

### 12.1 Common Issues
- **Missing Elements**: Add to `elements` table first
- **Invalid Ranges**: Check for OCR errors (commas vs decimals)
- **Source Not Found**: Verify PDF file and page numbers
- **Calculation Errors**: Check for missing elemental analysis data

### 12.2 Performance Optimization
- Index on frequently queried columns
- Partition large tables by alloy family
- Cache calculation results for reports
- Archive old heats to separate tables

---

**Final Note**: This schema is designed to be comprehensive yet extensible. Every addition must maintain the core principle of complete source traceability. When in doubt, create a new table with proper source tracking rather than overloading existing tables.
