import React from 'react';
import { Table, TableBody, TableCell, TableRow, Paper, Typography, Box } from '@mui/material';

const ProfitSummary = ({ budgetIncome, budgetExpenses, actualIncome, actualExpenses }) => {
    const budgetProfit = budgetIncome - budgetExpenses;
    const actualProfit = actualIncome - actualExpenses;

    const budgetSavingsRate = budgetIncome > 0 ? (budgetProfit / budgetIncome) * 100 : 0;
    const actualSavingsRate = actualIncome > 0 ? (actualProfit / actualIncome) * 100 : 0;

    // Calculate variances
    const incomeVariance = actualIncome - budgetIncome;
    const expenseVariance = actualExpenses - budgetExpenses;
    const profitVariance = actualProfit - budgetProfit;

    const getVarianceColor = (variance) => {
        return variance >= 0 ? 'success.main' : 'error.main';
    };

    return (
        <Paper elevation={3} style={{ marginTop: '20px', padding: '20px' }}>
            <Typography variant="h6" gutterBottom>Profit Summary</Typography>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Total Income</TableCell>
                        <TableCell align="right">Budget: ${budgetIncome.toFixed(2)}</TableCell>
                        <TableCell align="right">Actual: ${actualIncome.toFixed(2)}</TableCell>
                        <TableCell align="right">
                            <Box component="span" sx={{ color: getVarianceColor(incomeVariance) }}>
                                {incomeVariance >= 0 ? '+' : ''}{incomeVariance.toFixed(2)}
                            </Box>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Total Expenses</TableCell>
                        <TableCell align="right">Budget: ${budgetExpenses.toFixed(2)}</TableCell>
                        <TableCell align="right">Actual: ${actualExpenses.toFixed(2)}</TableCell>
                        <TableCell align="right">
                            <Box component="span" sx={{ color: getVarianceColor(-expenseVariance) }}>
                                {expenseVariance >= 0 ? '+' : ''}{expenseVariance.toFixed(2)}
                            </Box>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="subtitle1"><strong>Net Profit</strong></Typography>
                        </TableCell>
                        <TableCell align="right">
                            <strong>Budget: ${budgetProfit.toFixed(2)}</strong>
                        </TableCell>
                        <TableCell align="right">
                            <strong>Actual: ${actualProfit.toFixed(2)}</strong>
                        </TableCell>
                        <TableCell align="right">
                            <Box component="span" sx={{ color: getVarianceColor(profitVariance) }}>
                                <strong>{profitVariance >= 0 ? '+' : ''}{profitVariance.toFixed(2)}</strong>
                            </Box>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Savings Rate</TableCell>
                        <TableCell align="right">{budgetSavingsRate.toFixed(2)}%</TableCell>
                        <TableCell align="right">{actualSavingsRate.toFixed(2)}%</TableCell>
                        <TableCell align="right">
                            <Box component="span" sx={{ color: getVarianceColor(actualSavingsRate - budgetSavingsRate) }}>
                                {(actualSavingsRate - budgetSavingsRate >= 0 ? '+' : '')}{(actualSavingsRate - budgetSavingsRate).toFixed(2)}%
                            </Box>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );
};

export default ProfitSummary;