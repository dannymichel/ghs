const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { loadConfig, saveConfig } = require('../lib/config');

const app = express();
const PORT = 9000;

app.use(bodyParser.json());
app.use(cors());

let configs = loadConfig().key_pairs;

// Endpoint to get all configs
app.get('/configs', (req, res) => {
    console.log('Fetching configurations:', configs);
    res.json(Object.keys(configs).map(name => ({ name, ...configs[name] })));
});

// Endpoint to add a new config
app.post('/configs', (req, res) => {
    const config = req.body;
    configs[config.name] = { gpgKey: config.gpgKey, sshKey: config.sshKey };
    saveConfig({ key_pairs: configs });
    console.log('Added new configuration:', config);
    res.status(201).json(config);
});

// Endpoint to delete a config
app.delete('/configs/:name', (req, res) => {
    const name = req.params.name;
    delete configs[name];
    saveConfig({ key_pairs: configs });
    console.log('Deleted configuration with name:', name);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
