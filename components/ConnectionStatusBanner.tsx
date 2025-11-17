
import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useI18n } from '../contexts/i18nContext';
import { SignalSlashIcon } from './Icons';

export const ConnectionStatusBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t } = useI18n();

  if (isOnline) {
    return null;
  }

  return (
    <div 
        className="w-full bg-yellow-500 text-white text-center p-2 flex items-center justify-center text-sm font-semibold"
        role="status"
    >
      <SignalSlashIcon className="w-5 h-5 mr-2" />
      {t('app.offlineBanner')}
    </div>
  );
};
