import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, TextField } from '@mui/material';

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

    const handleIncludeChange = (revenue) => {
        onRevenueIncludeChange(revenue);
    };

    const handleAmountChange = (revenue, amount) => {
        onRevenueAmountChange(revenue, amount);
    };

    return (
        <TableContainer component={Paper}>
            <Table>
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
    );
};

export default RevenueQuadrant;