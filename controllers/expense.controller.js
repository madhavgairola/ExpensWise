const expenseService = require('../services/expense.service');
const analyticsService = require('../services/analytics.service');

const uploadCSV = async (req, res) => {
    try {
        // Assuming multer is configured in the router file just before reaching this controller.
        // For simplicity, we'll setup multer here.
        const multer = require('multer');
        const upload = multer({ dest: 'uploads/' }).single('file');

        upload(req, res, async function (err) {
            if (err) {
                return res.status(400).json({ error: 'Error uploading file' });
            }

            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const result = await expenseService.processCSV(file.path);
            res.status(200).json(result);
        });
    } catch (error) {
        console.error('Error handling CSV upload:', error);
        res.status(500).json({ error: 'Failed to process CSV upload', details: error.message });
    }
};

const getDashboardAnalytics = async (req, res) => {
    try {
        const { month, year } = req.query;

        const currentDate = new Date();
        const queryMonth = month ? parseInt(month) : currentDate.getUTCMonth() + 1;
        const queryYear = year ? parseInt(year) : currentDate.getUTCFullYear();

        const result = await analyticsService.getDashboardAnalytics(queryMonth, queryYear);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching dashboard analytics:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data', details: error.message });
    }
};

const exportCSV = async (req, res) => {
    try {
        const csvData = await expenseService.getExpensesAsCSV();

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
        res.status(200).send(csvData);
    } catch (error) {
        console.error('Error exporting expenses to CSV:', error);
        res.status(500).json({ error: 'Failed to export expenses', details: error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const result = await analyticsService.getHistory();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching historical analytics:', error);
        res.status(500).json({ error: 'Failed to fetch historical data', details: error.message });
    }
};

const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await expenseService.updateExpense(id, req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Failed to update expense', details: error.message });
    }
};

const deleteExpense = async (id_param) => {
    // This is for internal use or simple router call if id from params
};

const deleteExpenseHandler = async (req, res) => {
    try {
        const { id } = req.params;
        await expenseService.deleteExpense(id);
        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense', details: error.message });
    }
};

const deleteLastTransaction = async (req, res) => {
    try {
        const result = await expenseService.deleteLastTransaction();
        if (!result) {
            return res.status(404).json({ error: 'No transactions found to delete' });
        }
        res.status(200).json({ success: true, message: 'Last transaction deleted', data: result });
    } catch (error) {
        console.error('Error deleting last transaction:', error);
        res.status(500).json({ error: 'Failed to delete last transaction', details: error.message });
    }
};

module.exports = {
    uploadCSV,
    getDashboardAnalytics,
    exportCSV,
    getHistory,
    updateExpense,
    deleteExpense: deleteExpenseHandler,
    deleteLastTransaction
};
