import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox } from '@mui/material';

import formatDate from '../functions/formatDate';

const RevenueTable = ({ revenueData, onRevenueIncludeChange }) => {
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
                            <TableCell>{'$ ' + revenue.amount}</TableCell>
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

export default RevenueTable;