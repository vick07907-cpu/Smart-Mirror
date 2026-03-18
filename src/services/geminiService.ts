import { GoogleGenAI, Modality, Type, GenerateContentResponse, ThinkingLevel } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const TIMER_TOOL = {
  name: "setTimer",
  parameters: {
    type: Type.OBJECT,
    description: "Set a timer for a specific duration in minutes.",
    properties: {
      minutes: {
        type: Type.NUMBER,
        description: "The number of minutes for the timer.",
      },
    },
    required: ["minutes"],
  },
};

export const WEATHER_TOOL = {
  name: "getWeather",
  parameters: {
    type: Type.OBJECT,
    description: "Get the current weather forecast for a specific location.",
    properties: {
      location: {
        type: Type.STRING,
        description: "The city or location to check the weather for.",
      },
    },
    required: ["location"],
  },
};

export const TASK_TOOL = {
  name: "addTask",
  parameters: {
    type: Type.OBJECT,
    description: "Add a new task to the user's to-do list.",
    properties: {
      task: {
        type: Type.STRING,
        description: "The description of the task to add.",
      },
    },
    required: ["task"],
  },
};

export const MODE_TOOL = {
  name: "switchMode",
  parameters: {
    type: Type.OBJECT,
    description: "Switch the mirror to a specific mode like 'fitness', 'zen', 'news', or 'default'.",
    properties: {
      mode: {
        type: Type.STRING,
        description: "The mode to switch to.",
        enum: ["fitness", "zen", "news", "default", "productivity"],
      },
    },
    required: ["mode"],
  },
};

export async function processCommand(prompt: string) {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a futuristic smart mirror AI assistant. You can set timers, check weather, manage tasks, and switch modes. Be conversational, concise, and helpful. If the user asks for weather, use getWeather. If they want a timer, use setTimer. If they want to add a task, use addTask. If they want to change the vibe or mode (e.g., 'start my workout', 'I want to relax', 'show me news'), use switchMode.",
        tools: [{ 
          functionDeclarations: [TIMER_TOOL, WEATHER_TOOL, TASK_TOOL, MODE_TOOL],
          googleSearch: {} 
        }],
      },
    });

    return response;
  } catch (error) {
    console.error("Process Command Error:", error);
    throw error;
  }
}

export async function getThinkingResponse(prompt: string) {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Thinking Response Error:", error);
    return "I'm processing that complex request... one moment.";
  }
}

export async function getSearchGroundingResponse(prompt: string) {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return "I'm having trouble connecting to the internet right now.";
  }
}

export async function getFastResponse(prompt: string) {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Fast Response Error:", error);
    return "Something went wrong.";
  }
}

export async function getTTS(text: string) {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      await audio.play();
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
}
