import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Lagring av kortstokker
const decks = {};

// Funksjon for å generere en ny kortstokk
function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({ suit, rank });
        });
    });
    return deck;
}

// POST /temp/deck - Opprett en ny kortstokk
app.post('/temp/deck', (req, res) => {
    const deckId = `deck_${Date.now()}`;
    decks[deckId] = createDeck();
    res.status(201).json({ deck_id: deckId });
});

// PATCH /temp/deck/shuffle/:deck_id - Stokk kortstokken
app.patch('/temp/deck/shuffle/:deck_id', (req, res) => {
    const { deck_id } = req.params;
    const deck = decks[deck_id];

    if (!deck) {
        return res.status(404).json({ error: 'Deck not found' });
    }

    // Stokker kortstokken med Fisher-Yates-algoritmen
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    res.json({ message: 'Deck shuffled', deck_id });
});

// GET /temp/deck/:deck_id - Hent hele kortstokken
app.get('/temp/deck/:deck_id', (req, res) => {
    const { deck_id } = req.params;
    const deck = decks[deck_id];

    if (!deck) {
        return res.status(404).json({ error: 'Deck not found' });
    }

    res.json({ deck });
});

// GET /temp/deck/:deck_id/card - Trekk et kort
app.get('/temp/deck/:deck_id/card', (req, res) => {
    const { deck_id } = req.params;
    const deck = decks[deck_id];

    if (!deck) {
        return res.status(404).json({ error: 'Deck not found' });
    }

    if (deck.length === 0) {
        return res.status(400).json({ error: 'Deck is empty' });
    }

    // Trekker et tilfeldig kort fra kortstokken
    const randomIndex = Math.floor(Math.random() * deck.length);
    const drawnCard = deck.splice(randomIndex, 1)[0];

    res.json({ card: drawnCard });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
