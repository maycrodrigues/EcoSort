
export interface SingleItemAnalysisResult {
  itemName: string;
  wasteType: string;
  disposalSuggestion: string;
  recyclable: boolean;
  reasoning: string;
  environmentalImpact: string;
}

export interface MultiItemAnalysisResult {
  queryType: 'image';
  items: SingleItemAnalysisResult[];
}

export interface TextAnalysisResult {
  queryType: 'text';
  question: string;
  answer: string;
  disposalSuggestion: string;
  environmentalImpact: string;
}

export type AnalysisResult = MultiItemAnalysisResult | TextAnalysisResult;

// Base comum para todos os itens do histórico
interface BaseHistoryItem {
  id: string;
  timestamp: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

// Item de histórico para uma análise de imagem
export interface ImageHistoryItem extends BaseHistoryItem {
  queryType: 'image';
  result?: MultiItemAnalysisResult;
  imagePreview: string; // Armazena a imagem como Data URL (base64)
  mimeType: string; // Necessário para a sincronização offline
}

// Item de histórico para uma consulta de texto
export interface TextHistoryItem extends BaseHistoryItem {
  queryType: 'text';
  result?: TextAnalysisResult;
  originalQuery: string; // Armazena a pergunta original do usuário
}

export type HistoryItem = ImageHistoryItem | TextHistoryItem;

export interface EducationalContent {
  title: string;
  content: string;
}
