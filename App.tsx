
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { analyzeImage, analyzeTextQuery, getExpandedContent } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import type { AnalysisResult, HistoryItem, EducationalContent } from './types';
import { SparklesIcon, PhotoIcon, ChatBubbleLeftRightIcon } from './components/Icons';
import { Toast } from './components/Toast';
import { TextQueryInput } from './components/TextQueryInput';
import { useLocalStorage } from './hooks/useLocalStorage';
import { HistoryModal } from './components/HistoryModal';
import { useDarkMode } from './hooks/useDarkMode';
import { useI18n } from './contexts/i18nContext';
import { EducationalModal } from './components/EducationalModal';

interface ToastState {
  message: string;
  type: 'error' | 'info';
}

type AnalysisMode = 'image' | 'text';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [mode, setMode] = useState<AnalysisMode>('image');
  const [textQuery, setTextQuery] = useState('');
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('analysisHistory', []);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [theme, toggleTheme] = useDarkMode();
  const { t, locale } = useI18n();
  const [analysisStatus, setAnalysisStatus] = useState('');
  
  const [isEducationalModalOpen, setIsEducationalModalOpen] = useState(false);
  const [educationalContent, setEducationalContent] = useState<EducationalContent | null>(null);
  const [isEducationalContentLoading, setIsEducationalContentLoading] = useState(false);

  const historyButtonRef = useRef<HTMLButtonElement>(null);
  const prevIsHistoryOpen = useRef(isHistoryOpen);

  useEffect(() => {
    // Retorna o foco ao botão de Histórico quando o modal é fechado.
    if (prevIsHistoryOpen.current && !isHistoryOpen) {
      historyButtonRef.current?.focus();
    }
    prevIsHistoryOpen.current = isHistoryOpen;
  }, [isHistoryOpen]);

  const showToast = (message: string, type: 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // Limite de 4MB
        showToast(t('toast.fileTooLarge'), "error");
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setAnalysisResult(null);
    setIsLoading(false);
    setTextQuery('');
  }

  const handleClear = useCallback(() => {
    resetState();
  }, [imagePreview]);

  const handleModeChange = (newMode: AnalysisMode) => {
    if(mode !== newMode) {
      resetState();
      setMode(newMode);
    }
  }

  const handleAnalyzeClick = async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    setAnalysisStatus(t('app.ariaLive.loading'));
    let result: AnalysisResult | null = null;

    try {
      if (mode === 'image') {
        if (!selectedFile) {
          showToast(t('toast.selectImage'), "error");
          setIsLoading(false);
          return;
        }
        const { base64, mimeType } = await fileToBase64(selectedFile);
        result = await analyzeImage(base64, mimeType, {
          prompt: t('gemini.imagePrompt'),
          error: t('gemini.imageError'),
        });
      } else { // mode === 'text'
        if (!textQuery.trim()) {
          showToast(t('toast.enterQuestion'), "error");
          setIsLoading(false);
          return;
        }
        result = await analyzeTextQuery(textQuery, {
          prompt: t('gemini.textPrompt'),
          error: t('gemini.textError'),
        });
      }
      
      if (result) {
        setAnalysisResult(result);
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          result: result,
        };
        setHistory([newHistoryItem, ...history]);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('toast.unknownError');
      showToast(`${t('toast.analysisFailed')}: ${errorMessage}. ${t('toast.tryAgainLater')}`, "error");
    } finally {
      setIsLoading(false);
      setAnalysisStatus(t('app.ariaLive.complete'));
    }
  };

  const handleLearnMore = async (fact: string) => {
    setIsEducationalModalOpen(true);
    setIsEducationalContentLoading(true);
    setEducationalContent({ title: fact, content: '' }); // Mostra o título imediatamente
    try {
      const expandedContent = await getExpandedContent(fact, {
        prompt: t('gemini.educationalPrompt'),
        error: t('gemini.educationalError'),
      });
      setEducationalContent({ title: fact, content: expandedContent });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('toast.unknownError');
      showToast(`${errorMessage}. ${t('toast.tryAgainLater')}`, "error");
      setIsEducationalModalOpen(false); // Fecha o modal em caso de erro
    } finally {
      setIsEducationalContentLoading(false);
    }
  };
  
  const isAnalyzeButtonDisabled = () => {
    if (isLoading) return true;
    if (mode === 'image') return !selectedFile;
    if (mode === 'text') return !textQuery.trim();
    return true;
  }
  
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setAnalysisResult(item.result);
    setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setIsHistoryOpen(false);
  };
  
  const shouldShowAnalysisPanel = isLoading || analysisResult !== null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-brand-dark dark:text-gray-200 font-sans transition-colors duration-300">
      <div aria-live="polite" className="sr-only">
        {analysisStatus}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Header 
        onHistoryClick={() => setIsHistoryOpen(true)} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        historyButtonRef={historyButtonRef} 
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />
      <EducationalModal
        isOpen={isEducationalModalOpen}
        onClose={() => setIsEducationalModalOpen(false)}
        content={educationalContent}
        isLoading={isEducationalContentLoading}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8 w-full">
        <div className={`grid grid-cols-1 ${shouldShowAnalysisPanel ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-8 items-start transition-all duration-500`}>
          
          {/* Coluna da Esquerda */}
          <div className={`w-full flex flex-col items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 ${!shouldShowAnalysisPanel ? 'lg:max-w-2xl lg:mx-auto' : ''}`}>
            
            {/* Seletor de Modo */}
            <div className="w-full flex justify-center p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                <button onClick={() => handleModeChange('image')} className={`w-1/2 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'image' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                    <PhotoIcon className="w-5 h-5"/>
                    {t('app.imageAnalysis')}
                </button>
                <button onClick={() => handleModeChange('text')} className={`w-1/2 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'text' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                    <ChatBubbleLeftRightIcon className="w-5 h-5"/>
                    {t('app.textQuery')}
                </button>
            </div>
            
            <div key={mode} className="w-full animate-fade-in">
              {mode === 'image' ? (
                <ImageUploader
                  onFileSelect={handleFileChange}
                  imagePreview={imagePreview}
                  onClear={handleClear}
                />
              ) : (
                <TextQueryInput
                  query={textQuery}
                  onQueryChange={setTextQuery}
                />
              )}
            </div>

            <button
                onClick={handleAnalyzeClick}
                disabled={isAnalyzeButtonDisabled()}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-brand-green hover:bg-green-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 disabled:bg-green-300 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-4 focus:ring-green-300"
            >
                <SparklesIcon className="w-6 h-6" />
                <span className="text-lg">{isLoading ? t('app.analyzingButton') : t('app.analyzeButton')}</span>
            </button>
          </div>

          {/* Coluna da Direita */}
          {shouldShowAnalysisPanel && (
            <div className="w-full flex flex-col p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 min-h-[400px] md:min-h-[610px] animate-slide-in-right">
              <AnalysisDisplay
                  result={analysisResult}
                  isLoading={isLoading}
                  onLearnMore={handleLearnMore}
                />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
