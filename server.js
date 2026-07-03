const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', 
  port: 5432,
  password: ''
});

async function initializeDatabase() {
  try {
    console.log('Verifying factory database structure...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_users (
          id SERIAL PRIMARY KEY, username VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL, department VARCHAR(50) NOT NULL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
          slno SERIAL PRIMARY KEY, buyer VARCHAR(255) NOT NULL, style VARCHAR(100) UNIQUE NOT NULL, status VARCHAR(100) DEFAULT 'Yarn-Pending'
      );
    `);

    // AUTO ALTERS FOR ALL YOUR DETAILED DEPARTMENT LAYOUT FIELDS
    const patches = [
      "issued_log_date DATE", "required_date_agreed_by_sample_manager DATE", "pcs_required INT DEFAULT 0",
      "committed_date_for_yarn DATE", "committed_date_for_accessories DATE", "yarn_name VARCHAR(255)",
      "yarn_in_house_yes_no VARCHAR(10) DEFAULT 'No'", "yarn_approximate_date DATE", "accessories_in_housed_yes_no VARCHAR(10) DEFAULT 'No'",
      "accessories_approximate_date DATE", "store_date_confirmed_by_merchant VARCHAR(10) DEFAULT 'No'", "sample_type_stage VARCHAR(100)",
      "yarn_composition VARCHAR(255)", "yarn_count VARCHAR(50)", "yarn_ply VARCHAR(50)", "designer_needle_point VARCHAR(100)",
      "designer_courses_point VARCHAR(100)", "designer_tension_spec VARCHAR(100)", "designer_weight VARCHAR(50)",
      "designer_weight_validated_by VARCHAR(150)", "designer_tension_validated_by VARCHAR(150)", "machine_type VARCHAR(100)",
      "gauge VARCHAR(50)", "machine_system VARCHAR(50)", "knitting_way VARCHAR(100)", "machine_speed VARCHAR(50)",
      "knitting_minutes INT DEFAULT 0", "panels_qty INT DEFAULT 0", "structure_stitch_spec TEXT",
      "programmer_speed_validated_by VARCHAR(150)", "programmer_minutes_validated_by VARCHAR(150)", "total_knitted_pcs INT DEFAULT 0",
      "knit_mc_planned INT DEFAULT 0", "knit_mc_running INT DEFAULT 0", "target_pcs INT DEFAULT 0", "achieved_pcs INT DEFAULT 0",
      "target_sah NUMERIC(10,2) DEFAULT 0.00", "achieved_sah NUMERIC(10,2) DEFAULT 0.00", "target_smv NUMERIC(10,2) DEFAULT 0.00",
      "planned_smv NUMERIC(10,2) DEFAULT 0.00", "actual_smv NUMERIC(10,2) DEFAULT 0.00", "floor_smv_validated_by_programmer_head VARCHAR(150)",
      "floor_smv_validated_by_knitting_head VARCHAR(150)", "makeup_lines_planned INT DEFAULT 0", "makeup_lines_running INT DEFAULT 0",
      "makeup_line_wise_target_pcs TEXT", "makeup_line_wise_achieved_pcs TEXT", "finishing_lines_planned INT DEFAULT 0",
      "finishing_lines_running INT DEFAULT 0", "finishing_line_wise_target_pcs TEXT", "finishing_line_wise_achieved_pcs TEXT",
      "ie_knitting_process_wise_costed_smv NUMERIC(10,2) DEFAULT 0.00", "ie_makeup_process_wise_costed_smv NUMERIC(10,2) DEFAULT 0.00",
      "ie_finishing_process_wise_costed_smv NUMERIC(10,2) DEFAULT 0.00", "ie_smv_comparison_status VARCHAR(100) DEFAULT 'Pending Review'"
    ];

    for (let col of patches) {
      await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS ${col};`);
    }

    await pool.query(`
      INSERT INTO system_users (username, password_hash, department) VALUES
      ('merch1', 'pass123', 'merchant'), ('store1', 'pass123', 'store'), ('design1', 'pass123', 'designer'),
      ('prog1', 'pass123', 'programmer'), ('knit1', 'pass123', 'knitting'), ('makeup1', 'pass123', 'makeup'),
      ('finish1', 'pass123', 'finishing'), ('ie1', 'pass123', 'ie') ON CONFLICT (username) DO NOTHING;
    `);
    console.log('✅ Automated schema columns self-healed successfully.');
  } catch (err) { console.error('❌ Database Sync Failure:', err.message); }
}

pool.connect((err, client, release) => {
  if (err) return console.error('Postgres connection pool error:', err.stack);
  console.log('Connected smoothly to PostgreSQL Local Instance.');
  release();
  initializeDatabase();
});

// AUTHENTICATION
app.post('/api/factory/auth', async (req, res) => {
  const { username, password, department } = req.body;
  try {
    const result = await pool.query('SELECT * FROM system_users WHERE username = $1 AND password_hash = $2 AND department = $3', [username, password, department]);
    if (result.rows.length > 0) {
      res.json({ success: true, token: `token_${Date.now()}`, department: result.rows[0].department });
    } else { res.status(401).json({ success: false, error: 'Access denied.' }); }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// MERCHANDISER INTAKE
app.post('/api/factory/intake', async (req, res) => {
  const { buyer, style, issued_log_date, required_date_agreed_by_sample_manager, pcs_required, committed_date_for_yarn, committed_date_for_accessories } = req.body;
  try {
    await pool.query(
      `INSERT INTO orders (buyer, style, issued_log_date, required_date_agreed_by_sample_manager, pcs_required, committed_date_for_yarn, committed_date_for_accessories, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Yarn-Pending') RETURNING *;`,
      [buyer, style, issued_log_date || null, required_date_agreed_by_sample_manager || null, pcs_required || 0, committed_date_for_yarn || null, committed_date_for_accessories || null]
    );
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UNIFIED SYSTEM DYNAMIC UPDATE API (Handles Store, Designer, Programmer, Knitting, Makeup, Finishing, IE updates)
app.put('/api/factory/component-update', async (req, res) => {
  const { style, fields } = req.body;
  try {
    if (!style || !fields) return res.status(400).json({ success: false, error: 'Missing parameters' });
    const keys = Object.keys(fields);
    if (keys.length === 0) return res.status(400).json({ success: false, error: 'No fields provided' });
    
    const values = [style];
    const clauses = keys.map((key, i) => { values.push(fields[key]); return `${key} = $${i + 2}`; });
    const result = await pool.query(`UPDATE orders SET ${clauses.join(', ')} WHERE style = $1 RETURNING *;`, values);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Style not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET READ RECORES LOG LINES
app.get('/api/factory/orders', async (req, res) => {
  try { const result = await pool.query('SELECT * FROM orders ORDER BY slno DESC;'); res.json(result.rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// FRONTEND ACCESS PATH MAP RULES
app.get('/designer-form.html', (req, res) => { res.sendFile(path.join(__dirname, '../frontend/designer-form.html')); });
app.get('/programmer-form.html', (req, res) => { res.sendFile(path.join(__dirname, '../frontend/programmer-form.html')); });
app.get('/ie-form.html', (req, res) => { res.sendFile(path.join(__dirname, '../frontend/ie-form.html')); });
app.get('{/*splat}', (req, res) => { res.sendFile(path.join(__dirname, '../frontend/index.html')); });

app.listen(PORT, () => { console.log(`Helicon EMS system live on port: ${PORT}`); });
