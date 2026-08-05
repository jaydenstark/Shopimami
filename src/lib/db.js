/* global process */
import pg from 'pg';

const { Pool } = pg;

const hasDbUrl = !!process.env.DATABASE_URL;

const pool = hasDbUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : {
      query: () => Promise.reject(new Error("DATABASE_URL env var is not configured")),
      connect: () => Promise.reject(new Error("DATABASE_URL env var is not configured"))
    };

export default pool;
