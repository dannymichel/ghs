import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
    const [configs, setConfigs] = useState([]);
    const [newConfig, setNewConfig] = useState('');

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

    return (
        <div>
            <h1>Configurations</h1>
            <input 
                type="text" 
                value={newConfig} 
                onChange={(e) => setNewConfig(e.target.value)} 
                placeholder="New config name" 
            />
            <button onClick={addConfig}>Add Config</button>
            <ul>
                {configs.map((config, index) => (
                    <li key={index}>
                        {config.name}
                        <button onClick={() => deleteConfig(config.name)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
