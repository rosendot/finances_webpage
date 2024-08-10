import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Typography } from '@mui/material';

const IncomeBudget = ({ revenueData, setRevenueData }) => {
    const handleExpectedAmountChange = (index, value) => {
        const updatedRevenueData = [...revenueData];
        updatedRevenueData[index].expected_amount = value;
        setRevenueData(updatedRevenueData);
    };

    const calculateTotal = () => {
        return revenueData.reduce((total, revenue) => total + parseFloat(revenue.expected_amount || 0), 0);
    };

    return (
        <div>
            <Typography variant="h6" gutterBottom>Income Budget</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Expected Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {revenueData.map((revenue, index) => (
                            <TableRow key={revenue.id}>
                                <TableCell>{revenue.name}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={revenue.expected_amount || ''}
                                        onChange={(e) => handleExpectedAmountChange(index, e.target.value)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell><strong>Total</strong></TableCell>
                            <TableCell><strong>${calculateTotal().toFixed(2)}</strong></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default IncomeBudget;