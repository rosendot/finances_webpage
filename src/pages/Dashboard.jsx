import React, { useEffect, useState } from 'react';
import { Grid, Paper, Button, Box } from '@mui/material';
import IncomeBudget from '../components/IncomeBudget';
import ActualIncome from '../components/ActualIncome';
import ExpensesBudget from '../components/ExpensesBudget';
import ActualExpenses from '../components/ActualExpenses';
import ProfitSummary from '../components/ProfitSummary';
import { toast } from 'react-toastify';
import { formatDateForAPI } from '../utils/dateUtils';
// Import our API modules
import { revenueApi, expensesApi } from '../api/api';
import { processQBO } from '../utils/qboProcessor';

function Dashboard() {
    const [revenueData, setRevenueData] = useState([]);
    const [expensesData, setExpensesData] = useState([]);

    useEffect(() => {
        fetchRevenueData();
        fetchExpensesData();
    }, []);

    const fetchRevenueData = async () => {
        try {
            const data = await revenueApi.getAll();
            console.log('revenue data:', data);
            setRevenueData(data);
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            toast.error('Failed to fetch revenue data');
        }
    };

    const fetchExpensesData = async () => {
        try {
            const data = await expensesApi.getAll();
            console.log('expenses data:', data);
            setExpensesData(data);
        } catch (error) {
            console.error('Error fetching expenses data:', error);
            toast.error('Failed to fetch expenses data');
        }
    };

    const calculateTotalBudgetIncome = () => {
        return revenueData.reduce((total, income) => total + parseFloat(income.expected_amount || 0), 0);
    };

    const calculateTotalActualIncome = () => {
        return revenueData.reduce((total, income) => total + parseFloat(income.amount || 0), 0);
    };

    const calculateTotalBudgetExpenses = () => {
        return expensesData.reduce((total, expense) => total + parseFloat(expense.expected_amount || 0), 0);
    };

    const calculateTotalActualExpenses = () => {
        return expensesData.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
    };

    const handleQBOImport = async (event) => {
        const file = event.target.files[0];
        if (file) {
            // Verify file type
            if (!file.name.toLowerCase().endsWith('.qbo')) {
                toast.error('Please upload a QBO file.');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const qboData = e.target.result;
                    const processedData = processQBO(qboData);

                    toast.info(`Processing ${processedData.income.length + processedData.expenses.length} transactions...`);

                    // Process the income items
                    if (processedData.income.length > 0) {
                        const incomeItems = processedData.income.map(income => ({
                            name: income.name,
                            amount: income.amount,
                            expected_amount: 0,
                            date: formatDateForAPI(income.date),
                            is_recurring: income.isRecurring,
                            category: 'Income'
                        }));

                        toast.info(`Importing ${incomeItems.length} income transactions...`);
                        const newIncomeItems = await revenueApi.bulkCreate(incomeItems);

                        // Update revenue data with new items
                        setRevenueData(prevData => [...prevData, ...newIncomeItems]);
                        toast.success(`Successfully imported ${newIncomeItems.length} income transactions`);
                    }

                    // Process the expense items
                    if (processedData.expenses.length > 0) {
                        const expenseItems = processedData.expenses.map(expense => ({
                            name: expense.name,
                            amount: expense.amount,
                            expected_amount: 0,
                            date: formatDateForAPI(expense.date),
                            is_recurring: expense.isRecurring,
                            category: expense.category
                        }));

                        toast.info(`Importing ${expenseItems.length} expense transactions...`);
                        const newExpenseItems = await expensesApi.bulkCreate(expenseItems);

                        // Update expenses data with new items
                        setExpensesData(prevData => [...prevData, ...newExpenseItems]);
                        toast.success(`Successfully imported ${newExpenseItems.length} expense transactions`);
                    }

                    toast.success('QBO import completed successfully!');
                } catch (error) {
                    console.error('Error processing QBO file:', error);
                    toast.error('Failed to import QBO data. Please check the file format and try again.');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <input
                    accept=".qbo"
                    style={{ display: 'none' }}
                    id="qbo-file"
                    type="file"
                    onChange={handleQBOImport}
                />
                <label htmlFor="qbo-file">
                    <Button variant="contained" component="span">
                        Import QBO
                    </Button>
                </label>
            </Box>

            <Grid container spacing={1} style={{ height: '80vh' }}>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper style={{ height: '100%', overflow: 'auto' }}>
                        <IncomeBudget revenueData={revenueData} setRevenueData={setRevenueData} />
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper style={{ height: '100%', overflow: 'auto' }}>
                        <ActualIncome revenueData={revenueData} setRevenueData={setRevenueData} />
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper style={{ height: '100%', overflow: 'auto' }}>
                        <ExpensesBudget expensesData={expensesData} setExpensesData={setExpensesData} />
                    </Paper>
                    <ProfitSummary
                        budgetIncome={calculateTotalBudgetIncome()}
                        budgetExpenses={calculateTotalBudgetExpenses()}
                        actualIncome={calculateTotalActualIncome()}
                        actualExpenses={calculateTotalActualExpenses()}
                    />
                </Grid>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper style={{ height: '100%', overflow: 'auto' }}>
                        <ActualExpenses expensesData={expensesData} setExpensesData={setExpensesData} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;