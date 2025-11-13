import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type Locale = 'pt-BR' | 'en-US' | 'es-ES' | 'zh-CN';

const translations = {
  'pt-BR': {
    "header": {
      "subtitle": "Classificador de Resíduos",
      "history": "Histórico",
      "toggleTheme": "Mudar para modo {theme}",
      "changeLanguageAriaLabel": "Mudar idioma"
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
      "unknownError": "Ocorreu um erro desconhecido.",
      "tryAgainLater": "Por favor, tente novamente mais tarde."
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
      "toggleTheme": "Switch to {theme} mode",
      "changeLanguageAriaLabel": "Change language"
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
      "unknownError": "An unknown error occurred.",
      "tryAgainLater": "Please try again later."
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
  },
  'es-ES': {
    "header": {
      "subtitle": "Clasificador de Residuos",
      "history": "Historial",
      "toggleTheme": "Cambiar a modo {theme}",
      "changeLanguageAriaLabel": "Cambiar idioma"
    },
    "app": {
      "imageAnalysis": "Análisis de Imagen",
      "textQuery": "Consulta de Texto",
      "analyzingButton": "Analizando...",
      "analyzeButton": "Analizar",
      "ariaLive": {
        "loading": "Analizando...",
        "complete": "Análisis completo."
      }
    },
    "toast": {
      "fileTooLarge": "El archivo de imagen es demasiado grande. Por favor, elija un archivo de menos de 4MB.",
      "selectImage": "Por favor, seleccione una imagen primero.",
      "enterQuestion": "Por favor, ingrese su pregunta.",
      "analysisFailed": "Falló el análisis",
      "unknownError": "Ocurrió un error desconocido.",
      "tryAgainLater": "Por favor, inténtelo de nuevo más tarde."
    },
    "imageUploader": {
      "title": "1. Sube una foto de tu residuo",
      "dragDrop": "Haz clic para subir o arrastra y suelta",
      "fileTypes": "PNG, JPG o WEBP (Máx. 4MB)",
      "clearAriaLabel": "Limpiar imagen"
    },
    "textQuery": {
      "title": "1. Haz una pregunta sobre la eliminación",
      "placeholder": "Ej: ¿Cómo desechar las baterías?",
      "ariaLabel": "Cuadro de texto para pregunta sobre eliminación",
      "clearAriaLabel": "Limpiar texto",
      "examples": {
        "title": "Otros ejemplos:",
        "ex1": "¿Son reciclables las botellas de vidrio?",
        "ex2": "¿Dónde puedo tirar el aceite de cocina?",
        "ex3": "¿Es reciclable el poliestireno?"
      }
    },
    "analysis": {
      "title": "2. Resultado del Análisis",
      "spinnerTitle": "Analizando...",
      "spinnerSubtitle": "Estamos procesando su solicitud.",
      "recyclable": "Reciclable",
      "notRecyclable": "No Reciclable",
      "itemsFound": "{count} artículos encontrados en la imagen",
      "noItemsFound": {
        "title": "No se identificaron artículos",
        "description": "No pudimos identificar ningún artículo desechable en la imagen. Intente con una foto más clara o con objetos más visibles."
      },
      "disposalSuggestion": "Sugerencia de Eliminación",
      "aiReasoning": "Observaciones",
      "didYouKnow": "¿Sabías que?",
      "yourQuestion": "Tu Pregunta",
      "aiAnswer": "Respuesta",
      "learnMore": "Haz clic para saber más"
    },
    "history": {
      "title": "Historial de Análisis",
      "closeAriaLabel": "Cerrar modal",
      "empty": {
        "title": "No hay análisis en el historial.",
        "subtitle": "Tus futuros análisis aparecerán aquí."
      },
      "clearButton": "Limpiar Historial",
      "imageAnalysisNoItems": "Análisis de imagen (sin artículos)"
    },
    "educationalModal": {
      "title": "Aprende Más",
      "loading": "Obteniendo más información..."
    },
    "gemini": {
      "imagePrompt": "Analiza esta imagen. Identifica TODOS los artículos desechables visibles. Para cada artículo, proporciona su nombre, tipo de residuo, si es reciclable, una sugerencia de eliminación, un razonamiento y un dato de impacto ambiental. Devuelve un objeto JSON con una clave 'items' que contenga un array de objetos, uno para cada artículo. Si no se identifican artículos, devuelve un array vacío. Responde en español.",
      "textPrompt": "Eres un experto en sostenibilidad y reciclaje. Responde la siguiente pregunta del usuario sobre la eliminación de residuos. Pregunta: \"{query}\". Proporciona una respuesta directa, una sugerencia clara de eliminación y un dato de impacto ambiental relacionado. Responde en español.",
      "educationalPrompt": "Amplía el siguiente dato ambiental en un párrafo corto e informativo, explicando el contexto o la importancia. Dato: '{fact}'. Responde en español.",
      "imageError": "Error al comunicarse con el servicio de análisis de imágenes.",
      "textError": "Error al comunicarse con el servicio de análisis de texto.",
      "educationalError": "No se pudo obtener más información en este momento."
    }
  },
  'zh-CN': {
    "header": {
      "subtitle": "废物分类器",
      "history": "历史记录",
      "toggleTheme": "切换到 {theme} 模式",
      "changeLanguageAriaLabel": "更改语言"
    },
    "app": {
      "imageAnalysis": "图像分析",
      "textQuery": "文本查询",
      "analyzingButton": "分析中...",
      "analyzeButton": "分析",
      "ariaLive": {
        "loading": "分析中...",
        "complete": "分析完成。"
      }
    },
    "toast": {
      "fileTooLarge": "图像文件太大。请选择小于4MB的文件。",
      "selectImage": "请先选择一张图片。",
      "enterQuestion": "请输入您的问题。",
      "analysisFailed": "分析失败",
      "unknownError": "发生未知错误。",
      "tryAgainLater": "请稍后再试。"
    },
    "imageUploader": {
      "title": "1. 上传您的废物照片",
      "dragDrop": "点击上传或拖放",
      "fileTypes": "PNG, JPG 或 WEBP (最大 4MB)",
      "clearAriaLabel": "清除图像"
    },
    "textQuery": {
      "title": "1. 询问有关处理的问题",
      "placeholder": "例如：如何处理电池？",
      "ariaLabel": "处理问题文本框",
      "clearAriaLabel": "清除文本",
      "examples": {
        "title": "其他例子：",
        "ex1": "玻璃瓶可以回收吗？",
        "ex2": "我可以在哪里扔掉食用油？",
        "ex3": "泡沫塑料可以回收吗？"
      }
    },
    "analysis": {
      "title": "2. 分析结果",
      "spinnerTitle": "分析中...",
      "spinnerSubtitle": "我们正在处理您的请求。",
      "recyclable": "可回收",
      "notRecyclable": "不可回收",
      "itemsFound": "在图像中找到 {count} 个项目",
      "noItemsFound": {
        "title": "未识别到任何项目",
        "description": "我们在图像中未能识别出任何可丢弃的物品。请尝试使用更清晰的照片或更明显的物体。"
      },
      "disposalSuggestion": "处理建议",
      "aiReasoning": "观察",
      "didYouKnow": "您知道吗？",
      "yourQuestion": "您的问题",
      "aiAnswer": "回答",
      "learnMore": "点击了解更多"
    },
    "history": {
      "title": "分析历史",
      "closeAriaLabel": "关闭模态框",
      "empty": {
        "title": "历史记录中没有分析。",
        "subtitle": "您未来的分析将出现在这里。"
      },
      "clearButton": "清除历史记录",
      "imageAnalysisNoItems": "图像分析（无项目）"
    },
    "educationalModal": {
      "title": "了解更多",
      "loading": "正在获取更多信息..."
    },
    "gemini": {
      "imagePrompt": "分析这张图片。识别所有可见的可丢弃物品。对于每个物品，提供其名称、废物类型、是否可回收、处理建议、原因和环境影响事实。返回一个JSON对象，其中包含一个'items'键，该键包含一个对象数组，每个对象对应一个物品。如果未识别到任何物品，则返回一个空数组。用中文回答。",
      "textPrompt": "您是可持续发展和回收方面的专家。回答以下用户关于废物处理的问题。问题：“{query}”。提供直接的答案、明确的处理建议和相关的环境影响事实。用中文回答。",
      "educationalPrompt": "将以下环境事实扩展成一个简短、信息丰富的段落，解释其背景或重要性。事实：'{fact}'。用中文回答。",
      "imageError": "与图像分析服务通信失败。",
      "textError": "与文本分析服务通信失败。",
      "educationalError": "目前无法获取更多信息。"
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
