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
    Box
} from '@mui/material';
import { toast } from 'react-toastify';
import { expensesApi } from '../api/api';

const ExpensesBudget = ({ budgetCategories, expensesData, setExpensesData }) => {
    const [selectedCategories, setSelectedCategories] = useState(new Set());

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
        try {
            // Get all expenses in this category
            const categoryExpenses = expensesData.filter(exp =>
                (exp.category || 'Miscellaneous') === categoryName
            );

            if (categoryExpenses.length === 0) {
                // If there are no expenses in this category yet, create a default one
                const newExpense = {
                    name: `${categoryName} Budget`,
                    amount: 0,
                    expected_amount: value,
                    category: categoryName
                };

                const response = await expensesApi.create(newExpense);
                setExpensesData([...expensesData, response]);
                toast.success(`Created new budget for ${categoryName}`);
                return;
            }

            // Calculate how to distribute the new budget
            const currentTotal = categoryExpenses.reduce(
                (sum, exp) => sum + parseFloat(exp.expected_amount || 0),
                0
            );

            // If current total is 0, divide evenly. Otherwise, distribute proportionally.
            const updatePromises = categoryExpenses.map(expense => {
                let newAmount;

                if (currentTotal <= 0) {
                    // Divide evenly if current total is 0
                    newAmount = value / categoryExpenses.length;
                } else {
                    // Distribute proportionally based on current expected amounts
                    const proportion = (parseFloat(expense.expected_amount || 0) / currentTotal) || 0;
                    newAmount = value * proportion;
                }

                // Update the API
                return expensesApi.update(expense.id, {
                    expected_amount: newAmount
                });
            });

            await Promise.all(updatePromises);

            // Update local state
            const updatedExpensesData = expensesData.map(expense => {
                if ((expense.category || 'Miscellaneous') === categoryName) {
                    let newAmount;

                    if (currentTotal <= 0) {
                        newAmount = value / categoryExpenses.length;
                    } else {
                        const proportion = (parseFloat(expense.expected_amount || 0) / currentTotal) || 0;
                        newAmount = value * proportion;
                    }

                    return { ...expense, expected_amount: newAmount };
                }
                return expense;
            });

            setExpensesData(updatedExpensesData);
            toast.success(`Updated budget for ${categoryName}`);
        } catch (error) {
            console.error('Error updating expected amount:', error);
            toast.error('Failed to update expected amount');
        }
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

    const calculateTotal = () => {
        return budgetCategories.reduce(
            (total, category) => total + parseFloat(category.expected_amount || 0),
            0
        );
    };

    const calculateActualTotal = () => {
        return budgetCategories.reduce(
            (total, category) => total + parseFloat(category.actual_amount || 0),
            0
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                <Typography variant="h6">Expenses Budget</Typography>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell>Expected Amount</TableCell>
                            <TableCell>Actual Amount</TableCell>
                            <TableCell>Variance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {budgetCategories.map((category) => {
                            const isOverBudget = category.actual_amount > category.expected_amount;
                            const variance = category.actual_amount - category.expected_amount;

                            return (
                                <TableRow
                                    key={category.name}
                                    onClick={() => handleCategoryClick(category.name)}
                                    sx={{
                                        cursor: 'pointer',
                                        backgroundColor: selectedCategories.has(category.name)
                                            ? '#8a8a8a'
                                            : 'inherit',
                                        '&:hover': {
                                            backgroundColor: '#55c9c2',
                                        },
                                    }}
                                >
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>
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
                                        />
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            color: isOverBudget ? 'error.main' : 'success.main',
                                        }}
                                    >
                                        ${category.actual_amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            color: variance > 0 ? 'error.main' : 'success.main',
                                        }}
                                    >
                                        {variance > 0 ? '+' : ''}${variance.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow sx={{ backgroundColor: 'inherit' }}>
                            <TableCell><strong>Total</strong></TableCell>
                            <TableCell><strong>${calculateTotal().toFixed(2)}</strong></TableCell>
                            <TableCell
                                sx={{
                                    color: calculateActualTotal() > calculateTotal() ? 'error.main' : 'success.main',
                                }}
                            >
                                <strong>${calculateActualTotal().toFixed(2)}</strong>
                            </TableCell>
                            <TableCell
                                sx={{
                                    color: calculateActualTotal() - calculateTotal() > 0 ? 'error.main' : 'success.main',
                                }}
                            >
                                <strong>
                                    {calculateActualTotal() - calculateTotal() > 0 ? '+' : ''}
                                    ${(calculateActualTotal() - calculateTotal()).toFixed(2)}
                                </strong>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
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