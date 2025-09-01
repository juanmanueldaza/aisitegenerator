import React from 'react';

interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const themes = [
    { name: 'light', label: 'Light', icon: '☀️' },
    { name: 'dark', label: 'Dark', icon: '🌙' },
    { name: 'cupcake', label: 'Cupcake', icon: '🧁' },
    { name: 'bumblebee', label: 'Bumblebee', icon: '🐝' },
    { name: 'emerald', label: 'Emerald', icon: '💚' },
    { name: 'corporate', label: 'Corporate', icon: '🏢' },
    { name: 'synthwave', label: 'Synthwave', icon: '🌃' },
    { name: 'retro', label: 'Retro', icon: '📻' },
    { name: 'cyberpunk', label: 'Cyberpunk', icon: '🤖' },
    { name: 'valentine', label: 'Valentine', icon: '💖' },
    { name: 'halloween', label: 'Halloween', icon: '🎃' },
    { name: 'garden', label: 'Garden', icon: '🌸' },
    { name: 'forest', label: 'Forest', icon: '🌲' },
    { name: 'aqua', label: 'Aqua', icon: '💧' },
    { name: 'lofi', label: 'Lo-fi', icon: '🎵' },
    { name: 'pastel', label: 'Pastel', icon: '🎨' },
    { name: 'fantasy', label: 'Fantasy', icon: '🧚' },
    { name: 'wireframe', label: 'Wireframe', icon: '📐' },
    { name: 'black', label: 'Black', icon: '⚫' },
    { name: 'luxury', label: 'Luxury', icon: '💎' },
    { name: 'dracula', label: 'Dracula', icon: '🧛' },
    { name: 'cmyk', label: 'CMYK', icon: '🎭' },
    { name: 'autumn', label: 'Autumn', icon: '🍂' },
    { name: 'business', label: 'Business', icon: '💼' },
    { name: 'acid', label: 'Acid', icon: '🧪' },
    { name: 'lemonade', label: 'Lemonade', icon: '🍋' },
    { name: 'night', label: 'Night', icon: '🌙' },
    { name: 'coffee', label: 'Coffee', icon: '☕' },
    { name: 'winter', label: 'Winter', icon: '❄️' },
  ];

  const setTheme = (themeName: string) => {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
  };

  // Load theme from localStorage on component mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  return (
    <div className={`dropdown dropdown-end ${className}`}>
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <svg
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="inline-block h-5 w-5 stroke-current md:h-6 md:w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
          ></path>
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg max-h-96 overflow-y-auto"
      >
        {themes.map((theme) => (
          <li key={theme.name}>
            <button onClick={() => setTheme(theme.name)} className="flex items-center gap-2">
              <span className="text-lg">{theme.icon}</span>
              <span>{theme.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
