const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'portfolios.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS portfolios (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    title     TEXT NOT NULL,
    bio       TEXT NOT NULL,
    skills    TEXT NOT NULL,
    email     TEXT NOT NULL,
    github    TEXT,
    linkedin  TEXT,
    website   TEXT,
    status    TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

module.exports = {
  create({ name, title, bio, skills, email, github, linkedin, website }) {
    const stmt = db.prepare(`
      INSERT INTO portfolios (name, title, bio, skills, email, github, linkedin, website)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(name, title, bio, skills, email, github, linkedin, website).lastInsertRowid
  },

  getById(id) {
    return db.prepare('SELECT * FROM portfolios WHERE id = ?').get(id)
  },

  getApproved() {
    return db.prepare("SELECT * FROM portfolios WHERE status = 'approved' ORDER BY created_at DESC").all()
  },

  getAll() {
    return db.prepare('SELECT * FROM portfolios ORDER BY created_at DESC').all()
  },

  updateStatus(id, status) {
    db.prepare('UPDATE portfolios SET status = ? WHERE id = ?').run(status, id)
  }
}
