import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import RevenueQuadrant from './components/RevenueQuadrant';
import ExpensesQuadrant from './components/ExpensesQuadrant';

import { Grid, Paper, ThemeProvider, createTheme } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  const [revenueData, setRevenueData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);

  useEffect(() => {
    fetchRevenueData();
    fetchExpensesData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/revenue');
      setRevenueData(response.data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const fetchExpensesData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/expenses');
      setExpensesData(response.data);
    } catch (error) {
      console.error('Error fetching expenses data:', error);
    }
  };

  const handleRevenueIncludeChange = (revenue) => {
    const updatedRevenueData = revenueData.map((item) =>
      item.name === revenue.name ? { ...item, include: !item.include } : item
    );
    setRevenueData(updatedRevenueData);
  };

  const handleExpenseIncludeChange = (expense) => {
    const updatedExpensesData = expensesData.map((item) =>
      item.name === expense.name ? { ...item, include: !item.include } : item
    );
    setExpensesData(updatedExpensesData);
  };

  const handleRevenueAmountChange = (revenue, amount) => {
    const updatedRevenueData = revenueData.map((item) =>
      item.name === revenue.name ? { ...item, amount: amount } : item
    );
    setRevenueData(updatedRevenueData);
  };

  const handleExpenseAmountChange = (expense, amount) => {
    const updatedExpensesData = expensesData.map((item) =>
      item.name === expense.name ? { ...item, amount: amount } : item
    );
    setExpensesData(updatedExpensesData);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="App">
        <Grid container spacing={2} style={{ height: '100vh' }}>
          <Grid item xs={6} style={{ height: '50%' }}>
            <Paper elevation={3} style={{ height: '100%' }}>
              <RevenueQuadrant
                revenueData={revenueData}
                onRevenueIncludeChange={handleRevenueIncludeChange}
                onRevenueAmountChange={handleRevenueAmountChange}
              />
            </Paper>
          </Grid>
          <Grid item xs={6} style={{ height: '50%' }}>
            <Paper elevation={3} style={{ height: '100%' }}>
              <ExpensesQuadrant
                expensesData={expensesData}
                onExpenseIncludeChange={handleExpenseIncludeChange}
                onExpenseAmountChange={handleExpenseAmountChange}
              />
            </Paper>
          </Grid>
          <Grid item xs={6} style={{ height: '50%' }}>
            <Paper elevation={3} style={{ height: '100%' }}>
              {/* Add content for the bottom left quadrant */}
            </Paper>
          </Grid>
          <Grid item xs={6} style={{ height: '50%' }}>
            <Paper elevation={3} style={{ height: '100%' }}>
              {/* Add content for the bottom right quadrant */}
            </Paper>
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
}

export default App;