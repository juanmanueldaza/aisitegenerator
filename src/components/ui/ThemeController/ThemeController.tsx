import React from 'react';
import { useTheme } from '../ThemeProvider';
import type { Theme } from '../ThemeProvider';

interface ThemeControllerProps {
  className?: string;
}

export const ThemeController: React.FC<ThemeControllerProps> = ({ className = '' }) => {
  const { theme, setTheme, availableThemes } = useTheme();

  const themeLabels: Record<Theme, string> = {
    light: 'Light',
    dark: 'Dark',
    aisite: 'AI Site',
    cupcake: 'Cupcake',
    bumblebee: 'Bumblebee',
    emerald: 'Emerald',
    corporate: 'Corporate',
    synthwave: 'Synthwave',
    retro: 'Retro',
    cyberpunk: 'Cyberpunk',
    valentine: 'Valentine',
    halloween: 'Halloween',
    garden: 'Garden',
    forest: 'Forest',
    aqua: 'Aqua',
    lofi: 'Lo-fi',
    pastel: 'Pastel',
    fantasy: 'Fantasy',
    wireframe: 'Wireframe',
    black: 'Black',
    luxury: 'Luxury',
    dracula: 'Dracula',
    cmyk: 'CMYK',
    autumn: 'Autumn',
    business: 'Business',
    acid: 'Acid',
    lemonade: 'Lemonade',
    night: 'Night',
    coffee: 'Coffee',
    winter: 'Winter',
  };

  return (
    <div className={`dropdown dropdown-end ${className}`}>
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2"
        >
          <path
            d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.59-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.592zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"
            fill="currentColor"
          />
        </svg>
        Theme
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
        {availableThemes.map((themeOption) => (
          <li key={themeOption}>
            <a
              className={theme === themeOption ? 'active' : ''}
              onClick={() => setTheme(themeOption)}
            >
              {themeLabels[themeOption]}
              {theme === themeOption && (
                <svg
                  className="w-4 h-4 ml-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThemeController;
