import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// Legg til denne nye importen
import wheelRouter from './routes/wheelRoutes.mjs';

// Last miljøvariabler fra .env
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// Legg til denne nye linjen for å bruke wheel-ruteren
app.use('/api/wheels', wheelRouter);

// Behold dine eksisterende ruter
const wheelOptions = [
    'Win 100 points', 'Win 200 points', 'Lose 50 points', 'Try Again',
    'Jackpot!', 'Win a Bonus Spin', 'Win 500 points', 'Lose a Turn'
];

// GET / - Hjemmerute (beholdes som den er)
app.get('/', (req, res) => {
    res.send('Welcome to the Spin the Wheel API! Use /spin to spin the wheel.');
});

// GET /spin - Spinn hjulet (beholdes som den er)
app.get('/spin', (req, res) => {
    const randomIndex = Math.floor(Math.random() * wheelOptions.length);
    const result = wheelOptions[randomIndex];
    res.json({ message: 'The wheel has been spun!', result });
});

// Start server (beholdes som den er)
app.listen(port, () => {
    console.log(`Spin the Wheel server running at http://localhost:${port}`);
});