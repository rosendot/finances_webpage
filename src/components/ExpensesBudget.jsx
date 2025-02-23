import React, { useState } from 'react';
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

const ExpensesBudget = ({ expensesData, setExpensesData }) => {
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [lastSelectedRow, setLastSelectedRow] = useState(null);

    const handleRowClick = (id, event) => {
        if (event.shiftKey && lastSelectedRow !== null) {
            // Get the indices of the current and last selected rows
            const currentIndex = expensesData.findIndex(expense => expense.id === id);
            const lastIndex = expensesData.findIndex(expense => expense.id === lastSelectedRow);

            // Determine the range of rows to select/deselect
            const start = Math.min(currentIndex, lastIndex);
            const end = Math.max(currentIndex, lastIndex);

            // Get the rows in the range
            const rowsInRange = expensesData.slice(start, end + 1).map(expense => expense.id);

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

    const handleExpectedAmountChange = async (id, value) => {
        try {
            await axios.put(`http://localhost:5000/api/expenses/${id}`, {
                expected_amount: value
            });

            const updatedExpensesData = expensesData.map(expense =>
                expense.id === id ? { ...expense, expected_amount: value } : expense
            );
            setExpensesData(updatedExpensesData);
            toast.success('Updated expected amount');
        } catch (error) {
            console.error('Error updating expected amount:', error);
            toast.error('Failed to update expected amount');
        }
    };

    const addNewExpense = async () => {
        try {
            const newExpense = {
                name: 'New Expense',
                amount: 0,
                expected_amount: 0,
                date: formatDateForAPI(new Date()),
                category: 'Miscellaneous',
                is_recurring: false
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

    const updateExpenseDetails = async (id, field, value) => {
        try {
            await axios.put(`http://localhost:5000/api/expenses/${id}`, { [field]: value });
            const updatedExpensesData = expensesData.map(expense =>
                expense.id === id ? { ...expense, [field]: value } : expense
            );
            setExpensesData(updatedExpensesData);
            toast.success(`Updated expense ${field}`);
        } catch (error) {
            console.error(`Error updating expense ${field}:`, error);
            toast.error(`Failed to update expense ${field}`);
        }
    };

    const calculateTotal = () => {
        return expensesData.reduce((total, expense) => total + parseFloat(expense.expected_amount || 0), 0);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                <Typography variant="h6">Expenses Budget</Typography>
                {expensesData.length > 0 && (
                    <Button
                        variant="outlined"
                        size="small"
                        color={expensesData.every(expense => selectedRows.has(expense.id)) ? 'secondary' : 'primary'}
                        onClick={() => {
                            const allIds = new Set(expensesData.map(expense => expense.id));
                            const areAllSelected = expensesData.every(expense => selectedRows.has(expense.id));
                            setSelectedRows(areAllSelected ? new Set() : allIds);
                        }}
                    >
                        {expensesData.every(expense => selectedRows.has(expense.id))
                            ? 'Deselect All'
                            : 'Select All'}
                    </Button>
                )}
                <Button
                    variant="outlined"
                    size="small"
                    disabled={selectedRows.size === 0}
                    sx={{
                        color: selectedRows.size > 0 ? '#ff9800' : 'grey',
                        borderColor: selectedRows.size > 0 ? '#ff9800' : 'grey',
                        '&:hover': {
                            borderColor: '#f57c00',
                            backgroundColor: 'rgba(255, 152, 0, 0.04)'
                        }
                    }}
                    onClick={async () => {
                        for (const id of selectedRows) {
                            await deleteExpense(id);
                        }
                        setSelectedRows(new Set());
                    }}
                >
                    Delete Selected
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Expected Amount</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {expensesData.map((expense) => (
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
                                            updateExpenseDetails(expense.id, 'name', e.target.value);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        variant="standard"
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={expense.category || ''}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            updateExpenseDetails(expense.id, 'category', e.target.value);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        variant="standard"
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={expense.expected_amount || ''}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            handleExpectedAmountChange(expense.id, e.target.value);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        variant="standard"
                                        InputProps={{
                                            startAdornment: '$'
                                        }}
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
                            <TableCell colSpan={2}><strong>Total</strong></TableCell>
                            <TableCell colSpan={2}>
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

export default ExpensesBudget;