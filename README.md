# ghs - GitHub SSH and GPG Key Manager

`ghs` is a command-line tool and GUI to manage SSH and GPG keys for GitHub accounts. It allows you to analyze, save configurations, create new keys, delete configurations, and switch between them easily.

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
- Modern GUI with dark and light modes

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

3. Install the dependencies for the backend and frontend:

    ```bash
    npm install
    cd frontend
    npm install
    cd ../backend
    npm install
    cd ..
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

Save a new GPG and SSH key pair configuration. You can either pass the configuration name, GPG key, and SSH key directly as arguments, or run the command without arguments to select from options interactively.

```bash
ghs save [configName] [gpgKey] [sshKey]
```

or

```bash
ghs save
```

### Create New GPG and SSH Key Pair

Create a new GPG and SSH key pair. You can either pass the necessary details directly as arguments, or run the command without arguments to provide details interactively.

```bash
ghs new [configName] [gpgName] [gpgEmail] [gpgPassphrase] [sshKeyName]
```

or

```bash
ghs new
```

### Clone Repository

Clone a GitHub repository using specified SSH and GPG keys. You can either pass the URL, GPG key, and SSH key directly as arguments, or run the command without arguments to select from options interactively.

```bash
ghs clone [url] [gpgKey] [sshKey]
```

or

```bash
ghs clone
```

### Switch GitHub Accounts

Switch the GitHub account using a saved configuration. You can either pass the configuration name directly as an argument, or run the command without arguments to select from options interactively.

```bash
ghs switch [configName]
```

or

```bash
ghs switch
```

### Set Default Keys

Set default GPG and SSH keys for your operations. You can either pass the GPG key, SSH key, user name, and user email directly as arguments, or run the command without arguments to provide details interactively.

```bash
ghs default [gpgKey] [sshKey] [userName] [userEmail]
```

or

```bash
ghs default
```

### Delete Saved Configuration

Delete a saved GPG and SSH key pair configuration. Use the `--hard` option to delete both the configuration and the actual keys. You can either pass the configuration name directly as an argument, or run the command without arguments to select from options interactively.

```bash
ghs delete [configName]
ghs delete --hard [configName]
```

or

```bash
ghs delete
ghs delete --hard
```

### List All Saved Configurations

List all saved configurations.

```bash
ghs list
```

### Export GPG and SSH Keys

Export GPG and SSH keys for a saved configuration. You can either pass the configuration name directly as an argument, or run the command without arguments to select from options interactively.

```bash
ghs export [configName]
```

or

```bash
ghs export
```

### Dry-Run Mode

Simulate commands without making changes using the `--dry-run` option.

```bash
ghs clone --dry-run [url] [gpgKey] [sshKey]
ghs switch --dry-run [configName]
ghs default --dry-run [gpgKey] [sshKey] [userName] [userEmail]
ghs new --dry-run [configName] [gpgName] [gpgEmail] [gpgPassphrase] [sshKeyName]
ghs save --dry-run [configName] [gpgKey] [sshKey]
ghs delete --dry-run [configName]
ghs delete --hard --dry-run [configName]
```

### Running the GUI

To run the GUI for managing your configurations, use the following command:

```bash
npm start
```

This will start both the frontend and backend servers. You can then access the GUI in your browser at `http://localhost:3000`.

## Directory Structure

```
ghs/
│
├── bin/
│   └── ghs.js
├── backend/
│   ├── index.js
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── themes.js
│   │   ├── ...
│   └── package.json
├── lib/
│   ├── config.js
│   ├── gpg.js
│   ├── ssh.js
│   ├── git.js
│   └── prompts.js
└── package.json
```

- **bin/ghs.js**: Entry point for the CLI tool.
- **backend/index.js**: Entry point for the backend server.
- **frontend/**: Contains the frontend React application.
  - **public/**: Static assets for the frontend.
  - **src/**: Source code for the frontend.
    - **App.js**: Main application component.
    - **index.js**: Entry point for the React application.
    - **themes.js**: Contains theme configurations for light and dark modes.
- **lib/config.js**: Handles loading and saving configuration.
- **lib/gpg.js**: Functions for exporting, analyzing, saving, creating, setting default, and deleting GPG keys.
- **lib/ssh.js**: Functions for managing SSH keys.
- **lib/git.js**: Functions for cloning repositories and switching accounts.
- **lib/prompts.js**: User prompts for various operations.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.