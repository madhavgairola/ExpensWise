const { classifyAndParseMessage } = require('./services/gemini.service.js');
const chatService = require('./services/chat.service.js');

async function testExtraction() {
    const tests = [
        "set my budget to 8000",
        "decrease budget to 5000",
        "got 1500 bonus",
        "updated budget 1000",
        "set budget 200"
    ];

    for (const t of tests) {
        console.log(`\nTesting: "${t}"`);
        const aiResult = await classifyAndParseMessage(t);
        console.log("AI Result:", JSON.stringify(aiResult, null, 2));

        // Test fallback behavior by simulating failing AI
        // Fallback is local so we'd have to export it, but we can just test processInteraction directly
        const result = await chatService.processInteraction(t);
        console.log("Processed Result:", result.message);
    }
}

testExtraction();
