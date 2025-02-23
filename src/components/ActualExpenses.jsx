import React, { useState, useEffect } from 'react';
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
    IconButton,
    Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { toast } from 'react-toastify';
import { formatDateForInput, formatDateForAPI } from '../utils/dateUtils';

const ActualExpenses = ({ expensesData, setExpensesData }) => {
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [lastSelectedRow, setLastSelectedRow] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault(); // Prevent default browser select-all
                // Select all rows
                const allIds = expensesData.map(expense => expense.id);
                setSelectedRows(new Set(allIds));
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [expensesData]);

    const handleRowClick = (id, event) => {
        if (event.shiftKey && lastSelectedRow !== null) {
            // Create a flat array of all expenses for range selection
            const flatExpenses = expensesData.slice();

            // Get the indices of the current and last selected rows
            const currentIndex = flatExpenses.findIndex(expense => expense.id === id);
            const lastIndex = flatExpenses.findIndex(expense => expense.id === lastSelectedRow);

            // Determine the range of rows to select/deselect
            const start = Math.min(currentIndex, lastIndex);
            const end = Math.max(currentIndex, lastIndex);

            // Get the rows in the range
            const rowsInRange = flatExpenses.slice(start, end + 1).map(expense => expense.id);

            // Determine if we're selecting or deselecting based on the current row's state
            const isSelecting = !selectedRows.has(id);

            setSelectedRows(prev => {
                const newSelected = new Set(prev);

                // Apply the same action (select/deselect) to all rows in range
                rowsInRange.forEach(rowId => {
                    if (isSelecting) {
                        newSelected.add(rowId);
                    } else {
                        newSelected.delete(rowId);
                    }
                });

                return newSelected;
            });
        } else {
            // Regular click behavior
            setSelectedRows(prev => {
                const newSelected = new Set(prev);
                if (newSelected.has(id)) {
                    newSelected.delete(id);
                } else {
                    newSelected.add(id);
                }
                return newSelected;
            });
        }

        // Update the last selected row
        setLastSelectedRow(id);
    };

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
            setSelectedRows(prev => {
                const newSelected = new Set(prev);
                newSelected.delete(id);
                return newSelected;
            });
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                <Typography variant="h6">Actual Expenses</Typography>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                        const allIds = expensesData.map(expense => expense.id);
                        setSelectedRows(new Set(allIds));
                    }}
                >
                    Select All
                </Button>
            </Box>
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
                                    <TableRow
                                        key={expense.id}
                                        onClick={(event) => handleRowClick(expense.id, event)}
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: selectedRows.has(expense.id) ? '#8a8a8a' : 'inherit',
                                            '&:hover': {
                                                backgroundColor: '#55c9c2',
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <TextField
                                                value={expense.name}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateExpenseName(expense.id, e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                variant="standard"
                                            />
                                        </TableCell>
                                        <TableCell>{category}</TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                value={expense.amount || ''}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleAmountChange(expense.id, e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                variant="standard"
                                                InputProps={{
                                                    startAdornment: '$'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="date"
                                                value={formatDateForInput(expense.date)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleDateChange(expense.id, formatDateForAPI(e.target.value));
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                variant="standard"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteExpense(expense.id);
                                                }}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow sx={{ backgroundColor: 'inherit' }}>
                                    <TableCell colSpan={2}><strong>{category} Total</strong></TableCell>
                                    <TableCell colSpan={3}>
                                        <strong>${calculateCategoryTotal(expenses).toFixed(2)}</strong>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                        <TableRow sx={{ backgroundColor: 'inherit' }}>
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