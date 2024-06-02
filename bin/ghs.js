#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const {
    exportAndAnalyzeGpgKeys,
    saveKeys,
    setDefaultKeys,
    createNewKeys,
    deleteKeys,
    listConfigs,
    exportKeys
} = require('../lib/gpg');
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
    .command('clone [url] [gpgKey] [sshKey]', 'Clone a repository', {}, async (args) => {
        if (!args.url || !args.gpgKey || !args.sshKey) {
            const cloneDetails = await promptClone();
            args.url = args.url || cloneDetails.url;
            args.gpgKey = args.gpgKey || cloneDetails.gpgKey;
            args.sshKey = args.sshKey || cloneDetails.sshKey;
        }
        await cloneRepo(args.url, args.gpgKey, args.sshKey, args.dryRun);
    })
    .command('switch [configName]', 'Switch GitHub accounts using saved configuration', {}, async (args) => {
        if (!args.configName) {
            const switchDetails = await promptSwitch();
            args.configName = args.configName || switchDetails.configName;
        }
        await switchAccount(args.configName, args.dryRun);
    })
    .command('default', 'Set default GPG and SSH keys', {}, async (args) => {
        await setDefaultKeys(args.dryRun);
    })
    .command('delete [configName]', 'Delete a saved GPG and SSH key pair configuration', {
        hard: {
            type: 'boolean',
            description: 'Delete both the configuration and the actual keys',
            default: false,
        }
    }, async (args) => {
        await deleteKeys(args.dryRun, args.hard, args.configName);
    })
    .command('list', 'List all saved configurations', {}, async () => {
        await listConfigs();
    })
    .command('export [configName]', 'Export GPG and SSH keys for a saved configuration', {}, async (args) => {
        await exportKeys(args.configName);
    })
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .argv;
