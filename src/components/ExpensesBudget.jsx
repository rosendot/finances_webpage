import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Typography } from '@mui/material';

const ExpensesBudget = ({ expensesData, setExpensesData, categories }) => {
    const handleExpectedAmountChange = (categoryId, value) => {
        const updatedExpensesData = expensesData.map(expense =>
            expense.category_id === categoryId ? { ...expense, expected_amount: value } : expense
        );
        setExpensesData(updatedExpensesData);
    };

    const calculateTotal = () => {
        return categories.reduce((total, category) => {
            const categoryExpenses = expensesData.filter(expense => expense.category_id === category.id);
            const categoryTotal = categoryExpenses.reduce((sum, expense) => sum + parseFloat(expense.expected_amount || 0), 0);
            return total + categoryTotal;
        }, 0);
    };

    return (
        <div>
            <Typography variant="h6" gutterBottom>Expenses Budget</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell>Expected Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((category) => {
                            const categoryExpenses = expensesData.filter(expense => expense.category_id === category.id);
                            const categoryTotal = categoryExpenses.reduce((sum, expense) => sum + parseFloat(expense.expected_amount || 0), 0);
                            return (
                                <TableRow key={category.id}>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={categoryTotal || ''}
                                            onChange={(e) => handleExpectedAmountChange(category.id, e.target.value)}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow>
                            <TableCell><strong>Total</strong></TableCell>
                            <TableCell><strong>${calculateTotal().toFixed(2)}</strong></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ExpensesBudget;