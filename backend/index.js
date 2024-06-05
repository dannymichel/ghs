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
    const config = configs[name];
    if (config) {
        // Implement clone logic using the specified GPG and SSH keys
        res.status(200).send(`Cloned repository ${url} using configuration ${name}`);
    } else {
        res.status(404).send(`Configuration ${name} not found`);
    }
});

app.post('/switch', (req, res) => {
    const { name } = req.body;
    const config = configs[name];
    if (config) {
        // Implement switch logic using the specified GPG and SSH keys
        res.status(200).send(`Switched to configuration ${name}`);
    } else {
        res.status(404).send(`Configuration ${name} not found`);
    }
});

app.post('/delete', (req, res) => {
    const { name } = req.body;
    if (configs[name]) {
        delete configs[name];
        saveConfig({ key_pairs: configs });
        res.status(200).send(`Deleted configuration ${name}`);
    } else {
        res.status(404).send(`Configuration ${name} not found`);
    }
});

app.post('/export', (req, res) => {
    const { name } = req.body;
    const config = configs[name];
    if (config) {
        // Implement export logic
        res.status(200).send(`Exported configuration ${name}`);
    } else {
        res.status(404).send(`Configuration ${name} not found`);
    }
});

app.get('/analyze', (req, res) => {
    // Implement analyze logic
    res.status(200).send('Analyzed GPG keys');
});

app.post('/new', (req, res) => {
    const { name, gpgName, gpgEmail, gpgPassphrase, sshKeyName } = req.body;
    // Implement new keys creation logic
    const newConfig = { name, gpgName, gpgEmail, gpgPassphrase, sshKeyName };
    configs[name] = newConfig;
    saveConfig({ key_pairs: configs });
    res.status(201).json(newConfig);
});

app.post('/save', (req, res) => {
    const { name, gpgKey, sshKey } = req.body;
    if (name && gpgKey && sshKey) {
        configs[name] = { gpgKey, sshKey };
        saveConfig({ key_pairs: configs });
        res.status(201).send(`Saved configuration ${name}`);
    } else {
        res.status(400).send('Invalid input');
    }
});

app.post('/default', (req, res) => {
    const { gpgKey, sshKey } = req.body;
    // Implement setting default keys logic
    res.status(200).send(`Set default GPG key to ${gpgKey} and SSH key to ${sshKey}`);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
