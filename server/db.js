const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'Rosendo321.',
    host: 'localhost',
    port: 5432,
    database: 'finances',
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};