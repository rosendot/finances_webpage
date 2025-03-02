const express = require('express');
const router = express.Router();
const revenueController = require('./controllers/revenueController');
const expensesController = require('./controllers/expensesController');

// Revenue routes
router.get('/revenue', revenueController.getAllRevenue);
router.put('/revenue/:id', revenueController.updateRevenue);
router.post('/revenue', revenueController.createRevenue);
router.delete('/revenue/:id', revenueController.deleteRevenue);
router.delete('/revenue/bulk', revenueController.bulkDeleteRevenue);
router.post('/revenue/bulk', revenueController.bulkCreateRevenue);

// Expenses routes
router.get('/expenses', expensesController.getAllExpenses);
router.put('/expenses/:id', expensesController.updateExpense);
router.post('/expenses', expensesController.createExpense);
router.delete('/expenses/:id', expensesController.deleteExpense);
router.delete('/expenses/bulk', expensesController.bulkDeleteExpenses);
router.post('/expenses/bulk', expensesController.bulkCreateExpenses);

module.exports = router;