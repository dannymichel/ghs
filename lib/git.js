const simpleGit = require('simple-git');
const path = require('path');
const { loadConfig } = require('./config');

async function cloneRepo(url, gpgKey, sshKey, dryRun = false) {
    const git = simpleGit();
    const repoDir = path.join(process.cwd(), path.basename(url, '.git'));

    if (dryRun) {
        console.log(`Dry run mode - would clone ${url} into ${repoDir} using SSH key ${sshKey}`);
        return;
    }

    // Set the GIT_SSH_COMMAND environment variable
    process.env.GIT_SSH_COMMAND = `ssh -i ${sshKey}`;

    try {
        await git.clone(url, repoDir);
        console.log(`Cloned ${url} into ${repoDir}`);
    } catch (error) {
        console.error('Error cloning repository:', error);
    }
}

async function switchAccount(configName, dryRun = false) {
    const config = loadConfig();
    const keyPair = config.key_pairs[configName];
    if (!keyPair) {
        console.error(`No configuration found with name ${configName}`);
        return;
    }

    const git = simpleGit(process.cwd());
    const { gpgKey, sshKey } = keyPair;

    if (dryRun) {
        console.log(`Dry run mode - would switch account to use GPG key ${gpgKey} and SSH key ${sshKey}`);
        return;
    }

    // Set the GIT_SSH_COMMAND environment variable
    process.env.GIT_SSH_COMMAND = `ssh -i ${sshKey}`;

    try {
        await git.addConfig('user.signingkey', gpgKey);
        await git.addConfig('core.sshCommand', `ssh -i ${sshKey}`);
        console.log(`Switched account to use GPG key ${gpgKey} and SSH key ${sshKey}`);
    } catch (error) {
        console.error('Error switching account:', error);
    }
}

module.exports = { cloneRepo, switchAccount };
