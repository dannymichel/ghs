const fs = require('fs');
const path = require('path');
const CONFIG_FILE = path.join(require('os').homedir(), '.ghs_config.json');

function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
    return { key_pairs: {}, default_gpg_key: null, default_ssh_key: null };
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 4));
}

module.exports = { loadConfig, saveConfig };

