const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// GET: Fetch top 10 scores
app.get('/api/scores', async (req, res) => {
    try {
        const topScores = await pool.query(
            'SELECT * FROM scores ORDER BY top_score DESC LIMIT 10'
        );
        res.json(topScores.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// POST: Save a new score
app.post('/api/scores', async (req, res) => {
    try {
        const { username, top_score, accuracy } = req.body;
        
        // Basic validation
        if (!username || !top_score) {
            return res.status(400).json({ error: "Username and score are required" });
        }

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