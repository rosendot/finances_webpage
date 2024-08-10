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
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
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


app.post('/api/update-recurring-dates', async (req, res) => {
    const { expenses } = req.body;

    try {
        const updatedExpenses = expenses.map(expense => {
            if (expense.frequency === 'monthly' || expense.frequency === 'yearly') {
                const currentDate = new Date();
                const expenseDate = new Date(expense.date);

                if (expenseDate < currentDate) {
                    if (expense.frequency === 'monthly') {
                        while (expenseDate <= currentDate) {
                            expenseDate.setMonth(expenseDate.getMonth() + 1);
                        }
                    } else if (expense.frequency === 'yearly') {
                        while (expenseDate <= currentDate) {
                            expenseDate.setFullYear(expenseDate.getFullYear() + 1);
                        }
                    }
                    return { ...expense, date: expenseDate.toISOString().split('T')[0] };
                }
            }
            return expense;
        });

        // Update the database with new dates
        await pool.query('BEGIN');
        for (const expense of updatedExpenses) {
            if (expense.date !== expenses.find(e => e.name === expense.name).date) {
                await pool.query(
                    'UPDATE expenses SET date = $1 WHERE name = $2',
                    [expense.date, expense.name]
                );
            }
        }
        await pool.query('COMMIT');

        res.json(updatedExpenses);
    } catch (error) {
        console.error('Error updating recurring dates:', error);
        res.status(500).json({ error: 'Failed to update recurring dates' });
    }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});