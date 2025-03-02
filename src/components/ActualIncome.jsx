import React, { useState, useEffect, useContext } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    IconButton,
    Box,
    Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { formatDateForInput, formatDateForAPI } from '../utils/dateUtils';
import { revenueApi } from '../api/api';
import { ChangeContext } from '../pages/Dashboard';

const ActualIncome = ({ revenueData, setRevenueData }) => {
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [lastSelectedRow, setLastSelectedRow] = useState(null);

    // Get the change context
    const { addRevenuePendingChange } = useContext(ChangeContext);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                const allIds = revenueData.map(revenue => revenue.id);
                setSelectedRows(new Set(allIds));
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [revenueData]);

    const handleRowClick = (id, event) => {
        if (event.shiftKey && lastSelectedRow !== null) {
            // Get the indices of the current and last selected rows
            const currentIndex = revenueData.findIndex(revenue => revenue.id === id);
            const lastIndex = revenueData.findIndex(revenue => revenue.id === lastSelectedRow);

            // Determine the range of rows to select/deselect
            const start = Math.min(currentIndex, lastIndex);
            const end = Math.max(currentIndex, lastIndex);

            // Get the rows in the range
            const rowsInRange = revenueData.slice(start, end + 1).map(revenue => revenue.id);

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
        // Update the local state
        setRevenueData(revenueData.map(revenue =>
            revenue.id === id ? { ...revenue, amount: value } : revenue
        ));

        // Add to pending changes
        addRevenuePendingChange(id, { amount: value });
    };

    const handleDateChange = (id, value) => {
        // Update the local state
        setRevenueData(revenueData.map(revenue =>
            revenue.id === id ? { ...revenue, date: value } : revenue
        ));

        // Add to pending changes
        addRevenuePendingChange(id, { date: value });
    };

    const deleteIncome = async (id) => {
        try {
            await revenueApi.delete(id);
            setRevenueData(revenueData.filter(revenue => revenue.id !== id));
            setSelectedRows(prev => {
                const newSelected = new Set(prev);
                newSelected.delete(id);
                return newSelected;
            });
            toast.success('Deleted income');
        } catch (error) {
            console.error('Error deleting income:', error);
            toast.error('Failed to delete income');
        }
    };

    const deleteSelectedIncomes = async () => {
        try {
            const selectedIds = Array.from(selectedRows);
            await revenueApi.bulkDelete(selectedIds);

            setRevenueData(revenueData.filter(revenue => !selectedRows.has(revenue.id)));
            setSelectedRows(new Set());
            toast.success('Successfully deleted selected items');
        } catch (error) {
            console.error('Error deleting selected incomes:', error);
            toast.error('Failed to delete selected items');
        }
    };

    const calculateTotal = () => {
        return revenueData.reduce((total, revenue) => total + parseFloat(revenue.amount || 0), 0);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                <Typography variant="h6">Actual Income</Typography>
                {revenueData.length > 0 && (
                    <Button
                        variant="outlined"
                        size="small"
                        color={revenueData.every(revenue => selectedRows.has(revenue.id)) ? 'secondary' : 'primary'}
                        onClick={() => {
                            const allIds = new Set(revenueData.map(revenue => revenue.id));
                            const areAllSelected = revenueData.every(revenue => selectedRows.has(revenue.id));
                            setSelectedRows(areAllSelected ? new Set() : allIds);
                        }}
                    >
                        {revenueData.every(revenue => selectedRows.has(revenue.id))
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
                    onClick={deleteSelectedIncomes}
                >
                    Delete Selected
                </Button>
            </Box>
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
                            <TableRow
                                key={revenue.id}
                                onClick={(event) => handleRowClick(revenue.id, event)}
                                sx={{
                                    cursor: 'pointer',
                                    backgroundColor: selectedRows.has(revenue.id) ? '#8a8a8a' : 'inherit',
                                    '&:hover': {
                                        backgroundColor: '#55c9c2',
                                    },
                                }}
                            >
                                <TableCell>{revenue.name}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={revenue.amount || ''}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            handleAmountChange(revenue.id, e.target.value);
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
                                        value={formatDateForInput(revenue.date)}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            handleDateChange(revenue.id, formatDateForAPI(e.target.value));
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        variant="standard"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteIncome(revenue.id);
                                        }}
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