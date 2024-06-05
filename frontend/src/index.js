import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { IconButton } from '@mui/material';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

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
                {darkMode ? <WbSunnyIcon /> : <NightlightRoundIcon />}
            </IconButton>
            <App />
        </ThemeProvider>
    );
};

ReactDOM.render(<Index />, document.getElementById('root'));
