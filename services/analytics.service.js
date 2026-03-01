const prisma = require('../utils/prisma');
const geminiService = require('./gemini.service');

const getDashboardAnalytics = async (month, year) => {
    // 1. Get total budget for the month
    const budget = await prisma.budget.findUnique({
        where: {
            month_year: {
                month,
                year
            }
        }
    });

    const budgetTotal = budget ? budget.totalAmount : 0;

    // 2. Get all expenses for the month
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const expenses = await prisma.expense.findMany({
        where: {
            transactionDate: {
                gte: startDate,
                lte: endDate
            }
        }
    });

    // 3. Calculate metrics
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const needsSpent = expenses
        .filter(exp => exp.categoryType === 'need')
        .reduce((sum, exp) => sum + exp.amount, 0);

    const wantsSpent = expenses
        .filter(exp => exp.categoryType === 'want')
        .reduce((sum, exp) => sum + exp.amount, 0);

    const remainingBudget = budgetTotal - totalSpent;

    const metrics = {
        month,
        year,
        budget: {
            total: budgetTotal,
            remaining: remainingBudget
        },
        totalSpent,
        categoryBreakdown: {
            needs: needsSpent,
            wants: wantsSpent
        }
    };

    // 4. Get the last 10 transactions globally for the dashboard view
    const recentTransactions = await prisma.expense.findMany({
        take: 10,
        orderBy: {
            transactionDate: 'desc'
        }
    });

    // 5. Calculate Average-Based Comparison
    const now = new Date();
    const currentDay = now.getUTCDate();
    let comparison = { diffAmount: 0, diffPercentage: 0, trend: 'stable', type: 'average' };

    // Only compare if we are looking at the current month
    if (month === (now.getUTCMonth() + 1) && year === now.getUTCFullYear()) {
        const prevMonthDate = new Date(Date.UTC(year, month - 2, 1));
        const prevMonth = prevMonthDate.getUTCMonth() + 1;
        const prevYear = prevMonthDate.getUTCFullYear();

        // 1. Get entire previous month's spending
        const prevMonthStart = new Date(Date.UTC(prevYear, prevMonth - 1, 1));
        const prevMonthEnd = new Date(Date.UTC(prevYear, prevMonth, 0, 23, 59, 59, 999));
        const daysInPrevMonth = prevMonthEnd.getUTCDate();

        const prevExpenses = await prisma.expense.findMany({
            where: {
                transactionDate: {
                    gte: prevMonthStart,
                    lte: prevMonthEnd
                }
            }
        });

        const prevTotalSpent = prevExpenses.reduce((sum, e) => sum + e.amount, 0);

        // 2. Calculate average daily spend of prev month
        const prevDailyAvg = prevTotalSpent / daysInPrevMonth;

        // 3. Expected spend till current day based on prev avg
        const expectedSpend = Math.round(prevDailyAvg * currentDay);

        const diffAmount = totalSpent - expectedSpend;
        const diffPercentage = expectedSpend > 0 ? (Math.abs(diffAmount) / expectedSpend) * 100 : 0;

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        comparison = {
            diffAmount: Math.abs(diffAmount),
            diffPercentage: Math.round(diffPercentage),
            trend: diffAmount > 0 ? 'up' : (diffAmount < 0 ? 'down' : 'stable'),
            prevTotalSpent,
            prevDailyAvg: Math.round(prevDailyAvg),
            expectedSpend,
            type: 'average',
            prevMonthName: monthNames[prevMonth - 1]
        };
    }

    // 6. Get smart insight from Gemini
    const smartInsight = await geminiService.getSmartInsights(metrics);

    return {
        ...metrics,
        expenses,
        recentTransactions,
        comparison,
        smartInsight
    };
};

const getHistory = async () => {
    try {
        const history = [];
        const currentDate = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // 1. Fetch all expenses to bucket them locally (efficient for personal trackers, avoids N+1 queries)
        const allExpenses = await prisma.expense.findMany({
            orderBy: { transactionDate: 'desc' }
        });

        const currentYear = currentDate.getUTCFullYear();
        const currentMonth = currentDate.getUTCMonth();

        let monthsToFetch = 1; // Default to at least the current month

        if (allExpenses.length > 0) {
            // Find the oldest record 
            const oldestDate = allExpenses[allExpenses.length - 1].transactionDate;
            const oldestYear = oldestDate.getUTCFullYear();
            const oldestMonth = oldestDate.getUTCMonth();

            // Calculate how many months between now and the oldest transaction
            monthsToFetch = (currentYear - oldestYear) * 12 + (currentMonth - oldestMonth) + 1;
            if (monthsToFetch < 1) monthsToFetch = 1;
        }

        // 2. Iterate dynamically based on the age of the oldest transaction
        for (let i = 0; i < monthsToFetch; i++) {
            // Use Date.UTC to get the first day of the target month in UTC
            const d = new Date(Date.UTC(currentYear, currentMonth - i, 1));
            const month = d.getUTCMonth() + 1;
            const year = d.getUTCFullYear();

            const startDate = new Date(Date.UTC(year, month - 1, 1));
            const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

            // Bucket dynamically from memory
            const monthExpenses = allExpenses.filter(e =>
                e.transactionDate >= startDate && e.transactionDate <= endDate
            );

            const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
            const needs = monthExpenses.filter(e => e.categoryType === 'need').reduce((sum, e) => sum + e.amount, 0);
            const wants = monthExpenses.filter(e => e.categoryType === 'want').reduce((sum, e) => sum + e.amount, 0);

            history.push({
                month,
                year,
                monthName: monthNames[month - 1],
                total,
                needs,
                wants
            });
        }
        return history;
    } catch (error) {
        console.error("Error generating history:", error);
        return [];
    }
};

module.exports = {
    getDashboardAnalytics,
    getHistory
};
