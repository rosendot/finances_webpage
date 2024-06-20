// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Grid, Paper, Button, Box } from '@mui/material';
import RevenueQuadrant from '../components/RevenueQuadrant';
import ExpensesQuadrant from '../components/ExpensesQuadrant';
import axios from 'axios';
import { toast } from 'react-toastify';

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

    const handleRevenueIncludeChange = (revenue) => {
        const updatedRevenueData = revenueData.map((item) =>
            item.name === revenue.name ? { ...item, include: !item.include } : item
        );
        setRevenueData(updatedRevenueData);
    };

    const handleExpenseIncludeChange = (expense) => {
        const updatedExpensesData = expensesData.map((item) =>
            item.name === expense.name ? { ...item, include: !item.include } : item
        );
        setExpensesData(updatedExpensesData);
    };

    const handleRevenueAmountChange = (revenue, amount) => {
        const updatedRevenueData = revenueData.map((item) =>
            item.name === revenue.name ? { ...item, amount: amount } : item
        );
        setRevenueData(updatedRevenueData);
    };

    const handleExpenseAmountChange = (expense, amount) => {
        const updatedExpensesData = expensesData.map((item) =>
            item.name === expense.name ? { ...item, amount: amount } : item
        );
        setExpensesData(updatedExpensesData);
    };

    const handleRevenueDateChange = (revenue, date) => {
        const updatedRevenueData = revenueData.map((item) =>
            item.name === revenue.name ? { ...item, date: date } : item
        );
        setRevenueData(updatedRevenueData);
    };

    const handleExpenseDateChange = (expense, date) => {
        const updatedExpensesData = expensesData.map((item) =>
            item.name === expense.name ? { ...item, date: date } : item
        );
        setExpensesData(updatedExpensesData);
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
                    <Paper elevation={3} style={{ height: '100%' }}>
                        <RevenueQuadrant
                            revenueData={revenueData}
                            onRevenueIncludeChange={handleRevenueIncludeChange}
                            onRevenueAmountChange={handleRevenueAmountChange}
                            onRevenueDateChange={handleRevenueDateChange}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper elevation={3} style={{ height: '100%' }}>
                        <ExpensesQuadrant
                            expensesData={expensesData}
                            onExpenseIncludeChange={handleExpenseIncludeChange}
                            onExpenseAmountChange={handleExpenseAmountChange}
                            onExpenseDateChange={handleExpenseDateChange}
                            setExpensesData={setExpensesData}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper elevation={3} style={{ height: '100%' }}>
                        {/* Add content for the bottom left quadrant */}
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper elevation={3} style={{ height: '100%' }}>
                        {/* Add content for the bottom right quadrant */}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;