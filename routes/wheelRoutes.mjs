// routes/wheelRoutes.mjs
import express from 'express';
const router = express.Router();

// Datastruktur for hjul
class Wheel {
    constructor(name, options, settings = {}) {
        this.id = Date.now().toString();
        this.name = name;
        this.options = options;
        this.settings = {
            defaultPrize: settings.defaultPrize || 'Try Again',
            minSpinTime: settings.minSpinTime || 3,
            maxSpinTime: settings.maxSpinTime || 8,
            isActive: settings.isActive ?? true,
            ...settings
        };
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.spinHistory = [];
    }

    spin() {
        const result = this.options[Math.floor(Math.random() * this.options.length)];
        const spinResult = {
            result,
            timestamp: new Date(),
            wheelId: this.id
        };
        this.spinHistory.push(spinResult);
        return spinResult;
    }
}

// In-memory database
let wheels = new Map();

// Opprett standard hjul
const defaultWheel = new Wheel(
    'Default Wheel',
    ['Win 100 points', 'Win 200 points', 'Lose 50 points', 'Try Again',
     'Jackpot!', 'Win a Bonus Spin', 'Win 500 points', 'Lose a Turn']
);
wheels.set(defaultWheel.id, defaultWheel);

// CREATE - Opprett nytt hjul
router.post('/', (req, res) => {
    const { name, options, settings } = req.body;
    
    if (!name || !options || !Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ 
            error: 'Navn og minst ett hjulalternativ er påkrevd' 
        });
    }
    
    const wheel = new Wheel(name, options, settings);
    wheels.set(wheel.id, wheel);
    
    res.status(201).json(wheel);
});

// READ - Hent alle hjul
router.get('/', (req, res) => {
    res.json(Array.from(wheels.values()));
});

// READ - Hent spesifikt hjul
router.get('/:id', (req, res) => {
    const wheel = wheels.get(req.params.id);
    if (!wheel) {
        return res.status(404).json({ error: 'Hjul ikke funnet' });
    }
    res.json(wheel);
});

// UPDATE - Oppdater hjul
router.put('/:id', (req, res) => {
    const wheel = wheels.get(req.params.id);
    if (!wheel) {
        return res.status(404).json({ error: 'Hjul ikke funnet' });
    }
    
    const { name, options, settings } = req.body;
    
    if (name) wheel.name = name;
    if (options && Array.isArray(options) && options.length > 0) {
        wheel.options = options;
    }
    if (settings) {
        wheel.settings = { ...wheel.settings, ...settings };
    }
    
    wheel.updatedAt = new Date();
    
    res.json(wheel);
});

// DELETE - Slett hjul
router.delete('/:id', (req, res) => {
    if (!wheels.has(req.params.id)) {
        return res.status(404).json({ error: 'Hjul ikke funnet' });
    }
    
    wheels.delete(req.params.id);
    res.status(204).send();
});

// SPIN - Spinn et spesifikt hjul
router.post('/:id/spin', (req, res) => {
    const wheel = wheels.get(req.params.id);
    if (!wheel) {
        return res.status(404).json({ error: 'Hjul ikke funnet' });
    }
    
    const spinResult = wheel.spin();
    res.json({
        message: 'Hjulet har blitt snudd!',
        ...spinResult
    });
});

export default router;