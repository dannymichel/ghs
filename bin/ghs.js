#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { exportAndAnalyzeGpgKeys, saveKeys, setDefaultKeys, createNewKeys, deleteKeys } = require('../lib/gpg');
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
    .command('save', 'Save a new GPG and SSH key pair configuration', {}, async (args) => {
        await saveKeys(args.dryRun);
    })
    .command('new', 'Create a new GPG and SSH key pair', {}, async (args) => {
        await createNewKeys(args.dryRun);
    })
    .command('delete', 'Delete a saved GPG and SSH key pair configuration', {}, async (args) => {
        await deleteKeys(args.dryRun);
    })
    .command('clone', 'Clone a repository', {}, async (args) => {
        const cloneDetails = await promptClone();
        await cloneRepo(cloneDetails.url, cloneDetails.gpgKey, cloneDetails.sshKey, args.dryRun);
    })
    .command('switch', 'Switch GitHub accounts using saved configuration', {}, async (args) => {
        const switchDetails = await promptSwitch();
        await switchAccount(switchDetails.configName, args.dryRun);
    })
    .command('default', 'Set default GPG and SSH keys', {}, async (args) => {
        await setDefaultKeys(args.dryRun);
    })
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .argv;
