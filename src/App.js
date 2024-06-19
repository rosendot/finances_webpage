import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import RevenueTable from './components/RevenueTable';
import ExpensesTable from './components/ExpensesTable';

import { Typography } from '@mui/material';

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

  return (
    <div className="App">
      <Typography variant="h4" component="h2" gutterBottom>
        Revenue Table
      </Typography>
      <RevenueTable revenueData={revenueData} />

      <Typography variant="h4" component="h2" gutterBottom>
        Expenses Table
      </Typography>
      <ExpensesTable expensesData={expensesData} />
    </div>
  );
}

export default App;