const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'titan_skugen',
  password: 'admin',
  port: 5432,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Hora del servidor:', result.rows[0].now);
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Error de conexión:', err);
  }
}

testConnection();
