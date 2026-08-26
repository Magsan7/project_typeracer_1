const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// --- 1. SMART DATABASE CONNECTION ---
// If it finds a DATABASE_URL (on Render), it connects to the live cloud.
// If it doesn't (on your laptop), it uses your local .env variables!
const pool = new Pool(
    process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
      }
);

// --- 2. SMART TABLE CREATION ---
// "IF NOT EXISTS" is the magic phrase here.
const createTableQuery = `
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    top_score INT NOT NULL,
    accuracy INT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

pool.query(createTableQuery)
    .then(() => console.log("Database table 'scores' is ready!"))
    .catch((err) => console.error("Error creating table:", err));

// --- 3. API ROUTES ---
app.get('/api/scores', async (req, res) => {
    try {
        const topScores = await pool.query(
            'SELECT * FROM scores ORDER BY top_score DESC, accuracy DESC LIMIT 10'
        );
        res.json(topScores.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

app.post('/api/scores', async (req, res) => {
    try {
        const { username, top_score, accuracy } = req.body;
        if (!username || !top_score) return res.status(400).json({ error: "Required" });

        const newScore = await pool.query(
            'INSERT INTO scores (username, top_score, accuracy) VALUES ($1, $2, $3) RETURNING *',
            [username, top_score, accuracy]
        );
        res.json(newScore.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));