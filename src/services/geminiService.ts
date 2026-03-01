import { GoogleGenAI, Type } from "@google/genai";
import { DisposalInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const DISPOSAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    itemName: { type: Type.STRING },
    category: { type: Type.STRING },
    isRecyclable: { type: Type.BOOLEAN },
    instructions: { type: Type.STRING },
    environmentalImpact: { type: Type.STRING },
    alternatives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    ecoScore: { type: Type.NUMBER, description: "A score from 1-100 representing how environmentally friendly the item is." },
    upcyclingIdeas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Creative ideas to reuse this item."
    },
    harmfulnessScore: { type: Type.NUMBER, description: "A score from 1-10 representing how harmful the item is to the environment (10 being most harmful)." },
    recyclingDuration: { type: Type.STRING, description: "Estimated time it takes for this item to be recycled or decompose." },
    disposalRecommendations: {
      type: Type.OBJECT,
      properties: {
        method: { type: Type.STRING, description: "The best method for disposal (e.g., Recycling, Composting, Landfill)." },
        locationType: { type: Type.STRING, description: "Where to take it (e.g., Curbside bin, Specialized center)." },
        preparation: { type: Type.STRING, description: "How to prepare the item (e.g., Rinse, Remove cap)." }
      },
      required: ["method", "locationType", "preparation"]
    }
  },
  required: ["itemName", "category", "isRecyclable", "instructions", "environmentalImpact", "alternatives", "ecoScore", "upcyclingIdeas", "harmfulnessScore", "recyclingDuration", "disposalRecommendations"],
};

export async function identifyItem(imageBuffer: string, mimeType: string): Promise<DisposalInfo> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: imageBuffer,
              mimeType: mimeType,
            },
          },
          {
            text: "Identify this item and provide recycling/disposal instructions. Predict its harmfulness score (1-10), recycling duration, and provide detailed disposal recommendations. Provide the response in JSON format.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: DISPOSAL_SCHEMA,
    },
  });

  return JSON.parse(response.text || "{}") as DisposalInfo;
}

export async function searchItem(query: string): Promise<DisposalInfo> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Provide recycling/disposal instructions for: ${query}. Predict its harmfulness score (1-10), recycling duration, and provide detailed disposal recommendations. Provide the response in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: DISPOSAL_SCHEMA,
    },
  });

  return JSON.parse(response.text || "{}") as DisposalInfo;
}

export async function findNearbyCenters(lat: number, lng: number, itemType: string) {
  const model = "gemini-2.5-flash"; // Use 2.5 for maps grounding
  
  const response = await ai.models.generateContent({
    model,
    contents: `Find recycling centers or drop-off points for ${itemType} near my location. Return a list of centers with their names, addresses, and coordinates if possible.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      }
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}

export async function getMaterialInfo(material: string): Promise<any> {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Explain the material composition and recyclability of ${material}. Provide the response in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          composition: { type: Type.STRING },
          recyclabilityRate: { type: Type.STRING },
          commonUses: { type: Type.ARRAY, items: { type: Type.STRING } },
          funFact: { type: Type.STRING },
        },
        required: ["name", "composition", "recyclabilityRate", "commonUses", "funFact"],
      },
    },
  });
  return JSON.parse(response.text || "{}");
}

export async function getRecyclingQuiz(): Promise<any> {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: "Generate a 3-question multiple choice quiz about recycling and waste management. Provide the response in JSON format.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["question", "options", "correctAnswer", "explanation"],
        },
      },
    },
  });
  return JSON.parse(response.text || "[]");
}
