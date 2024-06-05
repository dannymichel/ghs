const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 9000;

app.use(bodyParser.json());
app.use(cors()); // Enable all CORS requests

let configs = [];

// Endpoint to get all configs
app.get('/configs', (req, res) => {
    console.log('Fetching configurations:', configs);
    res.json(configs);
});

// Endpoint to add a new config
app.post('/configs', (req, res) => {
    const config = req.body;
    configs.push(config);
    console.log('Added new configuration:', config);
    res.status(201).json(config);
});

// Endpoint to delete a config
app.delete('/configs/:name', (req, res) => {
    const name = req.params.name;
    configs = configs.filter(config => config.name !== name);
    console.log('Deleted configuration:', name);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
