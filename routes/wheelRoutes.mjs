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
        console.log("Raw DB row:", row); // Log raw data

        let options = row.options || [];  // Ensure it's an empty array if null
        let settings = row.settings || {}; // Ensure it's an empty object if null

        // If they are strings, try to parse them
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

        // Ensure we return a valid Wheel object even if some fields are missing
        return new Wheel(
            row.id || null,
            row.name || '',
            Array.isArray(options) ? options : [],
            typeof settings === 'object' ? settings : {}
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

// PUT route
// PUT route for updating wheel details
router.put("/:id", async (req, res) => {
    try {
      const { name, items } = req.body;
      const result = await pool.query(
        "UPDATE wheels SET name = $1, items = $2 WHERE id = $3 RETURNING *",
        [name, JSON.stringify(items), req.params.id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Wheel not found" });
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


// DELETE route
router.delete('/:id', async (req, res) => {
    try {
        const wheelId = req.params.id;

        const result = await pool.query('DELETE FROM wheels WHERE id = $1 RETURNING *', [wheelId]);

        res.json({ message: 'Wheel deleted', deletedWheel: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
