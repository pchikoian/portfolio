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

app.get('/', async (req, res, next) => {
  try {
    const portfolios = await db.getApproved()
    const allSkills = [...new Set(
      portfolios.flatMap(p => p.skills.split(',').map(s => s.trim().split(':')[0].trim()).filter(Boolean))
    )].sort()
    res.render('home', { portfolios, allSkills })
  } catch (err) { next(err) }
})

app.get('/submit', (req, res) => {
  res.render('submit', { error: null, values: {} })
})

app.post('/submit', async (req, res, next) => {
  try {
    const { name, title, bio, skills, interests, certifications, projects, email, github, linkedin, website } = req.body
    if (!name || !title || !bio || !skills || !email) {
      return res.render('submit', { error: 'Please fill in all required fields.', values: req.body })
    }
    const productsList = [req.body.product_1, req.body.product_2, req.body.product_3]
      .map(p => (p || '').trim()).filter(Boolean)
    const products = productsList.length ? productsList.join(';') : null
    const id = await db.create({
      name, title, bio, skills,
      interests: interests || null, certifications: certifications || null, projects: projects || null,
      products,
      email, github: github || null, linkedin: linkedin || null, website: website || null
    })
    res.redirect(`/portfolio/${id}?submitted=1`)
  } catch (err) { next(err) }
})

app.get('/portfolio/:id', async (req, res, next) => {
  try {
    const portfolio = await db.getById(Number(req.params.id))
    if (!portfolio) return res.status(404).render('404')
    res.render('portfolio', { portfolio, submitted: req.query.submitted === '1' })
  } catch (err) { next(err) }
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

app.get('/manager', requireManager, async (req, res, next) => {
  try {
    const portfolios = await db.getAll()
    const counts = {
      pending:  portfolios.filter(p => p.status === 'pending').length,
      approved: portfolios.filter(p => p.status === 'approved').length,
      rejected: portfolios.filter(p => p.status === 'rejected').length,
    }
    res.render('manager', { portfolios, counts })
  } catch (err) { next(err) }
})

app.get('/manager/report', requireManager, async (req, res, next) => {
  try {
    const portfolios = await db.getApproved()

    function aggregate(field) {
      const freq = {}
      for (const p of portfolios) {
        if (!p[field]) continue
        p[field].split(',').forEach(s => {
          const v = s.trim().split(':')[0].trim()
          if (v) freq[v] = (freq[v] || 0) + 1
        })
      }
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
      return { labels: sorted.map(([k]) => k), data: sorted.map(([, v]) => v) }
    }

    const skills = aggregate('skills')
    const certs  = aggregate('certifications')
    res.render('report', {
      labels:    skills.labels,
      data:      skills.data,
      certsJson: JSON.stringify(certs),
      total:     portfolios.length,
    })
  } catch (err) { next(err) }
})

app.post('/manager/status', requireManager, async (req, res, next) => {
  try {
    const { id, status } = req.body
    if (!['approved', 'rejected', 'pending'].includes(status)) return res.redirect('/manager')
    await db.updateStatus(Number(id), status)
    res.redirect('/manager')
  } catch (err) { next(err) }
})

// ─── Start ────────────────────────────────────────────────────────────────────

db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Portfolio Hub running at http://localhost:${PORT}`)
      console.log(`Manager login: http://localhost:${PORT}/manager/login  (password: ${MANAGER_PASSWORD})`)
    })
  })
  .catch(err => {
    console.error('Failed to connect to database:', err.message)
    process.exit(1)
  })
