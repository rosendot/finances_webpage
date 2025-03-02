const pool = require('../db');

// Get all expenses
exports.getAllExpenses = async (req, res) => {
    try {
        const { rows: expensesData } = await pool.query('SELECT * FROM expenses');
        res.json(expensesData);
    } catch (error) {
        console.error('Error fetching expenses data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update expense
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, expected_amount, category } = req.body;

        const query = 'UPDATE expenses SET name = COALESCE($1, name), expected_amount = COALESCE($2, expected_amount), category = COALESCE($3, category) WHERE id = $4 RETURNING *';
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
};

// Create expense
exports.createExpense = async (req, res) => {
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
};

// Delete expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Bulk delete expenses
exports.bulkDeleteExpenses = async (req, res) => {
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
};

// Bulk create expenses
exports.bulkCreateExpenses = async (req, res) => {
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
};