
import React from 'react';
import { XCircleIcon } from './Icons';
import { useI18n } from '../contexts/i18nContext';

interface TextQueryInputProps {
  query: string;
  onQueryChange: (query: string) => void;
}

const MAX_CHARS = 500;

export const TextQueryInput: React.FC<TextQueryInputProps> = ({ query, onQueryChange }) => {
  const { t } = useI18n();
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onQueryChange(e.target.value.slice(0, MAX_CHARS));
  };
  
  return (
    <div className="w-full flex flex-col">
      <h2 className="text-xl font-semibold text-center text-brand-dark dark:text-white mb-4">{t('textQuery.title')}</h2>
      <div className="relative w-full">
        <textarea
          value={query}
          onChange={handleQueryChange}
          placeholder={t('textQuery.placeholder')}
          className="w-full h-48 p-4 pr-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-brand-dark dark:text-gray-200 focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors resize-none placeholder-gray-400 dark:placeholder-gray-500"
          aria-label={t('textQuery.ariaLabel')}
          maxLength={MAX_CHARS}
        />
        {query.length > 0 && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all duration-200 hover:scale-125"
            aria-label={t('textQuery.clearAriaLabel')}
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        )}
      </div>
      <div className="w-full flex justify-between items-start text-xs text-gray-500 dark:text-gray-400 mt-2">
        <div className="flex-1">
          <p className='font-semibold'>{t('textQuery.examples.title')}</p>
          <ul className="list-disc list-inside">
              <li>"{t('textQuery.examples.ex1')}"</li>
              <li>"{t('textQuery.examples.ex2')}"</li>
              <li>"{t('textQuery.examples.ex3')}"</li>
          </ul>
        </div>
        <span className={`flex-shrink-0 font-medium ${query.length >= MAX_CHARS ? 'text-red-500' : ''}`}>
          {query.length} / {MAX_CHARS}
        </span>
      </div>
    </div>
  );
};