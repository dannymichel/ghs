const { execSync } = require('child_process');
const openpgp = require('openpgp');
const { promptGpgKey, promptSshKey, promptDefaultKeys, promptSaveKeys, promptNewKeys, promptDeleteKeys } = require('./prompts');
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
        const { gpgKey, sshKey, userName, userEmail } = await promptDefaultKeys();

        if (dryRun) {
            console.log(`Dry run mode - setting default GPG key to ${gpgKey}, SSH key to ${sshKey}, name to ${userName}, and email to ${userEmail}`);
        } else {
            config.default_gpg_key = gpgKey;
            config.default_ssh_key = sshKey;
            saveConfig(config);
            console.log(`Set default GPG key to ${gpgKey}, SSH key to ${sshKey}, name to ${userName}, and email to ${userEmail}`);

            // Update ~/.gitconfig
            execSync(`git config --global user.signingkey "${gpgKey}"`);
            execSync(`git config --global user.name "${userName}"`);
            execSync(`git config --global user.email "${userEmail}"`);
            execSync(`git config --global core.sshCommand "ssh -i ${sshKey}"`);
            console.log(`Updated ~/.gitconfig with GPG key ${gpgKey}, name ${userName}, email ${userEmail}, and SSH key ${sshKey}`);
        }
    } catch (error) {
        console.error('Error setting default keys:', error);
    }
}

async function createNewKeys(dryRun = false) {
    try {
        const config = loadConfig();
        const { configName, gpgName, gpgEmail, gpgPassphrase, sshKeyName } = await promptNewKeys();

        if (dryRun) {
            console.log(`Dry run mode - would create and save GPG key ${gpgName} <${gpgEmail}> and SSH key ${sshKeyName} as ${configName}`);
        } else {
            // Create new GPG key
            execSync(`gpg --batch --passphrase ${gpgPassphrase} --quick-gen-key "${gpgName} <${gpgEmail}>" default default 0`);

            // Create new SSH key
            execSync(`ssh-keygen -t ed25519 -f ~/.ssh/${sshKeyName} -N ""`);

            const gpgKey = `${gpgName} <${gpgEmail}>`;
            const sshKey = sshKeyName;
            config.key_pairs[configName] = { gpgKey, sshKey };
            saveConfig(config);
            console.log(`Created and saved GPG key ${gpgName} <${gpgEmail}> and SSH key ${sshKeyName} as ${configName}`);
        }
    } catch (error) {
        console.error('Error creating new keys:', error);
    }
}

async function deleteKeys(dryRun = false, hard = false) {
    try {
        const config = loadConfig();
        const { configName } = await promptDeleteKeys(config.key_pairs);

        if (dryRun) {
            console.log(`Dry run mode - would delete configuration ${configName}`);
        } else {
            const { gpgKey, sshKey } = config.key_pairs[configName];
            delete config.key_pairs[configName];
            saveConfig(config);
            console.log(`Deleted configuration ${configName}`);

            if (hard) {
                // Get GPG key fingerprint
                const fingerprint = execSync(`gpg --list-keys --with-colons "${gpgKey}" | grep '^fpr' | cut -d: -f10`).toString().trim();

                // Delete GPG key
                execSync(`gpg --batch --yes --delete-secret-keys "${fingerprint}"`);
                execSync(`gpg --batch --yes --delete-keys "${fingerprint}"`);

                // Delete SSH key
                execSync(`rm ~/.ssh/${sshKey}`);
                execSync(`rm ~/.ssh/${sshKey}.pub`);
                console.log(`Deleted GPG key ${gpgKey} and SSH key ${sshKey}`);
            }
        }
    } catch (error) {
        console.error('Error deleting configuration:', error);
    }
}

async function listConfigs() {
    try {
        const config = loadConfig();
        console.log('Saved configurations:');
        for (const [configName, { gpgKey, sshKey }] of Object.entries(config.key_pairs)) {
            console.log(`${configName}: GPG Key - ${gpgKey}, SSH Key - ${sshKey}`);
        }
    } catch (error) {
        console.error('Error listing configurations:', error);
    }
}

module.exports = { exportAndAnalyzeGpgKeys, saveKeys, setDefaultKeys, createNewKeys, deleteKeys, listConfigs };
