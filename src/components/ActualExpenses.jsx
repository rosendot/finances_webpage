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
    Button,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { toast } from 'react-toastify';

const ActualExpenses = ({ expensesData, setExpensesData }) => {
    const handleAmountChange = async (id, value) => {
        try {
            await axios.put(`http://localhost:5000/api/expenses/${id}`, {
                amount: value
            });

            const updatedExpensesData = expensesData.map(expense =>
                expense.id === id ? { ...expense, amount: value } : expense
            );
            setExpensesData(updatedExpensesData);
            toast.success('Updated actual amount');
        } catch (error) {
            console.error('Error updating actual amount:', error);
            toast.error('Failed to update actual amount');
        }
    };

    const handleDateChange = async (id, value) => {
        try {
            await axios.put(`http://localhost:5000/api/expenses/${id}`, {
                date: value
            });

            const updatedExpensesData = expensesData.map(expense =>
                expense.id === id ? { ...expense, date: value } : expense
            );
            setExpensesData(updatedExpensesData);
            toast.success('Updated date');
        } catch (error) {
            console.error('Error updating date:', error);
            toast.error('Failed to update date');
        }
    };

    const updateExpenseName = async (id, name) => {
        try {
            await axios.put(`http://localhost:5000/api/expenses/${id}`, { name });
            const updatedExpensesData = expensesData.map(expense =>
                expense.id === id ? { ...expense, name } : expense
            );
            setExpensesData(updatedExpensesData);
            toast.success('Updated expense name');
        } catch (error) {
            console.error('Error updating expense name:', error);
            toast.error('Failed to update expense name');
        }
    };

    const addNewExpense = async () => {
        try {
            const newExpense = {
                name: 'New Expense',
                amount: 0,
                expected_amount: 0,
                date: new Date().toISOString().split('T')[0],
                category: 'Miscellaneous'
            };

            const response = await axios.post('http://localhost:5000/api/expenses', newExpense);
            setExpensesData([...expensesData, response.data]);
            toast.success('Added new expense');
        } catch (error) {
            console.error('Error adding new expense:', error);
            toast.error('Failed to add new expense');
        }
    };

    const deleteExpense = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/expenses/${id}`);
            setExpensesData(expensesData.filter(expense => expense.id !== id));
            toast.success('Deleted expense');
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Failed to delete expense');
        }
    };

    const calculateTotal = () => {
        return expensesData.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
    };

    const groupedExpenses = expensesData.reduce((groups, expense) => {
        const category = expense.category || 'Uncategorized';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(expense);
        return groups;
    }, {});

    const calculateCategoryTotal = (expenses) => {
        return expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>Actual Expenses</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(groupedExpenses).map(([category, expenses]) => (
                            <React.Fragment key={category}>
                                {expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>
                                            <TextField
                                                value={expense.name}
                                                onChange={(e) => updateExpenseName(expense.id, e.target.value)}
                                                variant="standard"
                                            />
                                        </TableCell>
                                        <TableCell>{category}</TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                value={expense.amount || ''}
                                                onChange={(e) => handleAmountChange(expense.id, e.target.value)}
                                                variant="standard"
                                                InputProps={{
                                                    startAdornment: '$'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="date"
                                                value={expense.date || ''}
                                                onChange={(e) => handleDateChange(expense.id, e.target.value)}
                                                variant="standard"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => deleteExpense(expense.id)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={2}><strong>{category} Total</strong></TableCell>
                                    <TableCell colSpan={3}>
                                        <strong>${calculateCategoryTotal(expenses).toFixed(2)}</strong>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                        <TableRow>
                            <TableCell colSpan={2}><strong>Total Expenses</strong></TableCell>
                            <TableCell colSpan={3}>
                                <strong>${calculateTotal().toFixed(2)}</strong>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Button
                variant="contained"
                color="primary"
                onClick={addNewExpense}
                style={{ marginTop: '20px' }}
            >
                Add New Expense
            </Button>
        </div>
    );
};

export default ActualExpenses;