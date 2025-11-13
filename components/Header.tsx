import React, { useState, useEffect, useRef } from 'react';
import { RecycleIcon, ClockIcon, SunIcon, MoonIcon, ChevronDownIcon } from './Icons';
import { useI18n, Locale } from '../contexts/i18nContext';

interface HeaderProps {
    onHistoryClick: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    historyButtonRef: React.RefObject<HTMLButtonElement>;
}

const LanguageSelector: React.FC = () => {
    const { locale, setLocale, t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const locales: { code: Locale; label: string; name: string }[] = [
        { code: 'pt-BR', label: 'PT', name: 'Português' },
        { code: 'en-US', label: 'EN', name: 'English' },
        { code: 'es-ES', label: 'ES', name: 'Español' },
        { code: 'zh-CN', label: 'ZH', name: '中文' },
    ];
    
    // Fallback para inglês se o local atual não for encontrado
    const currentLocale = locales.find(l => l.code === locale) || locales[1];

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleLanguageSelect = (selectedLocale: Locale) => {
        setLocale(selectedLocale);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                id="language-menu-button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-brand-secondary dark:text-gray-300 font-semibold rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green dark:focus:ring-offset-gray-800"
                aria-haspopup="true"
                aria-controls="language-menu"
                aria-expanded={isOpen}
                aria-label={t('header.changeLanguageAriaLabel')}
            >
                <span className="font-bold w-5 text-center">{currentLocale.label}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div
                    id="language-menu"
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 py-1 z-10 origin-top-right animate-fade-in"
                    style={{ animationDuration: '150ms' }}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="language-menu-button"
                >
                    {locales.map(({ code, name }) => (
                        <button
                            key={code}
                            onClick={() => handleLanguageSelect(code)}
                            className={`w-full text-left px-4 py-2 text-sm text-brand-dark dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${locale === code ? 'font-bold' : ''}`}
                            role="menuitem"
                        >
                            <span>{name}</span>
                             {locale === code && <span className="text-brand-green font-sans">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
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
