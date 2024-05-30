#!/usr/bin/env node

const { exportAndAnalyzeGpgKeys, pairKeys, setDefaultKeys } = require('../lib/gpg');
const { cloneRepo, switchAccount } = require('../lib/git');
const { promptCommand, promptClone, promptSwitch } = require('../lib/prompts');

async function main() {
    try {
        const { command } = await promptCommand();

        switch (command) {
            case 'analyze':
                await exportAndAnalyzeGpgKeys();
                break;
            case 'pair':
                await pairKeys();
                break;
            case 'clone':
                const cloneDetails = await promptClone();
                await cloneRepo(cloneDetails.url, cloneDetails.gpgKey, cloneDetails.sshKey);
                break;
            case 'switch':
                const switchDetails = await promptSwitch();
                await switchAccount(switchDetails.repoPath, switchDetails.gpgKey, switchDetails.sshKey);
                break;
            case 'default':
                await setDefaultKeys();
                break;
            default:
                console.log('Unknown command');
        }
    } catch (err) {
        console.error(err);
    }
}

main();
