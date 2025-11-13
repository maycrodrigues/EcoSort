
import { GoogleGenAI, Type } from '@google/genai';
import type { MultiItemAnalysisResult, SingleItemAnalysisResult, TextAnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const singleItemSchema = {
    type: Type.OBJECT,
    properties: {
        itemName: {
            type: Type.STRING,
            description: "The name of the item. E.g., 'Plastic bottle', 'Cardboard box'."
        },
        wasteType: {
            type: Type.STRING,
            description: "The category of waste. E.g., 'Recyclable', 'Organic', 'Electronic', 'Hazardous', 'Non-recyclable'."
        },
        recyclable: {
            type: Type.BOOLEAN,
            description: "Indicates if the item is recyclable."
        },
        disposalSuggestion: {
            type: Type.STRING,
            description: "A clear, actionable suggestion on how to dispose of the item. E.g., 'Dispose of in the blue bin for plastics.' or 'Take to an electronic waste collection point.'"
        },
        reasoning: {
            type: Type.STRING,
            description: "A brief explanation for the classification and suggestion."
        },
        environmentalImpact: {
            type: Type.STRING,
            description: "An interesting fact or statistic about the environmental impact of the item or its recycling. E.g., 'A single plastic bottle can take up to 450 years to decompose.' Keep it concise and impactful. If no specific fact is available, provide a general fact about the type of waste."
        }
    },
    required: ["itemName", "wasteType", "recyclable", "disposalSuggestion", "reasoning", "environmentalImpact"],
};

const multiItemResponseSchema = {
    type: Type.OBJECT,
    properties: {
        items: {
            type: Type.ARRAY,
            description: "An array of all identified disposable items in the image.",
            items: singleItemSchema
        }
    },
    required: ["items"]
};

const textResponseSchema = {
    type: Type.OBJECT,
    properties: {
        question: {
            type: Type.STRING,
            description: "The user's original question, possibly rephrased for clarity."
        },
        answer: {
            type: Type.STRING,
            description: "A direct and informative answer to the user's question."
        },
        disposalSuggestion: {
            type: Type.STRING,
            description: "A practical suggestion on how to dispose of the item or material in question. If not applicable, provide a general sustainability tip related to the topic."
        },
        environmentalImpact: {
            type: Type.STRING,
            description: "An interesting fact or statistic about the environmental impact related to the question's topic. Keep it concise and impactful."
        }
    },
    required: ["question", "answer", "disposalSuggestion", "environmentalImpact"],
};

interface I18nStrings {
    prompt: string;
    error: string;
}

export const analyzeImage = async (base64Image: string, mimeType: string, i18n: I18nStrings): Promise<MultiItemAnalysisResult> => {
    const imagePart = {
        inlineData: { data: base64Image, mimeType: mimeType },
    };
    const textPart = {
        text: i18n.prompt,
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: multiItemResponseSchema,
                temperature: 0.2,
            }
        });

        const result = JSON.parse(response.text.trim());

        // Torna a função mais robusta:
        // Se a IA retornar uma lista, use-a.
        // Se a IA retornar um único objeto, transforme-o em uma lista com um item.
        if (result.items && Array.isArray(result.items)) {
             return { queryType: 'image', items: result.items };
        } else if (result.itemName) { // Verifica se parece um objeto de item único
            return { queryType: 'image', items: [result as SingleItemAnalysisResult] };
        }
        
        // Caso contrário, retorna uma lista vazia.
        return { queryType: 'image', items: [] };

    } catch (error) {
        console.error("Error calling Gemini API for image analysis:", error);
        throw new Error(i18n.error);
    }
};

export const analyzeTextQuery = async (query: string, i18n: I18nStrings): Promise<TextAnalysisResult> => {
    const textPart = {
        text: i18n.prompt.replace('{query}', query)
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: textResponseSchema,
                temperature: 0.3,
            }
        });

        const result = JSON.parse(response.text.trim());
        return { ...result, queryType: 'text' };
        
    } catch (error) {
        console.error("Error calling Gemini API for text query:", error);
        throw new Error(i18n.error);
    }
};

export const getExpandedContent = async (fact: string, i18n: I18nStrings): Promise<string> => {
    const textPart = {
        text: i18n.prompt.replace('{fact}', fact)
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [textPart] },
            config: {
                temperature: 0.5,
            }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error calling Gemini API for educational content:", error);
        throw new Error(i18n.error);
    }
};
