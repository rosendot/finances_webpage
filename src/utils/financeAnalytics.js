// Calculate average monthly expenses
export const calculateAverageMonthlyExpense = (monthlyData) => {
    if (!monthlyData || monthlyData.length === 0) return 0;

    const total = monthlyData.reduce((sum, month) =>
        sum + parseFloat(month.actual_expenses || 0), 0);

    return total / monthlyData.length;
};

// Calculate expense growth rate
export const calculateExpenseGrowthRate = (monthlyData) => {
    if (!monthlyData || monthlyData.length < 2) return 0;

    const sortedByMonth = [...monthlyData].sort((a, b) => a.month - b.month);
    const firstMonth = parseFloat(sortedByMonth[0].actual_expenses || 0);
    const lastMonth = parseFloat(sortedByMonth[sortedByMonth.length - 1].actual_expenses || 0);

    if (firstMonth === 0) return 0;

    return ((lastMonth - firstMonth) / firstMonth) * 100;
};

// Calculate months with highest expenses
export const findHighestExpenseMonths = (monthlyData, limit = 3) => {
    if (!monthlyData || monthlyData.length === 0) return [];

    return [...monthlyData]
        .sort((a, b) => parseFloat(b.actual_expenses || 0) - parseFloat(a.actual_expenses || 0))
        .slice(0, limit)
        .map(month => ({
            month: month.month,
            amount: parseFloat(month.actual_expenses || 0)
        }));
};

// Project future savings based on current trends
export const projectFutureSavings = (monthlyData, monthsAhead = 6) => {
    if (!monthlyData || monthlyData.length < 3) return [];

    // Calculate average monthly savings
    const averageSavings = monthlyData.reduce((sum, month) =>
        sum + parseFloat(month.profit || 0), 0) / monthlyData.length;

    // Simple linear projection
    const lastMonth = Math.max(...monthlyData.map(m => m.month));
    const lastYear = monthlyData[0].year;

    const projections = [];

    for (let i = 1; i <= monthsAhead; i++) {
        let projectedMonth = lastMonth + i;
        let projectedYear = lastYear;

        // Handle year rollover
        if (projectedMonth > 12) {
            projectedMonth -= 12;
            projectedYear += 1;
        }

        projections.push({
            month: projectedMonth,
            year: projectedYear,
            projectedSavings: averageSavings
        });
    }

    return projections;
};