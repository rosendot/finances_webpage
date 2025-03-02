import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Typography,
    Button,
    IconButton,
    Box
} from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { formatDateForInput, formatDateForAPI } from '../utils/dateUtils';
import { revenueApi } from '../api/api';
import { ChangeContext } from '../pages/Dashboard';

const IncomeBudget = ({ revenueData, setRevenueData }) => {
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [lastSelectedRow, setLastSelectedRow] = useState(null);
    const [flatRevenueList, setFlatRevenueList] = useState([]);
    const tableContainerRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState(300); // Default height

    // Get the change context
    const { addRevenuePendingChange } = useContext(ChangeContext);

    // Prepare flat list for virtualization
    useEffect(() => {
        // Create the flat list of revenue items for budget
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
            total + parseFloat(revenue.expected_amount || 0), 0);

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

    const handleExpectedAmountChange = (id, value) => {
        // Update local state
        setRevenueData(revenueData.map(revenue =>
            revenue.id === id ? { ...revenue, expected_amount: value } : revenue
        ));

        // Add to pending changes
        addRevenuePendingChange(id, { expected_amount: value });
    };

    const addNewIncome = async () => {
        try {
            const newIncome = {
                name: 'New Income Source',
                amount: 0,
                expected_amount: 0,
                date: formatDateForAPI(new Date()),
                is_recurring: false
            };

            const response = await revenueApi.create(newIncome);
            setRevenueData([...revenueData, response]);
            toast.success('Added new income source');
        } catch (error) {
            console.error('Error adding new income:', error);
            toast.error('Failed to add new income source');
        }
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
            toast.success('Deleted income source');
        } catch (error) {
            console.error('Error deleting income:', error);
            toast.error('Failed to delete income source');
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

    const updateIncomeName = (id, name) => {
        // Update local state
        setRevenueData(revenueData.map(revenue =>
            revenue.id === id ? { ...revenue, name } : revenue
        ));

        // Add to pending changes
        addRevenuePendingChange(id, { name });
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
                        <TableCell sx={{ flex: 2 }}>
                            <TextField
                                value={revenue.name}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    updateIncomeName(revenue.id, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                variant="standard"
                                fullWidth
                            />
                        </TableCell>
                        <TableCell sx={{ flex: 1 }}>
                            <TextField
                                type="number"
                                value={revenue.expected_amount || ''}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleExpectedAmountChange(revenue.id, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                variant="standard"
                                InputProps={{
                                    startAdornment: '$'
                                }}
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
                        <TableCell sx={{ flex: 1.5 }} colSpan={2}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                <Typography variant="h6">Income Budget</Typography>
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
                            <TableCell sx={{ flex: 1 }}>Expected Amount</TableCell>
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

            <Button
                variant="contained"
                color="primary"
                onClick={addNewIncome}
                style={{ marginTop: '20px' }}
            >
                Add New Income Source
            </Button>
        </div>
    );
};

export default IncomeBudget;