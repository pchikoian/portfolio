const db = require('../db')

async function clean() {
  await db.init()
  const { count } = await db.truncate()
  console.log(`Deleted ${count} portfolio(s). Database is now empty.`)
  process.exit(0)
}

clean().catch(err => { console.error(err); process.exit(1) })
