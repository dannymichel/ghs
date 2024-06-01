const { execSync } = require('child_process');
const openpgp = require('openpgp');
const { promptGpgKey, promptSshKey, promptDefaultKeys, promptSaveKeys, promptNewKeys, promptDeleteKeys, promptExportKeys } = require('./prompts');
const { loadConfig, saveConfig } = require('./config');
const path = require('path');
const os = require('os');

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
            console.log(`Saving GPG key: ${gpgKey} and SSH key: ${sshKey} as configuration: ${configName}`);
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
            const sshDir = path.join(os.homedir(), '.ssh');
            execSync(`ssh-keygen -t ed25519 -f ${sshDir}/${sshKeyName} -N ""`);

            const gpgKey = `${gpgName} <${gpgEmail}>`;
            const sshKey = `${sshDir}/${sshKeyName}`;
            console.log(`Creating new keys: GPG key: ${gpgKey}, SSH key: ${sshKey}`);
            config.key_pairs[configName] = { gpgKey, sshKey };
            saveConfig(config);
            console.log(`Created and saved GPG key ${gpgName} <${gpgEmail}> and SSH key ${sshKeyName} as ${configName}`);

            // Export and display the new keys
            const armoredText = execSync(`gpg --armor --export ${gpgKey}`).toString();
            console.log(`Here are your keys for configuration: ${configName}`);
            console.log(`GPG Key (${gpgKey}):\n${armoredText}`);

            const sshKeyPath = `${sshKey}.pub`;
            const sshKeyContent = execSync(`cat ${sshKeyPath}`).toString();
            console.log(`SSH Key (${sshKeyPath}):\n${sshKeyContent}`);
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
            console.log(`Deleting configuration: ${configName} with GPG key: ${gpgKey} and SSH key: ${sshKey}`);
            delete config.key_pairs[configName];
            saveConfig(config);
            console.log(`Deleted configuration ${configName}`);

            if (hard) {
                // Get GPG key fingerprints
                const fingerprints = execSync(`gpg --list-keys --with-colons "${gpgKey}" | grep '^fpr' | cut -d: -f10`).toString().trim().split('\n');
                console.log(`Found fingerprints for GPG key: ${gpgKey} - ${fingerprints.join(', ')}`);

                // Delete GPG keys
                fingerprints.forEach(fingerprint => {
                    try {
                        // Attempt to delete secret key
                        try {
                            console.log(`Attempting to delete secret key with fingerprint ${fingerprint}`);
                            execSync(`gpg --batch --yes --delete-secret-keys "${fingerprint}"`);
                        } catch (error) {
                            console.log(`Secret key with fingerprint ${fingerprint} not found or error deleting: ${error.message}`);
                        }
                        // Attempt to delete public key
                        try {
                            console.log(`Attempting to delete public key with fingerprint ${fingerprint}`);
                            execSync(`gpg --batch --yes --delete-keys "${fingerprint}"`);
                        } catch (error) {
                            console.log(`Public key with fingerprint ${fingerprint} not found or error deleting: ${error.message}`);
                        }
                    } catch (error) {
                        console.error(`Error deleting GPG key with fingerprint ${fingerprint}:`, error.message);
                    }
                });

                // Correct the SSH key path
                const sshDir = path.join(os.homedir(), '.ssh');
                const fullSshKeyPath = path.join(sshDir, path.basename(sshKey));
                try {
                    execSync(`rm ${fullSshKeyPath}`);
                    execSync(`rm ${fullSshKeyPath}.pub`);
                    console.log(`Deleted SSH key ${fullSshKeyPath}`);
                } catch (error) {
                    console.error(`Error deleting SSH key ${fullSshKeyPath}:`, error.message);
                }
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

async function exportKeys() {
    try {
        const config = loadConfig();
        const { configName } = await promptExportKeys(config.key_pairs);

        const { gpgKey, sshKey } = config.key_pairs[configName];
        console.log(`Exporting keys for configuration: ${configName} with GPG key: ${gpgKey} and SSH key: ${sshKey}`);

        // Export GPG key
        const armoredText = execSync(`gpg --armor --export ${gpgKey}`).toString();
        console.log(`GPG Key (${gpgKey}):\n${armoredText}`);

        // Show SSH key
        const sshKeyPath = `${sshKey}.pub`;
        const sshKeyContent = execSync(`cat ${sshKeyPath}`).toString();
        console.log(`SSH Key (${sshKeyPath}):\n${sshKeyContent}`);
    } catch (error) {
        console.error('Error exporting keys:', error);
    }
}

module.exports = { exportAndAnalyzeGpgKeys, saveKeys, setDefaultKeys, createNewKeys, deleteKeys, listConfigs, exportKeys };
