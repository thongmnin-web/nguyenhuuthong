const postgres = require('postgres')

let sql;
try {
    const connectionString = process.env.DATABASE_URL
    sql = postgres(connectionString)
    console.log('sql created');
} catch (e) {
    console.error('failed to create sql', e);
    sql = null;
}

module.exports = sql