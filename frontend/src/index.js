import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Index = () => {
    const [darkMode, setDarkMode] = useState(true);

    const theme = useMemo(() =>
        createTheme({
            palette: {
                mode: darkMode ? 'dark' : 'light',
                primary: {
                    main: '#1976d2',
                },
                secondary: {
                    main: '#dc004e',
                },
            },
        }), [darkMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <IconButton
                style={{ position: 'absolute', right: 16, top: 16 }}
                onClick={() => setDarkMode(!darkMode)}
                color="inherit"
            >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <App />
        </ThemeProvider>
    );
};

ReactDOM.render(<Index />, document.getElementById('root'));
