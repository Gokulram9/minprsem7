import { useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import Button from './ui/button';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      onClick={toggleTheme}
      className="gap-2 px-4"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
    </Button>
  );
};

export default ThemeToggle;
