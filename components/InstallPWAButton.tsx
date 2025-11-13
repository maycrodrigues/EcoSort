
import React from 'react';
import { useI18n } from '../contexts/i18nContext';
import { ArrowDownTrayIcon, XCircleIcon, ShareIcon } from './Icons';
import type { PWAInstallPlatform } from '../hooks/usePWAInstall';

interface InstallPWAButtonProps {
    platform: PWAInstallPlatform;
    onInstall: () => void;
    onDismiss: () => void;
}

export const InstallPWAButton: React.FC<InstallPWAButtonProps> = ({ platform, onInstall, onDismiss }) => {
    const { t } = useI18n();
    const isIOS = platform === 'ios';

    return (
        <div 
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700 animate-slide-up-fade"
            role="dialog"
            aria-labelledby="pwa-install-title"
            aria-describedby="pwa-install-description"
        >
            <button 
                onClick={onDismiss} 
                className="absolute -top-2 -right-2 p-1 bg-gray-200 dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-all transform hover:scale-110"
                aria-label={t('history.closeAriaLabel')}
            >
                <XCircleIcon className="w-6 h-6"/>
            </button>

            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 p-3 bg-brand-green/20 rounded-lg">
                    <img src="/icon.svg" alt="EcoSort Icon" className="w-8 h-8"/>
                </div>
                <div className="flex-grow">
                    <h3 id="pwa-install-title" className="font-bold text-brand-dark dark:text-white">
                        {isIOS ? t('pwaInstall.iosTitle') : t('pwaInstall.title')}
                    </h3>
                    <p id="pwa-install-description" className="text-sm text-brand-secondary dark:text-gray-400">
                        {isIOS ? t('pwaInstall.iosDescription') : t('pwaInstall.description')}
                    </p>
                </div>
                {!isIOS ? (
                    <button
                        onClick={onInstall}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span className="text-sm">{t('pwaInstall.installButton')}</span>
                    </button>
                ) : (
                    <div className="flex-shrink-0 p-2 border-2 border-brand-green rounded-md">
                        <ShareIcon className="w-6 h-6 text-brand-green" />
                    </div>
                )}
            </div>
        </div>
    );
};
