import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const Index = () => {
    const [darkMode, setDarkMode] = useState(true);

    const theme = useMemo(() =>
        createTheme({
            typography: {
                fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', \'Oxygen\', \'Ubuntu\', \'Cantarell\', \'Fira Sans\', \'Droid Sans\', \'Helvetica Neue\', sans-serif',
                fontSize: 12,
                button: {
                    textTransform: 'none',
                    fontSize: '12px',
                },
            },
            palette: {
                mode: darkMode ? 'dark' : 'light',
                primary: {
                    main: '#1976d2',
                },
                secondary: {
                    main: '#dc004e',
                },
                background: {
                    default: darkMode ? '#121212' : '#ffffff',
                },
                text: {
                    primary: darkMode ? '#ffffff' : '#000000',
                },
            },
            components: {
                MuiCssBaseline: {
                    styleOverrides: {
                        body: {
                            backgroundColor: darkMode ? '#121212' : '#ffffff',
                            color: darkMode ? '#ffffff' : '#000000',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                        },
                    },
                },
            },
        }), [darkMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App darkMode={darkMode} setDarkMode={setDarkMode} />
        </ThemeProvider>
    );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<Index />);
