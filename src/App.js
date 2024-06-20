import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import RevenueQuadrant from './components/RevenueQuadrant';
import ExpensesQuadrant from './components/ExpensesQuadrant';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

import { Grid, Paper, ThemeProvider, createTheme, Box, Button } from '@mui/material';

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

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/api/save', {
        revenue: revenueData,
        expenses: expensesData
      });
      toast.success('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Error saving data. Please try again.');
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
        <ToastContainer />
        <Box p={2} display="flex" justifyContent="flex-end">
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Data
          </Button>
        </Box>
        <Grid container spacing={2} style={{ height: 'calc(100vh - 64px)' }}>
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
                setExpensesData={setExpensesData}
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