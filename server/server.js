const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/revenue - Retrieves all revenue records from the database
app.get('/api/revenue', async (req, res) => {
    try {
        const { rows: revenueData } = await pool.query('SELECT * FROM revenue');
        res.json(revenueData);
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/revenue/:id - Updates a specific revenue record by ID
// Allows partial updates with name and/or expected_amount
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

// GET /api/expenses - Retrieves all expense records from the database
app.get('/api/expenses', async (req, res) => {
    try {
        const { rows: expensesData } = await pool.query('SELECT * FROM expenses');
        res.json(expensesData);
    } catch (error) {
        console.error('Error fetching expenses data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/expenses/:id - Updates a specific expense record by ID
// Allows partial updates with name, expected_amount, and/or category
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

// POST /api/revenue - Creates a new revenue record
// Sets default values for many fields
app.post('/api/revenue', async (req, res) => {
    try {
        const { name, amount, date, is_recurring, category, payment_method, notes } = req.body;

        const query = `
            INSERT INTO revenue (
                name,
                amount,
                date,
                is_recurring,
                category,
                payment_method,
                notes,
                status,
                created_at,
                tax_rate,
                pre_tax,
                frequency,
                bank_account,
                source
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP, 0, false, 'monthly', '', '')
            RETURNING *
        `;

        const values = [
            name,
            amount,
            date,
            is_recurring || false,
            category || 'Uncategorized',
            payment_method || '',
            notes || ''
        ];

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error adding revenue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/expenses - Creates a new expense record
// Sets default values for many fields
app.post('/api/expenses', async (req, res) => {
    try {
        const { name, amount, date, is_recurring, category, merchant, notes, payment_method } = req.body;

        const query = `
            INSERT INTO expenses (
                name,
                amount,
                date,
                is_recurring,
                category,
                merchant,
                notes,
                payment_method,
                status,
                created_at,
                tax_deductible,
                frequency,
                receipt_url,
                due_date
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', CURRENT_TIMESTAMP, false, 'monthly', '', $3)
            RETURNING *
        `;

        const values = [
            name,
            amount,
            date,
            is_recurring || false,
            category || 'Miscellaneous',
            merchant || '',
            notes || '',
            payment_method || ''
        ];

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/revenue/bulk - Deletes multiple revenue records in one operation
// Takes an array of IDs in the request body
app.delete('/api/revenue/bulk', async (req, res) => {
    try {
        const { ids } = req.body;
        const validIds = ids.map(id => Number(id)).filter(id => !isNaN(id));

        if (validIds.length === 0) {
            return res.status(400).json({ error: 'No valid IDs provided' });
        }

        const result = await pool.query(
            'DELETE FROM revenue WHERE id = ANY($1::int[])',
            [validIds]
        );

        res.json({
            message: 'Revenues deleted successfully',
            count: result.rowCount
        });
    } catch (error) {
        console.error('Error bulk deleting revenues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/expenses/bulk - Deletes multiple expense records in one operation
// Takes an array of IDs in the request body
app.delete('/api/expenses/bulk', async (req, res) => {
    try {
        const { ids } = req.body;
        const validIds = ids.map(id => Number(id)).filter(id => !isNaN(id));

        if (validIds.length === 0) {
            return res.status(400).json({ error: 'No valid IDs provided' });
        }

        const result = await pool.query(
            'DELETE FROM expenses WHERE id = ANY($1::int[])',
            [validIds]
        );

        res.json({
            message: 'Expenses deleted successfully',
            count: result.rowCount
        });
    } catch (error) {
        console.error('Error bulk deleting expenses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/revenue/:id - Deletes a single revenue record by ID
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

// DELETE /api/expenses/:id - Deletes a single expense record by ID
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

// POST /api/revenue/bulk - Creates multiple revenue records in one transaction
// Takes an array of revenue items in the request body
app.post('/api/revenue/bulk', async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid input: expected an array of items' });
        }

        // Use a single transaction for better performance
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const insertPromises = items.map(item => {
                const { name, amount, expected_amount, date, is_recurring, category, payment_method, notes } = item;

                const query = `
                    INSERT INTO revenue (
                        name,
                        amount,
                        expected_amount,
                        date,
                        is_recurring,
                        category,
                        payment_method,
                        notes,
                        status,
                        created_at,
                        tax_rate,
                        pre_tax,
                        frequency,
                        bank_account,
                        source
                    ) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', CURRENT_TIMESTAMP, 0, false, 'monthly', '', '')
                    RETURNING *
                `;

                const values = [
                    name,
                    amount || 0,
                    expected_amount || 0,
                    date,
                    is_recurring || false,
                    category || 'Uncategorized',
                    payment_method || '',
                    notes || ''
                ];

                return client.query(query, values);
            });

            const results = await Promise.all(insertPromises);
            await client.query('COMMIT');

            // Extract the inserted rows from results
            const insertedItems = results.map(result => result.rows[0]);
            res.json(insertedItems);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error bulk inserting revenue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/expenses/bulk - Creates multiple expense records in one transaction
// Takes an array of expense items in the request body
app.post('/api/expenses/bulk', async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid input: expected an array of items' });
        }

        // Use a single transaction for better performance
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const insertPromises = items.map(item => {
                const { name, amount, expected_amount, date, is_recurring, category, merchant, notes, payment_method } = item;

                const query = `
                    INSERT INTO expenses (
                        name,
                        amount,
                        expected_amount,
                        date,
                        is_recurring,
                        category,
                        merchant,
                        notes,
                        payment_method,
                        status,
                        created_at,
                        tax_deductible,
                        frequency,
                        receipt_url,
                        due_date
                    ) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', CURRENT_TIMESTAMP, false, 'monthly', '', $4)
                    RETURNING *
                `;

                const values = [
                    name,
                    amount || 0,
                    expected_amount || 0,
                    date,
                    is_recurring || false,
                    category || 'Miscellaneous',
                    merchant || '',
                    notes || '',
                    payment_method || ''
                ];

                return client.query(query, values);
            });

            const results = await Promise.all(insertPromises);
            await client.query('COMMIT');

            // Extract the inserted rows from results
            const insertedItems = results.map(result => result.rows[0]);
            res.json(insertedItems);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error bulk inserting expenses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server on the specified port or default to 5000
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});