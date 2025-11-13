
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

export interface HistoryItem {
  id: string;
  timestamp: string;
  result: AnalysisResult;
}

export interface EducationalContent {
  title: string;
  content: string;
}
