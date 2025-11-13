
import React from 'react';
import type { AnalysisResult, MultiItemAnalysisResult, SingleItemAnalysisResult, TextAnalysisResult } from '../types';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, GlobeAltIcon, TrashIcon, ChatBubbleLeftRightIcon, CubeTransparentIcon, BookOpenIcon } from './Icons';
import { useI18n } from '../contexts/i18nContext';

interface AnalysisDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  onLearnMore: (fact: string) => void;
}

const Spinner: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="flex flex-col items-center justify-center text-center text-brand-secondary dark:text-gray-400 h-full">
            <svg className="animate-spin h-12 w-12 text-brand-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-semibold">{t('analysis.spinnerTitle')}</p>
            <p className="text-sm">{t('analysis.spinnerSubtitle')}</p>
        </div>
    );
}

const RecyclableBadge: React.FC<{ recyclable: boolean; wasteType: string }> = ({ recyclable, wasteType }) => {
    const { t } = useI18n();
    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full inline-flex items-center gap-2";
    const statusText = recyclable ? t('analysis.recyclable') : t('analysis.notRecyclable');
    const Icon = recyclable ? CheckCircleIcon : XCircleIcon;

    const colorClasses = recyclable
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    
    // Verifica se o wasteType é redundante com o status de reciclável.
    const recyclableText = t('analysis.recyclable').toLowerCase();
    const notRecyclableText = t('analysis.notRecyclable').toLowerCase();
    const isWasteTypeRedundant = wasteType.toLowerCase() === recyclableText || wasteType.toLowerCase() === notRecyclableText;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className={`${baseClasses} ${colorClasses}`}>
                <Icon className="w-5 h-5"/>
                {statusText}
            </span>
            {!isWasteTypeRedundant && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                    {wasteType}
                </span>
            )}
        </div>
    );
};

const InfoBlock: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    children: React.ReactNode; 
    colorClass: string; 
    onClick?: () => void;
}> = ({ icon, title, children, colorClass, onClick }) => {
    const InteractiveWrapper = onClick ? 'button' : 'div';
    const { t } = useI18n();

    return (
        <InteractiveWrapper
            onClick={onClick}
            className={`w-full p-3 rounded-lg border text-left ${colorClass} transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''}`}
            aria-label={onClick ? t('analysis.learnMore') : undefined}
        >
            <div className="flex items-start">
                <span className="mr-3 mt-1 flex-shrink-0">{icon}</span>
                <div className="flex-grow">
                    <h4 className="font-bold text-md">{title}</h4>
                    <p className="text-sm">{children}</p>
                </div>
                {onClick && <BookOpenIcon className="w-6 h-6 ml-2 text-current opacity-70 flex-shrink-0" />}
            </div>
        </InteractiveWrapper>
    );
};

const ItemResultCard: React.FC<{ item: SingleItemAnalysisResult; onLearnMore: (fact: string) => void; }> = ({ item, onLearnMore }) => {
    const { t } = useI18n();
    return (
        <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-brand-dark dark:text-white">{item.itemName}</h3>
            <RecyclableBadge recyclable={item.recyclable} wasteType={item.wasteType} />
             <InfoBlock 
                icon={<TrashIcon className="w-6 h-6 text-blue-600 dark:text-blue-400"/>} 
                title={t('analysis.disposalSuggestion')}
                colorClass="bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-200"
            >
                {item.disposalSuggestion}
            </InfoBlock>
            <InfoBlock 
                icon={<InformationCircleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400"/>} 
                title={t('analysis.aiReasoning')}
                colorClass="bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-900/50 dark:border-indigo-700 dark:text-indigo-200"
            >
                {item.reasoning}
            </InfoBlock>
             {item.environmentalImpact && (
                <InfoBlock 
                    icon={<GlobeAltIcon className="w-6 h-6 text-teal-600 dark:text-teal-400"/>} 
                    title={t('analysis.didYouKnow')}
                    colorClass="bg-teal-50 border-teal-200 text-teal-900 dark:bg-teal-900/50 dark:border-teal-700 dark:text-teal-200"
                    onClick={() => onLearnMore(item.environmentalImpact)}
                >
                    {item.environmentalImpact}
                </InfoBlock>
            )}
        </div>
    );
};


const ImageResultDisplay: React.FC<{ result: MultiItemAnalysisResult; onLearnMore: (fact: string) => void; }> = ({ result, onLearnMore }) => {
    const { t } = useI18n();
    const itemCount = result.items.length;

    return (
    <div className="flex flex-col gap-4 text-left w-full">
        <div className="text-center border-b dark:border-gray-600 pb-3 animate-slide-up-fade">
            <h3 className="text-xl font-bold text-brand-dark dark:text-white">
                {itemCount > 0 
                    ? t('analysis.itemsFound', { count: itemCount })
                    : t('analysis.noItemsFound.title')
                }
            </h3>
        </div>
        
        {itemCount > 0 ? (
            <div className="space-y-4">
                {result.items.map((item, index) => (
                    <div 
                        key={index} 
                        className="animate-slide-up-fade" 
                        style={{ animationDelay: `${100 + index * 100}ms` }}
                    >
                        <ItemResultCard item={item} onLearnMore={onLearnMore} />
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center text-brand-secondary dark:text-gray-400 p-8 animate-slide-up-fade">
                <CubeTransparentIcon className="w-16 h-16 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                <p>{t('analysis.noItemsFound.description')}</p>
            </div>
        )}
    </div>
)};

const TextResultDisplay: React.FC<{ result: TextAnalysisResult; onLearnMore: (fact: string) => void; }> = ({ result, onLearnMore }) => {
    const { t } = useI18n();
    return (
    <div className="flex flex-col gap-5 text-left w-full animate-slide-up-fade">
        <div className="text-center border-b dark:border-gray-600 pb-4">
            <h3 className="text-sm font-semibold text-brand-secondary dark:text-gray-400 uppercase tracking-wider">{t('analysis.yourQuestion')}</h3>
            <p className="text-xl font-bold text-brand-dark dark:text-white mt-1 italic">"{result.question}"</p>
        </div>
        
        <div style={{ animationDelay: `100ms` }} className="animate-slide-up-fade">
            <InfoBlock 
                icon={<ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600 dark:text-purple-400"/>} 
                title={t('analysis.aiAnswer')}
                colorClass="bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-900/50 dark:border-purple-700 dark:text-purple-200"
            >
                {result.answer}
            </InfoBlock>
        </div>
        <div style={{ animationDelay: `200ms` }} className="animate-slide-up-fade">
            <InfoBlock 
                icon={<TrashIcon className="w-6 h-6 text-blue-600 dark:text-blue-400"/>} 
                title={t('analysis.disposalSuggestion')}
                colorClass="bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-200"
            >
                {result.disposalSuggestion}
            </InfoBlock>
        </div>
        {result.environmentalImpact && (
            <div style={{ animationDelay: `300ms` }} className="animate-slide-up-fade">
                <InfoBlock 
                    icon={<GlobeAltIcon className="w-6 h-6 text-teal-600 dark:text-teal-400"/>} 
                    title={t('analysis.didYouKnow')}
                    colorClass="bg-teal-50 border-teal-200 text-teal-900 dark:bg-teal-900/50 dark:border-teal-700 dark:text-teal-200"
                    onClick={() => onLearnMore(result.environmentalImpact)}
                >
                    {result.environmentalImpact}
                </InfoBlock>
            </div>
        )}
    </div>
)};

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, isLoading, onLearnMore }) => {
  const { t } = useI18n();
  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }
    
    if (result) {
        if (result.queryType === 'image') {
            return <ImageResultDisplay result={result} onLearnMore={onLearnMore} />;
        }
        if (result.queryType === 'text') {
            return <TextResultDisplay result={result} onLearnMore={onLearnMore} />;
        }
    }

    return null;
  };
  
  return (
    <div className="h-full w-full flex flex-col">
        <h2 className="text-xl font-semibold text-center text-brand-dark dark:text-white mb-4">{t('analysis.title')}</h2>
        <div className="flex-grow bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-center overflow-y-auto">
           {renderContent()}
        </div>
    </div>
  );
};
