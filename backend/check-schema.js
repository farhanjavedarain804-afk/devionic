const db = require('./db');

async function checkSchema() {
  try {
    const [cols] = await db.query("DESCRIBE job_applications");
    console.log(JSON.stringify(cols, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
