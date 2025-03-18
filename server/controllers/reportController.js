// server/controllers/reportController.js
const pool = require('../db');

// Get monthly data for a specific year
exports.getMonthlyData = async (req, res) => {
    try {
        const { year } = req.params;

        const query = `
            SELECT month, year, budget_income, actual_income, 
                   budget_expenses, actual_expenses, profit, savings_rate
            FROM monthly_reports
            WHERE year = $1
            ORDER BY month ASC
        `;

        const { rows } = await pool.query(query, [year]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching monthly data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create or update monthly report
exports.saveMonthlyReport = async (req, res) => {
    try {
        const { month, year, budget_income, actual_income, budget_expenses, actual_expenses, notes } = req.body;

        // Using upsert pattern with ON CONFLICT to handle both insert and update
        const query = `
            INSERT INTO monthly_reports (
                month, year, budget_income, actual_income, budget_expenses, actual_expenses, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (month, year) 
            DO UPDATE SET 
                budget_income = $3,
                actual_income = $4,
                budget_expenses = $5,
                actual_expenses = $6,
                notes = $7,
                date_created = CURRENT_TIMESTAMP
            RETURNING *
        `;

        const values = [
            month,
            year,
            budget_income,
            actual_income,
            budget_expenses,
            actual_expenses,
            notes || ''
        ];

        const { rows } = await pool.query(query, values);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error saving monthly report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get yearly summary
exports.getYearlySummary = async (req, res) => {
    try {
        const { year } = req.params;

        const query = `
            SELECT 
                $1 as year,
                SUM(budget_income) as total_budget_income,
                SUM(actual_income) as total_actual_income,
                SUM(budget_expenses) as total_budget_expenses,
                SUM(actual_expenses) as total_actual_expenses,
                SUM(profit) as total_profit,
                CASE 
                    WHEN SUM(actual_income) > 0 
                    THEN (SUM(profit) / SUM(actual_income)) * 100
                    ELSE 0 
                END as overall_savings_rate
            FROM monthly_reports
            WHERE year = $1
        `;

        const { rows } = await pool.query(query, [year]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching yearly summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCategoryData = async (req, res) => {
    try {
        const { year } = req.params;

        // Get basic category sums
        const categorySumQuery = `
            SELECT 
                COALESCE(category, 'Uncategorized') as category,
                SUM(amount) as amount
            FROM expenses
            WHERE EXTRACT(YEAR FROM date) = $1
            GROUP BY category
            ORDER BY amount DESC
        `;

        // Get month-by-month category data for trend analysis
        const categoryTrendQuery = `
            SELECT 
                COALESCE(category, 'Uncategorized') as category,
                EXTRACT(MONTH FROM date) as month,
                SUM(amount) as amount
            FROM expenses
            WHERE EXTRACT(YEAR FROM date) = $1
            GROUP BY category, EXTRACT(MONTH FROM date)
            ORDER BY category, month
        `;

        // Execute both queries
        const categorySumResult = await pool.query(categorySumQuery, [year]);
        const categoryTrendResult = await pool.query(categoryTrendQuery, [year]);

        // Process trend data to detect increases/decreases
        const trends = {};
        categoryTrendResult.rows.forEach(row => {
            const { category, month, amount } = row;

            if (!trends[category]) {
                trends[category] = [];
            }

            trends[category].push({ month, amount });
        });

        // Calculate trend metrics for each category
        const categoryData = categorySumResult.rows.map(category => {
            const categoryTrend = trends[category.category] || [];

            // Sort by month
            categoryTrend.sort((a, b) => a.month - b.month);

            // Calculate month-over-month change
            let trendDirection = 'stable';
            let trendPercentage = 0;

            if (categoryTrend.length >= 2) {
                const firstMonthAmount = parseFloat(categoryTrend[0].amount);
                const lastMonthAmount = parseFloat(categoryTrend[categoryTrend.length - 1].amount);

                if (firstMonthAmount > 0) {
                    trendPercentage = ((lastMonthAmount - firstMonthAmount) / firstMonthAmount) * 100;
                    trendDirection = trendPercentage > 5 ? 'increasing' :
                        trendPercentage < -5 ? 'decreasing' : 'stable';
                }
            }

            return {
                ...category,
                trendDirection,
                trendPercentage,
                monthlyData: categoryTrend
            };
        });

        res.json(categoryData);
    } catch (error) {
        console.error('Error fetching category data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};