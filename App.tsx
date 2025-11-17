

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { analyzeImage, analyzeTextQuery, getExpandedContent, generateSpeech } from './services/geminiService';
import { fileToBase64, createImagePreview } from './utils/fileUtils';
import { getGPSData } from './utils/exifUtils';
import type { AnalysisResult, HistoryItem, EducationalContent, ImageHistoryItem, TextHistoryItem, LocationState, MultiItemAnalysisResult } from './types';
import { SparklesIcon, PhotoIcon, ChatBubbleLeftRightIcon } from './components/Icons';
import { Toast } from './components/Toast';
import { TextQueryInput } from './components/TextQueryInput';
import { useLocalStorage } from './hooks/useLocalStorage';
import { HistoryModal } from './components/HistoryModal';
import { useDarkMode } from './hooks/useDarkMode';
import { useI18n } from './contexts/i18nContext';
import { EducationalModal } from './components/EducationalModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { ConnectionStatusBanner } from './components/ConnectionStatusBanner';
import { MapModal } from './components/MapModal';
import { decode, decodeAudioData } from './utils/audioUtils';

interface ToastState {
  message: string;
  type: 'error' | 'info';
}

type AnalysisMode = 'image' | 'text';

interface AudioState {
  itemId: string | null;
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
}

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Blob URL for performance
  const [historyImagePreview, setHistoryImagePreview] = useState<string | null>(null); // Data URL for storage
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [mode, setMode] = useState<AnalysisMode>('image');
  const [textQuery, setTextQuery] = useState('');
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('analysisHistory', []);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [theme, toggleTheme] = useDarkMode();
  const { t } = useI18n();
  const [analysisStatus, setAnalysisStatus] = useState('');
  
  const [isEducationalModalOpen, setIsEducationalModalOpen] = useState(false);
  const [educationalContent, setEducationalContent] = useState<EducationalContent | null>(null);
  const [isEducationalContentLoading, setIsEducationalContentLoading] = useState(false);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState<LocationState | null>(null);
  const [isFromHistory, setIsFromHistory] = useState(false);
  const [historyMimeType, setHistoryMimeType] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({ itemId: null, status: 'idle' });

  const isOnline = useOnlineStatus();
  const historyButtonRef = useRef<HTMLButtonElement>(null);
  const prevIsHistoryOpen = useRef(isHistoryOpen);
  const analysisCache = useRef<Map<string, AnalysisResult>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const audioProgressRef = useRef({ startOffset: 0, startTime: 0 });


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
  
  // Efeito para sincronizar itens pendentes quando a conexão voltar
  useEffect(() => {
    const syncPendingItems = async () => {
      const pendingItems = history.filter(item => item.syncStatus === 'pending');
      if (isOnline && !isSyncing && pendingItems.length > 0) {
        setIsSyncing(true);
        showToast(t('toast.syncing.started'), 'info');

        const updatedHistory = await Promise.all(history.map(async (item) => {
          if (item.syncStatus !== 'pending') {
            return item;
          }

          try {
            if (item.queryType === 'image') {
              const base64 = item.imagePreview.split(',')[1];
              const result = await analyzeImage(base64, item.mimeType, {
                prompt: t('gemini.imagePrompt'),
                locationPrompt: t('gemini.locationPrompt'),
                error: t('gemini.imageError'),
              }, item.location || null); 
              
              if (result) {
                const resultWithLocation: MultiItemAnalysisResult = { ...result, location: item.location };
                return { ...item, result: resultWithLocation, syncStatus: 'synced' as const };
              }
              return { ...item, syncStatus: 'error' as const };
            } else { // text
              const result = await analyzeTextQuery(item.originalQuery, {
                prompt: t('gemini.textPrompt'),
                error: t('gemini.textError'),
              });

              if (result) {
                return { ...item, result, syncStatus: 'synced' as const };
              }
              return { ...item, syncStatus: 'error' as const };
            }
          } catch (error) {
            console.error('Sync failed for item:', item.id, error);
            return { ...item, syncStatus: 'error' as const };
          }
        }));

        setHistory(updatedHistory);
        setIsSyncing(false);
        showToast(t('toast.syncing.completed'), 'info');
      }
    };

    syncPendingItems();
  }, [isOnline, history, isSyncing, setHistory, t]);

  const handleFileChange = async (file: File | null) => {
    setLocation(null); // Reseta a localização a cada nova imagem
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // Limite de 4MB
        showToast(t('toast.fileTooLarge'), "error");
        return;
      }
      setSelectedFile(file);
      // Cria um Blob URL para exibição rápida e eficiente na tela
      const blobUrl = URL.createObjectURL(file);
      setImagePreview(blobUrl);
       // Cria um Data URL (base64) otimizado para armazenamento no histórico
      const dataUrl = await createImagePreview(file, 400); // Max 400px
      setHistoryImagePreview(dataUrl);
      setAnalysisResult(null);
      setIsFromHistory(false);
      handleStopAudio();

      try {
        const gpsData = await getGPSData(file);
        if (gpsData) {
          setLocation(gpsData);
          showToast(t('toast.gpsFound'), 'info');
        }
      } catch (err) {
        console.warn("Não foi possível ler os dados EXIF da imagem.", err);
      }
    }
  };

  const resetState = (clearMode: boolean = true) => {
    setSelectedFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setHistoryImagePreview(null);
    setAnalysisResult(null);
    setIsLoading(false);
    setTextQuery('');
    setLocation(null);
    setIsFromHistory(false);
    setHistoryMimeType(null);
    handleStopAudio();
    if(clearMode) {
      setMode('image');
    }
  }

  const handleClear = useCallback(() => {
    resetState(false);
  }, [imagePreview]);

  const handleModeChange = (newMode: AnalysisMode) => {
    if(mode !== newMode) {
      resetState(false);
      setMode(newMode);
    }
  }

  const handleAnalyzeClick = async () => {
    handleStopAudio();
    const isReanalyzing = isFromHistory;
    setIsFromHistory(false); // Reseta imediatamente para que o botão volte ao normal após a análise.

    // Lógica Offline-First
    if (!isOnline) {
      if (mode === 'image' && selectedFile && historyImagePreview) {
        const newHistoryItem: ImageHistoryItem = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          queryType: 'image',
          syncStatus: 'pending',
          imagePreview: historyImagePreview,
          mimeType: selectedFile.type,
          location: location ?? undefined,
        };
        setHistory([newHistoryItem, ...history]);
        showToast(t('toast.offline.queued'), 'info');
        handleClear();
      } else if (mode === 'text' && textQuery.trim()) {
        const newHistoryItem: TextHistoryItem = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          queryType: 'text',
          syncStatus: 'pending',
          originalQuery: textQuery,
        };
        setHistory([newHistoryItem, ...history]);
        showToast(t('toast.offline.queued'), 'info');
        handleClear();
      } else {
        showToast(t('toast.offline.noInput'), 'error');
      }
      return;
    }

    // Verifica o cache antes de fazer a chamada à API, exceto se for uma reanálise
    if (!isReanalyzing) {
        if (mode === 'image' && historyImagePreview) {
            if (analysisCache.current.has(historyImagePreview)) {
                setAnalysisResult(analysisCache.current.get(historyImagePreview)!);
                showToast(t('toast.loadedFromCache'), 'info');
                return;
            }
        } else if (mode === 'text' && textQuery.trim()) {
            const queryKey = textQuery.trim();
            if (analysisCache.current.has(queryKey)) {
                setAnalysisResult(analysisCache.current.get(queryKey)!);
                showToast(t('toast.loadedFromCache'), 'info');
                return;
            }
        }
    }
    

    // Lógica Online
    setIsLoading(true);
    setAnalysisResult(null);
    setAnalysisStatus(t('app.ariaLive.loading'));
    
    try {
      if (mode === 'image') {
        let base64ForAnalysis: string;
        let mimeTypeForAnalysis: string;
        let imagePreviewForCache: string;

        // Determina a fonte dos dados da imagem (novo arquivo ou do histórico)
        if (isReanalyzing) {
            if (!historyImagePreview || !historyMimeType) {
              showToast("Error: Missing data for re-analysis.", "error");
              setIsLoading(false);
              return;
            }
            base64ForAnalysis = historyImagePreview.split(',')[1];
            mimeTypeForAnalysis = historyMimeType;
            imagePreviewForCache = historyImagePreview;
        } else {
            if (!selectedFile || !historyImagePreview) {
                showToast(t('toast.selectImage'), "error");
                setIsLoading(false);
                return;
            }
            const fileData = await fileToBase64(selectedFile);
            base64ForAnalysis = fileData.base64;
            mimeTypeForAnalysis = fileData.mimeType;
            imagePreviewForCache = historyImagePreview;
        }

        let locationForAnalysis = location;
        if (!locationForAnalysis) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            locationForAnalysis = { lat: position.coords.latitude, lon: position.coords.longitude };
            showToast(t('toast.locationUsed'), 'info');
          } catch (geoError) {
            console.warn("Geolocalização do navegador negada ou indisponível.", geoError);
          }
        }
        
        const result = await analyzeImage(base64ForAnalysis, mimeTypeForAnalysis, {
          prompt: t('gemini.imagePrompt'),
          locationPrompt: t('gemini.locationPrompt'),
          error: t('gemini.imageError'),
        }, locationForAnalysis);

        if (result) {
          const resultWithLocation: MultiItemAnalysisResult = { ...result, location: locationForAnalysis ?? undefined };
          setAnalysisResult(resultWithLocation);
          analysisCache.current.set(imagePreviewForCache, resultWithLocation); // Salva no cache
          const newHistoryItem: ImageHistoryItem = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            queryType: 'image',
            syncStatus: 'synced',
            result: resultWithLocation,
            imagePreview: imagePreviewForCache,
            mimeType: mimeTypeForAnalysis,
            location: locationForAnalysis ?? undefined,
          };
          setHistory([newHistoryItem, ...history]);
        }

      } else { // mode === 'text'
        if (!textQuery.trim()) {
          showToast(t('toast.enterQuestion'), "error");
          setIsLoading(false);
          return;
        }
        const result = await analyzeTextQuery(textQuery, {
          prompt: t('gemini.textPrompt'),
          error: t('gemini.textError'),
        });
        
        if (result) {
          setAnalysisResult(result);
          analysisCache.current.set(textQuery.trim(), result); // Salva no cache
          const newHistoryItem: TextHistoryItem = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            queryType: 'text',
            syncStatus: 'synced',
            result,
            originalQuery: textQuery,
          };
          setHistory([newHistoryItem, ...history]);
        }
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
    if (isLoading || isSyncing) return true;
    if (mode === 'image') return !selectedFile && !imagePreview;
    if (mode === 'text') return !textQuery.trim();
    return true;
  }
  
  const handleSelectHistoryItem = (item: HistoryItem) => {
    handleStopAudio();
    setIsFromHistory(item.syncStatus === 'synced');

    if (item.syncStatus === 'pending') {
      showToast(t('toast.history.pending'), 'info');
    } else if (item.syncStatus === 'error') {
      showToast(t('toast.history.error'), 'error');
    }

    if (item.queryType === 'image') {
      setMode('image');
      setImagePreview(item.imagePreview);
      setHistoryImagePreview(item.imagePreview);
      setHistoryMimeType(item.mimeType);
      setAnalysisResult(item.result || null); // Mostra o resultado se estiver sincronizado
      setTextQuery('');
      setSelectedFile(null);
    } else { // 'text'
      setMode('text');
      setTextQuery(item.originalQuery);
      setAnalysisResult(item.result || null); // Mostra o resultado se estiver sincronizado
      setImagePreview(null);
      setHistoryImagePreview(null);
      setHistoryMimeType(null);
      setSelectedFile(null);
    }
    
    setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setIsHistoryOpen(false);
  };

  const handleShowOnMap = (locationToShow: LocationState) => {
    setMapLocation(locationToShow);
    setIsMapModalOpen(true);
  };
  
  const handleStopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Ignora erros se stop() for chamado em uma fonte já parada
      }
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    setAudioState({ itemId: null, status: 'idle' });
    audioProgressRef.current = { startOffset: 0, startTime: 0 };
  }, []);

  const playAudioFromBuffer = (itemId: string, buffer: AudioBuffer) => {
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
    }
  
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
  
    const offset = audioProgressRef.current.startOffset % buffer.duration;
    source.start(0, offset);
  
    audioSourceRef.current = source;
    // startTime agora rastreia o início da *seção* atual de reprodução
    audioProgressRef.current.startTime = ctx.currentTime;
    setAudioState({ itemId, status: 'playing' });
  
    source.onended = () => {
      setAudioState(current => {
        // O onended é acionado no final natural e no .stop() manual.
        // Só queremos redefinir o estado se o áudio terminou de tocar (não foi pausado).
        if (current.itemId === itemId && current.status === 'playing') {
          handleStopAudio();
          return { itemId: null, status: 'idle' };
        }
        return current;
      });
    };
  };

  const handleToggleAudio = useCallback(async (itemId: string, textToSpeak: string) => {
    if (!audioContextRef.current) {
      // @ts-ignore
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    const isSameItem = audioState.itemId === itemId;
  
    if (isSameItem && audioState.status === 'playing') {
      // --- PAUSE ---
      if (audioSourceRef.current) {
        const elapsedTime = ctx.currentTime - audioProgressRef.current.startTime;
        audioProgressRef.current.startOffset += elapsedTime;
  
        audioSourceRef.current.onended = null;
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
      }
      setAudioState({ itemId, status: 'paused' });
      return;
    }
  
    if (isSameItem && audioState.status === 'paused') {
      // --- RESUME ---
      const buffer = audioBufferCacheRef.current.get(itemId);
      if (buffer) {
        playAudioFromBuffer(itemId, buffer);
      }
      return;
    }
  
    // --- PLAY NEW or from IDLE/ERROR ---
    handleStopAudio();
  
    const cachedBuffer = audioBufferCacheRef.current.get(itemId);
    if (cachedBuffer) {
      playAudioFromBuffer(itemId, cachedBuffer);
    } else {
      setAudioState({ itemId, status: 'loading' });
      try {
        const audioBase64 = await generateSpeech(textToSpeak, { error: t('toast.audioGenerationFailed') });
        const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
        audioBufferCacheRef.current.set(itemId, buffer);
        playAudioFromBuffer(itemId, buffer);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('toast.unknownError');
        showToast(errorMessage, 'error');
        setAudioState({ itemId: null, status: 'error' });
        handleStopAudio();
      }
    }
  }, [audioState, t, handleStopAudio]);
  
  const shouldShowAnalysisPanel = isLoading || analysisResult !== null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-brand-dark dark:text-gray-200 font-sans transition-colors duration-300">
      <ConnectionStatusBanner />
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
        onClose={() => { setIsHistoryOpen(false); handleStopAudio(); }}
        history={history}
        onSelectItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />
      <EducationalModal
        isOpen={isEducationalModalOpen}
        onClose={() => { setIsEducationalModalOpen(false); handleStopAudio(); }}
        content={educationalContent}
        isLoading={isEducationalContentLoading}
      />
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => { setIsMapModalOpen(false); handleStopAudio(); }}
        location={mapLocation}
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
                <span className="text-lg">
                    {isLoading 
                        ? t('app.analyzingButton') 
                        : isFromHistory 
                        ? t('app.reanalyzeButton') 
                        : t('app.analyzeButton')}
                </span>
            </button>
          </div>

          {/* Coluna da Direita */}
          {shouldShowAnalysisPanel && (
            <div className="w-full flex flex-col p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 min-h-[400px] md:min-h-[610px] animate-slide-in-right">
              <AnalysisDisplay
                  result={analysisResult}
                  isLoading={isLoading}
                  onLearnMore={handleLearnMore}
                  onShowOnMap={handleShowOnMap}
                  audioState={audioState}
                  onToggleAudio={handleToggleAudio}
                  onShowToast={showToast}
                />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;