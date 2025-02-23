import React, { useEffect, useState } from 'react';
import { Grid, Paper, Button, Box } from '@mui/material';
import IncomeBudget from '../components/IncomeBudget';
import ActualIncome from '../components/ActualIncome';
import ExpensesBudget from '../components/ExpensesBudget';
import ActualExpenses from '../components/ActualExpenses';
import ProfitSummary from '../components/ProfitSummary';
import axios from 'axios';
import { toast } from 'react-toastify';
import { processCSV } from '../utils/csvProcessor';
import { formatDateForAPI } from '../utils/dateUtils';

function Dashboard() {
    const [revenueData, setRevenueData] = useState([]);
    const [expensesData, setExpensesData] = useState([]);

    useEffect(() => {
        fetchRevenueData();
        fetchExpensesData();
    }, []);

    const fetchRevenueData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/revenue');
            console.log('revenue data:', response.data);
            setRevenueData(response.data);
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            toast.error('Failed to fetch revenue data');
        }
    };

    const fetchExpensesData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/expenses');
            console.log('expenses data:', response.data);
            setExpensesData(response.data);
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

    const handleCSVImport = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvData = e.target.result;
                const processedData = processCSV(csvData);

                let incomeProcessed = 0;
                let expensesProcessed = 0;
                const totalItems = processedData.income.length + processedData.expenses.length;

                const newRevenueData = [...revenueData];
                const newExpensesData = [...expensesData];

                // Process income synchronously
                for (const income of processedData.income) {
                    try {
                        axios.post('http://localhost:5000/api/revenue', {
                            name: income.name,
                            amount: income.amount,
                            date: formatDateForAPI(income.date),
                            is_recurring: income.isRecurring
                        }).then(response => {
                            newRevenueData.push(response.data);
                        });
                        incomeProcessed++;
                        toast.info(`Processed ${incomeProcessed + expensesProcessed} of ${totalItems} items (Income: ${income.name})`);
                    } catch (error) {
                        toast.error(`Failed to import income: ${income.name}`);
                        console.error('Error importing income:', error);
                    }
                }

                // Process expenses synchronously
                for (const expense of processedData.expenses) {
                    try {
                        axios.post('http://localhost:5000/api/expenses', {
                            name: expense.name,
                            amount: expense.amount,
                            date: formatDateForAPI(expense.date),
                            category: expense.category,
                            is_recurring: expense.isRecurring
                        }).then(response => {
                            newExpensesData.push(response.data);
                        });
                        expensesProcessed++;
                        toast.info(`Processed ${incomeProcessed + expensesProcessed} of ${totalItems} items (Expense: ${expense.name})`);
                    } catch (error) {
                        toast.error(`Failed to import expense: ${expense.name}`);
                        console.error('Error importing expense:', error);
                    }
                }

                // Update state with new data
                setRevenueData(newRevenueData);
                setExpensesData(newExpensesData);

                // Final summary
                const successfulImports = incomeProcessed + expensesProcessed;
                const failedImports = totalItems - successfulImports;

                if (failedImports === 0) {
                    toast.success(`Import complete! Successfully imported ${successfulImports} items`);
                } else {
                    toast.warning(`Import complete with some issues. Imported ${successfulImports} items, ${failedImports} failed`);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 2 }}>
                <input
                    accept=".csv"
                    style={{ display: 'none' }}
                    id="csv-file"
                    type="file"
                    onChange={handleCSVImport}
                />
                <label htmlFor="csv-file">
                    <Button variant="contained" component="span">
                        Import CSV
                    </Button>
                </label>
            </Box>
            <Grid container spacing={2} style={{ height: 'calc(100vh - 120px)' }}>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper elevation={3} style={{ height: '100%', overflow: 'auto' }}>
                        <IncomeBudget revenueData={revenueData} setRevenueData={setRevenueData} />
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper elevation={3} style={{ height: '100%', overflow: 'auto' }}>
                        <ActualIncome revenueData={revenueData} setRevenueData={setRevenueData} />
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper elevation={3} style={{ height: '100%', overflow: 'auto' }}>
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
                    <Paper elevation={3} style={{ height: '100%', overflow: 'auto' }}>
                        <ActualExpenses expensesData={expensesData} setExpensesData={setExpensesData} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;