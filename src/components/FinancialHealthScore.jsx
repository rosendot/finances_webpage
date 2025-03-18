// src/components/FinancialHealthScore.jsx
import React from 'react';
import { Paper, Typography, Box, LinearProgress } from '@mui/material';

const FinancialHealthScore = ({ monthlyData, yearlySummary }) => {
    // Calculate financial health score based on several metrics (0-100)
    const calculateHealthScore = () => {
        if (!monthlyData || monthlyData.length === 0 || !yearlySummary) {
            return { score: 0, breakdown: {} };
        }

        // 1. Savings rate (0-40 points)
        const savingsRateScore = Math.min(40, (yearlySummary.overall_savings_rate || 0) * 0.8);

        // 2. Consistency (0-20 points)
        // Check how consistently the person is saving money
        const savingMonths = monthlyData.filter(m => parseFloat(m.profit || 0) > 0).length;
        const consistencyScore = (savingMonths / monthlyData.length) * 20;

        // 3. Budget adherence (0-20 points)
        const expensesAdherence = monthlyData.reduce((sum, month) => {
            const budgeted = parseFloat(month.budget_expenses || 0);
            const actual = parseFloat(month.actual_expenses || 0);

            // Perfect if actual <= budgeted
            if (actual <= budgeted || budgeted === 0) return sum + 1;

            // Calculate how close to budget (0-1)
            const ratio = Math.max(0, 1 - ((actual - budgeted) / budgeted));
            return sum + ratio;
        }, 0) / monthlyData.length * 20;

        // 4. Income growth (0-20 points)
        let incomeGrowthScore = 0;
        if (monthlyData.length >= 2) {
            const sortedByMonth = [...monthlyData].sort((a, b) => a.month - b.month);
            const firstMonth = parseFloat(sortedByMonth[0].actual_income || 0);
            const lastMonth = parseFloat(sortedByMonth[sortedByMonth.length - 1].actual_income || 0);

            if (firstMonth > 0) {
                const growthRate = ((lastMonth - firstMonth) / firstMonth);
                incomeGrowthScore = Math.min(20, growthRate * 100);
            }
        }

        const totalScore = Math.round(savingsRateScore + consistencyScore + expensesAdherence + incomeGrowthScore);

        return {
            score: totalScore,
            breakdown: {
                savingsRate: Math.round(savingsRateScore),
                consistency: Math.round(consistencyScore),
                budgetAdherence: Math.round(expensesAdherence),
                incomeGrowth: Math.round(incomeGrowthScore)
            }
        };
    };

    const { score, breakdown } = calculateHealthScore();

    const getScoreColor = (score) => {
        if (score >= 80) return 'success.main';
        if (score >= 60) return '#ffbf00'; // amber
        return 'error.main';
    };

    const getScoreText = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    };

    return (
        <Paper style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>Financial Health Score</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h3" sx={{ color: getScoreColor(score), mr: 2 }}>
                    {score}
                </Typography>
                <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ color: getScoreColor(score) }}>
                        {getScoreText(score)}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={score}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: getScoreColor(score)
                            }
                        }}
                    />
                </Box>
            </Box>

            <Typography variant="subtitle2" gutterBottom>Score Breakdown:</Typography>
            <Typography variant="body2">Savings Rate: {breakdown.savingsRate}/40</Typography>
            <Typography variant="body2">Consistency: {breakdown.consistency}/20</Typography>
            <Typography variant="body2">Budget Adherence: {breakdown.budgetAdherence}/20</Typography>
            <Typography variant="body2">Income Growth: {breakdown.incomeGrowth}/20</Typography>

            <Typography variant="body2" sx={{ mt: 2 }}>
                {score >= 80 ?
                    "You're doing excellent with your finances! Keep up the great work." :
                    score >= 60 ?
                        "You're on the right track with your finances. Some small improvements could help you reach excellence." :
                        score >= 40 ?
                            "There's room for improvement in your financial habits. Consider focusing on saving more and sticking to your budget." :
                            "Your financial health needs attention. Focus on creating a realistic budget and building savings."
                }
            </Typography>
        </Paper>
    );
};

export default FinancialHealthScore;