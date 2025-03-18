// src/components/FinancialForecast.jsx
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialForecast = ({ monthlyData }) => {
    if (!monthlyData || monthlyData.length < 3) {
        return (
            <Paper style={{ padding: '20px' }}>
                <Typography variant="h6" gutterBottom>Financial Forecast</Typography>
                <Typography>Not enough data for forecasting. Need at least 3 months of data.</Typography>
            </Paper>
        );
    }

    const formatMonthName = (monthNumber) => {
        const date = new Date(2000, monthNumber - 1, 1);
        return date.toLocaleString('default', { month: 'short' });
    };

    const calculateForecast = () => {
        // Sort data by month
        const sortedData = [...monthlyData].sort((a, b) => a.month - b.month);

        // Get the last few months for trend calculation
        const recentMonths = sortedData.slice(-6);

        // Calculate average monthly changes
        let incomeChangeSum = 0;
        let expenseChangeSum = 0;
        let savingsChangeSum = 0;

        for (let i = 1; i < recentMonths.length; i++) {
            const prevIncome = parseFloat(recentMonths[i - 1].actual_income || 0);
            const currIncome = parseFloat(recentMonths[i].actual_income || 0);

            const prevExpense = parseFloat(recentMonths[i - 1].actual_expenses || 0);
            const currExpense = parseFloat(recentMonths[i].actual_expenses || 0);

            incomeChangeSum += prevIncome > 0 ? (currIncome - prevIncome) : 0;
            expenseChangeSum += prevExpense > 0 ? (currExpense - prevExpense) : 0;

            const prevSavings = parseFloat(recentMonths[i - 1].profit || 0);
            const currSavings = parseFloat(recentMonths[i].profit || 0);

            savingsChangeSum += currSavings - prevSavings;
        }

        const avgIncomeChange = incomeChangeSum / (recentMonths.length - 1);
        const avgExpenseChange = expenseChangeSum / (recentMonths.length - 1);
        const avgSavingsChange = savingsChangeSum / (recentMonths.length - 1);

        // Generate forecast for next 6 months
        const lastMonth = recentMonths[recentMonths.length - 1];
        const lastMonthNumber = parseInt(lastMonth.month);
        const lastYear = parseInt(lastMonth.year);

        const forecast = [];

        // Add historical data (last 3 months)
        for (let i = 3; i > 0; i--) {
            const idx = recentMonths.length - i;
            if (idx >= 0) {
                const historicalMonth = recentMonths[idx];
                forecast.push({
                    month: `${formatMonthName(historicalMonth.month)} ${historicalMonth.year}`,
                    income: parseFloat(historicalMonth.actual_income || 0),
                    expenses: parseFloat(historicalMonth.actual_expenses || 0),
                    savings: parseFloat(historicalMonth.profit || 0),
                    historical: true
                });
            }
        }

        // Add forecast data (next 6 months)
        let forecastIncome = parseFloat(lastMonth.actual_income || 0);
        let forecastExpense = parseFloat(lastMonth.actual_expenses || 0);
        let forecastSavings = parseFloat(lastMonth.profit || 0);

        for (let i = 1; i <= 6; i++) {
            let forecastMonth = lastMonthNumber + i;
            let forecastYear = lastYear;

            if (forecastMonth > 12) {
                forecastMonth -= 12;
                forecastYear += 1;
            }

            forecastIncome += avgIncomeChange;
            forecastExpense += avgExpenseChange;
            forecastSavings += avgSavingsChange;

            forecast.push({
                month: `${formatMonthName(forecastMonth)} ${forecastYear}`,
                income: Math.max(0, forecastIncome),
                expenses: Math.max(0, forecastExpense),
                savings: forecastSavings,
                historical: false
            });
        }

        return forecast;
    };

    const forecastData = calculateForecast();

    // Calculate projected savings and potential savings
    const projectedSavings = forecastData
        .filter(item => !item.historical)
        .reduce((sum, month) => sum + month.savings, 0);

    // Calculate total projected savings in 1 year
    const annualSavingsRate = forecastData
        .filter(item => !item.historical)
        .reduce((sum, month) => sum + month.income, 0) > 0
        ? projectedSavings / forecastData
            .filter(item => !item.historical)
            .reduce((sum, month) => sum + month.income, 0) * 100
        : 0;

    return (
        <Paper style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>Financial Forecast (Next 6 Months)</Typography>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#8884d8"
                        name="Income"
                        strokeWidth={2}
                        strokeDasharray={(d) => d.historical ? "0" : "5 5"}
                    />
                    <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#82ca9d"
                        name="Expenses"
                        strokeWidth={2}
                        strokeDasharray={(d) => d.historical ? "0" : "5 5"}
                    />
                    <Line
                        type="monotone"
                        dataKey="savings"
                        stroke="#ff7300"
                        name="Savings"
                        strokeWidth={2}
                        strokeDasharray={(d) => d.historical ? "0" : "5 5"}
                    />
                </LineChart>
            </ResponsiveContainer>

            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Forecast Summary:</Typography>
                <Typography>
                    <strong>Projected savings in next 6 months:</strong> ${projectedSavings.toFixed(2)}
                </Typography>
                <Typography>
                    <strong>Projected annual savings rate:</strong> {annualSavingsRate.toFixed(2)}%
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    This forecast is based on your historical financial patterns and should be used as a general guide only.
                </Typography>
            </Box>
        </Paper>
    );
};

export default FinancialForecast;