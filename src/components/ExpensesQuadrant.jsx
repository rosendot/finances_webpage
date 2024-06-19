import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, TextField } from '@mui/material';

import formatDate from '../functions/formatDate';

const ExpensesQuadrant = ({ expensesData, onExpenseIncludeChange, onExpenseAmountChange }) => {
    const [manualExpenses, setManualExpenses] = useState([]);
    const [recurringExpenses, setRecurringExpenses] = useState([]);

    useEffect(() => {
        const manual = expensesData.filter((expense) => expense.expense_type === 'manual');
        const recurring = expensesData.filter((expense) => expense.expense_type === 'recurring');
        setManualExpenses(manual);
        setRecurringExpenses(recurring);
    }, [expensesData]);

    const handleIncludeChange = (expense) => {
        onExpenseIncludeChange(expense);
    };

    const handleAmountChange = (expense, amount) => {
        onExpenseAmountChange(expense, amount);
    };

    return (
        <div style={{ display: 'flex' }}>
            <TableContainer component={Paper} style={{ width: '50%' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Manual</TableCell>
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
            <TableContainer component={Paper} style={{ width: '50%' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Recurring</TableCell>
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
        </div>
    );
};

export default ExpensesQuadrant;