const db = require('../db')

const COUNT = Number(process.argv[2]) || 20

const firstNames = ['Alice','Bob','Carol','David','Eva','Frank','Grace','Henry','Iris','James','Karen','Leo','Maya','Nathan','Olivia','Paul','Quinn','Rachel','Sam','Tina','Umar','Vera','Will','Xena','Yusuf','Zoe']
const lastNames  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Lee','Walker','Hall']

const titles = [
  'Full Stack Developer','Frontend Engineer','Backend Engineer',
  'DevOps Engineer','Mobile Developer','Data Engineer',
  'Machine Learning Engineer','UI/UX Designer','Cloud Architect',
  'Security Engineer','Site Reliability Engineer','Platform Engineer',
]

const interestPool = [
  'Open source','Hiking','Chess','Photography','Gaming','Cooking','Reading','Cycling',
  'Travel','Music','Painting','Podcasting','Blogging','Yoga','Running','Bouldering',
  'Board games','Astronomy','Home automation','3D printing',
]

const certPool = [
  'AWS Solutions Architect','AWS Developer Associate','AWS SysOps Administrator',
  'Google Cloud Professional','GCP Associate Cloud Engineer','Azure Administrator',
  'Certified Kubernetes Administrator (CKA)','Certified Kubernetes Application Developer (CKAD)',
  'HashiCorp Terraform Associate','Docker Certified Associate',
  'MongoDB Certified Developer','Oracle Java SE Certified',
  'Certified Ethical Hacker (CEH)','CompTIA Security+','CISSP',
  'Scrum Master (PSM I)','PMP','Google UX Design Certificate',
]

const skillPool = [
  'JavaScript','TypeScript','Python','Go','Rust','Java','C#','Ruby','PHP','Swift',
  'React','Vue','Angular','Next.js','Svelte','Node.js','Express','FastAPI','Django','Laravel',
  'PostgreSQL','MySQL','MariaDB','MongoDB','Redis','SQLite','Elasticsearch',
  'Docker','Kubernetes','AWS','GCP','Azure','Terraform','Ansible','CI/CD',
  'GraphQL','REST','gRPC','WebSockets','Kafka','RabbitMQ',
  'Git','Linux','Nginx','Figma','Tailwind CSS','SASS',
]

const bioTemplates = [
  (name, title) => `Hi, I'm ${name}, a passionate ${title} with over ${rand(2,10)} years of experience building scalable web applications. I love clean code, open source, and mentoring junior developers.`,
  (name, title) => `${name} here! I work as a ${title} specialising in high-performance systems. When I'm not coding I enjoy hiking and contributing to open source projects.`,
  (name, title) => `I'm ${name}, a ${title} who thrives at the intersection of design and engineering. I've shipped products used by millions of users and care deeply about developer experience.`,
  (name, title) => `As a ${title}, I've spent the last ${rand(3,8)} years helping startups and enterprises build reliable, maintainable software. I believe great software is built by great teams.`,
  (name, title) => `${name} — ${title}. I'm obsessed with performance optimisation and developer tooling. Previously at several well-known tech companies, now open to new opportunities.`,
]

const statuses = ['pending','approved','approved','approved','rejected']

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickMany(arr, min, max) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, rand(min, max))
}

function randomProfile() {
  const name  = `${pick(firstNames)} ${pick(lastNames)}`
  const title = pick(titles)
  const bio   = pick(bioTemplates)(name, title)
  const skills         = pickMany(skillPool, 3, 8).map(s => `${s}:${rand(1,4)}`).join(',')
  const interests      = Math.random() > 0.2 ? pickMany(interestPool, 2, 5).join(', ') : null
  const certifications = Math.random() > 0.4 ? pickMany(certPool, 1, 3).join(', ') : null
  const email  = `${name.toLowerCase().replace(' ', '.')}${rand(1,99)}@example.com`
  const github   = Math.random() > 0.3 ? `https://github.com/${name.toLowerCase().replace(' ','')}` : null
  const linkedin = Math.random() > 0.4 ? `https://linkedin.com/in/${name.toLowerCase().replace(' ','-')}` : null
  const website  = Math.random() > 0.6 ? `https://${name.toLowerCase().replace(' ','')} .dev` : null
  const status   = pick(statuses)
  return { name, title, bio, skills, interests, certifications, projects: null, products: null, email, github, linkedin, website, status }
}

async function seed() {
  await db.init()
  console.log(`Seeding ${COUNT} portfolios…`)
  for (let i = 0; i < COUNT; i++) {
    const p = randomProfile()
    const id = await db.create(p)
    await db.updateStatus(id, p.status)
    console.log(`  [${p.status}] ${p.name} — ${p.title}`)
  }
  console.log(`\nDone. ${COUNT} portfolios inserted.`)
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
