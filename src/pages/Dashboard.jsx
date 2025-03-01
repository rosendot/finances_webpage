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

    const handleCSVImport = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const csvData = e.target.result;
                const processedData = processCSV(csvData);

                toast.info(`Processing ${processedData.income.length + processedData.expenses.length} items...`);

                try {
                    // Bulk import income items
                    if (processedData.income.length > 0) {
                        const incomeItems = processedData.income.map(income => ({
                            name: income.name,
                            amount: income.amount,
                            expected_amount: 0, // Set default or calculate as needed
                            date: formatDateForAPI(income.date),
                            is_recurring: income.isRecurring,
                            category: 'Income'
                        }));

                        toast.info(`Importing ${incomeItems.length} income transactions...`);
                        const incomeResponse = await axios.post('http://localhost:5000/api/revenue/bulk', {
                            items: incomeItems
                        });

                        // Update revenue data with new items
                        setRevenueData(prevData => [...prevData, ...incomeResponse.data]);
                        toast.success(`Successfully imported ${incomeResponse.data.length} income transactions`);
                    }

                    // Bulk import expense items
                    if (processedData.expenses.length > 0) {
                        const expenseItems = processedData.expenses.map(expense => ({
                            name: expense.name,
                            amount: expense.amount,
                            expected_amount: 0, // Set default or calculate as needed
                            date: formatDateForAPI(expense.date),
                            is_recurring: expense.isRecurring,
                            category: expense.category
                        }));

                        toast.info(`Importing ${expenseItems.length} expense transactions...`);
                        const expenseResponse = await axios.post('http://localhost:5000/api/expenses/bulk', {
                            items: expenseItems
                        });

                        // Update expenses data with new items
                        setExpensesData(prevData => [...prevData, ...expenseResponse.data]);
                        toast.success(`Successfully imported ${expenseResponse.data.length} expense transactions`);
                    }

                    toast.success('CSV import completed successfully!');
                } catch (error) {
                    console.error('Error during bulk import:', error);
                    toast.error('Failed to import CSV data. Please try again or check the server logs.');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
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
        </Box >
    );
}

export default Dashboard;