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

app.post('/api/save-monthly-data', async (req, res) => {
    const {
        year,
        month,
        budget_income,
        actual_income,
        budget_expenses,
        actual_expenses,
        profit,
        savings_rate
    } = req.body;

    try {
        await pool.query(
            `INSERT INTO monthly_data 
            (year, month, budget_income, actual_income, budget_expenses, actual_expenses, profit, savings_rate)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (year, month) DO UPDATE
            SET budget_income = $3, actual_income = $4, budget_expenses = $5, actual_expenses = $6, profit = $7, savings_rate = $8`,
            [year, month, budget_income, actual_income, budget_expenses, actual_expenses, profit, savings_rate]
        );
        res.json({ message: 'Monthly data saved successfully' });
    } catch (error) {
        console.error('Error saving monthly data:', error);
        res.status(500).json({ error: 'Failed to save monthly data' });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const { rows: categories } = await pool.query('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});