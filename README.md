# ghs - GitHub SSH and GPG Key Manager

`ghs` is a command-line tool to manage SSH and GPG keys for GitHub accounts. It allows you to analyze, save configurations, create new keys, delete configurations, and switch between them easily.

## Features

- Export and analyze GPG keys
- Save and name GPG and SSH key configurations
- Create new GPG and SSH key pairs
- Clone repositories with specified SSH and GPG keys
- Switch GitHub accounts using saved configurations
- Set default GPG and SSH keys
- Delete saved configurations
- List all saved configurations
- Dry-run mode for simulating commands without making changes

## Installation

### From the Repository

1. Clone the repository:

    ```bash
    git clone https://github.com/dannymichel/ghs.git
    ```

2. Navigate to the project directory:

    ```bash
    cd ghs
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

4. Link the package globally:

    ```bash
    npm link
    ```

### Global Installation via npm

You can install the tool globally using npm:

```bash
npm install -g ghs-cli-tool
```

## Usage

You can use the `ghs` command to perform various tasks. Here are the available commands:

### Analyze GPG Keys

Export and analyze your GPG keys.

```bash
ghs analyze
```

### Save GPG and SSH Key Configuration

Save a new GPG and SSH key pair configuration.

```bash
ghs save
```

### Create New GPG and SSH Key Pair

Create a new GPG and SSH key pair.

```bash
ghs new
```

### Clone Repository

Clone a GitHub repository using specified SSH and GPG keys.

```bash
ghs clone
```

### Switch GitHub Accounts

Switch the GitHub account using a saved configuration.

```bash
ghs switch
```

### Set Default Keys

Set default GPG and SSH keys for your operations.

```bash
ghs default
```

### Delete Saved Configuration

Delete a saved GPG and SSH key pair configuration. Use the `--hard` option to delete both the configuration and the actual keys.

```bash
ghs delete
ghs delete --hard
```

### List All Saved Configurations

List all saved configurations.

```bash
ghs list
```

### Dry-Run Mode

Simulate commands without making changes using the `--dry-run` option.

```bash
ghs clone --dry-run
ghs switch --dry-run
ghs default --dry-run
ghs new --dry-run
ghs save --dry-run
ghs delete --dry-run
```

## Directory Structure

```
ghs/
│
├── bin/
│   └── ghs.js
├── lib/
│   ├── config.js
│   ├── gpg.js
│   ├── ssh.js
│   ├── git.js
│   └── prompts.js
└── package.json
```

- **bin/ghs.js**: Entry point for the CLI tool.
- **lib/config.js**: Handles loading and saving configuration.
- **lib/gpg.js**: Functions for exporting, analyzing, saving, creating, setting default, and deleting GPG keys.
- **lib/ssh.js**: Functions for managing SSH keys.
- **lib/git.js**: Functions for cloning repositories and switching accounts.
- **lib/prompts.js**: User prompts for various operations.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any

 improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.