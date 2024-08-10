import React from 'react';
import { Table, TableBody, TableCell, TableRow, Paper, Typography } from '@mui/material';

const ProfitSummary = ({ budgetIncome, budgetExpenses, actualIncome, actualExpenses }) => {
    const budgetProfit = budgetIncome - budgetExpenses;
    const actualProfit = actualIncome - actualExpenses;

    const budgetSavingsRate = budgetIncome > 0 ? (budgetProfit / budgetIncome) * 100 : 0;
    const actualSavingsRate = actualIncome > 0 ? (actualProfit / actualIncome) * 100 : 0;

    return (
        <Paper elevation={3} style={{ marginTop: '20px', padding: '16px' }}>
            <Typography variant="h6" gutterBottom>Profit Summary</Typography>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Profit (Income - Expenses)</TableCell>
                        <TableCell align="right">Budget: ${budgetProfit.toFixed(2)}</TableCell>
                        <TableCell align="right">Actual: ${actualProfit.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Savings Rate</TableCell>
                        <TableCell align="right">Budget: {budgetSavingsRate.toFixed(2)}%</TableCell>
                        <TableCell align="right">Actual: {actualSavingsRate.toFixed(2)}%</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );
};

export default ProfitSummary;