import React from 'react';
import { IoMoon, IoSunny } from 'react-icons/io5';
import { useTheme } from '../context/theme';

function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button type="button" onClick={toggleTheme} className="panel-soft text-main rounded-xl p-2 hover:scale-105 transition" title="Toggle theme">
            {isDark ? <IoSunny size={18} /> : <IoMoon size={18} />}
        </button>
    );
}

export default ThemeToggle;
