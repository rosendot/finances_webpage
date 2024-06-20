import React from 'react';
import { Button } from '@mui/material';
import axios from 'axios';

const SaveButton = ({ revenueData, expensesData }) => {
    const handleSave = async () => {
        try {
            console.log(revenueData); console.log(expensesData)
            await axios.post('http://localhost:5000/api/save', {
                revenue: revenueData,
                expenses: expensesData
            });
            alert('Data saved successfully!');
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data. Please try again.');
        }
    };

    return (
        <Button variant="contained" color="primary" onClick={handleSave}>
            Save Data
        </Button>
    );
};

export default SaveButton;