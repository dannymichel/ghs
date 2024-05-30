const path = require('path');
const fs = require('fs');

function getSshKeys() {
    const sshDir = path.join(require('os').homedir(), '.ssh');
    return fs.readdirSync(sshDir).filter(file => !file.endsWith('.pub')).map(file => ({
        name: file,
        value: path.join(sshDir, file)
    }));
}

module.exports = { getSshKeys };
