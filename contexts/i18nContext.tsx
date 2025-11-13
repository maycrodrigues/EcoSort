
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type Locale = 'pt-BR' | 'en-US';

const translations = {
  'pt-BR': {
    "header": {
      "subtitle": "Classificador de Resíduos",
      "history": "Histórico",
      "toggleTheme": "Mudar para modo {theme}"
    },
    "app": {
      "imageAnalysis": "Análise por Imagem",
      "textQuery": "Consulta por Texto",
      "analyzingButton": "Analisando...",
      "analyzeButton": "Analisar",
      "ariaLive": {
        "loading": "Analisando...",
        "complete": "Análise concluída."
      }
    },
    "toast": {
      "fileTooLarge": "O arquivo de imagem é muito grande. Por favor, escolha um menor que 4MB.",
      "selectImage": "Por favor, selecione uma imagem primeiro.",
      "enterQuestion": "Por favor, digite sua pergunta.",
      "analysisFailed": "Falha na análise",
      "unknownError": "Ocorreu um erro desconhecido."
    },
    "imageUploader": {
      "title": "1. Envie uma foto do seu resíduo",
      "dragDrop": "Clique para enviar ou arraste a imagem",
      "fileTypes": "PNG, JPG ou WEBP (Max. 4MB)",
      "clearAriaLabel": "Limpar imagem"
    },
    "textQuery": {
      "title": "1. Faça uma pergunta sobre descarte",
      "placeholder": "Ex: Como descartar pilhas de bateria?",
      "ariaLabel": "Caixa de texto para pergunta sobre descarte",
      "clearAriaLabel": "Limpar texto",
      "examples": {
        "title": "Outros exemplos:",
        "ex1": "Garrafas de vidro são recicláveis?",
        "ex2": "Onde posso jogar fora óleo de cozinha?",
        "ex3": "Isopor tem reciclagem?"
      }
    },
    "analysis": {
      "title": "2. Resultado da Análise",
      "spinnerTitle": "Analisando...",
      "spinnerSubtitle": "Estamos processando sua solicitação.",
      "recyclable": "Reciclável",
      "notRecyclable": "Não Reciclável",
      "itemsFound": "{count} itens encontrados na imagem",
      "noItemsFound": {
        "title": "Nenhum item foi identificado",
        "description": "Não conseguimos identificar itens descartáveis na imagem. Tente uma foto mais clara ou com os objetos mais visíveis."
      },
      "disposalSuggestion": "Sugestão de Descarte",
      "aiReasoning": "Observações",
      "didYouKnow": "Você Sabia?",
      "yourQuestion": "Sua Pergunta",
      "aiAnswer": "Resposta",
      "learnMore": "Clique para saber mais"
    },
    "history": {
      "title": "Histórico de Análises",
      "closeAriaLabel": "Fechar modal",
      "empty": {
        "title": "Nenhuma análise no histórico.",
        "subtitle": "Suas futuras análises aparecerão aqui."
      },
      "clearButton": "Limpar Histórico",
      "imageAnalysisNoItems": "Análise de imagem (sem itens)"
    },
    "educationalModal": {
      "title": "Saiba Mais",
      "loading": "Buscando mais informações..."
    },
    "gemini": {
      "imagePrompt": "Analise esta imagem. Identifique TODOS os itens descartáveis visíveis. Para cada item, forneça seu nome, tipo de lixo, se é reciclável, uma sugestão de descarte, uma justificativa e um fato de impacto ambiental. Retorne um objeto JSON com uma chave 'items' contendo um array de objetos, um para cada item. Se nenhum item for identificado, retorne um array vazio. Responda em português do Brasil.",
      "textPrompt": "Você é um especialista em sustentabilidade e reciclagem. Responda à seguinte pergunta de um usuário sobre descarte de resíduos. Pergunta: \"{query}\". Forneça uma resposta direta, uma sugestão clara de descarte, e um fato de impacto ambiental relacionado. Responda em português do Brasil.",
      "educationalPrompt": "Expanda o seguinte fato ambiental em um parágrafo curto e informativo, explicando o contexto ou a importância. Fato: '{fact}'. Responda em português do Brasil.",
      "imageError": "Falha ao comunicar com o serviço de análise de imagem.",
      "textError": "Falha ao comunicar com o serviço de análise de texto.",
      "educationalError": "Não foi possível buscar mais informações no momento."
    }
  },
  'en-US': {
    "header": {
      "subtitle": "Waste Sorter",
      "history": "History",
      "toggleTheme": "Switch to {theme} mode"
    },
    "app": {
      "imageAnalysis": "Image Analysis",
      "textQuery": "Text Query",
      "analyzingButton": "Analyzing...",
      "analyzeButton": "Analyze",
      "ariaLive": {
        "loading": "Analyzing...",
        "complete": "Analysis complete."
      }
    },
    "toast": {
      "fileTooLarge": "The image file is too large. Please choose a file smaller than 4MB.",
      "selectImage": "Please select an image first.",
      "enterQuestion": "Please enter your question.",
      "analysisFailed": "Analysis failed",
      "unknownError": "An unknown error occurred."
    },
    "imageUploader": {
      "title": "1. Upload a photo of your waste",
      "dragDrop": "Click to upload or drag and drop",
      "fileTypes": "PNG, JPG or WEBP (Max. 4MB)",
      "clearAriaLabel": "Clear image"
    },
    "textQuery": {
      "title": "1. Ask a question about disposal",
      "placeholder": "e.g., How to dispose of batteries?",
      "ariaLabel": "Textbox for disposal question",
      "clearAriaLabel": "Clear text",
      "examples": {
        "title": "Other examples:",
        "ex1": "Are glass bottles recyclable?",
        "ex2": "Where can I throw away cooking oil?",
        "ex3": "Is styrofoam recyclable?"
      }
    },
    "analysis": {
      "title": "2. Analysis Result",
      "spinnerTitle": "Analyzing...",
      "spinnerSubtitle": "We are processing your request.",
      "recyclable": "Recyclable",
      "notRecyclable": "Not Recyclable",
      "itemsFound": "{count} items found in the image",
      "noItemsFound": {
        "title": "No items were identified",
        "description": "We couldn't identify any disposable items in the image. Please try a clearer photo with more visible objects."
      },
      "disposalSuggestion": "Disposal Suggestion",
      "aiReasoning": "Observations",
      "didYouKnow": "Did You Know?",
      "yourQuestion": "Your Question",
      "aiAnswer": "Answer",
      "learnMore": "Click to learn more"
    },
    "history": {
      "title": "Analysis History",
      "closeAriaLabel": "Close modal",
      "empty": {
        "title": "No analysis in history.",
        "subtitle": "Your future analyses will appear here."
      },
      "clearButton": "Clear History",
      "imageAnalysisNoItems": "Image analysis (no items)"
    },
    "educationalModal": {
      "title": "Learn More",
      "loading": "Fetching more information..."
    },
    "gemini": {
      "imagePrompt": "Analyze this image. Identify ALL visible disposable items. For each item, provide its name, waste type, if it's recyclable, a disposal suggestion, a reasoning, and an environmental impact fact. Return a JSON object with a key 'items' containing an array of objects, one for each item. If no items are identified, return an empty array. Respond in English.",
      "textPrompt": "You are an expert in sustainability and recycling. Answer the following user question about waste disposal. Question: \"{query}\". Provide a direct answer, a clear disposal suggestion, and a related environmental impact fact. Respond in English.",
      "educationalPrompt": "Expand the following environmental fact into a short, informative paragraph, explaining the context or importance. Fact: '{fact}'. Respond in English.",
      "imageError": "Failed to communicate with the image analysis service.",
      "textError": "Failed to communicate with the text analysis service.",
      "educationalError": "Could not fetch more information at this time."
    }
  }
};

type Translations = typeof translations['pt-BR'];

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useLocalStorage<Locale>('locale', 'pt-BR');
  const [messages, setMessages] = useState<Translations>(translations[locale]);

  useEffect(() => {
    setMessages(translations[locale]);
  }, [locale]);
  
  const t = (key: string, options?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result: any = messages;
    
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    let text = String(result);

    if (options) {
      Object.keys(options).forEach(optKey => {
        text = text.replace(`{${optKey}}`, String(options[optKey]));
      });
    }

    return text;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
