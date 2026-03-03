const prisma = require('../utils/prisma');
const analyticsService = require('./analytics.service');
const geminiService = require('./gemini.service');

// Intelligent Fallback Logic (Regex-based)
const fallbackProcess = async (message, userId) => {
    const segments = message.includes(';') ? message.split(';') : [message];
    const results = [];
    let finalIntent = 'ADD_EXPENSE';

    for (const segment of segments) {
        const segTrim = segment.trim();
        if (!segTrim) continue;

        const segLower = segTrim.toLowerCase();

        let extractedDate = undefined;
        let amountMatchRaw = "";

        if (segLower.startsWith('yesterday')) {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            extractedDate = d.toISOString().split('T')[0];
        } else {
            const dateRegex = /^(\d{1,2})(?:\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:\s+(20\d{2}))?)?(?=\s)/i;
            const dateMatch = segTrim.match(dateRegex);
            if (dateMatch && parseInt(dateMatch[1]) <= 31) {
                const day = parseInt(dateMatch[1]);
                const monthStr = dateMatch[2];
                let year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear();

                let month = new Date().getMonth() + 1;
                if (monthStr) {
                    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                    month = monthNames.indexOf(monthStr.substring(0, 3).toLowerCase()) + 1;
                }
                extractedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
        }

        const amountRegex = /[₹\$]?(\d+(?:\.\d{1,2})?)([kK])?\b/g;
        const numberMatches = [...segTrim.matchAll(amountRegex)];
        let amount = 0;

        if (numberMatches.length === 1) {
            amount = parseFloat(numberMatches[0][1]);
            if (numberMatches[0][2]) amount *= 1000;
            amountMatchRaw = numberMatches[0][0];
        } else if (numberMatches.length > 1) {
            const firstNum = parseFloat(numberMatches[0][1]) * (numberMatches[0][2] ? 1000 : 1);
            const secondNum = parseFloat(numberMatches[1][1]) * (numberMatches[1][2] ? 1000 : 1);

            if (firstNum <= 31 && numberMatches[0][0].indexOf('₹') === -1 && numberMatches[0][0].indexOf('$') === -1 && !numberMatches[0][2]) {
                amount = secondNum;
                amountMatchRaw = numberMatches[1][0];
            } else {
                amount = firstNum;
                amountMatchRaw = numberMatches[0][0];
            }
        }

        let segIntent = 'ADD_EXPENSE';
        const addBudgetKeywords = ['bonus', 'salary', 'received', 'income', 'gift', 'earned', 'extra', 'add'];
        const setBudgetKeywords = ['set', 'update', 'decrease', 'change', 'new'];

        if (segLower.includes('budget') && setBudgetKeywords.some(k => segLower.includes(k))) {
            segIntent = 'SET_BUDGET';
        } else if (addBudgetKeywords.some(keyword => segLower.includes(keyword)) || segLower.includes('budget')) {
            segIntent = 'ADD_BUDGET';
        } else if ((segLower.includes('delete') || segLower.includes('remove') || segLower.includes('undo') || segLower.includes('cancel') || segLower.includes('clear')) &&
            (segLower.includes('last') || segLower.includes('previous') || segLower.includes('recent') || segLower.includes('entry') || segLower.includes('transaction'))) {
            segIntent = 'DELETE_LAST';
        } else if (segLower.includes('analytics') || segLower.includes('how much') || segLower.includes('status') || segLower.includes('show')) {
            segIntent = 'QUERY_ANALYTICS';
        }

        if (segIntent !== 'ADD_EXPENSE') finalIntent = segIntent;

        if (segIntent === 'ADD_EXPENSE' && amount > 0) {
            let description = segTrim.replace(amountMatchRaw, '').trim();
            description = description.replace(/^(yesterday|\d{1,2}(?:\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:\s+20\d{2})?)?)\s+/i, '').trim();
            description = description.replace(/on|for|spent|paid|\bneed\b|\bwant\b/gi, '').trim() || 'Expense';

            results.push({
                amount,
                description: description.charAt(0).toUpperCase() + description.slice(1),
                categoryType: (segLower.includes('rent') || segLower.includes('grocery') || segLower.includes('bill') || segLower.includes('food') || segLower.includes('metro') || segLower.includes('college')) ? 'need' : 'want',
                subcategory: 'General',
                date: extractedDate
            });
        } else if (segIntent === 'ADD_BUDGET' && amount > 0) {
            return { intent: 'ADD_BUDGET', data: { amount, date: extractedDate } };
        } else if (segIntent === 'SET_BUDGET' && amount > 0) {
            return { intent: 'SET_BUDGET', data: { amount, date: extractedDate } };
        } else if (segIntent === 'DELETE_LAST') {
            return { intent: 'DELETE_LAST', data: null };
        } else if (segIntent === 'QUERY_ANALYTICS') {
            return { intent: 'QUERY_ANALYTICS', data: {} };
        }
    }

    return { intent: finalIntent, data: results };
};

const processInteraction = async (message, userId) => {
    if (message.includes(';')) {
        const segments = message.split(';').map(s => s.trim()).filter(Boolean);
        const combinedResults = [];
        let finalResponse = "";

        for (const segment of segments) {
            const result = await processInteraction(segment, userId);
            if (result.data) {
                if (Array.isArray(result.data)) combinedResults.push(...result.data);
                else combinedResults.push(result.data);
            }
            finalResponse += (finalResponse ? " " : "") + result.message;
        }

        return {
            message: combinedResults.length > 0 ? `Processed ${combinedResults.length} entries. ${finalResponse}` : finalResponse,
            intent: 'ADD_EXPENSE',
            data: combinedResults,
            isAI: true
        };
    }

    let aiResult = null;
    let isAI = false;

    try {
        aiResult = await geminiService.classifyAndParseMessage(message);
        if (aiResult && aiResult.intent !== 'UNKNOWN') {
            isAI = true;
        }
    } catch (error) {
        console.warn("Gemini 2.0 error, switching to Fallback Engine:", error.message);
    }

    if (!isAI || (aiResult.intent === 'ADD_EXPENSE' && (!Array.isArray(aiResult.data) || aiResult.data.length === 0))) {
        aiResult = await fallbackProcess(message, userId);
        if (aiResult.intent !== 'ADD_EXPENSE') isAI = false;
    }

    if (!aiResult || !aiResult.intent) {
        return { message: "I'm having trouble understanding that. Could you rephrase?", intent: "UNKNOWN", isAI: false };
    }

    if (aiResult.intent === 'ADD_EXPENSE' && (!Array.isArray(aiResult.data) || aiResult.data.length === 0)) {
        return { message: "I couldn't find any expense details. Try phrasing it like '100 for food'.", intent: aiResult.intent, isAI: false };
    }

    const { intent, data } = aiResult;

    switch (intent) {
        case 'ADD_EXPENSE': {
            const createdExpenses = [];
            for (const item of data) {
                const expense = await prisma.expense.create({
                    data: {
                        amount: item.amount,
                        description: item.description,
                        categoryType: item.categoryType || 'want',
                        subcategory: item.subcategory || 'General',
                        transactionDate: item.date ? new Date(item.date) : new Date(),
                        source: 'chat',
                        userId
                    }
                });
                createdExpenses.push(expense);
            }

            return {
                message: createdExpenses.length === 1
                    ? `Added ₹${createdExpenses[0].amount} for ${createdExpenses[0].description}.`
                    : `Added ${createdExpenses.length} transactions.`,
                intent,
                data: createdExpenses.length === 1 ? createdExpenses[0] : createdExpenses,
                isAI
            };
        }

        case 'ADD_BUDGET': {
            const amount = data?.amount || 0;
            if (amount <= 0) return { message: "Invalid budget amount.", intent, isAI: false };

            const income = await prisma.income.create({
                data: {
                    amount,
                    transactionDate: data.date ? new Date(data.date) : new Date(),
                    description: 'Budget Addition (Chat)',
                    userId
                }
            });

            return { message: `Added ₹${amount} to your budget.`, intent, data: income, isAI };
        }

        case 'SET_BUDGET': {
            const amount = data?.amount || 0;
            if (amount <= 0) return { message: "Invalid budget amount.", intent, isAI: false };

            // For SET_BUDGET via chat, we'll just treat it as an Income addition for now
            // as the circular progress sums all incomes.
            const income = await prisma.income.create({
                data: {
                    amount,
                    transactionDate: data.date ? new Date(data.date) : new Date(),
                    description: 'Set Budget (Chat)',
                    userId
                }
            });

            return { message: `Set your budget/income to ₹${amount}.`, intent, data: income, isAI };
        }

        case 'QUERY_ANALYTICS': {
            const currentDate = new Date();
            const analytics = await analyticsService.getDashboardAnalytics(currentDate.getUTCMonth() + 1, currentDate.getUTCFullYear(), userId);
            return { message: `Spent: ₹${analytics.totalSpent}. Remaining: ₹${analytics.budget.remaining}.`, intent, data: analytics, isAI };
        }

        case 'DELETE_LAST': {
            const result = await prisma.expense.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
            if (!result) return { message: "No recently added transactions.", intent, isAI: false };
            await prisma.expense.delete({ where: { id: result.id } });
            return { message: `Deleted ₹${result.amount} for ${result.description}.`, intent, data: result, isAI };
        }

        default:
            return { message: "I'm not sure how to help with that yet.", intent, isAI: false };
    }
};

module.exports = {
    processInteraction
};
