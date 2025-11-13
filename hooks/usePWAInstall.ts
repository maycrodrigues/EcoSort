
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

export type PWAInstallPlatform = 'ios' | 'android' | 'other';

export const usePWAInstall = () => {
    const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [platform, setPlatform] = useState<PWAInstallPlatform>('other');
    const [wasDismissed, setWasDismissed] = useLocalStorage('pwa-install-dismissed', false);
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        // Detecção de iOS (iPhone, iPad, iPod)
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        // Detecção de navegador no iOS que não é Safari (ex: Chrome no iOS, que não suporta 'add to homescreen')
        const isNonSafariIOS = isIOS && !/version\/[\d\.]+.*safari/.test(userAgent);

        if (isIOS && !isNonSafariIOS) {
            setPlatform('ios');
        } else if (userAgent.includes('android')) {
            setPlatform('android');
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredInstallPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = useCallback(async () => {
        if (!deferredInstallPrompt) return;
        await deferredInstallPrompt.prompt();
        setDeferredInstallPrompt(null);
    }, [deferredInstallPrompt]);

    const handleDismiss = useCallback(() => {
        setWasDismissed(true);
    }, [setWasDismissed]);

    // O banner só deve ser mostrado se não estivermos no modo standalone,
    // se o usuário não o dispensou antes, e se houver um prompt (para Android) ou for iOS.
    const showInstallBanner = !isStandalone && !wasDismissed && (platform === 'ios' || !!deferredInstallPrompt);

    return {
        showInstallBanner,
        platform,
        handleInstall,
        handleDismiss,
    };
};
