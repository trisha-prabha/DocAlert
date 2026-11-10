import asyncHandler from "express-async-handler";
import { extractDocumentData } from "../services/aiExtractionService.js";

// @desc    Extract metadata from uploaded receipt/warranty document with Gemini AI
// @route   POST /api/items/extract
// @access  Private
export const extractDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload an image or PDF document to extract");
  }

  // Pass raw multer buffer and mimetype to extraction service
  const extracted = await extractDocumentData(
    req.file.buffer,
    req.file.mimetype,
  );

  // Return extracted JSON directly to frontend for preview/editing before saving
  res.json({
    success: !extracted.extractionFailed,
    extracted,
  });
});

// @desc    Temporary test route for verifying Gemini API key connectivity
// @route   GET /api/items/test-gemini
// @access  Private
// NOTE: Remove before deploying to production
export const testGemini = asyncHandler(async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500);
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = 'Say hello in JSON format: {"message": string}';
  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const cleaned = rawText.replace(/```(?:json)?|```/g, "").trim();

  let parsedResponse;
  try {
    parsedResponse = JSON.parse(cleaned);
  } catch {
    parsedResponse = { rawText };
  }

  res.json({
    success: true,
    model: modelName,
    response: parsedResponse,
    notice: "Temporary test route - remove before deploying to production",
  });
});

export default { extractDocument, testGemini };
