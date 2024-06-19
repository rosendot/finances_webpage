import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox } from '@mui/material';

import formatDate from '../functions/formatDate';

const ExpensesTable = ({ expensesData, onExpenseIncludeChange }) => {
    const [sortedExpensesData, setSortedExpensesData] = useState([]);

    useEffect(() => {
        const sorted = [...expensesData].sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });
        setSortedExpensesData(sorted);
    }, [expensesData]);

    const handleIncludeChange = (index) => {
        onExpenseIncludeChange(index);
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Include</TableCell>
                        <TableCell>Expense Type</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedExpensesData.map((expense) => (
                        <TableRow key={expense.name}>
                            <TableCell>{expense.name}</TableCell>
                            <TableCell>{expense.amount}</TableCell>
                            <TableCell>{expense.date ? formatDate(expense.date) : ''}</TableCell>
                            <TableCell>
                                <Checkbox
                                    checked={expense.include}
                                    onChange={() => handleIncludeChange(expense)}
                                />
                            </TableCell>
                            <TableCell>{expense.expense_type}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ExpensesTable;