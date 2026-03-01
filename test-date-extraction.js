const { classifyAndParseMessage } = require('./services/gemini.service.js');
const chatService = require('./services/chat.service.js');

async function testExtraction() {
    const tests = [
        "12 food 100",
        "12 Jan metro 50",
        "10 Feb 2025 books 400",
        "yesterday coffee 20"
    ];

    for (const t of tests) {
        console.log(`\nTesting AI on: "${t}"`);
        const aiResult = await classifyAndParseMessage(t);
        console.log(JSON.stringify(aiResult, null, 2));

        // Testing fallback engine by simulating fallbackProcess
        // We can't directly call fallbackProcess but processInteraction will trigger it if we disable AI or if AI fails.
    }
}

testExtraction();
