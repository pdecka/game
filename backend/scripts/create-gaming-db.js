const { Client } = require('pg');

async function main() {
  const c = new Client({
    connectionString: 'postgresql://postgres:Romil%407151@localhost:5432/postgres',
  });
  await c.connect();
  const r = await c.query("SELECT 1 FROM pg_database WHERE datname = 'gaming_db'");
  if (!r.rowCount) {
    await c.query('CREATE DATABASE gaming_db');
    console.log('CREATED gaming_db');
  } else {
    console.log('EXISTS gaming_db');
  }
  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
