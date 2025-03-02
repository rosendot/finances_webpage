import React, { useState, useContext, useEffect, useRef } from 'react';
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
    Box,
    Paper
} from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import { toast } from 'react-toastify';
import { expensesApi } from '../api/api';
import { ChangeContext } from '../pages/Dashboard';

const ExpensesBudget = ({ budgetCategories, expensesData, setExpensesData }) => {
    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [flatCategoriesList, setFlatCategoriesList] = useState([]);
    const tableContainerRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState(300); // Default height

    // Get the change context
    const { addExpensePendingChange } = useContext(ChangeContext);

    // Prepare flat list for virtualization
    useEffect(() => {
        // Create a flat list of budget categories
        const flatList = [];

        // Add all category rows
        budgetCategories.forEach(category => {
            flatList.push({
                type: 'category',
                data: category
            });
        });

        // Add the totals row
        const totalExpected = budgetCategories.reduce(
            (total, category) => total + parseFloat(category.expected_amount || 0),
            0
        );
        const totalActual = budgetCategories.reduce(
            (total, category) => total + parseFloat(category.actual_amount || 0),
            0
        );

        flatList.push({
            type: 'totals',
            expectedTotal: totalExpected,
            actualTotal: totalActual
        });

        setFlatCategoriesList(flatList);
    }, [budgetCategories]);

    // Measure the container height
    useEffect(() => {
        if (tableContainerRef.current) {
            const height = tableContainerRef.current.clientHeight - 56; // Subtract header height
            setContainerHeight(height > 100 ? height : 300); // Set a minimum height
        }
    }, [tableContainerRef]);

    const handleCategoryClick = (category) => {
        setSelectedCategories(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(category)) {
                newSelected.delete(category);
            } else {
                newSelected.add(category);
            }
            return newSelected;
        });
    };

    const handleExpectedAmountChange = async (categoryName, value) => {
        // Get all expenses in this category
        const categoryExpenses = expensesData.filter(exp =>
            (exp.category || 'Miscellaneous') === categoryName
        );

        if (categoryExpenses.length === 0) {
            // If there are no expenses in this category yet, create a default one
            try {
                const newExpense = {
                    name: `${categoryName} Budget`,
                    amount: 0,
                    expected_amount: value,
                    category: categoryName
                };

                const response = await expensesApi.create(newExpense);
                setExpensesData([...expensesData, response]);
                toast.success(`Created new budget for ${categoryName}`);
            } catch (error) {
                console.error('Error creating budget category:', error);
                toast.error(`Failed to create budget for ${categoryName}`);
            }
            return;
        }

        // Calculate how to distribute the new budget
        const currentTotal = categoryExpenses.reduce(
            (sum, exp) => sum + parseFloat(exp.expected_amount || 0),
            0
        );

        // Update local state with new expected amounts
        const updatedExpensesData = [...expensesData];

        categoryExpenses.forEach(expense => {
            let newAmount;

            if (currentTotal <= 0) {
                // Divide evenly if current total is 0
                newAmount = value / categoryExpenses.length;
            } else {
                // Distribute proportionally based on current expected amounts
                const proportion = (parseFloat(expense.expected_amount || 0) / currentTotal) || 0;
                newAmount = value * proportion;
            }

            // Find and update the expense in the copied array
            const index = updatedExpensesData.findIndex(e => e.id === expense.id);
            if (index !== -1) {
                updatedExpensesData[index] = {
                    ...updatedExpensesData[index],
                    expected_amount: newAmount
                };

                // Add to pending changes
                addExpensePendingChange(expense.id, { expected_amount: newAmount });
            }
        });

        // Update the state with the new array
        setExpensesData(updatedExpensesData);
    };

    const addNewCategory = async () => {
        try {
            const newExpense = {
                name: 'New Category Budget',
                amount: 0,
                expected_amount: 0,
                category: 'New Category',
                date: new Date().toISOString().split('T')[0]
            };

            const response = await expensesApi.create(newExpense);
            setExpensesData([...expensesData, response]);
            toast.success('Added new budget category');
        } catch (error) {
            console.error('Error adding new budget category:', error);
            toast.error('Failed to add new budget category');
        }
    };

    // Render a row based on its type and data
    const renderRow = ({ index, style }) => {
        const item = flatCategoriesList[index];

        if (item.type === 'category') {
            const category = item.data;
            const isOverBudget = category.actual_amount > category.expected_amount;
            const variance = category.actual_amount - category.expected_amount;

            return (
                <div style={style}>
                    <TableRow
                        onClick={() => handleCategoryClick(category.name)}
                        sx={{
                            cursor: 'pointer',
                            backgroundColor: selectedCategories.has(category.name)
                                ? '#8a8a8a'
                                : 'inherit',
                            '&:hover': {
                                backgroundColor: '#55c9c2',
                            },
                            display: 'flex',
                            width: '100%'
                        }}
                    >
                        <TableCell sx={{ flex: 2 }}>{category.name}</TableCell>
                        <TableCell sx={{ flex: 1 }}>
                            <TextField
                                type="number"
                                value={category.expected_amount || ''}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleExpectedAmountChange(
                                        category.name,
                                        parseFloat(e.target.value || 0)
                                    );
                                }}
                                onClick={(e) => e.stopPropagation()}
                                variant="standard"
                                InputProps={{
                                    startAdornment: '$'
                                }}
                                fullWidth
                            />
                        </TableCell>
                        <TableCell
                            sx={{
                                flex: 1,
                                color: isOverBudget ? 'error.main' : 'success.main',
                            }}
                        >
                            ${category.actual_amount.toFixed(2)}
                        </TableCell>
                        <TableCell
                            sx={{
                                flex: 1,
                                color: variance > 0 ? 'error.main' : 'success.main',
                            }}
                        >
                            {variance > 0 ? '+' : ''}${variance.toFixed(2)}
                        </TableCell>
                    </TableRow>
                </div>
            );
        } else if (item.type === 'totals') {
            const variance = item.actualTotal - item.expectedTotal;

            return (
                <div style={style}>
                    <TableRow sx={{ backgroundColor: 'inherit', display: 'flex', width: '100%' }}>
                        <TableCell sx={{ flex: 2 }}><strong>Total</strong></TableCell>
                        <TableCell sx={{ flex: 1 }}>
                            <strong>${item.expectedTotal.toFixed(2)}</strong>
                        </TableCell>
                        <TableCell
                            sx={{
                                flex: 1,
                                color: item.actualTotal > item.expectedTotal ? 'error.main' : 'success.main',
                            }}
                        >
                            <strong>${item.actualTotal.toFixed(2)}</strong>
                        </TableCell>
                        <TableCell
                            sx={{
                                flex: 1,
                                color: variance > 0 ? 'error.main' : 'success.main',
                            }}
                        >
                            <strong>
                                {variance > 0 ? '+' : ''}${variance.toFixed(2)}
                            </strong>
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
                <Typography variant="h6">Expenses Budget</Typography>
            </Box>

            <TableContainer
                ref={tableContainerRef}
                component={Paper}
                sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ display: 'flex', width: '100%' }}>
                            <TableCell sx={{ flex: 2 }}>Category</TableCell>
                            <TableCell sx={{ flex: 1 }}>Expected Amount</TableCell>
                            <TableCell sx={{ flex: 1 }}>Actual Amount</TableCell>
                            <TableCell sx={{ flex: 1 }}>Variance</TableCell>
                        </TableRow>
                    </TableHead>
                </Table>

                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <List
                        height={containerHeight}
                        itemCount={flatCategoriesList.length}
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
                onClick={addNewCategory}
                style={{ marginTop: '20px' }}
            >
                Add New Category
            </Button>
        </div>
    );
};

export default ExpensesBudget;