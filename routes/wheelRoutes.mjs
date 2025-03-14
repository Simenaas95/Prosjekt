import express from 'express';
import pool from '../db.mjs';
const router = express.Router();

class Wheel {
    constructor(id, name, options, settings) {
        this.id = id;
        this.name = name;
        this.options = options;
        this.settings = settings;
    }

    static fromDB(row) {
        console.log("Raw DB row:", row); // Logg rådata

        let options = row.options || [];  // Sørg for at det er en tom array hvis det er null
        let settings = row.settings || {}; // Sørg for at det er et tomt objekt hvis det er null

        // Hvis de er strenger, prøv å parse dem
        if (typeof options === 'string') {
            try {
                options = JSON.parse(options);
            } catch (error) {
                console.error('Invalid JSON in options:', options);
                options = [];
            }
        }

        if (typeof settings === 'string') {
            try {
                settings = JSON.parse(settings);
            } catch (error) {
                console.error('Invalid JSON in settings:', settings);
                settings = {};
            }
        }

        return new Wheel(
            row.id,
            row.name,
            options,
            settings
        );
    }
}

router.post('/', async (req, res) => {
    try {
        const { name, options, settings, prize } = req.body;

        // Legg til prize i options
        if (prize) {
            options.push(prize);
        }

        const wheelSettings = settings || {
            defaultPrize: 'Try Again',
            minSpinTime: 3,
            maxSpinTime: 8,
            isActive: true
        };

        // Sørg for at 'options' og 'settings' lagres som JSON
        const result = await pool.query(
            'INSERT INTO wheels (name, options, settings) VALUES ($1, $2, $3) RETURNING *',
            [name, JSON.stringify(options), JSON.stringify(wheelSettings)]
        );

        console.log("Saved to DB:", result.rows[0]); // Logg hva som faktisk blir lagret

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Feil ved opprettelse av hjul:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, options::json, settings::json FROM wheels WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Wheel not found' });
        }

        const wheel = Wheel.fromDB(result.rows[0]);
        res.json(wheel);
    } catch (error) {
        console.error('Error retrieving wheel:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Legg til denne ruten for å hente alle hjul
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, options::json, settings::json FROM wheels');

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No wheels found' });
        }

        const wheels = result.rows.map(row => Wheel.fromDB(row));
        res.json(wheels);
    } catch (error) {
        console.error('Error retrieving wheels:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
