import express from 'express';
import HTTP_CODES from './utils/httpCodes.mjs'; // Sørg for at denne filen eksisterer

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.static('public'));

// Root route (Hello World)
app.get("/", (req, res) => {
    res.status(HTTP_CODES?.SUCCESS?.OK || 200).send('Hello World').end();
});

// "/tmp/poem" route
app.get('/tmp/poem', (req, res) => {
    const poem = `
    Roses are red,
    Violets are blue,
    Express.js is cool,
    And so are you.
    `;
    res.send(poem);
});

// "/tmp/quote" route
const quotes = [
    "The only limit to our realization of tomorrow is our doubts of today.",
    "In the middle of every difficulty lies opportunity.",
    "The best way to predict the future is to invent it.",
    "Success is not the key to happiness. Happiness is the key to success.",
    "Do one thing every day that scares you."
];

app.get('/tmp/quote', (req, res) => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.send(randomQuote);
});

// "/tmp/sum/a/b" route
app.post('/tmp/sum/:a/:b', (req, res) => {
    const a = parseFloat(req.params.a);
    const b = parseFloat(req.params.b);

    if (isNaN(a) || isNaN(b)) {
        return res.status(400).send('Both parameters must be valid numbers.');
    }

    const sum = a + b;
    res.send(`The sum of ${a} and ${b} is ${sum}`);
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});