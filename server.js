const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/finances.html');
});

app.post('/update-csv', (req, res) => {
    const csvContent = req.body.csvContent;
    const filePath = path.join(__dirname, 'finances.csv');

    // Create the directory if it doesn't exist
    if (!fs.existsSync(__dirname)) {
        fs.mkdirSync(__dirname, { recursive: true });
    }

    fs.writeFile(filePath, csvContent, (err) => {
        if (err) {
            console.error('Error writing CSV file:', err);
            res.status(500).send('Error updating CSV file');
        } else {
            console.log('CSV file updated successfully.');
            res.sendStatus(200);
        }
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    const url = `http://localhost:${port}`;

    if (process.platform === 'darwin') {
        exec(`open ${url}`);
    } else if (process.platform === 'win32') {
        exec(`start ${url}`);
    } else if (process.platform === 'linux') {
        exec(`xdg-open ${url}`);
    }
});