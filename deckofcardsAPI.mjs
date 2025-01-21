import express from 'express';

const app = express();
const port = 3000;

// In-memory storage for decks
const decks = {};
let deckCounter = 1; // Simple counter for generating unique IDs

// Function to create a standard 52-card deck
function createDeck() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
    const deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    return deck;
}

// Generate a simple unique ID based on a counter
function generateDeckId() {
    return `deck-${deckCounter++}`;
}

// POST /temp/deck - Create a new deck and return its ID
app.post('/temp/deck', (req, res) => {
    const deckId = generateDeckId();
    decks[deckId] = createDeck();
    res.json({ deck_id: deckId });
});

// PATCH /temp/deck/shuffle/:deck_id - Shuffle the specified deck
app.patch('/temp/deck/shuffle/:deck_id', (req, res) => {
    const { deck_id } = req.params;
    const deck = decks[deck_id];
    if (!deck) {
        return res.status(404).json({ error: 'Deck not found' });
    }

    // Shuffle the deck using Fisher-Yates algorithm
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    res.json({ message: 'Deck shuffled' });
});

// GET /temp/deck/:deck_id - Return the entire deck (minus drawn cards)
app.get('/temp/deck/:deck_id', (req, res) => {
    const { deck_id } = req.params;
    const deck = decks[deck_id];
    if (!deck) {
        return res.status(404).json({ error: 'Deck not found' });
    }
    res.json({ deck });
});

// GET /temp/deck/:deck_id/card - Draw and return a random card from the deck
app.get('/temp/deck/:deck_id/card', (req, res) => {
    const { deck_id } = req.params;
    const deck = decks[deck_id];
    if (!deck) {
        return res.status(404).json({ error: 'Deck not found' });
    }
    if (deck.length === 0) {
        return res.status(400).json({ error: 'Deck is empty' });
    }

    const card = deck.pop(); // Remove and return the last card in the array
    res.json({ card });
});

// Start the server
app.listen(port, () => {
    console.log(`Card deck API running at http://localhost:${port}`);
});
