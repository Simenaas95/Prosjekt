import pool from './db.mjs';

const createTable = async () => {
    try {
        await pool.query(`
         

            CREATE TABLE IF NOT EXISTS wheels (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                options JSONB NOT NULL,
                settings JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

        `);
        console.log("Database tables created!");
    } catch (err) {
        console.error("Error creating database tables:", err);
    } finally {
        pool.end();
    }
};

createTable();
