# ghs - GitHub SSH and GPG Key Manager

`ghs` is a command-line tool to manage SSH and GPG keys for GitHub accounts. It allows you to analyze, pair, and set default keys for your repositories.

## Features

- Export and analyze GPG keys
- Pair GPG and SSH keys
- Clone repositories with specified SSH and GPG keys
- Switch GitHub accounts in a repository
- Set default GPG and SSH keys

## Installation

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

## Usage

You can use the `ghs` command to perform various tasks. Here are the available commands:

### Analyze GPG Keys

Export and analyze your GPG keys.

```bash
ghs
```

Choose the `analyze` command from the list.

### Pair GPG and SSH Keys

Pair your GPG and SSH keys for use with GitHub.

```bash
ghs
```

Choose the `pair` command from the list.

### Clone Repository

Clone a GitHub repository using specified SSH and GPG keys.

```bash
ghs
```

Choose the `clone` command from the list and provide the repository URL, GPG key ID, and SSH key path.

### Switch GitHub Accounts

Switch the GitHub account in a repository to use a different set of SSH and GPG keys.

```bash
ghs
```

Choose the `switch` command from the list and provide the repository path, GPG key ID, and SSH key path.

### Set Default Keys

Set default GPG and SSH keys for your operations.

```bash
ghs
```

Choose the `default` command from the list and select the GPG and SSH keys.

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
- **lib/gpg.js**: Functions for exporting, analyzing, and pairing GPG keys.
- **lib/ssh.js**: Functions for managing SSH keys.
- **lib/git.js**: Functions for cloning repositories and switching accounts.
- **lib/prompts.js**: User prompts for various operations.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.