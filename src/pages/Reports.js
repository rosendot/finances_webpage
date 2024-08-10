import React, { useState, useEffect } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Reports = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        fetchMonthlyData(selectedYear);
    }, [selectedYear]);

    const fetchMonthlyData = async (year) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/monthly-data/${year}`);
            setMonthlyData(response.data);
        } catch (error) {
            console.error('Error fetching monthly data:', error);
        }
    };

    const formatMonthName = (monthNumber) => {
        const date = new Date(2000, monthNumber - 1, 1);
        return date.toLocaleString('default', { month: 'long' });
    };

    const prepareChartData = () => {
        return monthlyData.map(data => ({
            month: formatMonthName(data.month),
            budgetIncome: data.budget_income,
            actualIncome: data.actual_income,
            budgetExpenses: data.budget_expenses,
            actualExpenses: data.actual_expenses
        }));
    };

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

    return (
        <div style={{ padding: '20px' }}>
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

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper style={{ padding: '20px' }}>
                        <h3>Income Comparison</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={prepareChartData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="budgetIncome" fill="#8884d8" name="Budget Income" />
                                <Bar dataKey="actualIncome" fill="#82ca9d" name="Actual Income" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper style={{ padding: '20px' }}>
                        <h3>Expenses Comparison</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={prepareChartData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="budgetExpenses" fill="#8884d8" name="Budget Expenses" />
                                <Bar dataKey="actualExpenses" fill="#82ca9d" name="Actual Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Month</TableCell>
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
                                        <TableCell align="right">${data.profit.toFixed(2)}</TableCell>
                                        <TableCell align="right">{data.savings_rate.toFixed(2)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </div>
    );
};

export default Reports;