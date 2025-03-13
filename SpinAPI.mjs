import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './db.mjs';
import wheelRouter from './routes/wheelRoutes.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static('public', { extensions: ['html'] }));
app.use(express.static('.'));

app.use('/api/wheels', wheelRouter);

const wheelOptions = [
    'Win 100 points', 'Win 200 points', 'Lose 50 points', 'Try Again',
    'Jackpot!', 'Win a Bonus Spin', 'Win 500 points', 'Lose a Turn'
];


app.get('/spin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'spin.html'));
});


app.get('/', (req, res) => {
    res.send('Welcome to the Spin the Wheel API! Use /spin to spin the wheel.');
});


app.get('/api/spin', async (req, res) => {
    const randomIndex = Math.floor(Math.random() * wheelOptions.length);
    const result = wheelOptions[randomIndex];

    try {
        const dbRes = await pool.query(
            "INSERT INTO spin_results (result) VALUES ($1) RETURNING *",
            [result]
        );
        res.json({ message: 'The wheel has been spun!', result: dbRes.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/spins', async (req, res) => {
    try {
        const results = await pool.query("SELECT * FROM spin_results ORDER BY id DESC");
        res.json(results.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.delete('/api/spins/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM spin_results WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Spin result not found" });
        }

        res.json({ message: "Spin result deleted", deleted: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Spin the Wheel server running at http://localhost:${port}`);
});
