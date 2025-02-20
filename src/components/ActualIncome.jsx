import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { toast } from 'react-toastify';

const ActualIncome = ({ revenueData, setRevenueData }) => {
    const handleAmountChange = async (id, value) => {
        try {
            await axios.put(`http://localhost:5000/api/revenue/${id}`, {
                amount: value
            });

            const updatedRevenueData = revenueData.map(revenue =>
                revenue.id === id ? { ...revenue, amount: value } : revenue
            );
            setRevenueData(updatedRevenueData);
            toast.success('Updated actual amount');
        } catch (error) {
            console.error('Error updating actual amount:', error);
            toast.error('Failed to update actual amount');
        }
    };

    const handleDateChange = async (id, value) => {
        try {
            await axios.put(`http://localhost:5000/api/revenue/${id}`, {
                date: value
            });

            const updatedRevenueData = revenueData.map(revenue =>
                revenue.id === id ? { ...revenue, date: value } : revenue
            );
            setRevenueData(updatedRevenueData);
            toast.success('Updated date');
        } catch (error) {
            console.error('Error updating date:', error);
            toast.error('Failed to update date');
        }
    };

    const deleteIncome = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/revenue/${id}`);
            setRevenueData(revenueData.filter(revenue => revenue.id !== id));
            toast.success('Deleted income');
        } catch (error) {
            console.error('Error deleting income:', error);
            toast.error('Failed to delete income');
        }
    };

    const calculateTotal = () => {
        return revenueData.reduce((total, revenue) => total + parseFloat(revenue.amount || 0), 0);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>Actual Income</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Actual Amount</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {revenueData.map((revenue) => (
                            <TableRow key={revenue.id}>
                                <TableCell>{revenue.name}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={revenue.amount || ''}
                                        onChange={(e) => handleAmountChange(revenue.id, e.target.value)}
                                        variant="standard"
                                        InputProps={{
                                            startAdornment: '$'
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={revenue.date || ''}
                                        onChange={(e) => handleDateChange(revenue.id, e.target.value)}
                                        variant="standard"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => deleteIncome(revenue.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell><strong>Total</strong></TableCell>
                            <TableCell>
                                <strong>${calculateTotal().toFixed(2)}</strong>
                            </TableCell>
                            <TableCell colSpan={2}></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ActualIncome;