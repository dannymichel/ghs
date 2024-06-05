import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
    const [configs, setConfigs] = useState([]);
    const [newConfigName, setNewConfigName] = useState('');
    const [newGpgKey, setNewGpgKey] = useState('');
    const [newSshKey, setNewSshKey] = useState('');
    const [selectedConfig, setSelectedConfig] = useState('');
    const [message, setMessage] = useState('');

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
            const response = await axios.post('http://localhost:9000/configs', {
                name: newConfigName,
                gpgKey: newGpgKey,
                sshKey: newSshKey
            });
            setConfigs([...configs, response.data]);
            setNewConfigName('');
            setNewGpgKey('');
            setNewSshKey('');
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

    const switchConfig = async () => {
        try {
            const response = await axios.post('http://localhost:9000/switch', { configName: selectedConfig });
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error switching configuration:', error);
        }
    };

    const analyzeGpgKeys = async () => {
        try {
            const response = await axios.get('http://localhost:9000/analyze');
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error analyzing GPG keys:', error);
        }
    };

    const setDefaultKeys = async () => {
        try {
            const response = await axios.post('http://localhost:9000/default', { gpgKey: newGpgKey, sshKey: newSshKey });
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error setting default keys:', error);
        }
    };

    return (
        <div>
            <h1>Configurations</h1>
            <div>
                <h2>Add New Config</h2>
                <input
                    type="text"
                    value={newConfigName}
                    onChange={(e) => setNewConfigName(e.target.value)}
                    placeholder="New config name"
                />
                <input
                    type="text"
                    value={newGpgKey}
                    onChange={(e) => setNewGpgKey(e.target.value)}
                    placeholder="New GPG key"
                />
                <input
                    type="text"
                    value={newSshKey}
                    onChange={(e) => setNewSshKey(e.target.value)}
                    placeholder="New SSH key"
                />
                <button onClick={addConfig}>Add Config</button>
            </div>
            <div>
                <h2>Saved Configurations</h2>
                <ul>
                    {configs.map((config, index) => (
                        <li key={index}>
                            {config.name} - GPG Key: {config.gpgKey}, SSH Key: {config.sshKey}
                            <button onClick={() => deleteConfig(config.name)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>Switch Configuration</h2>
                <select onChange={(e) => setSelectedConfig(e.target.value)}>
                    <option value="">Select Config</option>
                    {configs.map((config, index) => (
                        <option key={index} value={config.name}>
                            {config.name}
                        </option>
                    ))}
                </select>
                <button onClick={switchConfig}>Switch Config</button>
            </div>
            <div>
                <h2>Analyze GPG Keys</h2>
                <button onClick={analyzeGpgKeys}>Analyze</button>
            </div>
            <div>
                <h2>Set Default Keys</h2>
                <input
                    type="text"
                    value={newGpgKey}
                    onChange={(e) => setNewGpgKey(e.target.value)}
                    placeholder="GPG key"
                />
                <input
                    type="text"
                    value={newSshKey}
                    onChange={(e) => setNewSshKey(e.target.value)}
                    placeholder="SSH key"
                />
                <button onClick={setDefaultKeys}>Set Default Keys</button>
            </div>
            {message && <div><h3>Message</h3><p>{message}</p></div>}
        </div>
    );
};

export default App;
