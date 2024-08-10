import React, { useEffect, useState } from 'react';
import { Grid, Paper, Button, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import IncomeBudget from '../components/IncomeBudget';
import ActualIncome from '../components/ActualIncome';
import ExpensesBudget from '../components/ExpensesBudget';
import ActualExpenses from '../components/ActualExpenses';
import ProfitSummary from '../components/ProfitSummary';
import axios from 'axios';
import { toast } from 'react-toastify';
import { processCSV } from '../utils/csvProcessor';

function Dashboard() {
    const [revenueData, setRevenueData] = useState([]);
    const [expensesData, setExpensesData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    useEffect(() => {
        fetchRevenueData();
        fetchExpensesData();
        fetchCategories();
    }, []);

    const fetchRevenueData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/revenue');
            setRevenueData(response.data);
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            toast.error('Failed to fetch revenue data');
        }
    };

    const fetchExpensesData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/expenses');
            setExpensesData(response.data);
        } catch (error) {
            console.error('Error fetching expenses data:', error);
            toast.error('Failed to fetch expenses data');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to fetch categories');
        }
    };

    const calculateTotalBudgetIncome = () => {
        return revenueData.reduce((total, income) => total + parseFloat(income.expected_amount || 0), 0);
    };

    const calculateTotalActualIncome = () => {
        return revenueData.reduce((total, income) => total + parseFloat(income.amount || 0), 0);
    };

    const calculateTotalBudgetExpenses = () => {
        return expensesData.reduce((total, expense) => total + parseFloat(expense.expected_amount || 0), 0);
    };

    const calculateTotalActualExpenses = () => {
        return expensesData.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
    };

    const calculateProfit = () => {
        return calculateTotalActualIncome() - calculateTotalActualExpenses();
    };

    const calculateSavingsRate = () => {
        const actualIncome = calculateTotalActualIncome();
        return actualIncome > 0 ? (calculateProfit() / actualIncome) * 100 : 0;
    };

    const handleSave = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/save-monthly-data', {
                year: selectedYear,
                month: selectedMonth,
                budget_income: calculateTotalBudgetIncome(),
                actual_income: calculateTotalActualIncome(),
                budget_expenses: calculateTotalBudgetExpenses(),
                actual_expenses: calculateTotalActualExpenses(),
                profit: calculateProfit(),
                savings_rate: calculateSavingsRate()
            });
            if (response.status === 200) {
                toast.success('Monthly data saved successfully!');
            } else {
                toast.error('Failed to save monthly data. Please try again.');
            }
        } catch (error) {
            console.error('Error saving monthly data:', error);
            toast.error('Failed to save monthly data. Please try again.');
        }
    };

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const handleCSVImport = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvData = e.target.result;
                const processedData = processCSV(csvData);
                updateDataFromCSV(processedData);
            };
            reader.readAsText(file);
        }
    };

    const updateDataFromCSV = (processedData) => {
        const { income, expenses } = processedData;

        // Update income
        setRevenueData(prevData => {
            const updatedData = [...prevData];
            income.forEach(item => {
                const existingIndex = updatedData.findIndex(rev => rev.name === item.name);
                if (existingIndex !== -1) {
                    updatedData[existingIndex].amount = item.amount;
                } else {
                    updatedData.push(item);
                }
            });
            return updatedData;
        });

        // Update expenses
        setExpensesData(prevData => {
            const updatedData = [...prevData];
            expenses.forEach(item => {
                const existingIndex = updatedData.findIndex(exp => exp.name === item.name);
                if (existingIndex !== -1) {
                    updatedData[existingIndex].amount = item.amount;
                } else {
                    updatedData.push(item);
                }
            });
            return updatedData;
        });

        toast.success('CSV data imported successfully!');
    };
    console.log(expensesData)
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 2 }}>
                <input
                    accept=".csv"
                    style={{ display: 'none' }}
                    id="csv-file"
                    type="file"
                    onChange={handleCSVImport}
                />
                <label htmlFor="csv-file">
                    <Button variant="contained" component="span">
                        Import CSV
                    </Button>
                </label>
                <FormControl style={{ width: '5%' }}>
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
                <FormControl style={{ width: '5%' }}>
                    <InputLabel>Month</InputLabel>
                    <Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        label="Month"
                    >
                        {months.map(month => (
                            <MenuItem key={month} value={month}>{month}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {selectedYear && selectedMonth && (
                    <Button variant="contained" color="primary" onClick={handleSave}>
                        Save Data
                    </Button>
                )}
            </Box>
            <Grid container spacing={2} style={{ height: 'calc(100vh - 120px)' }}>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper elevation={3} style={{ height: '100%', overflow: 'auto' }}>
                        <IncomeBudget revenueData={revenueData} setRevenueData={setRevenueData} />
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper elevation={3} style={{ height: '100%', overflow: 'auto' }}>
                        <ActualIncome revenueData={revenueData} setRevenueData={setRevenueData} />
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper elevation={3} style={{ height: '100%', overflow: 'auto' }}>
                        <ExpensesBudget
                            expensesData={expensesData}
                            setExpensesData={setExpensesData}
                            categories={categories}
                        />
                    </Paper>
                    <ProfitSummary
                        budgetIncome={calculateTotalBudgetIncome()}
                        budgetExpenses={calculateTotalBudgetExpenses()}
                        actualIncome={calculateTotalActualIncome()}
                        actualExpenses={calculateTotalActualExpenses()}
                    />
                </Grid>
                <Grid item xs={6} style={{ height: '50%' }}>
                    <Paper elevation={3} style={{ height: '100%', overflow: 'auto' }}>
                        <ActualExpenses
                            expensesData={expensesData}
                            setExpensesData={setExpensesData}
                            categories={categories}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;