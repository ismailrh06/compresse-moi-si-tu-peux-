import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env.js";
import { assistantPrompt } from "./prompts/assistant.prompt.js";

/* ===============================
   Utils
================================ */

const buildMessageList = ({ messages }) => {
  return messages
    .map((msg) => ({
      role: msg.role,
      content: String(msg.content || "").trim()
    }))
    .filter((msg) => msg.content.length > 0);
};

/* ===============================
   MOCK (fallback safe)
================================ */

const buildMockReply = ({ messages }) => {
  const lastUser = [...messages]
    .reverse()
    .find((msg) => msg.role === "user")?.content;

  if (!lastUser) {
    return "Dis-moi ta ville, ton budget et la durée, je te propose un plan premium.";
  }

  const p = lastUser.toLowerCase();

  if (p.includes("marrakech") && (p.includes("3") || p.includes("trois"))) {
    return (
      "✨ Marrakech en 3 jours (premium)\n" +
      "• Jour 1 : Médina + Souks + coucher de soleil Jemaa el-Fna\n" +
      "• Jour 2 : Jardin Majorelle + palais Bahia + dîner rooftop\n" +
      "• Jour 3 : Vallée de l’Ourika ou désert d’Agafay\n\n" +
      "Tu préfères culture ou nature ?"
    );
  }

  return (
    "Super 👌\n" +
    "Dis-moi :\n" +
    "• ville(s)\n" +
    "• nombre de jours\n" +
    "• budget\n" +
    "• intérêts (culture, food, nature, luxe, aventure)"
  );
};

/* ===============================
   GEMINI (AI Studio)
================================ */

const buildGeminiReply = async ({ messages }) => {
  try {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);

    const model = genAI.getGenerativeModel({
      model: env.geminiModel || "gemini-1.5-flash",
      systemInstruction: assistantPrompt()
    });

    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content ||
      "Bonjour";

    const result = await model.generateContent(String(lastUserMessage));
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.log("GEMINI ERROR:", error?.message);
    throw error;
  }
};

/* ===============================
   MAIN EXPORT
================================ */

export const buildAssistantReply = async ({ messages }) => {
  if (env.useMockAi) {
    return buildMockReply({ messages });
  }

  if (env.geminiApiKey) {
    return buildGeminiReply({ messages });
  }

  return buildMockReply({ messages });
};
