require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const models = [
  'llama-3.3-70b-versatile',      // Best quality (recommended)
  'llama-3.1-70b-versatile',      // Fast and good
  'llama3-8b-8192',               // Fastest
  'mixtral-8x7b-32768',           // Good for long context
  'gemma2-9b-it'                  // Google's Gemma
];

async function testGroqModel(modelName) {
  console.log(`\n Testing: ${modelName}`);
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello! I am working!" in one sentence.'
          }
        ],
        temperature: 0.7,
        max_tokens: 50
      })
    });

    const data = await response.json();

    if (response.ok) {
      const text = data.choices[0].message.content;
      console.log(` SUCCESS!`);
      console.log(`   Response: ${text}`);
      return { success: true, model: modelName, response: text };
    } else {
      console.log(`Error: ${data.error?.message || JSON.stringify(data)}`);
      return { success: false, error: data.error?.message };
    }
  } catch (error) {
    console.log(`Network error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('Testing Groq API (FREE!)');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const model of models) {
    const result = await testGroqModel(model);
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  const working = results.filter(r => r.success);
  
  if (working.length > 0) {
    console.log('\n Working models:');
    working.forEach(r => {
      console.log(`   - ${r.model}`);
    });
    console.log(`\nRECOMMENDED MODEL: "${working[0].model}"`);
    console.log('\nYour Groq API key is working perfectly!');
  } else {
    console.log('\nNO WORKING MODELS!');
    console.log('\n🔧 Get a new Groq API key:');
    console.log('   1. Go to: https://console.groq.com/');
    console.log('   2. Sign up (FREE, no credit card)');
    console.log('   3. Get your API key from the dashboard');
  }
}

runTests();