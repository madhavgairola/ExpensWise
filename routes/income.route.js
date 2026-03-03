const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/income.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate); // Protect all income routes

router.post('/', incomeController.logIncome);
router.get('/', incomeController.getIncomes);
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;
