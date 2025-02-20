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

// In server.js
app.put('/api/revenue/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, expected_amount } = req.body;

        const query = 'UPDATE revenue SET name = COALESCE($1, name), expected_amount = COALESCE($2, expected_amount) WHERE id = $3 RETURNING *';
        const values = [name, expected_amount, id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Revenue not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating revenue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/revenue/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM revenue WHERE id = $1', [id]);
        res.json({ message: 'Revenue deleted successfully' });
    } catch (error) {
        console.error('Error deleting revenue:', error);
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

// In server.js
app.put('/api/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, expected_amount, category } = req.body;

        const query = 'UPDATE expenses SET name = COALESCE($1, name), expected_amount = COALESCE($2, expected_amount), category = COALESCE($3, category) WHERE id = $3 RETURNING *';
        const values = [name, expected_amount, category, id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});