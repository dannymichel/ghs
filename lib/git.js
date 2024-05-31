const simpleGit = require('simple-git');
const path = require('path');

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

async function switchAccount(repoPath, gpgKey, sshKey, dryRun = false) {
    const git = simpleGit(repoPath);

    if (dryRun) {
        console.log(`Dry run mode - would switch account in ${repoPath} to use GPG key ${gpgKey} and SSH key ${sshKey}`);
        return;
    }

    // Set the GIT_SSH_COMMAND environment variable
    process.env.GIT_SSH_COMMAND = `ssh -i ${sshKey}`;

    try {
        await git.addConfig('user.signingkey', gpgKey);
        await git.addConfig('core.sshCommand', `ssh -i ${sshKey}`);
        console.log(`Switched account in ${repoPath} to use GPG key ${gpgKey} and SSH key ${sshKey}`);
    } catch (error) {
        console.error('Error switching account:', error);
    }
}

module.exports = { cloneRepo, switchAccount };
