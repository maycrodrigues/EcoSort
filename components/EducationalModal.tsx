import React, { useEffect, useRef } from 'react';
import { useI18n } from '../contexts/i18nContext';
import { XCircleIcon } from './Icons';
import type { EducationalContent } from '../types';

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: EducationalContent | null;
  isLoading: boolean;
}

const LoadingSpinner: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-8">
            <svg className="animate-spin h-8 w-8 text-brand-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 font-semibold">{t('educationalModal.loading')}</p>
        </div>
    );
};

export const EducationalModal: React.FC<EducationalModalProps> = ({ isOpen, onClose, content, isLoading }) => {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const modalNode = modalRef.current;
    if (!modalNode) return;
    
    const focusableElements = Array.from(
      modalNode.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])')
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            // FIX: Cast to HTMLElement to ensure 'focus' method is available.
            (lastElement as HTMLElement)?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            // FIX: Cast to HTMLElement to ensure 'focus' method is available.
            (firstElement as HTMLElement)?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Foca no botão de fechar ao abrir
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="educational-modal-title"
    >
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 max-h-[80vh] flex flex-col animate-slide-up-fade"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 border-b dark:border-gray-700">
          <h2 id="educational-modal-title" className="text-xl font-bold text-brand-dark dark:text-white">{t('educationalModal.title')}</h2>
          <button ref={closeButtonRef} onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-110" aria-label={t('history.closeAriaLabel')}>
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow p-6 overflow-y-auto text-gray-700 dark:text-gray-300 space-y-4">
          {content && <p className="font-bold text-lg italic text-brand-dark dark:text-white">"{content.title}"</p>}
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p>{content?.content}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};