const express = require('express');
const router = express.Router();
const revenueController = require('./controllers/revenueController');
const expensesController = require('./controllers/expensesController');
const reportController = require('./controllers/reportController');

// Revenue routes
router.get('/revenue', revenueController.getAllRevenue);
router.put('/revenue/:id', revenueController.updateRevenue);
router.post('/revenue/bulk', revenueController.bulkCreateRevenue);
router.post('/revenue', revenueController.createRevenue);
router.delete('/revenue/bulk', revenueController.bulkDeleteRevenue);
router.delete('/revenue/:id', revenueController.deleteRevenue);

// Expenses routes
router.get('/expenses', expensesController.getAllExpenses);
router.put('/expenses/:id', expensesController.updateExpense);
router.post('/expenses/bulk', expensesController.bulkCreateExpenses);
router.post('/expenses', expensesController.createExpense);
router.delete('/expenses/bulk', expensesController.bulkDeleteExpenses);
router.delete('/expenses/:id', expensesController.deleteExpense);

// Reports routes
router.get('/monthly-data/:year', reportController.getMonthlyData);
router.post('/monthly-report', reportController.saveMonthlyReport);
router.get('/yearly-summary/:year', reportController.getYearlySummary);
module.exports = router;