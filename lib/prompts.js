const inquirer = require('inquirer');
const { getSshKeys } = require('./ssh');
const { execSync } = require('child_process');
const openpgp = require('openpgp');

async function promptCommand() {
    return await inquirer.prompt({
        type: 'list',
        name: 'command',
        message: 'Choose a command:',
        choices: ['analyze', 'pair', 'clone', 'switch', 'default']
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
    return await inquirer.prompt([
        { type: 'input', name: 'url', message: 'Repository URL:' },
        { type: 'input', name: 'gpgKey', message: 'GPG key ID:' },
        { type: 'input', name: 'sshKey', message: 'Path to SSH private key (not .pub):' }
    ]);
}

async function promptSwitch() {
    return await inquirer.prompt([
        { type: 'input', name: 'repoPath', message: 'Path to the repository:' },
        { type: 'input', name: 'gpgKey', message: 'GPG key ID:' },
        { type: 'input', name: 'sshKey', message: 'Path to SSH private key (not .pub):' }
    ]);
}

async function promptDefaultKeys() {
    const armoredText = execSync('gpg --export --armor').toString();
    const keys = await openpgp.readKeys({ armoredKeys: armoredText });

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
        throw new Error('No keys found or the returned value is not an array.');
    }

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

module.exports = { promptCommand, promptGpgKey, promptSshKey, promptClone, promptSwitch, promptDefaultKeys };
