import mysql from 'mysql2/promise'


const databaseUrl = process.env.DATABASE_URL;
const dbPort = Number(process.env.DB_PORT || 3306);
const dbSslEnabled = process.env.DB_SSL === 'true';

const pool = databaseUrl
  ? mysql.createPool(databaseUrl)
  : mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mulingo',
      port: dbPort,
      ssl: dbSslEnabled ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })



export default pool
