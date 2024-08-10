import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function BudgetSummary({ revenueData, expensesData, categories }) {
    const calculateTotal = (data) => data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    const calculateCategoryTotal = (categoryId) => {
        return expensesData
            .filter(expense => expense.category_id === categoryId)
            .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    };

    const totalRevenue = calculateTotal(revenueData);
    const totalExpenses = calculateTotal(expensesData);
    const profit = totalRevenue - totalExpenses;

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Expected Amount</TableCell>
                        <TableCell align="right">Actual Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* Revenue Section */}
                    <TableRow>
                        <TableCell colSpan={3}><strong>Income</strong></TableCell>
                    </TableRow>
                    {revenueData.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">${parseFloat(item.expected_amount || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">${parseFloat(item.amount || 0).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell><strong>Total Income</strong></TableCell>
                        <TableCell align="right"><strong>${totalRevenue.toFixed(2)}</strong></TableCell>
                        <TableCell align="right"><strong>${totalRevenue.toFixed(2)}</strong></TableCell>
                    </TableRow>

                    {/* Expenses Section */}
                    <TableRow>
                        <TableCell colSpan={3}><strong>Expenses</strong></TableCell>
                    </TableRow>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>{category.name}</TableCell>
                            <TableCell align="right">$0.00</TableCell>
                            <TableCell align="right">${calculateCategoryTotal(category.id).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell><strong>Total Expenses</strong></TableCell>
                        <TableCell align="right"><strong>$0.00</strong></TableCell>
                        <TableCell align="right"><strong>${totalExpenses.toFixed(2)}</strong></TableCell>
                    </TableRow>

                    {/* Profit/Loss Section */}
                    <TableRow>
                        <TableCell><strong>Profit (Income - Expenses)</strong></TableCell>
                        <TableCell align="right"><strong>${totalRevenue.toFixed(2)}</strong></TableCell>
                        <TableCell align="right"><strong>${profit.toFixed(2)}</strong></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default BudgetSummary;