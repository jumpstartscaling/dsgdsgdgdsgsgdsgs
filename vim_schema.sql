-- ============================================================
-- Production-Ready VIM (Vacuum Induction Melting) PostgreSQL Schema
-- Enterprise-grade database for metallurgical charge planning
-- ============================================================

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. REFERENCE DATA TABLES
-- ============================================================

-- Standardized periodic table elements to enforce data integrity
CREATE TABLE elements (
    element_sym VARCHAR(3) PRIMARY KEY,
    element_name VARCHAR(50) NOT NULL UNIQUE,
    atomic_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE elements IS 'Standardized element reference to prevent typos in chemistry data';

-- Master list of alloy products
CREATE TABLE alloys (
    alloy_id VARCHAR(50) PRIMARY KEY,
    description TEXT,
    alloy_family VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE alloys IS 'Master catalog of alloy products manufactured';

-- Enhanced specifications handling impurities (like Tungsten from SP77P revert)
CREATE TABLE alloy_specifications (
    spec_id SERIAL PRIMARY KEY,
    alloy_id VARCHAR(50) REFERENCES alloys(alloy_id) ON DELETE CASCADE,
    element_sym VARCHAR(3) REFERENCES elements(element_sym),
    low_limit DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
    high_limit DECIMAL(8,4) NOT NULL,
    aim_value DECIMAL(8,4) NOT NULL,
    is_balance BOOLEAN DEFAULT FALSE,
    is_impurity BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alloy_id, element_sym),
    CONSTRAINT chk_limits CHECK (low_limit <= aim_value AND aim_value <= high_limit),
    CONSTRAINT chk_percentages CHECK (low_limit >= 0 AND high_limit <= 100)
);

COMMENT ON TABLE alloy_specifications IS 'Chemistry targets with low/high limits and impurity flags';
COMMENT ON COLUMN alloy_specifications.is_impurity IS 'Flags elements where AIM is 0.00% but a hard max exists (e.g., W, Co)';

CREATE INDEX idx_alloy_specs_alloy ON alloy_specifications(alloy_id);
CREATE INDEX idx_alloy_specs_element ON alloy_specifications(element_sym);

-- ============================================================
-- 2. INVENTORY & CHEMISTRY TRACKING
-- ============================================================

-- Master lot record with complete traceability
CREATE TABLE inventory_lots (
    lot_id VARCHAR(50) PRIMARY KEY,
    parent_alloy_id VARCHAR(50) REFERENCES alloys(alloy_id),
    material_category VARCHAR(20) NOT NULL CHECK (material_category IN ('Virgin', 'Scrap', 'Remelt', 'Master Alloy')),
    form_suffix VARCHAR(20),
    initial_weight DECIMAL(10,3) NOT NULL,
    current_weight DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    vendor_source VARCHAR(100),
    lot_status VARCHAR(20) DEFAULT 'Quarantined' CHECK (lot_status IN ('Available', 'Quarantined', 'Depleted', 'Rejected')),
    date_received DATE DEFAULT CURRENT_DATE,
    location VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_weights CHECK (current_weight >= 0 AND current_weight <= initial_weight)
);

COMMENT ON TABLE inventory_lots IS 'Physical lot/barrel records with material category and status workflow';
COMMENT ON COLUMN inventory_lots.lot_status IS 'Quarantined by default - requires QC approval before Available';

CREATE INDEX idx_lots_status ON inventory_lots(lot_status);
CREATE INDEX idx_lots_alloy ON inventory_lots(parent_alloy_id);
CREATE INDEX idx_lots_category ON inventory_lots(material_category);

-- The specific chemical breakdown of each lot
CREATE TABLE elemental_analysis (
    analysis_id SERIAL PRIMARY KEY,
    lot_id VARCHAR(50) REFERENCES inventory_lots(lot_id) ON DELETE CASCADE,
    element_sym VARCHAR(3) REFERENCES elements(element_sym),
    measured_pct DECIMAL(8,4) NOT NULL,
    analysis_date DATE DEFAULT CURRENT_DATE,
    lab_cert_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lot_id, element_sym),
    CONSTRAINT chk_percentage CHECK (measured_pct >= 0 AND measured_pct <= 100)
);

COMMENT ON TABLE elemental_analysis IS 'Measured chemistry breakdown per lot linked to elements table';

CREATE INDEX idx_analysis_lot ON elemental_analysis(lot_id);
CREATE INDEX idx_analysis_element ON elemental_analysis(element_sym);

-- Complete audit trail of inventory movements
CREATE TABLE inventory_transactions (
    transaction_id SERIAL PRIMARY KEY,
    lot_id VARCHAR(50) REFERENCES inventory_lots(lot_id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('Receive', 'Consume', 'Adjust', 'Transfer')),
    quantity_change DECIMAL(10,3) NOT NULL,
    reference_heat VARCHAR(50),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by VARCHAR(50),
    notes TEXT,
    CONSTRAINT chk_quantity_change CHECK (
        (transaction_type = 'Consume' AND quantity_change < 0) OR
        (transaction_type IN ('Receive', 'Adjust', 'Transfer'))
    )
);

COMMENT ON TABLE inventory_transactions IS 'Never-deleted audit trail of receives, consumes, and adjustments';
COMMENT ON COLUMN inventory_transactions.quantity_change IS 'Negative for consumption, positive for receipt';

CREATE INDEX idx_transactions_lot ON inventory_transactions(lot_id);
CREATE INDEX idx_transactions_heat ON inventory_transactions(reference_heat);
CREATE INDEX idx_transactions_date ON inventory_transactions(transaction_date);

-- ============================================================
-- 3. PRODUCTION & CHARGE FORMULATION
-- ============================================================

-- Work order and heat tracking
CREATE TABLE heats (
    heat_number VARCHAR(50) PRIMARY KEY,
    target_alloy_id VARCHAR(50) REFERENCES alloys(alloy_id),
    target_weight DECIMAL(10,3) NOT NULL,
    actual_weight DECIMAL(10,3),
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Approved', 'Melted', 'Poured', 'Closed', 'Cancelled')),
    scheduled_date DATE,
    melt_date DATE,
    operator VARCHAR(50),
    furnace_id VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_target_weight CHECK (target_weight > 0)
);

COMMENT ON TABLE heats IS 'Work orders with target alloy, weight, and status workflow';

CREATE INDEX idx_heats_alloy ON heats(target_alloy_id);
CREATE INDEX idx_heats_status ON heats(status);
CREATE INDEX idx_heats_date ON heats(scheduled_date);

-- The actual recipe built by the melter
CREATE TABLE charge_materials (
    charge_id SERIAL PRIMARY KEY,
    heat_number VARCHAR(50) REFERENCES heats(heat_number) ON DELETE CASCADE,
    lot_id VARCHAR(50) REFERENCES inventory_lots(lot_id),
    weight_added DECIMAL(10,3) NOT NULL,
    sequence_order INTEGER,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by VARCHAR(50),
    CONSTRAINT chk_weight CHECK (weight_added > 0)
);

COMMENT ON TABLE charge_materials IS 'Recipe lines showing which lots and weights go into each heat';

CREATE INDEX idx_charge_heat ON charge_materials(heat_number);
CREATE INDEX idx_charge_lot ON charge_materials(lot_id);

-- ============================================================
-- 4. CALCULATION ENGINE (SQL VIEWS)
-- ============================================================

-- Weighted-average chemistry calculation for any heat
CREATE OR REPLACE VIEW view_heat_chemistry AS
WITH HeatTotals AS (
    SELECT 
        heat_number, 
        SUM(weight_added) as total_charge_weight
    FROM charge_materials
    GROUP BY heat_number
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
JOIN elements e ON ec.element_sym = e.element_sym
ORDER BY ec.heat_number, ec.element_sym;

COMMENT ON VIEW view_heat_chemistry IS 'Auto-calculates weighted-average chemistry for any heat based on charge materials';

-- Heat chemistry compliance check against specifications
CREATE OR REPLACE VIEW view_heat_compliance AS
SELECT 
    h.heat_number,
    h.target_alloy_id,
    h.status,
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
    CASE 
        WHEN asp.is_impurity AND hc.calculated_pct > asp.high_limit 
        THEN 'IMPURITY_VIOLATION'
        ELSE NULL
    END as alert_flag
FROM heats h
JOIN view_heat_chemistry hc ON h.heat_number = hc.heat_number
LEFT JOIN alloy_specifications asp ON h.target_alloy_id = asp.alloy_id 
    AND hc.element_sym = asp.element_sym
ORDER BY h.heat_number, hc.element_sym;

COMMENT ON VIEW view_heat_compliance IS 'Checks calculated chemistry against spec limits and flags impurity violations';

-- Inventory valuation summary
CREATE OR REPLACE VIEW view_inventory_valuation AS
SELECT 
    il.parent_alloy_id,
    il.material_category,
    il.lot_status,
    COUNT(*) as lot_count,
    SUM(il.current_weight) as total_weight,
    SUM(il.current_weight * il.unit_cost) as total_value,
    AVG(il.unit_cost) as avg_cost_per_lb
FROM inventory_lots il
GROUP BY il.parent_alloy_id, il.material_category, il.lot_status
ORDER BY total_value DESC;

COMMENT ON VIEW view_inventory_valuation IS 'Inventory value by alloy, category, and status';

-- Lot chemistry summary with all elements
CREATE OR REPLACE VIEW view_lot_chemistry_summary AS
SELECT 
    il.lot_id,
    il.parent_alloy_id,
    il.material_category,
    il.current_weight,
    il.lot_status,
    json_object_agg(ea.element_sym, ea.measured_pct) as chemistry_json,
    COUNT(ea.element_sym) as element_count
FROM inventory_lots il
LEFT JOIN elemental_analysis ea ON il.lot_id = ea.lot_id
GROUP BY il.lot_id, il.parent_alloy_id, il.material_category, il.current_weight, il.lot_status
ORDER BY il.lot_id;

COMMENT ON VIEW view_lot_chemistry_summary IS 'Lot details with chemistry as JSON object for easy API consumption';

-- ============================================================
-- 5. TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================

-- Update inventory_lots.current_weight when transactions occur
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
FOR EACH ROW
EXECUTE FUNCTION update_lot_weight();

COMMENT ON FUNCTION update_lot_weight IS 'Automatically updates lot current_weight and status based on transactions';

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_alloys_updated_at
BEFORE UPDATE ON alloys
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lots_updated_at
BEFORE UPDATE ON inventory_lots
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_heats_updated_at
BEFORE UPDATE ON heats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. UTILITY FUNCTIONS
-- ============================================================

-- Function to check if a heat meets all chemistry specifications
CREATE OR REPLACE FUNCTION check_heat_compliance(p_heat_number VARCHAR)
RETURNS TABLE (
    element_sym VARCHAR,
    calculated_pct DECIMAL,
    spec_low DECIMAL,
    spec_high DECIMAL,
    is_compliant BOOLEAN,
    is_impurity_violation BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hc.element_sym::VARCHAR,
        hc.calculated_pct,
        asp.low_limit,
        asp.high_limit,
        (hc.calculated_pct >= asp.low_limit AND hc.calculated_pct <= asp.high_limit) as is_compliant,
        (asp.is_impurity AND hc.calculated_pct > asp.high_limit) as is_impurity_violation
    FROM view_heat_chemistry hc
    JOIN heats h ON hc.heat_number = h.heat_number
    LEFT JOIN alloy_specifications asp ON h.target_alloy_id = asp.alloy_id 
        AND hc.element_sym = asp.element_sym
    WHERE hc.heat_number = p_heat_number
    ORDER BY hc.element_sym;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_heat_compliance IS 'Returns compliance status for all elements in a heat';

-- ============================================================
-- 7. PDF DOCUMENT STORAGE & VERIFICATION TABLES
-- ============================================================

-- Master table for PDF documents stored on server
CREATE TABLE pdf_documents (
    pdf_id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_path TEXT,
    server_path TEXT NOT NULL,
    pdf_type VARCHAR(50) CHECK (pdf_type IN ('PTP', 'PDS', 'COA', 'Other')),
    total_pages INTEGER,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Unprocessed' CHECK (status IN ('Unprocessed', 'OCR_Extracted', 'Verified', 'Archived')),
    ocr_extraction_date TIMESTAMP,
    file_size_bytes BIGINT,
    md5_hash VARCHAR(32),
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE pdf_documents IS 'Stores PDF files on server with metadata and processing status';

CREATE INDEX idx_pdf_status ON pdf_documents(status);
CREATE INDEX idx_pdf_type ON pdf_documents(pdf_type);

-- Extracted page images for verification UI
CREATE TABLE pdf_page_images (
    page_id SERIAL PRIMARY KEY,
    pdf_id INTEGER REFERENCES pdf_documents(pdf_id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    image_format VARCHAR(10) DEFAULT 'PNG',
    dpi INTEGER DEFAULT 300,
    ocr_text TEXT,
    extraction_confidence DECIMAL(5,2),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    verified_at TIMESTAMP,
    UNIQUE(pdf_id, page_number)
);

COMMENT ON TABLE pdf_page_images IS 'Stores processed page images with OCR text for verification';

CREATE INDEX idx_page_images_pdf ON pdf_page_images(pdf_id);

-- Verbatim page text for text-first PTP imports and popup preview
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

COMMENT ON TABLE ptp_page_texts IS 'Stores verbatim page text for PTP documents with source traceability';

CREATE INDEX idx_ptp_page_texts_pdf ON ptp_page_texts(pdf_id);
CREATE INDEX idx_ptp_page_texts_hash ON ptp_page_texts(text_hash);

-- Anchors and spans that point to text locations within a verbatim page
CREATE TABLE ptp_text_anchors (
    anchor_id SERIAL PRIMARY KEY,
    text_id INTEGER REFERENCES ptp_page_texts(text_id) ON DELETE CASCADE,
    anchor_type VARCHAR(40) NOT NULL, -- 'page_header', 'section', 'field', 'property', 'note'
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

COMMENT ON TABLE ptp_text_anchors IS 'Stores source anchors and spans for popup/highlight traceability';

CREATE INDEX idx_ptp_text_anchors_text_id ON ptp_text_anchors(text_id);
CREATE INDEX idx_ptp_text_anchors_label ON ptp_text_anchors(anchor_label);

-- Test method requirements per alloy
CREATE TABLE test_method_requirements (
    test_req_id SERIAL PRIMARY KEY,
    alloy_id VARCHAR(50) REFERENCES alloys(alloy_id) ON DELETE CASCADE,
    test_name VARCHAR(50) NOT NULL,
    test_procedure VARCHAR(50),
    frequency VARCHAR(50),
    is_required BOOLEAN DEFAULT TRUE,
    spec_min DECIMAL(8,4),
    spec_max DECIMAL(8,4),
    spec_target DECIMAL(8,4),
    spec_unit VARCHAR(20),
    aws_reference VARCHAR(50),
    source_pdf_id INTEGER REFERENCES pdf_documents(pdf_id),
    source_page INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alloy_id, test_name)
);

COMMENT ON TABLE test_method_requirements IS 'QC test requirements: Hall Flow, Sieve Analysis, Hardness, etc.';

CREATE INDEX idx_test_req_alloy ON test_method_requirements(alloy_id);

-- Powder size specifications
CREATE TABLE powder_size_specifications (
    size_spec_id SERIAL PRIMARY KEY,
    alloy_id VARCHAR(50) REFERENCES alloys(alloy_id) ON DELETE CASCADE,
    mesh_size_range VARCHAR(50) NOT NULL,
    typical_application VARCHAR(50),
    d90_max_microns INTEGER,
    d50_typical_microns INTEGER,
    is_standard BOOLEAN DEFAULT TRUE,
    source_pdf_id INTEGER REFERENCES pdf_documents(pdf_id),
    source_page INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alloy_id, mesh_size_range, typical_application)
);

COMMENT ON TABLE powder_size_specifications IS 'Powder mesh sizes: 80/270, 100/325, 120/400 for different applications';

CREATE INDEX idx_powder_size_alloy ON powder_size_specifications(alloy_id);

-- Physical property requirements
CREATE TABLE physical_property_requirements (
    prop_req_id SERIAL PRIMARY KEY,
    alloy_id VARCHAR(50) REFERENCES alloys(alloy_id) ON DELETE CASCADE,
    property_name VARCHAR(50) NOT NULL,
    spec_min DECIMAL(8,4),
    spec_max DECIMAL(8,4),
    aim_value DECIMAL(8,4),
    unit VARCHAR(20),
    test_temperature_f INTEGER,
    source_pdf_id INTEGER REFERENCES pdf_documents(pdf_id),
    source_page INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alloy_id, property_name)
);

COMMENT ON TABLE physical_property_requirements IS 'Hardness, density, flow rates with min/max/aim values';

CREATE INDEX idx_phys_prop_alloy ON physical_property_requirements(alloy_id);

-- Data verification audit trail
CREATE TABLE data_verification_audit (
    audit_id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    field_name VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    pdf_id INTEGER REFERENCES pdf_documents(pdf_id),
    pdf_page INTEGER,
    verified_by VARCHAR(50) NOT NULL,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_action VARCHAR(20) CHECK (verification_action IN ('Verified', 'Corrected', 'Flagged', 'Added', 'Removed')),
    notes TEXT
);

COMMENT ON TABLE data_verification_audit IS 'Complete audit trail of all verification actions with old/new values';

CREATE INDEX idx_audit_table ON data_verification_audit(table_name, record_id);
CREATE INDEX idx_audit_date ON data_verification_audit(verified_at);

-- ============================================================
-- 8. EXTEND EXISTING TABLES
-- ============================================================

-- Add columns to alloys table
ALTER TABLE alloys ADD COLUMN IF NOT EXISTS aws_specification VARCHAR(100);
ALTER TABLE alloys ADD COLUMN IF NOT EXISTS ptp_document_id INTEGER REFERENCES pdf_documents(pdf_id);
ALTER TABLE alloys ADD COLUMN IF NOT EXISTS product_form VARCHAR(50) DEFAULT 'Powder';
ALTER TABLE alloys ADD COLUMN IF NOT EXISTS primary_application VARCHAR(100);
ALTER TABLE alloys ADD COLUMN IF NOT EXISTS date_approved DATE;
ALTER TABLE alloys ADD COLUMN IF NOT EXISTS approved_by VARCHAR(50);
ALTER TABLE alloys ADD COLUMN IF NOT EXISTS revision_number VARCHAR(10);
ALTER TABLE alloys ADD COLUMN IF NOT EXISTS pdf_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE alloys ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'Pending' CHECK (verification_status IN ('Pending', 'Verified', 'Needs Review', 'Updated'));

-- Add columns to alloy_specifications
ALTER TABLE alloy_specifications ADD COLUMN IF NOT EXISTS source_pdf_id INTEGER REFERENCES pdf_documents(pdf_id);
ALTER TABLE alloy_specifications ADD COLUMN IF NOT EXISTS source_page INTEGER;
ALTER TABLE alloy_specifications ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE alloy_specifications ADD COLUMN IF NOT EXISTS verified_by VARCHAR(50);
ALTER TABLE alloy_specifications ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE alloy_specifications ADD COLUMN IF NOT EXISTS aws_spec_reference VARCHAR(50);

-- ============================================================
-- 9. VERIFICATION TRIGGERS
-- ============================================================

-- Trigger to update alloy verification status when specs are verified
CREATE OR REPLACE FUNCTION update_alloy_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if all specs for this alloy are verified
    IF NOT EXISTS (
        SELECT 1 FROM alloy_specifications 
        WHERE alloy_id = NEW.alloy_id AND is_verified = FALSE
    ) THEN
        UPDATE alloys 
        SET pdf_verified = TRUE, 
            verification_status = 'Verified',
            updated_at = CURRENT_TIMESTAMP
        WHERE alloy_id = NEW.alloy_id;
    ELSE
        UPDATE alloys 
        SET verification_status = 'Needs Review',
            updated_at = CURRENT_TIMESTAMP
        WHERE alloy_id = NEW.alloy_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_alloy_verification
AFTER UPDATE OF is_verified ON alloy_specifications
FOR EACH ROW
EXECUTE FUNCTION update_alloy_verification_status();

-- ============================================================
-- 10. VERIFICATION VIEWS
-- ============================================================

-- View: Alloy verification status summary
CREATE OR REPLACE VIEW view_alloy_verification_status AS
SELECT 
    a.alloy_id,
    a.alloy_family,
    a.pdf_verified,
    a.verification_status,
    COUNT(DISTINCT asp.spec_id) as total_specs,
    COUNT(DISTINCT CASE WHEN asp.is_verified THEN asp.spec_id END) as verified_specs,
    COUNT(DISTINCT tmr.test_req_id) as total_tests,
    COUNT(DISTINCT CASE WHEN tmr.is_verified THEN tmr.test_req_id END) as verified_tests,
    COUNT(DISTINCT pss.size_spec_id) as total_size_specs,
    COUNT(DISTINCT CASE WHEN pss.is_verified THEN pss.size_spec_id END) as verified_sizes,
    p.filename as source_pdf,
    pd.status as pdf_status
FROM alloys a
LEFT JOIN alloy_specifications asp ON a.alloy_id = asp.alloy_id
LEFT JOIN test_method_requirements tmr ON a.alloy_id = tmr.alloy_id
LEFT JOIN powder_size_specifications pss ON a.alloy_id = pss.alloy_id
LEFT JOIN pdf_documents p ON a.ptp_document_id = p.pdf_id
LEFT JOIN pdf_documents pd ON asp.source_pdf_id = pd.pdf_id
GROUP BY a.alloy_id, a.alloy_family, a.pdf_verified, a.verification_status, p.filename, pd.status
ORDER BY a.alloy_id;

COMMENT ON VIEW view_alloy_verification_status IS 'Shows verification progress for each alloy with counts';

-- View: Data extraction accuracy
CREATE OR REPLACE VIEW view_data_extraction_summary AS
SELECT 
    'PDF Documents' as category,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'Verified' THEN 1 END) as verified,
    COUNT(CASE WHEN status = 'OCR_Extracted' THEN 1 END) as pending
FROM pdf_documents
UNION ALL
SELECT 
    'Alloy Specifications' as category,
    COUNT(*),
    COUNT(CASE WHEN is_verified THEN 1 END),
    COUNT(CASE WHEN NOT is_verified THEN 1 END)
FROM alloy_specifications
UNION ALL
SELECT 
    'Test Methods' as category,
    COUNT(*),
    COUNT(CASE WHEN is_verified THEN 1 END),
    COUNT(CASE WHEN NOT is_verified THEN 1 END)
FROM test_method_requirements
UNION ALL
SELECT 
    'Powder Sizes' as category,
    COUNT(*),
    COUNT(CASE WHEN is_verified THEN 1 END),
    COUNT(CASE WHEN NOT is_verified THEN 1 END)
FROM powder_size_specifications
UNION ALL
SELECT 
    'Physical Properties' as category,
    COUNT(*),
    COUNT(CASE WHEN is_verified THEN 1 END),
    COUNT(CASE WHEN NOT is_verified THEN 1 END)
FROM physical_property_requirements;

COMMENT ON VIEW view_data_extraction_summary IS 'Summary of all extracted data verification progress';

-- ============================================================
-- SCHEMA COMPLETE - WITH PDF VERIFICATION
-- ============================================================
