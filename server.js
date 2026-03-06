// Load environment variables from api.env during development only
// dotenv is not required in production (render/Heroku etc provide env vars)
// install with `npm install dotenv` and add api.env to .gitignore
console.log('server.js loaded');
if (process.env.NODE_ENV !== 'production') {
    try {
        require('dotenv').config({ path: './api.env' });
        console.log('DATABASE_URL:', process.env.DATABASE_URL);
    } catch (e) {
        console.warn('dotenv not installed, skipping');
    }
}

const path = require("path");
const express = require('express');
const sql = require('./db'); // db.js uses process.env.DATABASE_URL
const cors = require("cors");

const app = express();
console.log('app created');
app.use(cors());

app.use(express.static(path.join(__dirname)));

// parse JSON request bodies
app.use(express.json());

// No need for config here, db.js handles connection via DATABASE_URL

app.get('/products', async (req, res) => {
    try {
        const result = await sql`SELECT * FROM Products`;
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// orders endpoints
app.post('/orders', async (req, res) => {
    const { date, name, phone, address, items, total } = req.body;
    try {
        const inserted = await sql`
            INSERT INTO Orders (date, name, phone, address, items, total)
            VALUES (${date}, ${name}, ${phone}, ${address}, ${items}, ${total})
            RETURNING *
        `;
        res.json(inserted[0]);
    } catch (err) {
        console.error('order insert failed', err);
        res.status(500).send('Could not save order');
    }
});

app.get('/orders', async (req, res) => {
    console.log('GET /orders route hit');
    if (!sql) return res.status(500).send('DB not connected');
    try {
        const rows = await sql`SELECT * FROM Orders ORDER BY id DESC`;
        res.json(rows);
    } catch (err) {
        console.error('fetch orders failed', err);
        res.status(500).send('Database error');
    }
});

app.delete('/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await sql`DELETE FROM Orders WHERE id = ${id}`;
        res.sendStatus(204);
    } catch (err) {
        console.error('delete order failed', err);
        res.status(500).send('Database error');
    }
});

// simple health check to verify DB connection
app.get('/ping', async (req, res) => {
    console.log('GET /ping route hit');
    if (!sql) return res.status(500).send('DB not connected');
    try {
        await sql`SELECT 1`;
        res.send('pong');
    } catch (err) {
        console.error('DB ping failed', err);
        res.status(500).send('db down');
    }
});

// ensure orders table exists (run once at startup)
(async () => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS Orders (
            id serial PRIMARY KEY,
            date text,
            name text,
            phone text,
            address text,
            items text,
            total text
        )`;
        console.log('Orders table checked/created');
    } catch (e) {
        console.error('failed to create Orders table', e);
    }
})();

const PORT = process.env.PORT || 3000;
console.log('PORT:', PORT);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});