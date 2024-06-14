const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    if (process.env.NODE_ENV === 'development') {
        import('open').then((open) => {
            open.default(`http://localhost:${port}`, { app: 'chrome' });
        });
    }
});