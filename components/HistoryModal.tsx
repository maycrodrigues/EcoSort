
import React, { useEffect, useRef } from 'react';
import type { HistoryItem } from '../types';
import { PhotoIcon, ChatBubbleLeftRightIcon, TrashIcon, XCircleIcon } from './Icons';
import { useI18n } from '../contexts/i18nContext';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const HistoryItemCard: React.FC<{ item: HistoryItem; onSelect: () => void; animationDelay: number }> = ({ item, onSelect, animationDelay }) => {
    const { t, locale } = useI18n();
    const { result } = item;
    const isImageQuery = result.queryType === 'image';
    const Icon = isImageQuery ? PhotoIcon : ChatBubbleLeftRightIcon;
    
    let title = '';
    if (result.queryType === 'image') {
        if (result.items.length > 0) {
            title = result.items.map(i => i.itemName).join(', ');
        } else {
            title = t('history.imageAnalysisNoItems');
        }
    } else {
        title = result.question;
    }

    return (
        <button 
            onClick={onSelect}
            className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-sm animate-slide-up-fade"
            style={{ animationDelay: `${animationDelay}ms`, opacity: 0 }} // opacity 0 for animation start
        >
            <Icon className="w-6 h-6 mr-4 text-brand-secondary dark:text-gray-400 flex-shrink-0" />
            <div className="flex-grow overflow-hidden">
                <p className="font-semibold text-brand-dark dark:text-gray-200 truncate">{title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.timestamp).toLocaleString(locale.replace('_', '-'))}
                </p>
            </div>
        </button>
    );
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onSelectItem, onClearHistory }) => {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const modalNode = modalRef.current;
    if (!modalNode) return;

    const focusableElements = Array.from(
      modalNode.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) { // Shift+Tab
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);


  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
    >
      <div 
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg m-4 max-h-[80vh] flex flex-col animate-slide-up-fade"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 id="history-modal-title" className="text-xl font-bold text-brand-dark dark:text-white">{t('history.title')}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-110" aria-label={t('history.closeAriaLabel')}>
            <XCircleIcon className="w-6 h-6"/>
          </button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((item, index) => (
                <HistoryItemCard 
                    key={item.id} 
                    item={item} 
                    onSelect={() => onSelectItem(item)} 
                    animationDelay={index * 50}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="font-semibold">{t('history.empty.title')}</p>
              <p className="text-sm">{t('history.empty.subtitle')}</p>
            </div>
          )}
        </div>

        {history.length > 0 && (
            <div className="p-4 border-t dark:border-gray-700">
                <button 
                    onClick={onClearHistory}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/50 dark:hover:bg-red-900 dark:text-red-300 font-semibold rounded-lg transition-all duration-200 hover:scale-105 text-sm"
                >
                    <TrashIcon className="w-5 h-5"/>
                    {t('history.clearButton')}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};