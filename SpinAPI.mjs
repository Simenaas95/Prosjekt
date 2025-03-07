import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
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

app.get('/spin', (req, res) => {
    const randomIndex = Math.floor(Math.random() * wheelOptions.length);
    const result = wheelOptions[randomIndex];
    res.json({ message: 'The wheel has been spun!', result });
});


app.listen(port, () => {
    console.log(`Spin the Wheel server running at http://localhost:${port}`);
});