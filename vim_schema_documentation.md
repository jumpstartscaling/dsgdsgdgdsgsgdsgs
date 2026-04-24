# VIM Production Schema Documentation

## Overview

This is a production-ready PostgreSQL database schema for **Vacuum Induction Melting (VIM)** operations. The schema enforces strict data integrity, provides complete historical traceability, and includes built-in SQL views for automated chemistry calculations.

## Table of Contents

1. [Schema Architecture](#schema-architecture)
2. [Core Tables](#core-tables)
3. [Calculation Views](#calculation-views)
4. [Key Features](#key-features)
5. [Usage Examples](#usage-examples)
6. [Data Quality Notes](#data-quality-notes)

---

## Schema Architecture

### Design Principles

1. **Data Integrity at Database Level** - Foreign keys, check constraints, and triggers enforce business rules
2. **Never Delete History** - Inventory transactions are append-only for complete audit trail
3. **Automated Calculations** - SQL views perform weighted-average chemistry math
4. **Impurity Tracking** - Special flags for elements like Tungsten that must be monitored
5. **Status Workflows** - Lots default to "Quarantined" until QC approval

### Entity Relationship Diagram

```
elements ──┐
           ├──> alloy_specifications ──> alloys
           │                               │
           └──> elemental_analysis         │
                      │                    │
                      ▼                    ▼
              inventory_lots ◄──── heats
                      │                    │
                      ▼                    ▼
          inventory_transactions    charge_materials
```

---

## Core Tables

### 1. Reference Data

#### `elements`
Standardized periodic table to prevent typos in chemistry data.

```sql
CREATE TABLE elements (
    element_sym VARCHAR(3) PRIMARY KEY,  -- 'Ni', 'Cr', 'W', 'Co'
    element_name VARCHAR(50) NOT NULL,
    atomic_number INTEGER
);
```

**Why this matters:** Prevents data entry errors like typing "N" when you mean "Ni".

#### `alloys`
Master catalog of alloy products manufactured.

```sql
CREATE TABLE alloys (
    alloy_id VARCHAR(50) PRIMARY KEY,
    description TEXT,
    alloy_family VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);
```

**Examples:** F75, SP77P, SP46SF, SP30CrCu

#### `alloy_specifications`
Chemistry targets with low/high limits and impurity flags.

```sql
CREATE TABLE alloy_specifications (
    alloy_id VARCHAR(50) REFERENCES alloys(alloy_id),
    element_sym VARCHAR(3) REFERENCES elements(element_sym),
    low_limit DECIMAL(8,4),
    high_limit DECIMAL(8,4),
    aim_value DECIMAL(8,4),
    is_balance BOOLEAN DEFAULT FALSE,
    is_impurity BOOLEAN DEFAULT FALSE  -- Critical for W, Co tracking
);
```

**Key Feature:** `is_impurity` flag allows aim_value = 0.00% but enforces a hard max (e.g., W ≤ 0.50% in SP77P).

---

### 2. Inventory & Chemistry

#### `inventory_lots`
Physical lot/barrel records with material category and status.

```sql
CREATE TABLE inventory_lots (
    lot_id VARCHAR(50) PRIMARY KEY,
    parent_alloy_id VARCHAR(50) REFERENCES alloys(alloy_id),
    material_category VARCHAR(20) CHECK (material_category IN 
        ('Virgin', 'Scrap', 'Remelt', 'Master Alloy')),
    current_weight DECIMAL(10,3),
    lot_status VARCHAR(20) DEFAULT 'Quarantined' CHECK (lot_status IN 
        ('Available', 'Quarantined', 'Depleted', 'Rejected'))
);
```

**Status Workflow:**
- New lots → `Quarantined` (default)
- After QC approval → `Available`
- When consumed → `Depleted` (automatic via trigger)

#### `elemental_analysis`
Measured chemistry breakdown per lot.

```sql
CREATE TABLE elemental_analysis (
    lot_id VARCHAR(50) REFERENCES inventory_lots(lot_id),
    element_sym VARCHAR(3) REFERENCES elements(element_sym),
    measured_pct DECIMAL(8,4),
    lab_cert_number VARCHAR(50)
);
```

**Example:**
```sql
-- SP77P Revert with Tungsten contamination
LOT-SP77P-REVERT-001:
  Co: 58.20%
  Cr: 30.50%
  Mo: 4.80%
  W: 3.45%  ← EXCEEDS SPEC (0.50% max)
```

#### `inventory_transactions`
Complete audit trail - never deleted.

```sql
CREATE TABLE inventory_transactions (
    lot_id VARCHAR(50) REFERENCES inventory_lots(lot_id),
    transaction_type VARCHAR(20) CHECK (transaction_type IN 
        ('Receive', 'Consume', 'Adjust', 'Transfer')),
    quantity_change DECIMAL(10,3),  -- Negative for consumption
    reference_heat VARCHAR(50)
);
```

**Trigger:** Automatically updates `inventory_lots.current_weight` on INSERT.

---

### 3. Production & Charge Planning

#### `heats`
Work orders with target alloy and status workflow.

```sql
CREATE TABLE heats (
    heat_number VARCHAR(50) PRIMARY KEY,
    target_alloy_id VARCHAR(50) REFERENCES alloys(alloy_id),
    target_weight DECIMAL(10,3),
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN 
        ('Draft', 'Approved', 'Melted', 'Poured', 'Closed', 'Cancelled'))
);
```

**Workflow:** Draft → Approved → Melted → Poured → Closed

#### `charge_materials`
Recipe lines showing which lots go into each heat.

```sql
CREATE TABLE charge_materials (
    heat_number VARCHAR(50) REFERENCES heats(heat_number),
    lot_id VARCHAR(50) REFERENCES inventory_lots(lot_id),
    weight_added DECIMAL(10,3)
);
```

---

## Calculation Views

### `view_heat_chemistry`
**Auto-calculates weighted-average chemistry for any heat.**

```sql
SELECT * FROM view_heat_chemistry WHERE heat_number = 'HEAT-F75-001';
```

**Output:**
```
heat_number    | element_sym | calculated_pct | total_charge_weight
---------------|-------------|----------------|--------------------
HEAT-F75-001   | Co          | 63.25          | 450.00
HEAT-F75-001   | Cr          | 28.10          | 450.00
HEAT-F75-001   | Mo          | 5.75           | 450.00
HEAT-F75-001   | Ni          | 0.68           | 450.00
```

**How it works:**
1. Sums all `weight_added` from `charge_materials` for the heat
2. For each element, calculates: `SUM(weight × pct) / total_weight × 100`
3. Joins to `elements` table for element names

**No application code needed** - the database does the math!

---

### `view_heat_compliance`
**Checks calculated chemistry against spec limits.**

```sql
SELECT * FROM view_heat_compliance 
WHERE heat_number = 'HEAT-SP77P-002' 
  AND compliance_status != 'IN_SPEC';
```

**Output:**
```
heat_number     | element_sym | calculated_pct | low_limit | high_limit | compliance_status | alert_flag
----------------|-------------|----------------|-----------|------------|-------------------|-------------------
HEAT-SP77P-002  | W           | 3.45           | 0.00      | 0.50       | ABOVE_SPEC        | IMPURITY_VIOLATION
```

**Alert Flags:**
- `IMPURITY_VIOLATION` - Element marked as impurity exceeds max limit
- Front-end can query this view to show warnings

---

### `view_inventory_valuation`
**Inventory value by alloy, category, and status.**

```sql
SELECT * FROM view_inventory_valuation 
WHERE lot_status = 'Available' 
ORDER BY total_value DESC;
```

**Output:**
```
parent_alloy_id | material_category | lot_count | total_weight | total_value  | avg_cost_per_lb
----------------|-------------------|-----------|--------------|--------------|----------------
Ni_Scrap        | Scrap             | 1         | 107160.20    | 621,529.16   | 5.80
88W_Scrap       | Scrap             | 1         | 80191.15     | 441,051.33   | 5.50
F75             | Remelt            | 2         | 19667.01     | 287,548.89   | 14.62
```

---

## Key Features

### 1. Impurity Tracking

**Problem:** SP77P revert may contain Tungsten from previous SP46SF melts. Tungsten is not a spec element for SP77P (aim = 0.00%), but must be limited to ≤ 0.50%.

**Solution:**
```sql
-- SP77P specification
INSERT INTO alloy_specifications VALUES
('SP77P', 'W', 0.00, 0.50, 0.00, FALSE, TRUE);
--                                        ↑
--                                   is_impurity = TRUE
```

**Usage:**
```sql
-- Check if heat violates impurity limits
SELECT * FROM view_heat_compliance 
WHERE alert_flag = 'IMPURITY_VIOLATION';
```

---

### 2. Automatic Weight Updates

**Trigger:** `trg_update_lot_weight`

When you insert a transaction:
```sql
INSERT INTO inventory_transactions (lot_id, transaction_type, quantity_change, reference_heat)
VALUES ('LOT-F75-001', 'Consume', -350.00, 'HEAT-F75-001');
```

The trigger automatically:
1. Updates `inventory_lots.current_weight` (11546.39 → 11196.39)
2. Sets `lot_status = 'Depleted'` if weight ≤ 0.001

**No manual updates needed!**

---

### 3. Compliance Function

**Check if a heat meets all specs:**

```sql
SELECT * FROM check_heat_compliance('HEAT-F75-001');
```

**Output:**
```
element_sym | calculated_pct | spec_low | spec_high | is_compliant | is_impurity_violation
------------|----------------|----------|-----------|--------------|----------------------
C           | 0.22           | 0.15     | 0.35      | TRUE         | FALSE
Cr          | 28.10          | 27.00    | 30.00     | TRUE         | FALSE
Mo          | 5.75           | 5.00     | 7.00      | TRUE         | FALSE
W           | 0.08           | 0.00     | 0.20      | TRUE         | FALSE
```

---

## Usage Examples

### Example 1: Create a New Heat

```sql
-- 1. Create the work order
INSERT INTO heats (heat_number, target_alloy_id, target_weight, status, scheduled_date, operator, furnace_id)
VALUES ('HEAT-SP46SF-002', 'SP46SF', 450.00, 'Draft', '2025-01-25', 'John Smith', 'VIM-1');

-- 2. Add charge materials
INSERT INTO charge_materials (heat_number, lot_id, weight_added, sequence_order) VALUES
('HEAT-SP46SF-002', 'LOT-SP46SF-001', 380.00, 1),
('HEAT-SP46SF-002', 'LOT-CO-001', 45.00, 2),
('HEAT-SP46SF-002', 'LOT-W-001', 20.00, 3),
('HEAT-SP46SF-002', 'LOT-NI-001', 5.00, 4);

-- 3. Check calculated chemistry
SELECT * FROM view_heat_chemistry WHERE heat_number = 'HEAT-SP46SF-002';

-- 4. Check compliance
SELECT * FROM view_heat_compliance WHERE heat_number = 'HEAT-SP46SF-002';

-- 5. If approved, update status
UPDATE heats SET status = 'Approved' WHERE heat_number = 'HEAT-SP46SF-002';
```

---

### Example 2: Receive New Inventory

```sql
-- 1. Create the lot (defaults to Quarantined)
INSERT INTO inventory_lots (lot_id, parent_alloy_id, material_category, form_suffix, 
    initial_weight, current_weight, unit_cost, vendor_source, date_received, location)
VALUES ('LOT-NI-002', 'Ni', 'Virgin', 'P', 5000.00, 5000.00, 9.25, 'Amerin', '2025-01-15', 'Warehouse A');

-- 2. Record the receipt transaction
INSERT INTO inventory_transactions (lot_id, transaction_type, quantity_change, recorded_by, notes)
VALUES ('LOT-NI-002', 'Receive', 5000.00, 'Warehouse', 'PO #12345');

-- 3. Add chemistry from lab cert
INSERT INTO elemental_analysis (lot_id, element_sym, measured_pct, lab_cert_number) VALUES
('LOT-NI-002', 'Ni', 99.60, 'CERT-NI-2025-002'),
('LOT-NI-002', 'Co', 0.25, 'CERT-NI-2025-002'),
('LOT-NI-002', 'Fe', 0.12, 'CERT-NI-2025-002'),
('LOT-NI-002', 'C', 0.03, 'CERT-NI-2025-002');

-- 4. After QC approval, make available
UPDATE inventory_lots SET lot_status = 'Available' WHERE lot_id = 'LOT-NI-002';
```

---

### Example 3: Query Available Inventory

```sql
-- Show all available lots with chemistry
SELECT 
    il.lot_id,
    il.parent_alloy_id,
    il.material_category,
    il.current_weight,
    il.unit_cost,
    json_object_agg(ea.element_sym, ea.measured_pct) as chemistry
FROM inventory_lots il
LEFT JOIN elemental_analysis ea ON il.lot_id = ea.lot_id
WHERE il.lot_status = 'Available'
  AND il.current_weight > 10.0
GROUP BY il.lot_id, il.parent_alloy_id, il.material_category, il.current_weight, il.unit_cost
ORDER BY il.parent_alloy_id, il.current_weight DESC;
```

---

### Example 4: Identify Impurity Violations

```sql
-- Find all heats with impurity violations
SELECT 
    hc.heat_number,
    h.target_alloy_id,
    h.status,
    hc.element_sym,
    hc.calculated_pct,
    hc.high_limit as max_allowed,
    (hc.calculated_pct - hc.high_limit) as excess_pct
FROM view_heat_compliance hc
JOIN heats h ON hc.heat_number = h.heat_number
WHERE hc.alert_flag = 'IMPURITY_VIOLATION'
  AND h.status IN ('Draft', 'Approved')
ORDER BY excess_pct DESC;
```

---

### Example 5: Audit Trail for a Lot

```sql
-- Show complete history of a lot
SELECT 
    it.transaction_date,
    it.transaction_type,
    it.quantity_change,
    it.reference_heat,
    it.recorded_by,
    it.notes,
    il.current_weight as weight_after
FROM inventory_transactions it
JOIN inventory_lots il ON it.lot_id = il.lot_id
WHERE it.lot_id = 'LOT-F75-001'
ORDER BY it.transaction_date;
```

**Output:**
```
transaction_date     | transaction_type | quantity_change | reference_heat | recorded_by | current_weight
---------------------|------------------|-----------------|----------------|-------------|---------------
2025-01-01 08:00:00  | Receive          | 11546.39        | NULL           | Warehouse   | 11546.39
2025-01-10 10:30:00  | Consume          | -350.00         | HEAT-F75-001   | John Smith  | 11196.39
```

---

## Data Quality Notes

### Real Data (from CSV)

- **71 alloys** from inventory spreadsheet
- **20 inventory lots** with actual on-hand quantities
- **309 historical heats** extracted from production charges
- **Material categories** derived from naming conventions

### Synthetic Data (for demonstration)

- **Elemental analysis** - Created realistic chemistry for key lots
- **Alloy specifications** - Based on typical Stellite/F75 specs
- **Impurity examples** - SP77P revert with 3.45% W to demonstrate tracking
- **Unit costs** - Estimated based on material type

### Missing Data

- **Vendor lot numbers** - Not in source CSV
- **Lab cert numbers** - Generated as placeholders
- **Operator names** - Generic "John Smith" / "Jane Doe"
- **Detailed charge recipes** - Only 2 example heats have full recipes

---

## Front-End Integration

### Recommended API Endpoints

```javascript
// Get available inventory with chemistry
GET /api/inventory?status=Available

// Get heat chemistry calculation
GET /api/heats/:heatNumber/chemistry

// Check heat compliance
GET /api/heats/:heatNumber/compliance

// Create new heat
POST /api/heats
{
  "heat_number": "HEAT-F75-003",
  "target_alloy_id": "F75",
  "target_weight": 450.0,
  "charge_materials": [
    {"lot_id": "LOT-F75-001", "weight_added": 350.0},
    {"lot_id": "LOT-CO-001", "weight_added": 75.0}
  ]
}
```

### Real-Time Chemistry Display

```javascript
// Front-end can simply query the view
const chemistry = await db.query(`
  SELECT element_sym, calculated_pct, element_name
  FROM view_heat_chemistry
  WHERE heat_number = $1
  ORDER BY calculated_pct DESC
`, [heatNumber]);

// Display as table or chart - no calculation needed!
```

---

## Deployment Instructions

### 1. Create Database

```bash
createdb vim_production
```

### 2. Load Schema

```bash
psql vim_production < vim_schema.sql
```

### 3. Load Seed Data

```bash
psql vim_production < vim_seed_data.sql
```

### 4. Verify

```sql
-- Check row counts
SELECT 'Elements: ' || COUNT(*) FROM elements;
SELECT 'Alloys: ' || COUNT(*) FROM alloys;
SELECT 'Specs: ' || COUNT(*) FROM alloy_specifications;
SELECT 'Lots: ' || COUNT(*) FROM inventory_lots;
SELECT 'Chemistry: ' || COUNT(*) FROM elemental_analysis;
SELECT 'Heats: ' || COUNT(*) FROM heats;

-- Test chemistry view
SELECT * FROM view_heat_chemistry WHERE heat_number = 'HEAT-F75-001';

-- Test compliance view
SELECT * FROM view_heat_compliance WHERE heat_number = 'HEAT-F75-001';
```

---

## Support & Maintenance

### Adding New Elements

```sql
INSERT INTO elements (element_sym, element_name, atomic_number)
VALUES ('Zr', 'Zirconium', 40);
```

### Adding New Alloy Specifications

```sql
-- Add new alloy
INSERT INTO alloys (alloy_id, description, alloy_family)
VALUES ('SP100', 'Stellite 100', 'Stellite Powder');

-- Add specifications
INSERT INTO alloy_specifications (alloy_id, element_sym, low_limit, high_limit, aim_value) VALUES
('SP100', 'C', 0.50, 0.70, 0.60),
('SP100', 'Cr', 25.00, 28.00, 26.50),
('SP100', 'W', 10.00, 12.00, 11.00);
```

### Backup & Recovery

```bash
# Backup
pg_dump vim_production > vim_backup_$(date +%Y%m%d).sql

# Restore
psql vim_production < vim_backup_20250115.sql
```

---

## Conclusion

This schema provides a **production-ready foundation** for VIM operations with:

✅ **Strict data integrity** enforced at database level  
✅ **Complete audit trail** via inventory transactions  
✅ **Automated chemistry calculations** via SQL views  
✅ **Impurity tracking** for critical elements like Tungsten  
✅ **Status workflows** with automatic transitions  
✅ **Real inventory data** from existing spreadsheets  

The front-end application can focus on UI/UX while the database handles all the complex metallurgical calculations and data validation.
