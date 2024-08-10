import React from 'react';
import { Table, TableBody, TableCell, TableRow, Paper, Typography } from '@mui/material';

const ProfitSummary = ({ totalIncome, totalExpenses }) => {
    const profit = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

    return (
        <Paper elevation={3} style={{ marginTop: '20px', padding: '16px' }}>
            <Typography variant="h6" gutterBottom>Profit Summary</Typography>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Profit (Income - Expenses)</TableCell>
                        <TableCell align="right">${profit.toFixed(2)}</TableCell>
                        <TableCell align="right">${profit.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Savings Rate</TableCell>
                        <TableCell align="right">{savingsRate.toFixed(2)}%</TableCell>
                        <TableCell align="right">{savingsRate.toFixed(2)}%</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );
};

export default ProfitSummary;