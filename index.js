#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const simpleGit = require('simple-git');
const openpgp = require('openpgp');
let inquirer;

// Configuration file to store key pairs
const CONFIG_FILE = path.join(require('os').homedir(), '.ghs_config.json');

// Load configuration
function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
    return { key_pairs: {}, default_gpg_key: null, default_ssh_key: null };
}

// Save configuration
function saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 4));
}

// Function to export and analyze GPG keys
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

// Pair GPG and SSH keys
async function pairKeys() {
    try {
        const config = loadConfig();
        console.log("Loaded config:", config);
        
        const armoredText = execSync('gpg --export --armor').toString();
        console.log("Exported GPG keys:", armoredText);

        if (!armoredText || !armoredText.includes('BEGIN PGP PUBLIC KEY BLOCK')) {
            throw new Error('No armored GPG keys found. Please check your GPG configuration.');
        }

        const keys = await openpgp.readKeys({ armoredKeys: armoredText });
        console.log("Read keys:", keys);

        if (!keys || !Array.isArray(keys) || keys.length === 0) {
            throw new Error('No keys found or the returned value is not an array.');
        }

        const gpgChoices = keys.map((key, index) => ({
            name: `${key.getKeyID().toHex()} (${key.getUserIDs().join(', ')})`,
            value: key.getKeyID().toHex()
        }));
        console.log("GPG choices:", gpgChoices);

        const { gpgKey } = await inquirer.prompt({
            type: 'list',
            name: 'gpgKey',
            message: 'Select a GPG key:',
            choices: gpgChoices
        });

        const sshDir = path.join(require('os').homedir(), '.ssh');
        const sshKeys = fs.readdirSync(sshDir).filter(file => file.endsWith('.pub'));
        const sshChoices = sshKeys.map((key, index) => ({
            name: key,
            value: path.join(sshDir, key.replace('.pub', ''))
        }));
        console.log("SSH choices:", sshChoices);

        const { sshKey } = await inquirer.prompt({
            type: 'list',
            name: 'sshKey',
            message: 'Select an SSH private key (not .pub):',
            choices: sshChoices
        });

        config.key_pairs[gpgKey] = sshKey;
        saveConfig(config);
        console.log(`Paired GPG key ${gpgKey} with SSH key ${sshKey}`);
    } catch (error) {
        console.error('Error pairing keys:', error);
    }
}

// Clone repository with specified account
async function cloneRepo(url, gpgKey, sshKey) {
    const git = simpleGit();
    const repoDir = path.join(process.cwd(), path.basename(url, '.git'));
    await git.clone(url, repoDir, {
        '--config': `core.sshCommand="ssh -i ${sshKey}"`
    });
    console.log(`Cloned ${url} into ${repoDir}`);
}

// Switch GitHub accounts in a repository
async function switchAccount(repoPath, gpgKey, sshKey) {
    const git = simpleGit(repoPath);
    await git.addConfig('user.signingkey', gpgKey);
    await git.addConfig('core.sshCommand', `ssh -i ${sshKey}`);
    console.log(`Switched account in ${repoPath} to use GPG key ${gpgKey} and SSH key ${sshKey}`);
}

// Set default keys
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

        const sshDir = path.join(require('os').homedir(), '.ssh');
        const sshKeys = fs.readdirSync(sshDir).filter(file => !file.endsWith('.pub'));
        const sshChoices = sshKeys.map((key, index) => ({
            name: key,
            value: path.join(sshDir, key)
        }));

        const { sshKey } = await inquirer.prompt({
            type: 'list',
            name: 'sshKey',
            message: 'Select a default SSH private key:',
            choices: sshChoices
        });

        config.default_gpg_key = gpgKey;
        config.default_ssh_key = sshKey;
        saveConfig(config);
        console.log(`Set default GPG key to ${gpgKey} and SSH key to ${sshKey}`);
    } catch (error) {
        console.error('Error setting default keys:', error);
    }
}

// Main function
async function main() {
    inquirer = (await import('inquirer')).default;

    const { command } = await inquirer.prompt({
        type: 'list',
        name: 'command',
        message: 'Choose a command:',
        choices: ['analyze', 'pair', 'clone', 'switch', 'default']
    });

    switch (command) {
        case 'analyze':
            await exportAndAnalyzeGpgKeys();
            break;
        case 'pair':
            await pairKeys();
            break;
        case 'clone':
            const { url, gpgKey: cloneGpgKey, sshKey: cloneSshKey } = await inquirer.prompt([
                { type: 'input', name: 'url', message: 'Repository URL:' },
                { type: 'input', name: 'gpgKey', message: 'GPG key ID:' },
                { type: 'input', name: 'sshKey', message: 'Path to SSH private key (not .pub):' }
            ]);
            await cloneRepo(url, cloneGpgKey, cloneSshKey);
            break;
        case 'switch':
            const { repoPath, gpgKey: switchGpgKey, sshKey: switchSshKey } = await inquirer.prompt([
                { type: 'input', name: 'repoPath', message: 'Path to the repository:' },
                { type: 'input', name: 'gpgKey', message: 'GPG key ID:' },
                { type: 'input', name: 'sshKey', message: 'Path to SSH private key (not .pub):' }
            ]);
            await switchAccount(repoPath, switchGpgKey, switchSshKey);
            break;
        case 'default':
            await setDefaultKeys();
            break;
        default:
            console.log('Unknown command');
    }
}

main().catch(err => console.error(err));
