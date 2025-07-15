import 'dotenv/config';
console.log("✅ Loaded GEMINI key:", process.env.GEMINI_API_KEY);

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runTest() {
  try {
    console.log("Testing Gemini 1.5 Flash...");

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      apiVersion: "v1"
    });

    const result = await model.generateContent("Write an essay on school");
    const response = await result.response;

    console.log("✅ Gemini says:", response.candidates[0].content.parts[0].text);
  } catch (err) {
    console.error("❌ Error testing Gemini:", err);
  }
}

runTest();