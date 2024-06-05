import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import './index.css';

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
        <Container maxWidth="sm">
            <h1>Configurations</h1>
            <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                value={newConfig}
                onChange={(e) => setNewConfig(e.target.value)}
                placeholder="New config name"
            />
            <Button
                variant="contained"
                color="primary"
                onClick={addConfig}
                disabled={!newConfig}
            >
                Add Config
            </Button>
            <List>
                {configs.map((config, index) => (
                    <ListItem key={index} divider>
                        <ListItemText primary={config.name} />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete" onClick={() => deleteConfig(config.name)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default App;
