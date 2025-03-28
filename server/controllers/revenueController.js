const pool = require('../db');

// Get all revenue
exports.getAllRevenue = async (req, res) => {
    try {
        const { rows: revenueData } = await pool.query('SELECT * FROM revenue');
        res.json(revenueData);
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update revenue
exports.updateRevenue = async (req, res) => {
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
};

// Create revenue
exports.createRevenue = async (req, res) => {
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
};

// Delete revenue
exports.deleteRevenue = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM revenue WHERE id = $1', [id]);
        res.json({ message: 'Revenue deleted successfully' });
    } catch (error) {
        console.error('Error deleting revenue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Bulk delete revenue
exports.bulkDeleteRevenue = async (req, res) => {
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
};

// Bulk create revenue
exports.bulkCreateRevenue = async (req, res) => {
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
};