const express = require('express')
const session = require('express-session')
const path = require('path')
const db = require('./db')

const app = express()
const PORT = process.env.PORT || 3000
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || 'admin123'

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  secret: process.env.SESSION_SECRET || 'portfolio-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 hours
}))

// ─── Public Routes ────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  const portfolios = db.getApproved()
  res.render('home', { portfolios })
})

app.get('/submit', (req, res) => {
  res.render('submit', { error: null, values: {} })
})

app.post('/submit', (req, res) => {
  const { name, title, bio, skills, email, github, linkedin, website } = req.body
  if (!name || !title || !bio || !skills || !email) {
    return res.render('submit', {
      error: 'Please fill in all required fields.',
      values: req.body
    })
  }
  const id = db.create({ name, title, bio, skills, email,
    github: github || null, linkedin: linkedin || null, website: website || null })
  res.redirect(`/portfolio/${id}?submitted=1`)
})

app.get('/portfolio/:id', (req, res) => {
  const portfolio = db.getById(Number(req.params.id))
  if (!portfolio) return res.status(404).render('404')
  res.render('portfolio', { portfolio, submitted: req.query.submitted === '1' })
})

// ─── Manager Routes ───────────────────────────────────────────────────────────

app.get('/manager/login', (req, res) => {
  if (req.session.manager) return res.redirect('/manager')
  res.render('login', { error: null })
})

app.post('/manager/login', (req, res) => {
  if (req.body.password === MANAGER_PASSWORD) {
    req.session.manager = true
    return res.redirect('/manager')
  }
  res.render('login', { error: 'Invalid password.' })
})

app.post('/manager/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/manager/login'))
})

function requireManager(req, res, next) {
  if (!req.session.manager) return res.redirect('/manager/login')
  next()
}

app.get('/manager', requireManager, (req, res) => {
  const portfolios = db.getAll()
  const counts = {
    pending: portfolios.filter(p => p.status === 'pending').length,
    approved: portfolios.filter(p => p.status === 'approved').length,
    rejected: portfolios.filter(p => p.status === 'rejected').length,
  }
  res.render('manager', { portfolios, counts })
})

app.post('/manager/status', requireManager, (req, res) => {
  const { id, status } = req.body
  if (!['approved', 'rejected', 'pending'].includes(status)) return res.redirect('/manager')
  db.updateStatus(Number(id), status)
  res.redirect('/manager')
})

app.listen(PORT, () => {
  console.log(`Portfolio Hub running at http://localhost:${PORT}`)
  console.log(`Manager login: http://localhost:${PORT}/manager/login  (password: ${MANAGER_PASSWORD})`)
})
