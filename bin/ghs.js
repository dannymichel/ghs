#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { exportAndAnalyzeGpgKeys, pairKeys, setDefaultKeys } = require('../lib/gpg');
const { cloneRepo, switchAccount } = require('../lib/git');
const { promptClone, promptSwitch } = require('../lib/prompts');

const argv = yargs(hideBin(process.argv))
    .option('dry-run', {
        type: 'boolean',
        description: 'Run the command in dry-run mode',
        default: false,
    })
    .command('analyze', 'Export and analyze GPG keys', {}, async (args) => {
        await exportAndAnalyzeGpgKeys(args.dryRun);
    })
    .command('pair', 'Pair GPG and SSH keys', {}, async (args) => {
        await pairKeys(args.dryRun);
    })
    .command('clone', 'Clone a repository', {}, async (args) => {
        const cloneDetails = await promptClone();
        await cloneRepo(cloneDetails.url, cloneDetails.gpgKey, cloneDetails.sshKey, args.dryRun);
    })
    .command('switch', 'Switch GitHub accounts in a repository', {}, async (args) => {
        const switchDetails = await promptSwitch();
        await switchAccount(switchDetails.repoPath, switchDetails.gpgKey, switchDetails.sshKey, args.dryRun);
    })
    .command('default', 'Set default GPG and SSH keys', {}, async (args) => {
        await setDefaultKeys(args.dryRun);
    })
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .argv;
