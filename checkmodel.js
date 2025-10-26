import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent("Hello from Gemini Pro!");
    console.log(result.response.text());
  } catch (err) {
    console.error(err);
  }
}

testGemini();
