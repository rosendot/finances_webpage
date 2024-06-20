import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, TextField, Typography, Box, Button } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

import formatDate from '../functions/formatDate';

const ExpensesQuadrant = ({ expensesData, onExpenseIncludeChange, onExpenseAmountChange, onExpenseDateChange, setExpensesData }) => {
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
            toast.success('Recurring dates updated successfully');
        } catch (error) {
            console.error('Error updating dates:', error);
            toast.error('Failed to update recurring dates');
        }
    };

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

    const handleDateChange = (expense, date) => {
        onExpenseDateChange(expense, date);
    };

    const renderExpenseTable = (expenses) => (
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
                    {expenses.map((expense) => (
                        <TableRow key={expense.name}>
                            <TableCell>{expense.name}</TableCell>
                            <TableCell>
                                <TextField
                                    type="number"
                                    value={expense.amount}
                                    onChange={(e) => handleAmountChange(expense, e.target.value)}
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    value={formatDate(expense.date) || ''}
                                    onChange={(e) => handleDateChange(expense, e.target.value)}
                                />
                            </TableCell>
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
    );

    return (
        <div style={{ height: '100%', display: 'flex' }}>
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" component="h3" gutterBottom>
                    Manual
                </Typography>
                {renderExpenseTable(manualExpenses)}
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
                {renderExpenseTable(recurringExpenses)}
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