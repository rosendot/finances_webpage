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
    IconButton,
    Box,
    Button,
    Paper
} from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { formatDateForInput, formatDateForAPI } from '../utils/dateUtils';
import { revenueApi } from '../api/api';
import { ChangeContext } from '../pages/Dashboard';

const ActualIncome = ({ revenueData, setRevenueData }) => {
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [lastSelectedRow, setLastSelectedRow] = useState(null);
    const [flatRevenueList, setFlatRevenueList] = useState([]);
    const tableContainerRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState(300); // Default height

    // Get the change context
    const { addRevenuePendingChange } = useContext(ChangeContext);

    // Prepare flat list for virtualization
    useEffect(() => {
        // Create the flat list of revenue items
        const flatList = [];

        // Add all revenue rows
        revenueData.forEach(revenue => {
            flatList.push({
                type: 'revenue',
                data: revenue
            });
        });

        // Add a grand total row
        const grandTotal = revenueData.reduce((total, revenue) =>
            total + parseFloat(revenue.amount || 0), 0);

        flatList.push({
            type: 'grandTotal',
            total: grandTotal
        });

        setFlatRevenueList(flatList);
    }, [revenueData]);

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

    // Render a row based on its type and data
    const renderRow = ({ index, style }) => {
        const item = flatRevenueList[index];

        if (item.type === 'revenue') {
            const revenue = item.data;
            return (
                <div style={style}>
                    <TableRow
                        onClick={(event) => handleRowClick(revenue.id, event)}
                        sx={{
                            cursor: 'pointer',
                            backgroundColor: selectedRows.has(revenue.id) ? '#8a8a8a' : 'inherit',
                            '&:hover': {
                                backgroundColor: '#55c9c2',
                            },
                            display: 'flex',
                            width: '100%'
                        }}
                    >
                        <TableCell sx={{ flex: 2 }}>{revenue.name}</TableCell>
                        <TableCell sx={{ flex: 1 }}>
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
                                fullWidth
                            />
                        </TableCell>
                        <TableCell sx={{ flex: 1 }}>
                            <TextField
                                type="date"
                                value={formatDateForInput(revenue.date)}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleDateChange(revenue.id, formatDateForAPI(e.target.value));
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
                                    deleteIncome(revenue.id);
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
        } else if (item.type === 'grandTotal') {
            return (
                <div style={style}>
                    <TableRow sx={{ backgroundColor: 'inherit', display: 'flex', width: '100%' }}>
                        <TableCell sx={{ flex: 2 }}><strong>Total</strong></TableCell>
                        <TableCell sx={{ flex: 1 }}>
                            <strong>${item.total.toFixed(2)}</strong>
                        </TableCell>
                        <TableCell sx={{ flex: 1.5 }} colSpan={2}></TableCell>
                    </TableRow>
                </div>
            );
        }

        return null;
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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

            <TableContainer
                ref={tableContainerRef}
                component={Paper}
                sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ display: 'flex', width: '100%' }}>
                            <TableCell sx={{ flex: 2 }}>Name</TableCell>
                            <TableCell sx={{ flex: 1 }}>Actual Amount</TableCell>
                            <TableCell sx={{ flex: 1 }}>Date</TableCell>
                            <TableCell sx={{ flex: 0.5 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                </Table>

                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <List
                        height={containerHeight}
                        itemCount={flatRevenueList.length}
                        itemSize={60} // Adjust row height as needed
                        width="100%"
                    >
                        {renderRow}
                    </List>
                </Box>
            </TableContainer>
        </div>
    );
};

export default ActualIncome;