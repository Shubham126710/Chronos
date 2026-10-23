import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";

/**
 * Returns an array of language models ordered by priority and availability.
 * Supported Gemini models:
 *   1. process.env.GEMINI_MODEL || "gemini-3.5-flash"
 *   2. "gemini-3.1-flash-lite" (ultra-fast, highly resilient fallback)
 *   3. "gemini-flash-lite-latest"
 * Prepared for Groq and Qwen/OpenRouter when keys are provided.
 */
export function getAvailableLanguageModels() {
  const models: { providerName: string; model: any; modelId: string }[] = [];

  // 1. Google Gemini (Primary)
  if (process.env.GEMINI_API_KEY) {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY
    });
    const primaryId = process.env.GEMINI_MODEL || "gemini-3.5-flash";
    models.push({ providerName: "gemini", model: google(primaryId), modelId: primaryId });

    // Include lightweight fallback models
    if (primaryId !== "gemini-3.1-flash-lite") {
      models.push({ providerName: "gemini-fallback", model: google("gemini-3.1-flash-lite"), modelId: "gemini-3.1-flash-lite" });
    }
    if (primaryId !== "gemini-flash-lite-latest") {
      models.push({ providerName: "gemini-fallback", model: google("gemini-flash-lite-latest"), modelId: "gemini-flash-lite-latest" });
    }
  }

  // 2. Groq (Prepared for when GROQ_API_KEY is configured)
  if (process.env.GROQ_API_KEY) {
    const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
    });
    const groqModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    models.push({ providerName: "groq", model: groq(groqModel), modelId: groqModel });
  }

  // 3. Qwen / OpenRouter (Prepared for when QWEN_API_KEY is configured)
  if (process.env.QWEN_API_KEY) {
    const qwen = createOpenAI({
      baseURL: process.env.QWEN_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
      apiKey: process.env.QWEN_API_KEY,
    });
    const qwenModel = process.env.QWEN_MODEL || "qwen-plus";
    models.push({ providerName: "qwen", model: qwen(qwenModel), modelId: qwenModel });
  }

  return models;
}

/**
 * Executes generateObject across available models with bounded exponential backoff
 * and graceful fallback.
 */
export async function executeStructuredWithFallback<T>({
  system,
  prompt,
  schema,
  maxRetries = 2
}: {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  maxRetries?: number;
}): Promise<{ success: boolean; data: T | null; error?: string; usedModel?: string }> {
  const models = getAvailableLanguageModels();

  if (models.length === 0) {
    return {
      success: false,
      data: null,
      error: "No AI provider is configured. Please provide GEMINI_API_KEY in your environment."
    };
  }

  let lastError: any = null;

  for (const { model, modelId, providerName } of models) {
    let attempts = 0;
    while (attempts <= maxRetries) {
      try {
        const result = await generateObject({
          model,
          system,
          prompt,
          schema,
        });

        if (result?.object) {
          return {
            success: true,
            data: result.object,
            usedModel: `${providerName}:${modelId}`
          };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isRateLimit = errMsg.includes("429") || err?.status === 429;
        const isTemporary = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand");

        if ((isRateLimit || isTemporary) && attempts < maxRetries) {
          attempts++;
          // Exponential backoff with jitter: 800ms, 1600ms...
          const delay = Math.pow(2, attempts) * 400 + Math.random() * 200;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If not retryable or maxRetries reached for this model, try next fallback model
        console.warn(`[AI Client] Model ${modelId} failed: ${errMsg.slice(0, 100)}. Falling back.`);
        break;
      }
    }
  }

  const isQuota = lastError?.message?.includes("429") || lastError?.status === 429;
  return {
    success: false,
    data: null,
    error: isQuota
      ? "AI provider rate limit reached. Please wait a moment before trying again."
      : `AI processing unavailable: ${lastError?.message?.slice(0, 120) || "Unknown error"}`
  };
}
