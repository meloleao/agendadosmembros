import { GoogleGenAI, Type } from "@google/genai";
import { Event, EventType } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY! });

const parseEventSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "O título conciso do evento.",
    },
    date: {
      type: Type.STRING,
      description: "A data do evento no formato AAAA-MM-DD.",
    },
    startTime: {
      type: Type.STRING,
      description: "A hora de início do evento no formato HH:mm.",
    },
    endTime: {
      type: Type.STRING,
      description: "A hora de término do evento no formato HH:mm. Se não especificado, adicione 1 hora ao início.",
    },
    type: {
      type: Type.STRING,
      description: `O tipo de evento. Deve ser um dos seguintes: ${Object.values(EventType).join(", ")}.`,
    },
    location: {
      type: Type.STRING,
      description: "O local do evento (ex: 'Sala de Reuniões', 'Online', 'Palácio da Justiça'). Se não for especificado, deixe em branco.",
    },
    description: {
      type: Type.STRING,
      description: "Uma descrição detalhada do evento, incluindo participantes e objetivo.",
    },
  },
  required: ["title", "date", "startTime", "endTime", "type", "description", "location"],
};


export const parseEventFromText = async (text: string): Promise<Partial<Event> | null> => {
  if (!GEMINI_API_KEY) {
    throw new Error("A chave da API do Gemini não está configurada.");
  }
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extraia os detalhes do evento a partir do seguinte texto e formate como JSON. Considere que a data de hoje é ${today}. O texto é: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: parseEventSchema,
        systemInstruction: "Você é um assistente especialista em extrair informações de eventos de texto em português e formatá-las em JSON estrito. Sempre determine a data e hora corretas com base no contexto e na data atual fornecida."
      }
    });

    const jsonString = response.text;
    const parsedData = JSON.parse(jsonString);
    
    if (parsedData.type && !Object.values(EventType).includes(parsedData.type as EventType)) {
        console.warn(`Tipo de evento inválido recebido da IA: ${parsedData.type}. Usando 'Outro' como padrão.`);
        parsedData.type = EventType.OUTRO;
    }

    return parsedData as Partial<Event>;

  } catch (error) {
    console.error("Erro ao comunicar com a API do Gemini:", error);
    return null;
  }
};