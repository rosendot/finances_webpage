import React, { useState, useEffect, useContext, useRef } from 'react';
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
    Box,
    Paper
} from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { formatDateForInput, formatDateForAPI } from '../utils/dateUtils';
import { expensesApi } from '../api/api';
import { ChangeContext } from '../pages/Dashboard';

const ActualExpenses = ({ expensesData, setExpensesData }) => {
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [lastSelectedRow, setLastSelectedRow] = useState(null);
    const [flatExpensesList, setFlatExpensesList] = useState([]);
    const tableContainerRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState(300); // Default height

    // Get the change context
    const { addExpensePendingChange } = useContext(ChangeContext);

    // Flatten the grouped expenses for virtualization 
    useEffect(() => {
        // Create a flat list of expenses with category information
        const flatList = [];

        // Group expenses by category
        const groupedExpenses = expensesData.reduce((groups, expense) => {
            const category = expense.category || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(expense);
            return groups;
        }, {});

        // For each category, add items and a category total row
        Object.entries(groupedExpenses).forEach(([category, expenses]) => {
            // Add all expense rows for this category
            expenses.forEach(expense => {
                flatList.push({
                    type: 'expense',
                    data: expense,
                    category
                });
            });

            // Add a category total row
            const categoryTotal = expenses.reduce((total, expense) =>
                total + parseFloat(expense.amount || 0), 0);

            flatList.push({
                type: 'categoryTotal',
                category,
                total: categoryTotal
            });
        });

        // Add the grand total row
        const grandTotal = expensesData.reduce((total, expense) =>
            total + parseFloat(expense.amount || 0), 0);

        flatList.push({
            type: 'grandTotal',
            total: grandTotal
        });

        setFlatExpensesList(flatList);
    }, [expensesData]);

    // Measure the container height
    useEffect(() => {
        if (tableContainerRef.current) {
            const height = tableContainerRef.current.clientHeight - 56; // Subtract header height
            setContainerHeight(height > 100 ? height : 300); // Set a minimum height
        }
    }, [tableContainerRef]);

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

    const handleAmountChange = (id, value) => {
        // Update local state
        const updatedExpensesData = expensesData.map(expense =>
            expense.id === id ? { ...expense, amount: value } : expense
        );
        setExpensesData(updatedExpensesData);

        // Add to pending changes
        addExpensePendingChange(id, { amount: value });
    };

    const handleDateChange = (id, value) => {
        // Update local state
        const updatedExpensesData = expensesData.map(expense =>
            expense.id === id ? { ...expense, date: value } : expense
        );
        setExpensesData(updatedExpensesData);

        // Add to pending changes
        addExpensePendingChange(id, { date: value });
    };

    const updateExpenseName = (id, name) => {
        // Update local state
        const updatedExpensesData = expensesData.map(expense =>
            expense.id === id ? { ...expense, name } : expense
        );
        setExpensesData(updatedExpensesData);

        // Add to pending changes
        addExpensePendingChange(id, { name });
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

            const response = await expensesApi.create(newExpense);
            setExpensesData([...expensesData, response]);
            toast.success('Added new expense');
        } catch (error) {
            console.error('Error adding new expense:', error);
            toast.error('Failed to add new expense');
        }
    };

    const deleteExpense = async (id) => {
        try {
            await expensesApi.delete(id);
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

    const deleteSelectedExpenses = async () => {
        try {
            const selectedIds = Array.from(selectedRows);
            await expensesApi.bulkDelete(selectedIds);

            setExpensesData(expensesData.filter(expense => !selectedRows.has(expense.id)));
            setSelectedRows(new Set());
            toast.success('Successfully deleted selected items');
        } catch (error) {
            console.error('Error deleting selected expenses:', error);
            toast.error('Failed to delete selected items');
        }
    };

    // Render a row based on its type and data
    const renderRow = ({ index, style }) => {
        const item = flatExpensesList[index];

        if (item.type === 'expense') {
            const expense = item.data;
            return (
                <div style={style}>
                    <TableRow
                        onClick={(event) => handleRowClick(expense.id, event)}
                        sx={{
                            cursor: 'pointer',
                            backgroundColor: selectedRows.has(expense.id) ? '#8a8a8a' : 'inherit',
                            '&:hover': {
                                backgroundColor: '#55c9c2',
                            },
                            display: 'flex',
                            width: '100%'
                        }}
                    >
                        <TableCell sx={{ flex: 2 }}>
                            <TextField
                                value={expense.name}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    updateExpenseName(expense.id, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                variant="standard"
                                fullWidth
                            />
                        </TableCell>
                        <TableCell sx={{ flex: 1 }}>{item.category}</TableCell>
                        <TableCell sx={{ flex: 1 }}>
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
                                fullWidth
                            />
                        </TableCell>
                        <TableCell sx={{ flex: 1 }}>
                            <TextField
                                type="date"
                                value={formatDateForInput(expense.date)}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleDateChange(expense.id, formatDateForAPI(e.target.value));
                                }}
                                onClick={(e) => e.stopPropagation()}
                                variant="standard"
                                fullWidth
                            />
                        </TableCell>
                        <TableCell sx={{ flex: 0.5 }}>
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
                </div>
            );
        } else if (item.type === 'categoryTotal') {
            return (
                <div style={style}>
                    <TableRow sx={{ backgroundColor: 'inherit', display: 'flex', width: '100%' }}>
                        <TableCell sx={{ flex: 2 }}><strong>{item.category} Total</strong></TableCell>
                        <TableCell sx={{ flex: 1 }}></TableCell>
                        <TableCell sx={{ flex: 2.5 }} colSpan={3}>
                            <strong>${item.total.toFixed(2)}</strong>
                        </TableCell>
                    </TableRow>
                </div>
            );
        } else if (item.type === 'grandTotal') {
            return (
                <div style={style}>
                    <TableRow sx={{ backgroundColor: 'inherit', display: 'flex', width: '100%' }}>
                        <TableCell sx={{ flex: 2 }}><strong>Total Expenses</strong></TableCell>
                        <TableCell sx={{ flex: 1 }}></TableCell>
                        <TableCell sx={{ flex: 2.5 }} colSpan={3}>
                            <strong>${item.total.toFixed(2)}</strong>
                        </TableCell>
                    </TableRow>
                </div>
            );
        }

        return null;
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">Actual Expenses</Typography>
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
                    onClick={deleteSelectedExpenses}
                >
                    Delete Selected
                </Button>
            </Box>

            <TableContainer
                ref={tableContainerRef}
                component={Paper}
                sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ display: 'flex', width: '100%' }}>
                            <TableCell sx={{ flex: 2 }}>Name</TableCell>
                            <TableCell sx={{ flex: 1 }}>Category</TableCell>
                            <TableCell sx={{ flex: 1 }}>Amount</TableCell>
                            <TableCell sx={{ flex: 1 }}>Date</TableCell>
                            <TableCell sx={{ flex: 0.5 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                </Table>

                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <List
                        height={containerHeight}
                        itemCount={flatExpensesList.length}
                        itemSize={60} // Adjust row height as needed
                        width="100%"
                    >
                        {renderRow}
                    </List>
                </Box>
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