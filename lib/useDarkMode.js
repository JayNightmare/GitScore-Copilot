/**
 * Custom hook for managing dark mode state
 * Persists preference in localStorage and applies to document
 */

import { useState, useEffect } from 'react';

export const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check for saved preference or default to light mode
        const savedMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedMode !== null) {
            setDarkMode(savedMode === 'true');
        } else {
            setDarkMode(prefersDark);
        }
    }, []);

    useEffect(() => {
        // Apply dark mode class to document
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return { darkMode, toggleDarkMode };
};
