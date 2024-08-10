import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Typography } from '@mui/material';

const ActualIncome = ({ revenueData, setRevenueData }) => {
    const handleAmountChange = (index, value) => {
        const updatedRevenueData = [...revenueData];
        updatedRevenueData[index].amount = value;
        setRevenueData(updatedRevenueData);
    };

    const calculateTotal = () => {
        return revenueData.reduce((total, revenue) => total + parseFloat(revenue.amount || 0), 0);
    };

    return (
        <div>
            <Typography variant="h6" gutterBottom>Actual Income</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Actual Amount</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {revenueData.map((revenue, index) => (
                            <TableRow key={revenue.id}>
                                <TableCell>{revenue.name}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={revenue.amount || ''}
                                        onChange={(e) => handleAmountChange(index, e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={revenue.date || ''}
                                        onChange={(e) => {
                                            const updatedRevenueData = [...revenueData];
                                            updatedRevenueData[index].date = e.target.value;
                                            setRevenueData(updatedRevenueData);
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell><strong>Total</strong></TableCell>
                            <TableCell><strong>${calculateTotal().toFixed(2)}</strong></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ActualIncome;