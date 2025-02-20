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
            setRevenueData(response.data);
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            toast.error('Failed to fetch revenue data');
        }
    };

    const fetchExpensesData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/expenses');
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
                updateDataFromCSV(processedData);
            };
            reader.readAsText(file);
        }
    };

    const updateDataFromCSV = async (processedData) => {
        const { income, expenses } = processedData;

        try {
            // Update income records
            for (const item of income) {
                await axios.post('http://localhost:5000/api/revenue', item);
            }

            // Update expense records
            for (const item of expenses) {
                await axios.post('http://localhost:5000/api/expenses', item);
            }

            // Refresh data
            fetchRevenueData();
            fetchExpensesData();

            toast.success('CSV data imported successfully!');
        } catch (error) {
            console.error('Error updating data:', error);
            toast.error('Failed to import some data');
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