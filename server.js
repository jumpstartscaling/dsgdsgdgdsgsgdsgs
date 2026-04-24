const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5007;

// Import routes
const pdfRoutes = require('./routes/pdf-routes');
const verificationRoutes = require('./routes/verification-routes');
const inventoryRoutes = require('./routes/inventory-routes');

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'vim_app',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'vim_production',
  password: process.env.DB_PASSWORD || 'vim_secure_2026',
  port: Number(process.env.DB_PORT || 5432),
});

app.use(cors());
app.use(express.json());

// Attach database pool to requests
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Register PDF and verification routes
app.use('/api/pdfs', pdfRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/inventory', inventoryRoutes);

// Serve Swagger UI
app.use(express.static(path.join(__dirname, 'public')));

// Serve swagger.json
app.get('/swagger.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger.json'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'VIM Production API', version: '1.0.0' });
});

// Get all elements
app.get('/api/elements', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM elements ORDER BY atomic_number');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all alloys (excluding chemical elements)
app.get('/api/alloys', async (req, res) => {
  try {
    // Filter out elements (1-2 char IDs that are element symbols)
    // Real alloys have 3+ character IDs or contain numbers
    const result = await pool.query(`
      SELECT * FROM alloys 
      WHERE is_active = TRUE 
        AND (
          LENGTH(alloy_id) > 2 
          OR alloy_id ~ '[0-9]'
          OR alloy_id ~ '_'
        )
        AND alloy_id NOT IN (
          'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
          'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
          'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
          'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
          'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn',
          'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd',
          'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb',
          'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg',
          'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th',
          'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm',
          'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds',
          'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'
        )
      ORDER BY alloy_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get alloy specifications
app.get('/api/alloys/:alloyId/specifications', async (req, res) => {
  try {
    const { alloyId } = req.params;
    const result = await pool.query(
      `SELECT asp.*, e.element_name 
       FROM alloy_specifications asp
       JOIN elements e ON asp.element_sym = e.element_sym
       WHERE asp.alloy_id = $1
       ORDER BY asp.element_sym`,
      [alloyId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get inventory valuation (MUST be before /:lotId to avoid route conflict)
app.get('/api/inventory/valuation', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM view_inventory_valuation ORDER BY total_value DESC');
    res.json(result.rows);
  } catch (err) {
    // If the view doesn't exist, return empty array with a warning
    if (err.message && err.message.includes('does not exist')) {
      res.json([]);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Get inventory lots
app.get('/api/inventory', async (req, res) => {
  try {
    const { status, alloy_id } = req.query;
    let query = `
      SELECT 
        il.*
      FROM inventory_lots il
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` AND il.status = $${params.length}`;
    }
    
    if (alloy_id) {
      params.push(alloy_id);
      query += ` AND il.alloy_id = $${params.length}`;
    }
    
    query += ' ORDER BY il.lot_id';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get lot details with chemistry
app.get('/api/inventory/:lotId', async (req, res) => {
  try {
    const { lotId } = req.params;
    
    // Get lot details
    const lotResult = await pool.query(
      'SELECT * FROM inventory_lots WHERE lot_id = $1',
      [lotId]
    );
    
    if (lotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lot not found' });
    }
    
    // Get chemistry — guard against missing table
    let chemRows = [];
    try {
      const chemResult = await pool.query(
        `SELECT ea.*, e.element_name 
         FROM elemental_analysis ea
         JOIN elements e ON ea.element_sym = e.element_sym
         WHERE ea.lot_id = $1
         ORDER BY ea.measured_pct DESC`,
        [lotId]
      );
      chemRows = chemResult.rows;
    } catch (_) {}
    
    // Get transaction history — guard against missing table
    let transRows = [];
    try {
      const transResult = await pool.query(
        `SELECT * FROM inventory_transactions 
         WHERE lot_id = $1 
         ORDER BY transaction_date DESC`,
        [lotId]
      );
      transRows = transResult.rows;
    } catch (_) {}
    
    res.json({
      lot: lotResult.rows[0],
      chemistry: chemRows,
      transactions: transRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all heats
app.get('/api/heats', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM heats';
    const params = [];
    
    if (status) {
      params.push(status);
      query += ' WHERE status = $1';
    }
    
    query += ' ORDER BY heat_number DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get heat details with chemistry and compliance
app.get('/api/heats/:heatNumber', async (req, res) => {
  try {
    const { heatNumber } = req.params;
    
    // Get heat details
    const heatResult = await pool.query(
      'SELECT * FROM heats WHERE heat_number = $1',
      [heatNumber]
    );
    
    if (heatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Heat not found' });
    }
    
    // Get charge materials — guard against schema differences
    let chargeRows = [];
    try {
      const chargeResult = await pool.query(
        `SELECT cm.*, il.parent_alloy_id, il.material_category
         FROM charge_materials cm
         JOIN inventory_lots il ON cm.lot_id = il.lot_id
         WHERE cm.heat_number = $1
         ORDER BY cm.sequence_order`,
        [heatNumber]
      );
      chargeRows = chargeResult.rows;
    } catch (_) {
      try {
        const chargeResult = await pool.query(
          'SELECT * FROM charge_materials WHERE heat_number = $1 ORDER BY sequence_order',
          [heatNumber]
        );
        chargeRows = chargeResult.rows;
      } catch (_2) {}
    }
    
    // Get calculated chemistry — view may not exist
    let chemRows = [];
    try {
      const chemResult = await pool.query(
        'SELECT * FROM view_heat_chemistry WHERE heat_number = $1 ORDER BY calculated_pct DESC',
        [heatNumber]
      );
      chemRows = chemResult.rows;
    } catch (_) {}
    
    // Get compliance — view may not exist
    let compRows = [];
    try {
      const compResult = await pool.query(
        'SELECT * FROM view_heat_compliance WHERE heat_number = $1 ORDER BY element_sym',
        [heatNumber]
      );
      compRows = compResult.rows;
    } catch (_) {}
    
    res.json({
      heat: heatResult.rows[0],
      charge_materials: chargeRows,
      chemistry: chemRows,
      compliance: compRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get heat chemistry (auto-calculated)
app.get('/api/heats/:heatNumber/chemistry', async (req, res) => {
  try {
    const { heatNumber } = req.params;
    try {
      const result = await pool.query(
        'SELECT * FROM view_heat_chemistry WHERE heat_number = $1 ORDER BY calculated_pct DESC',
        [heatNumber]
      );
      res.json(result.rows);
    } catch (_) {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get heat compliance
app.get('/api/heats/:heatNumber/compliance', async (req, res) => {
  try {
    const { heatNumber } = req.params;
    try {
      const result = await pool.query(
        'SELECT * FROM view_heat_compliance WHERE heat_number = $1 ORDER BY element_sym',
        [heatNumber]
      );
      res.json(result.rows);
    } catch (_) {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check heat compliance using function
app.get('/api/heats/:heatNumber/check', async (req, res) => {
  try {
    const { heatNumber } = req.params;
    try {
      const result = await pool.query(
        'SELECT * FROM check_heat_compliance($1)',
        [heatNumber]
      );
      res.json(result.rows);
    } catch (_) {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NOTE: /api/inventory/valuation is now registered above /api/inventory/:lotId (see top of inventory section)

// Find impurity violations
app.get('/api/compliance/violations', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM view_heat_compliance 
       WHERE alert_flag = 'IMPURITY_VIOLATION'
       ORDER BY heat_number, element_sym`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new heat
app.post('/api/heats', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { heat_number, target_alloy_id, target_weight, scheduled_date, operator, furnace_id, charge_materials } = req.body;
    
    // Insert heat
    await client.query(
      `INSERT INTO heats (heat_number, target_alloy_id, target_weight, scheduled_date, operator, furnace_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [heat_number, target_alloy_id, target_weight, scheduled_date, operator, furnace_id]
    );
    
    // Insert charge materials
    if (charge_materials && charge_materials.length > 0) {
      for (let i = 0; i < charge_materials.length; i++) {
        const { lot_id, weight_added } = charge_materials[i];
        await client.query(
          `INSERT INTO charge_materials (heat_number, lot_id, weight_added, sequence_order, added_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [heat_number, lot_id, weight_added, i + 1, operator]
        );
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json({ message: 'Heat created successfully', heat_number });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ============================================================
// QA COMPLIANCE TEST ENDPOINT
// ============================================================

// QA Test endpoint - validates heat chemistry against spec
app.post('/api/qa/validate', async (req, res) => {
  try {
    const { heat_number, total_charge_weight, chemistry } = req.body;
    
    // Get the heat to find target alloy
    const heatResult = await pool.query(
      'SELECT target_alloy_id FROM heats WHERE heat_number = $1',
      [heat_number]
    );
    
    if (heatResult.rows.length === 0) {
      return res.json({
        status: 'FAIL',
        reason: ['Heat number not found in database']
      });
    }
    
    const target_alloy = heatResult.rows[0].target_alloy_id;
    
    // Get specifications for the alloy
    const specResult = await pool.query(
      'SELECT element_sym, low_limit, high_limit, is_impurity FROM alloy_specifications WHERE alloy_id = $1',
      [target_alloy]
    );
    
    const violations = [];
    
    // Check total weight
    if (Math.abs(total_charge_weight - 450.00) > 0.01) {
      violations.push(`Total weight is ${total_charge_weight} lbs, must be exactly 450.00 lbs`);
    }
    
    // Check each element in chemistry
    for (const [element, value] of Object.entries(chemistry)) {
      const spec = specResult.rows.find(s => s.element_sym === element);
      
      if (!spec) {
        violations.push(`${element} not found in ${target_alloy} specification`);
        continue;
      }
      
      if (value < spec.low_limit) {
        violations.push(`${element} is ${value}%, below minimum ${spec.low_limit}%`);
      }
      
      if (value > spec.high_limit) {
        if (spec.is_impurity) {
          violations.push(`${element} is ${value}%, exceeds impurity limit ${spec.high_limit}%`);
        } else {
          violations.push(`${element} is ${value}%, above maximum ${spec.high_limit}%`);
        }
      }
    }
    
    res.json({
      status: violations.length === 0 ? 'PASS' : 'FAIL',
      reason: violations
    });
    
  } catch (err) {
    res.status(500).json({ 
      status: 'ERROR',
      reason: [err.message] 
    });
  }
});

// ============================================================
// ADMIN PANEL API ENDPOINTS
// ============================================================

// Get all tables with row counts
app.get('/api/admin/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = t.table_name) as column_count,
        (SELECT reltuples::bigint FROM pg_class 
         WHERE relname = t.table_name) as row_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get table data with pagination
app.get('/api/admin/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Validate table name to prevent SQL injection
    const tableCheck = await pool.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_name = $1`,
      [tableName]
    );

    if (tableCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Get column information
    const columnsResult = await pool.query(`
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = $1 
          AND tc.table_schema = 'public'
          AND tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name
      WHERE c.table_name = $1
        AND c.table_schema = 'public'
      ORDER BY c.ordinal_position
    `, [tableName]);

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
    const total = parseInt(countResult.rows[0].count);

    // Get data
    const dataResult = await pool.query(
      `SELECT * FROM ${tableName} ORDER BY 1 LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      table: tableName,
      columns: columnsResult.rows,
      rows: dataResult.rows,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a single cell
app.patch('/api/admin/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { primaryKey, primaryValue, column, value } = req.body;

    // Validate table name
    const tableCheck = await pool.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_name = $1`,
      [tableName]
    );

    if (tableCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Update the cell
    const query = `UPDATE ${tableName} SET ${column} = $1 WHERE ${primaryKey} = $2`;
    await pool.query(query, [value, primaryValue]);

    res.json({ success: true, message: 'Cell updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'VIM Production API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      admin: '/admin.html',
      swagger: '/index.html',
      elements: '/api/elements',
      alloys: '/api/alloys',
      specifications: '/api/alloys/:alloyId/specifications',
      inventory: '/api/inventory',
      inventoryDetails: '/api/inventory/:lotId',
      heats: '/api/heats',
      heatDetails: '/api/heats/:heatNumber',
      heatChemistry: '/api/heats/:heatNumber/chemistry',
      heatCompliance: '/api/heats/:heatNumber/compliance',
      heatCheck: '/api/heats/:heatNumber/check',
      valuation: '/api/inventory/valuation',
      violations: '/api/compliance/violations'
    }
  });
});

app.listen(port, () => {
  console.log(`VIM Production API listening on port ${port}`);
});
