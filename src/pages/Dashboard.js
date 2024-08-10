import React, { useEffect, useState } from 'react';
import { Grid, Paper, Button, Box } from '@mui/material';
import IncomeBudget from '../components/IncomeBudget';
import ActualIncome from '../components/ActualIncome';
import ExpensesBudget from '../components/ExpensesBudget';
import ActualExpenses from '../components/ActualExpenses';
import axios from 'axios';
import { toast } from 'react-toastify';

function Dashboard() {
    const [revenueData, setRevenueData] = useState([]);
    const [expensesData, setExpensesData] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchRevenueData();
        fetchExpensesData();
        fetchCategories();
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

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to fetch categories');
        }
    };

    const handleSave = async () => {
        try {
            await axios.post('http://localhost:5000/api/save', {
                revenue: revenueData,
                expenses: expensesData
            });
            toast.success('Data saved successfully!');
        } catch (error) {
            console.error('Error saving data:', error);
            toast.error('Error saving data. Please try again.');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSave}>
                    Save Data
                </Button>
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
                        <ExpensesBudget
                            expensesData={expensesData}
                            setExpensesData={setExpensesData}
                            categories={categories}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper elevation={3} style={{ height: '100%', overflow: 'auto' }}>
                        <ActualExpenses
                            expensesData={expensesData}
                            setExpensesData={setExpensesData}
                            categories={categories}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;