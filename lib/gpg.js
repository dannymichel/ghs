const { execSync } = require('child_process');
const openpgp = require('openpgp');
const { promptGpgKey, promptSshKey } = require('./prompts');
const { loadConfig, saveConfig } = require('./config');

async function exportAndAnalyzeGpgKeys() {
    try {
        const armoredText = execSync('gpg --export --armor').toString();

        if (!armoredText || !armoredText.includes('BEGIN PGP PUBLIC KEY BLOCK')) {
            throw new Error('No armored GPG keys found. Please check your GPG configuration.');
        }

        const keys = await openpgp.readKeys({ armoredKeys: armoredText });
        if (!keys || !Array.isArray(keys) || keys.length === 0) {
            throw new Error('No keys found or the returned value is not an array.');
        }
        console.log('Available GPG Keys:');
        keys.forEach((key, index) => {
            const keyID = key.getFingerprint() || key.getKeyID().toHex();
            console.log(`${index}: ${keyID} (${key.getUserIDs().join(', ')})`);
        });
    } catch (error) {
        console.error('Error exporting GPG keys:', error);
    }
}

async function pairKeys() {
    try {
        const config = loadConfig();
        const armoredText = execSync('gpg --export --armor').toString();

        if (!armoredText || !armoredText.includes('BEGIN PGP PUBLIC KEY BLOCK')) {
            throw new Error('No armored GPG keys found. Please check your GPG configuration.');
        }

        const keys = await openpgp.readKeys({ armoredKeys: armoredText });

        if (!keys || !Array.isArray(keys) || keys.length === 0) {
            throw new Error('No keys found or the returned value is not an array.');
        }

        const gpgKey = await promptGpgKey(keys);
        const sshKey = await promptSshKey();

        config.key_pairs[gpgKey] = sshKey;
        saveConfig(config);
        console.log(`Paired GPG key ${gpgKey} with SSH key ${sshKey}`);
    } catch (error) {
        console.error('Error pairing keys:', error);
    }
}

async function setDefaultKeys() {
    try {
        const config = loadConfig();
        const armoredText = execSync('gpg --export --armor').toString();

        if (!armoredText || !armoredText.includes('BEGIN PGP PUBLIC KEY BLOCK')) {
            throw new Error('No armored GPG keys found. Please check your GPG configuration.');
        }

        const keys = await openpgp.readKeys({ armoredKeys: armoredText });

        if (!keys || !Array.isArray(keys) || keys.length === 0) {
            throw new Error('No keys found or the returned value is not an array.');
        }

        const gpgKey = await promptGpgKey(keys);
        const sshKey = await promptSshKey();

        config.default_gpg_key = gpgKey;
        config.default_ssh_key = sshKey;
        saveConfig(config);
        console.log(`Set default GPG key to ${gpgKey} and SSH key to ${sshKey}`);
    } catch (error) {
        console.error('Error setting default keys:', error);
    }
}

module.exports = { exportAndAnalyzeGpgKeys, pairKeys, setDefaultKeys };
