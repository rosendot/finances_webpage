const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// API endpoint for revenue data
app.get('/api/revenue', async (req, res) => {
    try {
        const { rows: revenueData } = await pool.query('SELECT * FROM revenue');
        res.json(revenueData);
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint for expenses data
app.get('/api/expenses', async (req, res) => {
    try {
        const { rows: expensesData } = await pool.query('SELECT * FROM expenses');
        res.json(expensesData);
    } catch (error) {
        console.error('Error fetching expenses data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/save', async (req, res) => {
    const { revenue, expenses } = req.body;

    try {
        await pool.query('BEGIN');

        // Update revenue data
        for (const item of revenue) {
            await pool.query(
                'UPDATE revenue SET amount = $1, include = $2, date = $3 WHERE name = $4',
                [item.amount, item.include, item.date, item.name]
            );
        }

        // Update expenses data
        for (const item of expenses) {
            await pool.query(
                'UPDATE expenses SET amount = $1, include = $2, date = $3 WHERE name = $4',
                [item.amount, item.include, item.date, item.name]
            );
        }

        await pool.query('COMMIT');
        res.json({ message: 'Data saved successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});