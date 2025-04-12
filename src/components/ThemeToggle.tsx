
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Switch } from './ui/switch';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Sun size={18} className={`transition-opacity ${theme === 'dark' ? 'opacity-50' : 'opacity-100'}`} />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
        aria-label="Toggle dark mode"
      />
      <Moon size={18} className={`transition-opacity ${theme === 'light' ? 'opacity-50' : 'opacity-100'}`} />
    </div>
  );
};
