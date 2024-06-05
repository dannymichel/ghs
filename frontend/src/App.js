import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, Grid, Box, Paper } from '@mui/material';

const App = () => {
    const [configs, setConfigs] = useState([]);
    const [newConfig, setNewConfig] = useState('');
    const [command, setCommand] = useState('');
    const [response, setResponse] = useState('');
    const [selectedConfig, setSelectedConfig] = useState('');
    const [repositoryUrl, setRepositoryUrl] = useState('');
    const [gpgKey, setGpgKey] = useState('');
    const [sshKey, setSshKey] = useState('');

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const response = await axios.get('http://localhost:9000/configs');
            setConfigs(response.data);
        } catch (error) {
            console.error('Error fetching configurations:', error);
        }
    };

    const addConfig = async () => {
        try {
            const response = await axios.post('http://localhost:9000/configs', { name: newConfig });
            setConfigs([...configs, response.data]);
            setNewConfig('');
        } catch (error) {
            console.error('Error adding configuration:', error);
        }
    };

    const deleteConfig = async (name) => {
        try {
            await axios.delete(`http://localhost:9000/configs/${name}`);
            setConfigs(configs.filter(config => config.name !== name));
        } catch (error) {
            console.error('Error deleting configuration:', error);
        }
    };

    const executeCommand = async () => {
        try {
            let url = `http://localhost:9000/${command}`;
            let data = {};
            let method = 'post';
            if (command === 'list' || command === 'analyze') {
                method = 'get';
            }

            if (command === 'clone') {
                data = { name: selectedConfig, url: repositoryUrl };
            } else if (command === 'save') {
                data = { name: selectedConfig, gpgKey, sshKey };
            } else if (command === 'new') {
                data = { name: selectedConfig, gpgName: gpgKey, gpgEmail: sshKey, gpgPassphrase: 'dummyPass', sshKeyName: 'dummySshKey' };
            } else {
                data = { name: selectedConfig };
            }

            const response = method === 'post' ? await axios.post(url, data) : await axios.get(url);

            if (command === 'list') {
                setResponse(JSON.stringify(response.data, null, 2));
            } else {
                setResponse(`Executed ${command} successfully.`);
            }
        } catch (error) {
            console.error('Error executing command:', error);
            setResponse(`Error executing command: ${error.message}`);
        }
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>GitHub SSH and GPG Key Manager</Typography>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '16px' }}>
                        <Typography variant="h6">Add New Configuration</Typography>
                        <TextField
                            label="New Config Name"
                            value={newConfig}
                            onChange={(e) => setNewConfig(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <Button variant="contained" color="primary" onClick={addConfig}>Add Config</Button>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '16px' }}>
                        <Typography variant="h6">Execute Command</Typography>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Command</InputLabel>
                            <Select
                                value={command}
                                onChange={(e) => setCommand(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="list">List Configs</MenuItem>
                                <MenuItem value="clone">Clone</MenuItem>
                                <MenuItem value="switch">Switch</MenuItem>
                                <MenuItem value="delete">Delete</MenuItem>
                                <MenuItem value="export">Export</MenuItem>
                                <MenuItem value="analyze">Analyze</MenuItem>
                                <MenuItem value="new">New</MenuItem>
                                <MenuItem value="save">Save</MenuItem>
                                <MenuItem value="default">Default</MenuItem>
                            </Select>
                        </FormControl>

                        {(command === 'clone' || command === 'save' || command === 'new' || command === 'switch' || command === 'delete' || command === 'export' || command === 'default') && (
                            <Box>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Configuration</InputLabel>
                                    <Select
                                        value={selectedConfig}
                                        onChange={(e) => setSelectedConfig(e.target.value)}
                                        fullWidth
                                    >
                                        {configs.map(config => (
                                            <MenuItem key={config.name} value={config.name}>{config.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {command === 'clone' && (
                                    <TextField
                                        label="Repository URL"
                                        value={repositoryUrl}
                                        onChange={(e) => setRepositoryUrl(e.target.value)}
                                        fullWidth
                                        margin="normal"
                                    />
                                )}
                                {command === 'save' && (
                                    <Box>
                                        <TextField
                                            label="GPG Key"
                                            value={gpgKey}
                                            onChange={(e) => setGpgKey(e.target.value)}
                                            fullWidth
                                            margin="normal"
                                        />
                                        <TextField
                                            label="SSH Key"
                                            value={sshKey}
                                            onChange={(e) => setSshKey(e.target.value)}
                                            fullWidth
                                            margin="normal"
                                        />
                                    </Box>
                                )}
                                {command === 'new' && (
                                    <Box>
                                        <TextField
                                            label="GPG Name"
                                            value={gpgKey}
                                            onChange={(e) => setGpgKey(e.target.value)}
                                            fullWidth
                                            margin="normal"
                                        />
                                        <TextField
                                            label="GPG Email"
                                            value={sshKey}
                                            onChange={(e) => setSshKey(e.target.value)}
                                            fullWidth
                                            margin="normal"
                                        />
                                        <TextField
                                            label="GPG Passphrase"
                                            value="dummyPass"
                                            disabled
                                            fullWidth
                                            margin="normal"
                                        />
                                        <TextField
                                            label="SSH Key Name"
                                            value="dummySshKey"
                                            disabled
                                            fullWidth
                                            margin="normal"
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}

                        <Button variant="contained" color="primary" onClick={executeCommand}>Execute</Button>
                        {response && (
                            <Box mt={2}>
                                <Typography variant="body1">Response</Typography>
                                <pre>{response}</pre>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '16px' }}>
                        <Typography variant="h6">Existing Configurations</Typography>
                        <ul>
                            {configs.map((config, index) => (
                                <li key={index}>
                                    {config.name}
                                    <Button variant="contained" color="secondary" onClick={() => deleteConfig(config.name)}>Delete</Button>
                                </li>
                            ))}
                        </ul>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default App;
