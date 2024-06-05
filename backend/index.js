const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { loadConfig, saveConfig } = require('../lib/config');
const { exportAndAnalyzeGpgKeys, setDefaultKeys } = require('../lib/gpg');

const app = express();
const PORT = 9000;

app.use(bodyParser.json());
app.use(cors());

let configs = loadConfig().key_pairs;

app.get('/configs', (req, res) => {
    console.log('Fetching configurations:', configs);
    res.json(Object.keys(configs).map(name => ({ name, ...configs[name] })));
});

app.post('/configs', (req, res) => {
    const { name, gpgKey, sshKey } = req.body;
    configs[name] = { gpgKey, sshKey };
    saveConfig({ key_pairs: configs });
    console.log('Added new configuration:', { name, gpgKey, sshKey });
    res.status(201).json({ name, gpgKey, sshKey });
});

app.delete('/configs/:name', (req, res) => {
    const name = req.params.name;
    delete configs[name];
    saveConfig({ key_pairs: configs });
    console.log('Deleted configuration with name:', name);
    res.status(204).send();
});

app.post('/switch', (req, res) => {
    const { configName } = req.body;
    if (configs[configName]) {
        // Logic to switch accounts (this should be implemented)
        res.json({ message: `Switched to configuration: ${configName}` });
    } else {
        res.status(404).json({ message: `Configuration ${configName} not found` });
    }
});

app.get('/analyze', async (req, res) => {
    try {
        await exportAndAnalyzeGpgKeys();
        res.json({ message: 'GPG keys analyzed' });
    } catch (error) {
        res.status(500).json({ message: 'Error analyzing GPG keys', error });
    }
});

app.post('/default', (req, res) => {
    const { gpgKey, sshKey } = req.body;
    try {
        setDefaultKeys(gpgKey, sshKey);
        res.json({ message: 'Default keys set' });
    } catch (error) {
        res.status(500).json({ message: 'Error setting default keys', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
