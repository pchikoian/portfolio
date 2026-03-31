const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'portfolio',
  password: process.env.DB_PASSWORD || 'portfolio',
  database: process.env.DB_NAME     || 'portfolio',
  waitForConnections: true,
  connectionLimit: 10,
})

async function init() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS portfolios (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      title      VARCHAR(255) NOT NULL,
      bio        TEXT NOT NULL,
      skills     TEXT NOT NULL,
      email      VARCHAR(255) NOT NULL,
      github     VARCHAR(500),
      linkedin   VARCHAR(500),
      website    VARCHAR(500),
      status     ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

async function create({ name, title, bio, skills, email, github, linkedin, website }) {
  const [result] = await pool.execute(
    `INSERT INTO portfolios (name, title, bio, skills, email, github, linkedin, website)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, title, bio, skills, email, github, linkedin, website]
  )
  return result.insertId
}

async function getById(id) {
  const [rows] = await pool.execute('SELECT * FROM portfolios WHERE id = ?', [id])
  return rows[0] || null
}

async function getApproved() {
  const [rows] = await pool.execute(
    "SELECT * FROM portfolios WHERE status = 'approved' ORDER BY created_at DESC"
  )
  return rows
}

async function getAll() {
  const [rows] = await pool.execute('SELECT * FROM portfolios ORDER BY created_at DESC')
  return rows
}

async function updateStatus(id, status) {
  await pool.execute('UPDATE portfolios SET status = ? WHERE id = ?', [status, id])
}

async function truncate() {
  const [result] = await pool.execute('DELETE FROM portfolios')
  await pool.execute('ALTER TABLE portfolios AUTO_INCREMENT = 1')
  return { count: result.affectedRows }
}

module.exports = { init, create, getById, getApproved, getAll, updateStatus, truncate }
