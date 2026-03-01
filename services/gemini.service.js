const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    console.error("WARNING: GEMINI_API_KEY is missing in .env file. AI features will be disabled.");
}

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

/**
 * Unified Classifier and Parser using Gemini 2.0.
 * Determines the intent (ADD_EXPENSE, ADD_BUDGET, QUERY_ANALYTICS) and extracts data.
 */
const classifyAndParseMessage = async (message) => {
    const prompt = `
    Analyze this financial message: "${message}"
    Current Date Context: ${new Date().toISOString()}
    
    Determine the INTENT and extract the DATA.
    
    INTENTS:
    - "ADD_EXPENSE": User spent money (e.g., "₹20 for tea", "paid 500 for rent", "12 food 300").
    - "ADD_BUDGET": User received money to ADD to their budget (e.g., "got 2000 bonus", "my salary 50000 arrived").
    - "SET_BUDGET": User wants to SET their total budget limit to a specific amount (e.g., "set budget to 10000", "decrease budget to 5000").
    - "QUERY_ANALYTICS": User asking about status (e.g., "how much spent?", "show analytics").
    - "DELETE_LAST": User wants to remove the most recent entry (e.g., "delete the last transaction", "undo last entry", "remove previous").

    Return ONLY a JSON object:
    {
      "intent": "ADD_EXPENSE" | "ADD_BUDGET" | "SET_BUDGET" | "QUERY_ANALYTICS" | "DELETE_LAST",
      "data": any
    }

    DATA format for ADD_EXPENSE:
    [{"amount": number, "description": string, "categoryType": "need"|"want", "subcategory": string, "date": "YYYY-MM-DD"}]

    DATA format for ADD_BUDGET or SET_BUDGET:
    {"amount": number}

    DATA format for QUERY_ANALYTICS:
    {}

    Rules:
    - If user says "bonus", "salary", "received", "income", classify as ADD_BUDGET.
    - If user says "set budget", "update budget", "decrease budget", classify as SET_BUDGET.
    - If there are multiple entries separated by semicolons (;), process ALL of them into the data array.
    - Example: "food 100 need; taxi 200 want" -> [{"amount": 100, "description": "Food", "categoryType": "need", ...}, {"amount": 200, "description": "Taxi", "categoryType": "want", ...}]
    - For ADD_EXPENSE, "need" is for essentials (Rent, Groceries, Utils, Metro, Bills, Food, College), "want" is for everything else.
    - For ADD_EXPENSE, if the user explicitly specifies a date (e.g., "12", "12 Feb", "yesterday"), extract it as "date" in YYYY-MM-DD format using the Current Date Context. If no date is specified, omit the "date" field entirely.
    - CRITICAL: Do NOT include the words "need" or "want" in the extracted description (e.g., "food need 300" -> description should be "Food").
    - Return ONLY the JSON code block.
    `;

    try {
        if (!model) return null;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("GEMINI_RESPONSE:", text);
        const jsonMatch = text.match(/\{.*\}/s);
        return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (error) {
        if (error.status === 429) {
            console.warn("Gemini API: Quota exceeded (429). Using fallback engine.");
        } else {
            console.error("Gemini Unified Error:", error.message);
        }
        return null;
    }
};

/**
 * Generates smart financial insights based on current metrics.
 */
const getSmartInsights = async (metrics) => {
    const prompt = `
    As a smart financial assistant, provide 3 short, punchy, and helpful insights based on these metrics:
    Month: ${metrics.month}/${metrics.year}
    Budget: ₹${metrics.budget.total}
    Spent: ₹${metrics.totalSpent}
    Needs: ₹${metrics.categoryBreakdown.needs}
    Wants: ₹${metrics.categoryBreakdown.wants}
    
    Return a single paragraph (max 3 sentences) that sounds professional but friendly (Supabase style).
    Example: "You've saved 20% compared to last month. Consider moving ₹500 to savings."
    `;

    try {
        if (!model) return "You're doing great! Keep tracking your expenses to see patterns over time.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        return "You're doing great! Keep tracking your expenses to see patterns over time.";
    }
};

module.exports = {
    classifyAndParseMessage,
    getSmartInsights
};
