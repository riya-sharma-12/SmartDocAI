const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const PPTXParser = require("pptx2json");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function extractTextFromFile(filePath) {
    let buffer;
    const ext = path.extname(filePath).toLowerCase();

    if (filePath.startsWith("http")) {
        console.log("🌍 Downloading file from URL:", filePath);
        const response = await fetch(filePath, {
            headers: {
                "Cache-Control": "no-cache"
            }
        });

        console.log("Fetch response status:", response.status);

        if (!response.ok) {
            const text = await response.text().catch(() => "<could not parse>");
            throw new Error(`Failed to download file from URL: ${filePath} | Status: ${response.status} | Body: ${text}`);
        }

        buffer = await response.buffer();
    } else {
        buffer = fs.readFileSync(filePath);
    }

    if (ext === '.pdf') {
        console.log("📄 Parsing PDF...");
        const data = await pdfParse(buffer);
        return data.text;

    } else if (ext === '.docx') {
        console.log("📝 Parsing DOCX...");
        const result = await mammoth.extractRawText({ buffer });
        return result.value;

    } else if (ext === '.pptx') {
        console.log("📊 Parsing PPTX...");
        const tempFile = path.join(__dirname, "temp.pptx");
        fs.writeFileSync(tempFile, buffer);
        const slides = await new PPTXParser().parse(tempFile);
        fs.unlinkSync(tempFile);
        return slides.map(slide => slide.text).join('\n\n');

    } else {
        throw new Error("Unsupported file type: " + ext);
    }
}

module.exports = { extractTextFromFile };
