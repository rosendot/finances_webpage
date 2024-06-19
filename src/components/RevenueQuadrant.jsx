import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, TextField, Typography, Box } from '@mui/material';

import formatDate from '../functions/formatDate';

const RevenueQuadrant = ({ revenueData, onRevenueIncludeChange, onRevenueAmountChange }) => {
    const [sortedRevenueData, setSortedRevenueData] = useState([]);

    useEffect(() => {
        const sorted = [...revenueData].sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });
        setSortedRevenueData(sorted);
    }, [revenueData]);

    const calculateTotal = () => {
        return sortedRevenueData.reduce((total, revenue) => {
            if (revenue.include) {
                return total + parseFloat(revenue.amount);
            }
            return total;
        }, 0);
    };

    const handleIncludeChange = (revenue) => {
        onRevenueIncludeChange(revenue);
    };

    const handleAmountChange = (revenue, amount) => {
        onRevenueAmountChange(revenue, amount);
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" component="h3" gutterBottom>
                Revenue
            </Typography>
            <TableContainer component={Paper} style={{ flexGrow: 1, overflowY: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Include</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedRevenueData.map((revenue) => (
                            <TableRow key={revenue.name}>
                                <TableCell>{revenue.name}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={revenue.amount}
                                        onChange={(e) => handleAmountChange(revenue, e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>{revenue.date ? formatDate(revenue.date) : ''}</TableCell>
                                <TableCell>
                                    <Checkbox
                                        checked={revenue.include}
                                        onChange={() => handleIncludeChange(revenue)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box mt={2}>
                <Typography variant="subtitle1" component="h4" gutterBottom>
                    Total
                </Typography>
                <Typography variant="body1">{calculateTotal()}</Typography>
            </Box>
        </div>
    );
};

export default RevenueQuadrant;