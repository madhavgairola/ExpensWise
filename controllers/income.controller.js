const prisma = require('../utils/prisma');

const logIncome = async (req, res) => {
    try {
        const { amount, transactionDate, description } = req.body;
        const userId = req.user.id;

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const income = await prisma.income.create({
            data: {
                amount: parseFloat(amount),
                transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
                description: description || 'Budget Addition',
                userId
            }
        });

        res.status(201).json({ message: 'Income logged successfully', income });
    } catch (error) {
        console.error('Log income error:', error);
        res.status(500).json({ message: 'Server error while logging income' });
    }
};

const getIncomes = async (req, res) => {
    try {
        const userId = req.user.id;
        const incomes = await prisma.income.findMany({
            where: { userId },
            orderBy: { transactionDate: 'desc' }
        });
        res.json(incomes);
    } catch (error) {
        console.error('Get incomes error:', error);
        res.status(500).json({ message: 'Server error while fetching incomes' });
    }
};

const deleteIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const income = await prisma.income.findUnique({ where: { id } });

        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        if (income.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await prisma.income.delete({ where: { id } });
        res.json({ message: 'Income deleted successfully' });
    } catch (error) {
        console.error('Delete income error:', error);
        res.status(500).json({ message: 'Server error while deleting income' });
    }
};

module.exports = {
    logIncome,
    getIncomes,
    deleteIncome
};
