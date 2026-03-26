// src/database/index.ts
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',         // seu usuário do postgres
  host: 'localhost',
  database: 'engemarko_db', // o nome que você deu ao banco
  password: '3004',
  port: 5432,
});

export default pool;