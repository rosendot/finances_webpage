const express = require('express');
const app = express();
const db = require('./db');

app.get('/finances', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM revenue');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});