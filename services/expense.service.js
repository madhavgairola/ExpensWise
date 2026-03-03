const fs = require('fs');
const csvParser = require('csv-parser');
const prisma = require('../utils/prisma');
const csvUtil = require('../utils/csv.util');

const processCSV = async (filePath, userId) => {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    const parsedExpenses = results.map(row => {
                        const amount = parseFloat(row.amount);

                        if (isNaN(amount) || amount >= 0) {
                            return null;
                        }

                        return {
                            amount: Math.abs(amount),
                            description: row.description || 'CSV Import',
                            categoryType: row.categoryType || 'want',
                            subcategory: row.subcategory || 'General',
                            transactionDate: new Date(row.date || Date.now()),
                            source: 'csv',
                            userId
                        };
                    }).filter(e => e !== null);

                    if (parsedExpenses.length > 0) {
                        await prisma.expense.createMany({
                            data: parsedExpenses,
                        });
                    }

                    fs.unlinkSync(filePath);
                    resolve({ success: true, count: parsedExpenses.length });
                } catch (error) {
                    console.error('Error processing CSV data:', error);
                    reject(error);
                }
            })
            .on('error', (error) => reject(error));
    });
};

const getExpensesAsCSV = async (userId) => {
    const expenses = await prisma.expense.findMany({
        where: { userId },
        orderBy: { transactionDate: 'desc' },
    });

    return csvUtil.convertToCSV(expenses);
};

const deleteExpense = async (id, userId) => {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== userId) {
        throw new Error('Unauthorized or expense not found');
    }

    return await prisma.expense.delete({
        where: { id }
    });
};

const updateExpense = async (id, data, userId) => {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== userId) {
        throw new Error('Unauthorized or expense not found');
    }

    return await prisma.expense.update({
        where: { id },
        data: {
            amount: data.amount ? parseFloat(data.amount) : undefined,
            description: data.description,
            categoryType: data.categoryType,
            subcategory: data.subcategory || 'General',
            transactionDate: data.transactionDate ? new Date(data.transactionDate) : undefined
        }
    });
};

const deleteLastTransaction = async (userId) => {
    const lastExpense = await prisma.expense.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });

    if (!lastExpense) return null;

    return await prisma.expense.delete({
        where: { id: lastExpense.id }
    });
};

module.exports = {
    processCSV,
    getExpensesAsCSV,
    deleteExpense,
    updateExpense,
    deleteLastTransaction
};
