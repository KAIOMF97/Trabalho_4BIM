const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'loja_carros',
    password: 'kaio07890',
    port: 5432,
});

module.exports = pool;

