
import React, { useEffect, useRef } from 'react';
import { useI18n } from '../contexts/i18nContext';
import { XCircleIcon } from './Icons';
import type { LocationState } from '../types';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationState | null;
}

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, location }) => {
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
            (lastElement as HTMLElement)?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            (firstElement as HTMLElement)?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !location) return null;

  const { lat, lon } = location;
  // Bounding box for the iframe view, creating a small zoom area around the marker.
  const bbox = `${lon - 0.005},${lat - 0.005},${lon + 0.005},${lat + 0.005}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-modal-title"
    >
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 h-[70vh] flex flex-col animate-slide-up-fade"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 border-b dark:border-gray-700">
          <h2 id="map-modal-title" className="text-xl font-bold text-brand-dark dark:text-white">{t('mapModal.title')}</h2>
          <button ref={closeButtonRef} onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-110" aria-label={t('mapModal.closeAriaLabel')}>
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow p-1 overflow-hidden">
            <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={mapUrl}
                title={t('mapModal.title')}
                style={{ border: 0, borderRadius: '0 0 1rem 1rem' }}
            ></iframe>
        </div>
      </div>
    </div>
  );
};
