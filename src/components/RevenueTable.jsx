import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import formatDate from '../functions/formatDate';

const RevenueTable = ({ revenueData }) => {
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
                    {revenueData.map((revenue, index) => (
                        <TableRow key={index}>
                            <TableCell>{revenue.name}</TableCell>
                            <TableCell>{revenue.amount}</TableCell>
                            <TableCell>{revenue.date ? formatDate(revenue.date) : ''}</TableCell>
                            <TableCell>{revenue.include ? 'Yes' : 'No'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default RevenueTable;