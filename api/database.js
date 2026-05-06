import pkg from 'pg';

const { Pool } = pkg;

export const pool = new Pool({
    user: 'luan',
    host: 'localhost',
    database: 'orders_db',
    password: 'luan',
    port: 5432,
});