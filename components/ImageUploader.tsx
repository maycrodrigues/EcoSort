
import React, { useRef, useCallback, useState } from 'react';
import { UploadIcon, XCircleIcon } from './Icons';
import { useI18n } from '../contexts/i18nContext';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  imagePreview: string | null;
  onClear: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, imagePreview, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useI18n();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onFileSelect(event.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleClearClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClear();
    if (fileInputRef.current) {
      // Reseta o valor do input de arquivo. Isso permite selecionar o mesmo arquivo novamente.
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerFileInput();
    }
  };

  const activeDragClasses = isDragging 
    ? 'border-brand-green bg-green-50 dark:bg-green-900/50 scale-105' 
    : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50';

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-center text-brand-dark dark:text-white mb-4">{t('imageUploader.title')}</h2>
      <div 
        className={`relative w-full aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-300 ${activeDragClasses}`}
        onClick={triggerFileInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={t('imageUploader.dragDrop')}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/jpeg, image/png, image/webp"
          tabIndex={-1}
        />
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg p-2 animate-fade-in" />
            <button 
              onClick={handleClearClick} 
              className="absolute top-3 right-3 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-all transform hover:scale-110"
              aria-label={t('imageUploader.clearAriaLabel')}
            >
              <XCircleIcon className="w-8 h-8"/>
            </button>
          </>
        ) : (
          <div className="text-center text-brand-secondary dark:text-gray-400 p-4 flex flex-col items-center pointer-events-none">
            <UploadIcon className="w-16 h-16 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
            <p className="font-semibold">{t('imageUploader.dragDrop')}</p>
            <p className="text-sm mt-1">{t('imageUploader.fileTypes')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
