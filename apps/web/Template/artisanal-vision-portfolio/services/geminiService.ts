
import { GoogleGenAI } from "@google/genai";

// Fixed to initialize GoogleGenAI with process.env.API_KEY directly as required
export const getGeminiResponse = async (userMessage: string) => {
  // Creating a new instance right before the call to ensure correct API key usage
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: `You are 'Aura', the virtual assistant for the artist "Elena Vance". 
        Elena Vance is a visionary artist specializing in "Digital Surrealism" and "Abstract Expressionism".
        Your tone is elegant, helpful, and creative. 
        You answer questions about her work, her availability for commissions, and her artistic philosophy.
        If asked about technical details, mention she uses tools like Procreate, Blender, and traditional oil on canvas.
        Keep responses concise but inspiring.`,
        temperature: 0.7,
        topP: 0.95,
        // Removed maxOutputTokens to prevent potential response truncation unless paired with thinkingBudget
      },
    });

    // Accessing .text as a property, not a function call
    return response.text || "I'm sorry, I couldn't process that. My creative circuits are a bit hazy.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am currently taking a moment to reflect. Please try again in a few moments.";
  }
};