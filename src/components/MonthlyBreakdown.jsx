// src/components/MonthlyBreakdown.jsx
import React, { useState } from 'react';
import {
    Paper, Typography, Select, MenuItem, FormControl,
    InputLabel, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Box
} from '@mui/material';

const MonthlyBreakdown = ({ monthlyData }) => {
    const [selectedMonth, setSelectedMonth] = useState('');

    const formatMonthName = (monthNumber) => {
        const date = new Date(2000, monthNumber - 1, 1);
        return date.toLocaleString('default', { month: 'long' });
    };

    const months = monthlyData.map(data => ({
        value: data.month,
        label: formatMonthName(data.month)
    })).sort((a, b) => a.value - b.value);

    const selectedMonthData = monthlyData.find(data => data.month == selectedMonth);

    const calculateRemainingBudget = () => {
        if (!selectedMonthData) return { amount: 0, percentage: 0 };

        const budgeted = parseFloat(selectedMonthData.budget_expenses || 0);
        const actual = parseFloat(selectedMonthData.actual_expenses || 0);

        const amount = budgeted - actual;
        const percentage = budgeted > 0 ? (amount / budgeted) * 100 : 0;

        return { amount, percentage };
    };

    const remainingBudget = calculateRemainingBudget();

    return (
        <Paper style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>Monthly Breakdown</Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Month</InputLabel>
                <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    label="Select Month"
                >
                    {months.map(month => (
                        <MenuItem key={month.value} value={month.value}>
                            {month.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedMonthData ? (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            {formatMonthName(selectedMonthData.month)} Summary
                        </Typography>

                        <Typography>
                            <strong>Budget Income:</strong> ${parseFloat(selectedMonthData.budget_income).toFixed(2)}
                        </Typography>
                        <Typography>
                            <strong>Actual Income:</strong> ${parseFloat(selectedMonthData.actual_income).toFixed(2)}
                        </Typography>
                        <Typography>
                            <strong>Budget Expenses:</strong> ${parseFloat(selectedMonthData.budget_expenses).toFixed(2)}
                        </Typography>
                        <Typography>
                            <strong>Actual Expenses:</strong> ${parseFloat(selectedMonthData.actual_expenses).toFixed(2)}
                        </Typography>
                        <Typography>
                            <strong>Profit:</strong> ${parseFloat(selectedMonthData.profit).toFixed(2)}
                        </Typography>
                        <Typography>
                            <strong>Savings Rate:</strong> {parseFloat(selectedMonthData.savings_rate).toFixed(2)}%
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Budget Status
                        </Typography>

                        <Typography sx={{
                            color: remainingBudget.amount >= 0 ? 'success.main' : 'error.main',
                            fontWeight: 'bold'
                        }}>
                            {remainingBudget.amount >= 0
                                ? `Under budget by $${Math.abs(remainingBudget.amount).toFixed(2)} (${Math.abs(remainingBudget.percentage).toFixed(1)}%)`
                                : `Over budget by $${Math.abs(remainingBudget.amount).toFixed(2)} (${Math.abs(remainingBudget.percentage).toFixed(1)}%)`
                            }
                        </Typography>
                    </Box>

                    {/* Add category breakdown if you have the data */}
                </>
            ) : (
                <Typography>Select a month to view details</Typography>
            )}
        </Paper>
    );
};

export default MonthlyBreakdown;