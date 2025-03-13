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
        let options;
        try {
            options = JSON.parse(row.options);
        } catch (error) {
            console.error('Invalid JSON in options:', row.options);
            options = [];
        }

        let settings;
        try {
            settings = JSON.parse(row.settings);
        } catch (error) {
            console.error('Invalid JSON in settings:', row.settings);
            settings = {};
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

        const result = await pool.query(
            'INSERT INTO wheels (name, options, settings) VALUES ($1, $2, $3) RETURNING *',
            [name, JSON.stringify(options), JSON.stringify(wheelSettings)]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Feil ved opprettelse av hjul:', error);
        res.status(500).json({ error: 'Database error' });
    }
});


router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, options, settings FROM wheels ORDER BY id DESC');
        
        const wheels = result.rows.map(row => {
            let options, settings;
            try {
                options = JSON.parse(row.options);
            } catch (error) {
                console.error('Invalid JSON in options:', row.options);
                options = [];
            }
            try {
                settings = JSON.parse(row.settings);
            } catch (error) {
                console.error('Invalid JSON in settings:', row.settings);
                settings = {};
            }
            return {
                id: row.id,
                name: row.name,
                options: options,
                settings: settings
            };
        });

        res.status(200).json(wheels);
    } catch (error) {
        console.error('Feil ved henting av hjul:', error);
        res.status(500).json({ error: 'Database error' });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { name, options, settings } = req.body;

        const result = await pool.query(
            'UPDATE wheels SET name=$1, options=$2, settings=$3, updated_at=CURRENT_TIMESTAMP WHERE id=$4 RETURNING *',
            [name, JSON.stringify(options), JSON.stringify(settings), req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Hjul ikke funnet' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Feil ved oppdatering av hjul:', error);
        res.status(500).json({ error: 'Database error' });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM wheels WHERE id = $1 RETURNING *', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Hjul ikke funnet' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Feil ved sletting av hjul:', error);
        res.status(500).json({ error: 'Database error' });
    }
});


router.post('/:id/spin', async (req, res) => {
    try {
        const wheel = await pool.query('SELECT * FROM wheels WHERE id = $1', [req.params.id]);

        if (wheel.rows.length === 0) {
            return res.status(404).json({ error: 'Hjul ikke funnet' });
        }

        const options = JSON.parse(wheel.rows[0].options); // Konverter fra JSON-streng til array
        const result = options[Math.floor(Math.random() * options.length)];

        await pool.query(
            'INSERT INTO spin_history (wheel_id, result, timestamp) VALUES ($1, $2, CURRENT_TIMESTAMP)',
            [req.params.id, result]
        );

        res.json({ message: 'Hjulet ble spunnet!', result });
    } catch (error) {
        console.error('Feil ved spinning av hjul:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

router.put('/update-options', async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE wheels SET options = \'["test", "test", "test"]\' WHERE id = 1'
        );
        res.json(result);
    } catch (error) {
        console.error('Feil ved oppdatering av alternativer:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
