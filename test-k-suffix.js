const { classifyAndParseMessage } = require('./services/gemini.service.js');
const chatService = require('./services/chat.service.js');

async function testExtraction() {
    const tests = [
        "set my budget to 5k",
        "decrease budget to 1.5k",
        "12 Feb 5k rent",
        "got 12K bonus"
    ];

    for (const t of tests) {
        console.log(`\nTesting: "${t}"`);
        const aiResult = await classifyAndParseMessage(t);
        console.log("AI Result:", JSON.stringify(aiResult, null, 2));

        // Test fallback behavior by simulating failing AI
        const fallbackResult = await chatService.processInteraction(t);
        console.log("Fallback Process Result:", fallbackResult.message);
    }
}

testExtraction();
