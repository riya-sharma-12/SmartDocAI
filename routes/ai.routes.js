const express = require('express');
const router = express.Router();
const fileModel = require('../models/files.models');
const supabase = require('../config/supabase.config.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middlewares/authe');
const Chat = require('../models/chat.models');
require('dotenv').config();

// PDF parse setup (force node-safe)
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const pptx2json = require('pptx2json');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load previous chat
router.post('/load-chat', authMiddleware, async (req, res) => {
  try {
    const { docId } = req.body;
    const chat = await Chat.findOne({ user: req.user.userId, file: docId });
    res.json({ history: chat?.history || [] });
  } catch (err) {
    console.error("Load chat history failed:", err);
    res.status(500).json({ error: "Could not load chat history" });
  }
});

router.post('/ai', authMiddleware, async (req, res) => {
  try {
    const { docId, feature, question } = req.body;
    console.log("🔍 AI route hit for feature:", feature);

    const file = await fileModel.findById(docId);
    if (!file) return res.status(404).json({ error: "File not found" });

    const fileName = file.path.split('/').pop();
    const { data, error } = await supabase.storage.from('drive').download(fileName);
    if (error || !data) {
      throw new Error("Failed to download file from Supabase: " + (error?.message || "no data"));
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

  const header = buffer.toString('utf8', 0, 4);
let text = "";

if (header === '%PDF') {
  const parsed = await pdfParse(buffer);
  text = parsed.text;
} else if (header.startsWith('PK')) {
  // Try DOCX first
  try {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value.trim();

    if (!text) {
      // If empty, fallback to PPTX
      const slides = await pptx2json(buffer);
      text = slides.map(slide => slide.text).join('\n');
    }
  } catch (err) {
    throw new Error("Failed to parse DOCX or PPTX: " + err.message);
  }
} else {
  throw new Error("Unsupported file format. Header: " + buffer.toString('utf8', 0, 10));
}

    let prompt = "";

    if (feature === "summary") {
      prompt = `Generate a detailed summary of the following document. Do not use any markdown symbols like ** or * or #. Give plain text only.\n\n${text}`;
    } else if (feature === "topicwise") {
      prompt = `Provide a topic-wise summary of the following document. 
Break it down by main ideas or themes, without using any page numbers or headings like "Page 1". 
Use plain text only, and avoid any markdown symbols like **, *, #, or -.\n\n${text}`;
    } else if (feature === "keywords") {
      prompt = `Identify only technical terms, domain-specific words, or important vocabulary from the following document and provide short dictionary-style definitions. 
Ignore common words or general English terms. 
Format your output as:

1. Term: Meaning

Limit to the 10-15 most important technical terms. Provide plain text only, no markdown symbols.

Document content:

${text}`;
    } else if (feature === "flashcards") {
      prompt = `Create detailed flashcards to help someone thoroughly understand the critical concepts in the following document. 

Each flashcard should:
- Include a Term (or Key Concept).
- Provide a clear, complete explanation in your own words that goes beyond the document if necessary, including examples, implications, or why it's important, so the user gains a deep understanding.
- Be at least 3-4 sentences long if needed.

Use this format:

Card 1
Term: ...
Explanation: ...

Focus only on technical, industry-relevant, or critical ideas, not general words. Provide plain text only, no markdown symbols.

Document content:

${text}`;
    } else if (feature === "questions") {
      prompt = `Create exam-style questions and answers based on the following document. Each question should test understanding of the key ideas, facts, or implications. Clearly separate questions and answers in plain text. Avoid markdown symbols.

Document content:

${text}`;
    } 
else if (feature === "time") {
  const words = text.trim().split(/\s+/).length;
  const minutes = (words / 200).toFixed(2);
  const readingTime = `Total word count: ${words} words. Estimated reading time: ${minutes} minutes.`;
  
  return res.json({ answer: readingTime });
}
else if (feature === "chat") {
      prompt = `Answer the user's question based on this document content.

Question: ${question}

Document content:
${text}`;
    } else {
      return res.status(400).json({ error: "Invalid feature." });
    }

    // Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
// 6. Always save to chat history
let userMessage;
if (feature === "chat") {
  userMessage = question;  // just the text
} else {
  userMessage = `Feature: ${feature}${question ? `\n${question}` : ""}`;
}

await Chat.findOneAndUpdate(
  { user: req.user.userId, file: docId },
  { $push: { history: [
    { sender: "user", message: userMessage },
    { sender: "ai", message: responseText }
  ]}},
  { upsert: true, new: true, setDefaultsOnInsert: true }
);

    // Save chat history
   
    console.log(responseText);
    return res.json({ answer: responseText || "No response generated." });

  } catch (err) {
    console.error("AI call failed:", err);
    return res.status(503).json({ error: "AI model overloaded or internal error. Please try again." });
  }
});

module.exports = router;