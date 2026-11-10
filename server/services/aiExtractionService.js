import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment");
  }
  return new GoogleGenerativeAI(apiKey);
};

const FALLBACK_OBJECT = {
  extractionFailed: true,
  productName: null,
  vendor: null,
  purchaseDate: null,
  warrantyPeriodMonths: null,
  category: "other",
};

/**
 * Extracts warranty and document details from an image or document buffer using Google Gemini API
 * @param {Buffer} fileBuffer - Multer memory buffer
 * @param {string} mimeType - e.g. image/jpeg, image/png, application/pdf
 * @returns {Promise<Object>} Parsed extraction JSON object or fallback object
 */
export async function extractDocumentData(fileBuffer, mimeType) {
  if (!fileBuffer) {
    return FALLBACK_OBJECT;
  }

  const prompt = `Extract the following fields from this bill/warranty card image as strict JSON only — no markdown, no preamble, no explanation:
{
  "productName": string or null,
  "vendor": string or null,
  "purchaseDate": "YYYY-MM-DD" or null,
  "warrantyPeriodMonths": number or null,
  "category": one of ["electronics","insurance","subscription","amc","other"]
}`;

  const validMime =
    mimeType === "application/pdf"
      ? "application/pdf"
      : mimeType || "image/jpeg";

  const imagePart = {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType: validMime,
    },
  };

  const makeCall = async () => {
    const genAI = getGenAI();
    // Default model specified: gemini-2.5-flash (with graceful fallback if model is aliased)
    const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    const cleaned = text.replace(/```(?:json)?|```/g, "").trim();
    return JSON.parse(cleaned);
  };

  // Attempt extraction with 1 retry on 429 rate limit error
  try {
    return await makeCall();
  } catch (error) {
    const isRateLimit =
      error.status === 429 ||
      error.message?.includes("429") ||
      error.message?.toLowerCase().includes("rate limit") ||
      error.message?.toLowerCase().includes("quota");

    if (isRateLimit) {
      console.warn(
        "[Gemini AI Rate Limit 429] Retrying after 1-second delay...",
      );
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await makeCall();
      } catch (retryError) {
        console.error("[Gemini AI Retry Failed]:", retryError.message);
        return { ...FALLBACK_OBJECT, error: retryError.message };
      }
    }

    console.error("[Gemini AI Document Extraction Error]:", error.message);
    return { ...FALLBACK_OBJECT, error: error.message };
  }
}

export default extractDocumentData;
