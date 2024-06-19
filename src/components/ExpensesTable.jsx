import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const ExpensesTable = ({ expensesData }) => {
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
                    {expensesData.map((expense, index) => (
                        <TableRow key={index}>
                            <TableCell>{expense.name}</TableCell>
                            <TableCell>{expense.amount}</TableCell>
                            <TableCell>{expense.date}</TableCell>
                            <TableCell>{expense.include ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{expense.expense_type}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ExpensesTable;