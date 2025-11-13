import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'light' | 'dark';

export function useDarkMode(): [Theme, () => void] {
  // Inicializa com a preferência do sistema se nenhum valor estiver armazenado
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return [theme, toggleTheme];
}
