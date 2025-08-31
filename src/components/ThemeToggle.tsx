import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="p-2 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-green-500/30 hover:bg-gray-100 dark:hover:bg-black transition-colors duration-300"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-gray-600 dark:text-green-400" />
      ) : (
        <Sun className="w-4 h-4 text-green-600 dark:text-green-400" />
      )}
    </Button>
  );
};
