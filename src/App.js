import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import RevenueTable from './components/RevenueTable';
import ExpensesTable from './components/ExpensesTable';

import { Typography, Grid, Paper } from '@mui/material';

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


  return (
    <div className="App">
      <Grid container spacing={2} style={{ height: '100vh' }}>
        <Grid item xs={6} style={{ height: '50%' }}>
          <Paper elevation={3} style={{ height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Revenue Table
            </Typography>
            <RevenueTable
              revenueData={revenueData}
              onRevenueIncludeChange={handleRevenueIncludeChange}
            />
          </Paper>
        </Grid>
        <Grid item xs={6} style={{ height: '50%' }}>
          <Paper elevation={3} style={{ height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Expenses Table
            </Typography>
            <ExpensesTable
              expensesData={expensesData}
              onExpenseIncludeChange={handleExpenseIncludeChange}
            />
          </Paper>
        </Grid>
        <Grid item xs={6} style={{ height: '50%' }}>
          <Paper elevation={3} style={{ height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Bottom Left Quadrant
            </Typography>
            {/* Add content for the bottom left quadrant */}
          </Paper>
        </Grid>
        <Grid item xs={6} style={{ height: '50%' }}>
          <Paper elevation={3} style={{ height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Bottom Right Quadrant
            </Typography>
            {/* Add content for the bottom right quadrant */}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;