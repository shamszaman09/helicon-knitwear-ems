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
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          department VARCHAR(50) NOT NULL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
          slno SERIAL PRIMARY KEY,
          buyer VARCHAR(255) NOT NULL,
          style VARCHAR(100) UNIQUE NOT NULL,
          gauge VARCHAR(50),
          yarn VARCHAR(255),
          designer_name VARCHAR(150),
          programmer_name VARCHAR(150),
          inquiry_recv_date DATE,
          require_delivery_date DATE,
          status VARCHAR(100) DEFAULT 'Yarn-Pending'
      );
    `);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_knitted_pcs INT DEFAULT 0;`);
    await pool.query(`
      INSERT INTO system_users (username, password_hash, department) VALUES
      ('merch1', 'pass123', 'merchant'), ('design1', 'pass123', 'designer'),
      ('prog1', 'pass123', 'programmer'), ('knit1', 'pass123', 'knitting'),
      ('store1', 'pass123', 'store'), ('finish1', 'pass123', 'finishing'), ('ie1', 'pass123', 'ie')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('✅ Master schema structural columns verified successfully.');
  } catch (err) {
    console.error('❌ Database Initialization Failed:', err.message);
  }
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
    const result = await pool.query(
      'SELECT * FROM system_users WHERE username = $1 AND password_hash = $2 AND department = $3',
      [username, password, department]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, token: `token_${Date.now()}`, department: result.rows[0].department });
    } else {
      res.status(401).json({ success: false, error: 'Access denied for this department' });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SIGNUP
app.post('/api/factory/signup', async (req, res) => {
  const { username, password, department } = req.body;
  try {
    const userCheck = await pool.query('SELECT id FROM system_users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) return res.status(400).json({ success: false, error: 'Username taken' });
    await pool.query('INSERT INTO system_users (username, password_hash, department) VALUES ($1, $2, $3)', [username, password, department]);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET ORDERS
app.get('/api/factory/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY slno DESC;');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// INTAKE
app.post('/api/factory/intake', async (req, res) => {
  const { buyer, style, yarn, inquiry_recv_date, require_delivery_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO orders (buyer, style, yarn, inquiry_recv_date, require_delivery_date, status) VALUES ($1, $2, $3, $4, $5, 'Yarn-Pending') RETURNING *;`,
      [buyer, style, yarn, inquiry_recv_date, require_delivery_date]
    );
    res.status(201).json({ success: true, order: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DESIGNER UPDATE
app.put('/api/factory/technical-update', async (req, res) => {
  const { style, gauge, designer_name, programmer_name, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE orders SET gauge = COALESCE($1, gauge), designer_name = COALESCE($2, designer_name), programmer_name = COALESCE($3, programmer_name), status = COALESCE($4, status) WHERE style = $5 RETURNING *;`,
      [gauge, designer_name, programmer_name, status, style]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, updatedOrder: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// KNITTING UPDATE
app.put('/api/factory/knitting-update', async (req, res) => {
  const { style, total_knitted_pcs, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE orders SET total_knitted_pcs = COALESCE($1, total_knitted_pcs), status = COALESCE($2, status) WHERE style = $3 RETURNING *;`,
      [total_knitted_pcs, status, style]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, updatedOrder: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// MASTER UNIVERSAL STATUS UPDATE (Used for Store, IE, Finishing, Washing, Makeup, Distribution)
app.put('/api/factory/status-update', async (req, res) => {
  const { style, status } = req.body;
  try {
    const result = await pool.query(`UPDATE orders SET status = $1 WHERE style = $2 RETURNING *;`, [status, style]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Style not found' });
    res.json({ success: true, updatedOrder: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/ie-form.html', (req, res) => { res.sendFile(path.join(__dirname, '../frontend/ie-form.html')); });
app.get('{/*splat}', (req, res) => { res.sendFile(path.join(__dirname, '../frontend/index.html')); });

app.listen(PORT, () => { console.log(`Helicon EMS system live on port: ${PORT}`); });
