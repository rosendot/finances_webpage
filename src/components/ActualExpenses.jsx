import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Typography, Button } from '@mui/material';

const ActualExpenses = ({ expensesData, setExpensesData, categories }) => {
    const handleAmountChange = (index, value) => {
        const updatedExpensesData = [...expensesData];
        updatedExpensesData[index].amount = value;
        setExpensesData(updatedExpensesData);
    };

    const handleDateChange = (index, value) => {
        const updatedExpensesData = [...expensesData];
        updatedExpensesData[index].date = value;
        setExpensesData(updatedExpensesData);
    };

    const calculateCategoryTotal = (categoryId) => {
        return expensesData
            .filter(expense => expense.category_id === categoryId)
            .reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
    };

    const calculateTotal = () => {
        return categories.reduce((total, category) => total + calculateCategoryTotal(category.id), 0);
    };

    const addNewExpense = (categoryId) => {
        const newExpense = {
            id: Date.now(), // temporary id
            name: 'New Expense',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            category_id: categoryId
        };
        setExpensesData([...expensesData, newExpense]);
    };

    return (
        <div>
            <Typography variant="h6" gutterBottom>Actual Expenses</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Actual Amount</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((category) => {
                            const categoryExpenses = expensesData.filter(expense => expense.category_id === category.id);
                            return (
                                <React.Fragment key={category.id}>
                                    {categoryExpenses.map((expense, index) => (
                                        <TableRow key={expense.id}>
                                            <TableCell>{index === 0 ? category.name : ''}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={expense.name}
                                                    onChange={(e) => {
                                                        const updatedExpensesData = [...expensesData];
                                                        updatedExpensesData[expensesData.indexOf(expense)].name = e.target.value;
                                                        setExpensesData(updatedExpensesData);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={expense.amount || ''}
                                                    onChange={(e) => handleAmountChange(expensesData.indexOf(expense), e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="date"
                                                    value={expense.date || ''}
                                                    onChange={(e) => handleDateChange(expensesData.indexOf(expense), e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={() => {
                                                        const updatedExpensesData = expensesData.filter(e => e.id !== expense.id);
                                                        setExpensesData(updatedExpensesData);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => addNewExpense(category.id)}
                                            >
                                                Add Expense to {category.name}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={2}><strong>{category.name} Total</strong></TableCell>
                                        <TableCell><strong>${calculateCategoryTotal(category.id).toFixed(2)}</strong></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </React.Fragment>
                            );
                        })}
                        <TableRow>
                            <TableCell colSpan={2}><strong>Total Expenses</strong></TableCell>
                            <TableCell><strong>${calculateTotal().toFixed(2)}</strong></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ActualExpenses; 