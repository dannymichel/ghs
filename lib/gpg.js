const { execSync } = require('child_process');
const openpgp = require('openpgp');
const { promptGpgKey, promptSshKey, promptDefaultKeys, promptSaveKeys } = require('./prompts');
const { loadConfig, saveConfig } = require('./config');

async function exportAndAnalyzeGpgKeys(dryRun = false) {
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

        if (dryRun) {
            console.log('Dry run mode - no changes made.');
        }
    } catch (error) {
        console.error('Error exporting GPG keys:', error);
    }
}

async function saveKeys(dryRun = false) {
    try {
        const config = loadConfig();
        const { configName, gpgKey, sshKey } = await promptSaveKeys();

        if (dryRun) {
            console.log(`Dry run mode - would save GPG key ${gpgKey} and SSH key ${sshKey} as ${configName}`);
        } else {
            config.key_pairs[configName] = { gpgKey, sshKey };
            saveConfig(config);
            console.log(`Saved GPG key ${gpgKey} and SSH key ${sshKey} as ${configName}`);
        }
    } catch (error) {
        console.error('Error saving keys:', error);
    }
}

async function setDefaultKeys(dryRun = false) {
    try {
        const config = loadConfig();
        const { gpgKey, sshKey } = await promptDefaultKeys();

        if (dryRun) {
            console.log(`Dry run mode - setting default GPG key to ${gpgKey} and SSH key to ${sshKey}`);
        } else {
            config.default_gpg_key = gpgKey;
            config.default_ssh_key = sshKey;
            saveConfig(config);
            console.log(`Set default GPG key to ${gpgKey} and SSH key to ${sshKey}`);
        }
    } catch (error) {
        console.error('Error setting default keys:', error);
    }
}

module.exports = { exportAndAnalyzeGpgKeys, saveKeys, setDefaultKeys };
