const express = require('express');
const chatController = require('../controllers/chat.controller');
const expenseController = require('../controllers/expense.controller');

const router = express.Router();

router.post('/chat', chatController.handleChatInput);
router.post('/upload', expenseController.uploadCSV);
router.get('/dashboard', expenseController.getDashboardAnalytics);
router.get('/history', expenseController.getHistory);
router.get('/export', expenseController.exportCSV);

// New CRUD Routes
router.put('/expenses/:id', expenseController.updateExpense);
router.delete('/expenses/last', expenseController.deleteLastTransaction);
router.delete('/expenses/:id', expenseController.deleteExpense);

module.exports = router;
