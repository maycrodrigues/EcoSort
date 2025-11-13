import React from 'react';
import { RecycleIcon, ClockIcon, SunIcon, MoonIcon } from './Icons';
import { useI18n } from '../contexts/i18nContext';

interface HeaderProps {
    onHistoryClick: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    historyButtonRef: React.RefObject<HTMLButtonElement>;
}

const LanguageSelector: React.FC = () => {
    const { locale, setLocale } = useI18n();

    const handleLanguageChange = () => {
        const newLocale = locale === 'pt-BR' ? 'en-US' : 'pt-BR';
        setLocale(newLocale);
    };

    return (
        <button
            onClick={handleLanguageChange}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-brand-secondary dark:text-gray-300 font-semibold rounded-lg transition-all duration-200 hover:scale-105"
            aria-label={`Change language to ${locale === 'pt-BR' ? 'English' : 'Português'}`}
        >
            <span className="font-bold">{locale === 'pt-BR' ? 'PT' : 'EN'}</span>
        </button>
    );
};


export const Header: React.FC<HeaderProps> = ({ onHistoryClick, theme, toggleTheme, historyButtonRef }) => {
    const { t } = useI18n();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
            <RecycleIcon className="h-8 w-8 text-brand-green mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark dark:text-white tracking-tight">
            EcoSort <span className="text-brand-secondary dark:text-gray-400 font-light hidden sm:inline">| {t('header.subtitle')}</span>
            </h1>
        </div>
        <div className="flex items-center gap-2">
            <LanguageSelector />
            <button 
                ref={historyButtonRef}
                onClick={onHistoryClick}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-brand-secondary dark:text-gray-300 font-semibold rounded-lg transition-all duration-200 hover:scale-105"
            >
                <ClockIcon className="w-5 h-5"/>
                <span className="hidden sm:inline">{t('header.history')}</span>
            </button>
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-brand-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green dark:focus:ring-offset-gray-800 transition-all duration-200 hover:scale-105"
                aria-label={t('header.toggleTheme', { theme: theme === 'light' ? 'dark' : 'light' })}
            >
                {theme === 'light' ? <MoonIcon className="w-6 h-6"/> : <SunIcon className="w-6 h-6"/>}
            </button>
        </div>
      </div>
    </header>
  );
};