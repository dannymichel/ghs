const { getSshKeys } = require('./ssh');
const { execSync } = require('child_process');
const openpgp = require('openpgp');
const { loadConfig } = require('./config');

async function loadInquirer() {
    const inquirer = await import('inquirer');
    return inquirer.default;
}

async function promptCommand() {
    const inquirer = await loadInquirer();
    return await inquirer.prompt({
        type: 'list',
        name: 'command',
        message: 'Choose a command:',
        choices: ['analyze', 'save', 'new', 'clone', 'switch', 'default', 'delete', 'list', 'export']
    });
}

async function promptGpgKey(keys) {
    const inquirer = await loadInquirer();
    const gpgChoices = keys.map(key => ({
        name: `${key.getKeyID().toHex()} (${key.getUserIDs().join(', ')})`,
        value: key.getKeyID().toHex()
    }));
    const { gpgKey } = await inquirer.prompt({
        type: 'list',
        name: 'gpgKey',
        message: 'Select a GPG key:',
        choices: gpgChoices
    });
    return gpgKey;
}

async function promptSshKey() {
    const inquirer = await loadInquirer();
    const sshChoices = getSshKeys();
    const { sshKey } = await inquirer.prompt({
        type: 'list',
        name: 'sshKey',
        message: 'Select an SSH private key (not .pub):',
        choices: sshChoices
    });
    return sshKey;
}

async function promptClone() {
    const inquirer = await loadInquirer();
    const armoredText = execSync('gpg --export --armor').toString();
    const keys = await openpgp.readKeys({ armoredKeys: armoredText });

    return await inquirer.prompt([
        { type: 'input', name: 'url', message: 'Repository URL:' },
        { type: 'list', name: 'gpgKey', message: 'Select a GPG key:', choices: keys.map(key => ({
            name: `${key.getKeyID().toHex()} (${key.getUserIDs().join(', ')})`,
            value: key.getKeyID().toHex()
        })) },
        { type: 'list', name: 'sshKey', message: 'Select an SSH private key:', choices: getSshKeys() }
    ]);
}

async function promptSwitch() {
    const inquirer = await loadInquirer();
    const config = loadConfig();
    const configNames = Object.keys(config.key_pairs);

    return await inquirer.prompt([
        { type: 'list', name: 'configName', message: 'Select a configuration:', choices: configNames }
    ]);
}

async function promptDefaultKeys() {
    const inquirer = await loadInquirer();
    const armoredText = execSync('gpg --export --armor').toString();
    const keys = await openpgp.readKeys({ armoredKeys: armoredText });

    const gpgChoices = keys.map((key, index) => ({
        name: `${key.getKeyID().toHex()} (${key.getUserIDs().join(', ')})`,
        value: key.getKeyID().toHex()
    }));

    const { gpgKey } = await inquirer.prompt({
        type: 'list',
        name: 'gpgKey',
        message: 'Select a default GPG key:',
        choices: gpgChoices
    });

    const sshChoices = getSshKeys();
    const { sshKey } = await inquirer.prompt({
        type: 'list',
        name: 'sshKey',
        message: 'Select a default SSH private key:',
        choices: sshChoices
    });

    const { userName } = await inquirer.prompt({
        type: 'input',
        name: 'userName',
        message: 'Enter your name:'
    });

    const { userEmail } = await inquirer.prompt({
        type: 'input',
        name: 'userEmail',
        message: 'Enter your email:'
    });

    return { gpgKey, sshKey, userName, userEmail };
}

async function promptSaveKeys() {
    const inquirer = await loadInquirer();
    const armoredText = execSync('gpg --export --armor').toString();
    const keys = await openpgp.readKeys({ armoredKeys: armoredText });

    const gpgChoices = keys.map(key => ({
        name: `${key.getKeyID().toHex()} (${key.getUserIDs().join(', ')})`,
        value: key.getKeyID().toHex()
    }));

    const sshChoices = getSshKeys();

    const { configName } = await inquirer.prompt({
        type: 'input',
        name: 'configName',
        message: 'Enter a name for this configuration:'
    });

    const { gpgKey } = await inquirer.prompt({
        type: 'list',
        name: 'gpgKey',
        message: 'Select a GPG key:',
        choices: gpgChoices
    });

    const { sshKey } = await inquirer.prompt({
        type: 'list',
        name: 'sshKey',
        message: 'Select an SSH private key:',
        choices: sshChoices
    });

    return { configName, gpgKey, sshKey };
}

async function promptNewKeys() {
    const inquirer = await loadInquirer();
    const { configName } = await inquirer.prompt({
        type: 'input',
        name: 'configName',
        message: 'Enter a name for this configuration:'
    });

    const { gpgName } = await inquirer.prompt({
        type: 'input',
        name: 'gpgName',
        message: 'Enter the name for the new GPG key:'
    });

    const { gpgEmail } = await inquirer.prompt({
        type: 'input',
        name: 'gpgEmail',
        message: 'Enter the email for the new GPG key:'
    });

    const { gpgPassphrase } = await inquirer.prompt({
        type: 'password',
        name: 'gpgPassphrase',
        message: 'Enter the passphrase for the new GPG key:'
    });

    const { sshKeyName } = await inquirer.prompt({
        type: 'input',
        name: 'sshKeyName',
        message: 'Enter the name for the new SSH key (e.g., id_ed25519_github):'
    });

    return { configName, gpgName, gpgEmail, gpgPassphrase, sshKeyName };
}

async function promptDeleteKeys(configKeys) {
    const inquirer = await loadInquirer();
    const configChoices = Object.keys(configKeys).map(name => ({ name, value: name }));

    return await inquirer.prompt({
        type: 'list',
        name: 'configName',
        message: 'Select a configuration to delete:',
        choices: configChoices
    });
}

async function promptExportKeys(configKeys) {
    const inquirer = await loadInquirer();
    const configChoices = Object.keys(configKeys).map(name => ({ name, value: name }));

    return await inquirer.prompt({
        type: 'list',
        name: 'configName',
        message: 'Select a configuration to export:',
        choices: configChoices
    });
}

module.exports = { promptCommand, promptGpgKey, promptSshKey, promptClone, promptSwitch, promptDefaultKeys, promptSaveKeys, promptNewKeys, promptDeleteKeys, promptExportKeys };
