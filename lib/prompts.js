const inquirer = require('inquirer');
const { getSshKeys } = require('./ssh');
const { execSync } = require('child_process');
const openpgp = require('openpgp');
const { loadConfig } = require('./config');

async function promptCommand() {
    return await inquirer.prompt({
        type: 'list',
        name: 'command',
        message: 'Choose a command:',
        choices: ['analyze', 'save', 'clone', 'switch', 'default']
    });
}

async function promptGpgKey(keys) {
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
    const config = loadConfig();
    const configNames = Object.keys(config.key_pairs);

    return await inquirer.prompt([
        { type: 'list', name: 'configName', message: 'Select a configuration:', choices: configNames }
    ]);
}

async function promptDefaultKeys() {
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

module.exports = { promptCommand, promptGpgKey, promptSshKey, promptClone, promptSwitch, promptDefaultKeys, promptSaveKeys };
