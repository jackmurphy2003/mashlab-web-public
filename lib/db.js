const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

let db = null;

async function getDb() {
  if (!db) {
    db = await open({
      filename: 'murphmixes.db',
      driver: sqlite3.Database
    });
    
    // Initialize schema
    await initSchema();
  }
  return db;
}

async function initSchema() {
  const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Split by semicolon and execute each statement
  const statements = schema.split(';').filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      await db.exec(statement);
    }
  }
}



module.exports = {
  getDb
};
