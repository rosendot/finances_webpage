import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, TextField, Typography, Box, Button } from '@mui/material';
import axios from 'axios';

import formatDate from '../functions/formatDate';

const ExpensesQuadrant = ({ expensesData, onExpenseIncludeChange, onExpenseAmountChange, setExpensesData }) => {
    const [manualExpenses, setManualExpenses] = useState([]);
    const [recurringExpenses, setRecurringExpenses] = useState([]);

    useEffect(() => {
        const sortExpenses = (expenses) => {
            return expenses.sort((a, b) => {
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            });
        };

        const manual = sortExpenses(expensesData.filter((expense) => expense.expense_type === 'manual'));
        const recurring = sortExpenses(expensesData.filter((expense) => expense.expense_type === 'recurring'));
        setManualExpenses(manual);
        setRecurringExpenses(recurring);
    }, [expensesData]);

    const calculateTotal = (expenses) => {
        return expenses.reduce((total, expense) => {
            if (expense.include) {
                return total + parseFloat(expense.amount);
            }
            return total;
        }, 0);
    };

    const handleIncludeChange = (expense) => {
        onExpenseIncludeChange(expense);
    };

    const handleAmountChange = (expense, amount) => {
        onExpenseAmountChange(expense, amount);
    };

    const updateDates = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/update-recurring-dates', { expenses: recurringExpenses });
            setExpensesData(prevData => {
                const updatedData = prevData.map(expense => {
                    const updatedExpense = response.data.find(item => item.name === expense.name);
                    return updatedExpense || expense;
                });
                return updatedData;
            });
        } catch (error) {
            console.error('Error updating dates:', error);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex' }}>
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" component="h3" gutterBottom>
                    Manual
                </Typography>
                <TableContainer component={Paper} style={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Include</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {manualExpenses.map((expense) => (
                                <TableRow key={expense.name}>
                                    <TableCell>{expense.name}</TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={expense.amount}
                                            onChange={(e) => handleAmountChange(expense, e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>{expense.date ? formatDate(expense.date) : ''}</TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={expense.include}
                                            onChange={() => handleIncludeChange(expense)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box mt={2}>
                    <Typography variant="subtitle1" component="h4" gutterBottom>
                        Total
                    </Typography>
                    <Typography variant="body1">{calculateTotal(manualExpenses)}</Typography>
                </Box>
            </div>
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" component="h3" gutterBottom>
                        Recurring
                    </Typography>
                    <Button variant="contained" color="primary" onClick={updateDates}>
                        Update Dates
                    </Button>
                </Box>
                <TableContainer component={Paper} style={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Include</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recurringExpenses.map((expense) => (
                                <TableRow key={expense.name}>
                                    <TableCell>{expense.name}</TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={expense.amount}
                                            onChange={(e) => handleAmountChange(expense, e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>{expense.date ? formatDate(expense.date) : ''}</TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={expense.include}
                                            onChange={() => handleIncludeChange(expense)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box mt={2}>
                    <Typography variant="subtitle1" component="h4" gutterBottom>
                        Total
                    </Typography>
                    <Typography variant="body1">{calculateTotal(recurringExpenses)}</Typography>
                </Box>
            </div>
        </div>
    );
};

export default ExpensesQuadrant; 