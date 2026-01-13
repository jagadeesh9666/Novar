const express = require('express');
const pool = require('./db');
const app = express();
const port = process.env.PORT || 4001;

app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('ok'));

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, name FROM users');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'db_error', detail: e.message });
  }
});

app.listen(port, () => console.log(`User service on ${port}`));

