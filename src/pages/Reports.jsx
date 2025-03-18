import React, { useState, useEffect } from 'react';
import {
    Select, MenuItem, FormControl, InputLabel, Grid, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Box, Tabs, Tab
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import axios from 'axios';
import { reportApi } from '../api/api';
import SpendingAlerts from '../components/SpendingAlerts';
import FinancialHealthScore from '../components/FinancialHealthScore';
import MonthlyBreakdown from '../components/MonthlyBreakdown';
import FinancialForecast from '../components/FinancialForecast';

// Tab panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const Reports = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyData, setMonthlyData] = useState([]);
    const [yearlySummary, setYearlySummary] = useState({});
    const [tabValue, setTabValue] = useState(0);
    const [categoryData, setCategoryData] = useState([]);

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    useEffect(() => {
        fetchMonthlyData(selectedYear);
        fetchYearlySummary(selectedYear);
        fetchCategoryData(selectedYear);
    }, [selectedYear]);

    const fetchMonthlyData = async (year) => {
        try {
            const response = await reportApi.getMonthlyData(year);
            setMonthlyData(response);
        } catch (error) {
            console.error('Error fetching monthly data:', error);
        }
    };

    const fetchYearlySummary = async (year) => {
        try {
            const response = await reportApi.getYearlySummary(year);
            setYearlySummary(response);
        } catch (error) {
            console.error('Error fetching yearly summary:', error);
        }
    };

    // Add a new method to fetch expense categories
    const fetchCategoryData = async (year) => {
        try {
            // Implement this API endpoint to get expense breakdown by category
            const response = await axios.get(`http://localhost:5000/api/category-data/${year}`);
            setCategoryData(response.data);
        } catch (error) {
            console.error('Error fetching category data:', error);
        }
    };

    const formatMonthName = (monthNumber) => {
        const date = new Date(2000, monthNumber - 1, 1);
        return date.toLocaleString('default', { month: 'long' });
    };

    const prepareChartData = () => {
        return monthlyData.map(data => ({
            month: formatMonthName(data.month),
            budgetIncome: parseFloat(data.budget_income) || 0,
            actualIncome: parseFloat(data.actual_income) || 0,
            budgetExpenses: parseFloat(data.budget_expenses) || 0,
            actualExpenses: parseFloat(data.actual_expenses) || 0,
            profit: parseFloat(data.profit) || 0,
            savingsRate: parseFloat(data.savings_rate) || 0
        }));
    };

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>Financial Reports</Typography>

            <FormControl style={{ marginBottom: '20px', minWidth: 120 }}>
                <InputLabel>Year</InputLabel>
                <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    label="Year"
                >
                    {years.map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
                <Tab label="Monthly Analysis" />
                <Tab label="Yearly Summary" />
                <Tab label="Category Analysis" />
                <Tab label="Trends" />
            </Tabs>

            {/* Monthly Analysis Tab */}
            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <MonthlyBreakdown monthlyData={monthlyData} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper style={{ padding: '20px' }}>
                            <Typography variant="h6">Income Comparison</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={prepareChartData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                    <Legend />
                                    <Bar dataKey="budgetIncome" fill="#8884d8" name="Budget Income" />
                                    <Bar dataKey="actualIncome" fill="#82ca9d" name="Actual Income" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper style={{ padding: '20px' }}>
                            <Typography variant="h6">Expenses Comparison</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={prepareChartData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                    <Legend />
                                    <Bar dataKey="budgetExpenses" fill="#8884d8" name="Budget Expenses" />
                                    <Bar dataKey="actualExpenses" fill="#82ca9d" name="Actual Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper style={{ padding: '20px' }}>
                            <Typography variant="h6">Monthly Profit</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={prepareChartData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="profit"
                                        stroke="#8884d8"
                                        activeDot={{ r: 8 }}
                                        name="Profit"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper style={{ padding: '20px' }}>
                            <Typography variant="h6">Savings Rate (%)</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={prepareChartData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="savingsRate"
                                        stroke="#82ca9d"
                                        activeDot={{ r: 8 }}
                                        name="Savings Rate"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Month</TableCell>
                                        <TableCell align="right">Budget Income</TableCell>
                                        <TableCell align="right">Actual Income</TableCell>
                                        <TableCell align="right">Budget Expenses</TableCell>
                                        <TableCell align="right">Actual Expenses</TableCell>
                                        <TableCell align="right">Profit</TableCell>
                                        <TableCell align="right">Savings Rate</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {monthlyData.map((data) => (
                                        <TableRow key={data.month}>
                                            <TableCell component="th" scope="row">
                                                {formatMonthName(data.month)}
                                            </TableCell>
                                            <TableCell align="right">${parseFloat(data.budget_income).toFixed(2)}</TableCell>
                                            <TableCell align="right">${parseFloat(data.actual_income).toFixed(2)}</TableCell>
                                            <TableCell align="right">${parseFloat(data.budget_expenses).toFixed(2)}</TableCell>
                                            <TableCell align="right">${parseFloat(data.actual_expenses).toFixed(2)}</TableCell>
                                            <TableCell align="right">${parseFloat(data.profit).toFixed(2)}</TableCell>
                                            <TableCell align="right">{parseFloat(data.savings_rate).toFixed(2)}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Yearly Summary Tab */}
            <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FinancialHealthScore monthlyData={monthlyData} yearlySummary={yearlySummary} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SpendingAlerts monthlyData={monthlyData} categoryData={categoryData} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper style={{ padding: '20px' }}>
                            <Typography variant="h6" gutterBottom>Yearly Overview</Typography>
                            <Typography variant="body1">
                                <strong>Total Budget Income:</strong> ${(yearlySummary.total_budget_income || 0).toFixed(2)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Total Actual Income:</strong> ${(yearlySummary.total_actual_income || 0).toFixed(2)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Total Budget Expenses:</strong> ${(yearlySummary.total_budget_expenses || 0).toFixed(2)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Total Actual Expenses:</strong> ${(yearlySummary.total_actual_expenses || 0).toFixed(2)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Total Profit:</strong> ${(yearlySummary.total_profit || 0).toFixed(2)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Overall Savings Rate:</strong> {(yearlySummary.overall_savings_rate || 0).toFixed(2)}%
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper style={{ padding: '20px' }}>
                            <Typography variant="h6">Annual Budget vs. Actual</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={[
                                        {
                                            name: 'Income',
                                            budget: parseFloat(yearlySummary.total_budget_income) || 0,
                                            actual: parseFloat(yearlySummary.total_actual_income) || 0
                                        },
                                        {
                                            name: 'Expenses',
                                            budget: parseFloat(yearlySummary.total_budget_expenses) || 0,
                                            actual: parseFloat(yearlySummary.total_actual_expenses) || 0
                                        }
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                    <Legend />
                                    <Bar dataKey="budget" fill="#8884d8" name="Budgeted" />
                                    <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Category Analysis Tab */}
            <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper style={{ padding: '20px' }}>
                            <Typography variant="h6">Expense Categories</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="amount"
                                        nameKey="category"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper style={{ padding: '20px' }}>
                            <Typography variant="h6">Top Spending Categories</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Category</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                            <TableCell align="right">Percentage</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {categoryData.slice(0, 5).map((category) => {
                                            const totalSpent = categoryData.reduce((sum, cat) => sum + parseFloat(cat.amount), 0);
                                            const percentage = (parseFloat(category.amount) / totalSpent) * 100;

                                            return (
                                                <TableRow key={category.category}>
                                                    <TableCell>{category.category}</TableCell>
                                                    <TableCell align="right">${parseFloat(category.amount).toFixed(2)}</TableCell>
                                                    <TableCell align="right">{percentage.toFixed(2)}%</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Trends Tab */}
            <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FinancialForecast monthlyData={monthlyData} />
                    </Grid>
                    <Grid item xs={12}>
                        <Paper style={{ padding: '20px' }}>
                            <Typography variant="h6">Income vs. Expenses Trend</Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart
                                    data={prepareChartData()}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="actualIncome"
                                        stackId="1"
                                        stroke="#8884d8"
                                        fill="#8884d8"
                                        name="Income"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="actualExpenses"
                                        stackId="2"
                                        stroke="#82ca9d"
                                        fill="#82ca9d"
                                        name="Expenses"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper style={{ padding: '20px' }}>
                            <Typography variant="h6">Savings Rate Trend</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={prepareChartData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="savingsRate"
                                        stroke="#8884d8"
                                        name="Savings Rate (%)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>
        </div>
    );
};

export default Reports;