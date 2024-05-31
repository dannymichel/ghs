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
        choices: ['analyze', 'save', 'new', 'clone', 'switch', 'default']
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

    return { gpgKey, sshKey };
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

    const { gpgKey } = await inquirer.prompt({
        type: 'input',
        name: 'gpgKey',
        message: 'Enter the name and email for the new GPG key (e.g., "John Doe <john@example.com>"):'
    });

    const { sshKey } = await inquirer.prompt({
        type: 'input',
        name: 'sshKey',
        message: 'Enter the name for the new SSH key (e.g., id_rsa_github):'
    });

    return { configName, gpgKey, sshKey };
}

module.exports = { promptCommand, promptGpgKey, promptSshKey, promptClone, promptSwitch, promptDefaultKeys, promptSaveKeys, promptNewKeys };
