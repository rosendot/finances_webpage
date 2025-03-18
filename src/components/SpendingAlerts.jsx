// src/components/SpendingAlerts.jsx
import React from 'react';
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const SpendingAlerts = ({ monthlyData, categoryData }) => {
    if (!monthlyData || monthlyData.length === 0) {
        return null;
    }

    const formatMonthName = (monthNumber) => {
        const date = new Date(2000, monthNumber - 1, 1);
        return date.toLocaleString('default', { month: 'long' });
    };

    const alerts = [];

    // Check for months where spending exceeds income
    monthlyData.forEach(month => {
        const income = parseFloat(month.actual_income || 0);
        const expenses = parseFloat(month.actual_expenses || 0);

        if (expenses > income) {
            alerts.push({
                type: 'overspending',
                message: `In ${formatMonthName(month.month)}, your expenses exceeded your income by $${(expenses - income).toFixed(2)}.`,
                severity: 'high',
                icon: <WarningIcon color="error" />
            });
        }
    });

    // Check for significant increases in monthly expenses
    if (monthlyData.length >= 2) {
        const sortedData = [...monthlyData].sort((a, b) => a.month - b.month);

        for (let i = 1; i < sortedData.length; i++) {
            const prevMonth = parseFloat(sortedData[i - 1].actual_expenses || 0);
            const currMonth = parseFloat(sortedData[i].actual_expenses || 0);

            if (prevMonth > 0 && currMonth > prevMonth) {
                const percentIncrease = ((currMonth - prevMonth) / prevMonth) * 100;

                if (percentIncrease > 20) {
                    alerts.push({
                        type: 'increase',
                        message: `Your expenses increased by ${percentIncrease.toFixed(1)}% from ${formatMonthName(sortedData[i - 1].month)} to ${formatMonthName(sortedData[i].month)}.`,
                        severity: percentIncrease > 50 ? 'high' : 'medium',
                        icon: <ArrowUpwardIcon color={percentIncrease > 50 ? "error" : "warning"} />
                    });
                }
            }
        }
    }

    // Check if any months significantly exceeded budget
    monthlyData.forEach(month => {
        const budgeted = parseFloat(month.budget_expenses || 0);
        const actual = parseFloat(month.actual_expenses || 0);

        if (budgeted > 0 && actual > budgeted) {
            const percentOver = ((actual - budgeted) / budgeted) * 100;

            if (percentOver > 15) {
                alerts.push({
                    type: 'budget',
                    message: `In ${formatMonthName(month.month)}, you exceeded your expenses budget by ${percentOver.toFixed(1)}% ($${(actual - budgeted).toFixed(2)}).`,
                    severity: percentOver > 30 ? 'high' : 'medium',
                    icon: <WarningIcon color={percentOver > 30 ? "error" : "warning"} />
                });
            }
        }
    });

    // Check for positive trends - consistently under budget
    if (monthlyData.length >= 3) {
        let consecutiveUnderBudget = 0;

        for (let i = monthlyData.length - 1; i >= 0; i--) {
            const budgeted = parseFloat(monthlyData[i].budget_expenses || 0);
            const actual = parseFloat(monthlyData[i].actual_expenses || 0);

            if (budgeted > 0 && actual <= budgeted) {
                consecutiveUnderBudget++;
            } else {
                break;
            }
        }

        if (consecutiveUnderBudget >= 3) {
            alerts.push({
                type: 'positive',
                message: `Great job! You've stayed within your budget for ${consecutiveUnderBudget} consecutive months.`,
                severity: 'low',
                icon: <TrendingDownIcon color="success" />
            });
        }
    }

    // Category-specific alerts
    if (categoryData && categoryData.length > 0) {
        // Find categories that make up more than 30% of spending
        const totalSpent = categoryData.reduce((sum, cat) => sum + parseFloat(cat.amount || 0), 0);

        categoryData.forEach(category => {
            const amount = parseFloat(category.amount || 0);
            const percentage = (amount / totalSpent) * 100;

            if (percentage > 30) {
                alerts.push({
                    type: 'category',
                    message: `The ${category.category} category makes up ${percentage.toFixed(1)}% of your total spending.`,
                    severity: percentage > 50 ? 'high' : 'medium',
                    icon: <WarningIcon color={percentage > 50 ? "error" : "warning"} />
                });
            }
        });
    }

    if (alerts.length === 0) {
        return null;
    }

    return (
        <Paper style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>Spending Insights & Alerts</Typography>

            <List>
                {alerts.map((alert, index) => (
                    <React.Fragment key={index}>
                        <ListItem alignItems="flex-start">
                            <ListItemIcon>
                                {alert.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={alert.message}
                                secondary={
                                    alert.type === 'overspending' ? "Consider adjusting your budget or finding ways to increase income." :
                                        alert.type === 'increase' ? "Look for unusual expenses that may have caused this increase." :
                                            alert.type === 'budget' ? "Review your budget to ensure it's realistic, or find areas to cut back." :
                                                alert.type === 'category' ? "Consider whether you want to allocate this much of your budget to this category." :
                                                    "Keep up the good work!"
                                }
                            />
                        </ListItem>
                        {index < alerts.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
};

export default SpendingAlerts;