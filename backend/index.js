const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { execSync } = require('child_process');
const { loadConfig, saveConfig } = require('./config');

const app = express();
const PORT = 9000;

app.use(bodyParser.json());
app.use(cors());

let configs = loadConfig().key_pairs;

app.get('/configs', (req, res) => {
    res.json(Object.keys(configs).map(name => ({ name })));
});

app.post('/configs', (req, res) => {
    const config = req.body;
    configs[config.name] = config;
    saveConfig({ key_pairs: configs });
    res.status(201).json(config);
});

app.delete('/configs/:name', (req, res) => {
    const name = req.params.name;
    delete configs[name];
    saveConfig({ key_pairs: configs });
    res.status(204).send();
});

app.get('/list', (req, res) => {
    res.json(Object.keys(configs).map(name => ({ name })));
});

app.post('/clone', (req, res) => {
    const { name, url } = req.body;
    // Placeholder implementation for cloning a repository
    res.json(`Cloned repository ${url} using configuration ${name}`);
});

app.post('/switch', (req, res) => {
    const { name } = req.body;
    // Placeholder implementation for switching configuration
    res.json(`Switched to configuration ${name}`);
});

app.post('/delete', (req, res) => {
    const { name } = req.body;
    delete configs[name];
    saveConfig({ key_pairs: configs });
    res.json(`Deleted configuration ${name}`);
});

app.post('/export', (req, res) => {
    const { name } = req.body;
    // Placeholder implementation for exporting keys
    res.json(`Exported configuration ${name}`);
});

app.get('/analyze', (req, res) => {
    // Placeholder implementation for analyzing GPG keys
    res.json({ message: 'Analyzed GPG keys' });
});

app.post('/new', (req, res) => {
    const { name, gpgName, gpgEmail, gpgPassphrase, sshKeyName } = req.body;
    // Placeholder implementation for creating new keys
    res.json({ message: `Created new keys for ${name}` });
});

app.post('/save', (req, res) => {
    const { name, gpgKey, sshKey } = req.body;
    configs[name] = { gpgKey, sshKey };
    saveConfig({ key_pairs: configs });
    res.json({ message: `Saved keys for ${name}` });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
