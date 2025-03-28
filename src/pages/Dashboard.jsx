import React, { useEffect, useState, useContext } from 'react';
import { Grid, Paper, Button, Box, Fab, Snackbar, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import IncomeBudget from '../components/IncomeBudget';
import ActualIncome from '../components/ActualIncome';
import ExpensesBudget from '../components/ExpensesBudget';
import ActualExpenses from '../components/ActualExpenses';
import ProfitSummary from '../components/ProfitSummary';
import { toast } from 'react-toastify';
import { formatDateForAPI } from '../utils/dateUtils';
// Import our API modules
import { revenueApi, expensesApi } from '../api/api';
import { processQBO } from '../utils/qboProcessor';
import SaveMonthlyReportModal from '../components/SaveMonthlyReportModal';

// Create a new context for managing changes
export const ChangeContext = React.createContext();

function Dashboard() {
    const [revenueData, setRevenueData] = useState([]);
    const [expensesData, setExpensesData] = useState([]);
    const [budgetCategories, setBudgetCategories] = useState([]);

    // Add states for managing changes
    const [pendingChanges, setPendingChanges] = useState({
        revenue: {},
        expenses: {}
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [showFab, setShowFab] = useState(false);
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [saveReportOpen, setSaveReportOpen] = useState(false);

    useEffect(() => {
        fetchRevenueData();
        fetchExpensesData();
    }, []);

    useEffect(() => {
        // Group expenses by category and aggregate
        const categories = {};

        expensesData.forEach(expense => {
            const category = expense.category || 'Miscellaneous';

            if (!categories[category]) {
                categories[category] = {
                    name: category,
                    expected_amount: 0,
                    actual_amount: 0
                };
            }

            // Sum up expected amounts for budgeting
            categories[category].expected_amount += parseFloat(expense.expected_amount || 0);
            // Sum up actual amounts for comparison
            categories[category].actual_amount += parseFloat(expense.amount || 0);
        });

        setBudgetCategories(Object.values(categories));
    }, [expensesData]);

    // Effect to set hasChanges whenever pendingChanges changes
    useEffect(() => {
        const hasRevenueChanges = Object.keys(pendingChanges.revenue).length > 0;
        const hasExpensesChanges = Object.keys(pendingChanges.expenses).length > 0;

        setHasChanges(hasRevenueChanges || hasExpensesChanges);

        if (hasRevenueChanges || hasExpensesChanges) {
            setIsSnackbarOpen(true);
        } else {
            setIsSnackbarOpen(false);
            setShowFab(false);
        }
    }, [pendingChanges]);

    const fetchRevenueData = async () => {
        try {
            const data = await revenueApi.getAll();
            setRevenueData(data);
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            toast.error('Failed to fetch revenue data');
        }
    };

    const fetchExpensesData = async () => {
        try {
            const data = await expensesApi.getAll();
            setExpensesData(data);
        } catch (error) {
            console.error('Error fetching expenses data:', error);
            toast.error('Failed to fetch expenses data');
        }
    };

    const addRevenuePendingChange = (id, changes) => {
        setPendingChanges(prev => ({
            ...prev,
            revenue: {
                ...prev.revenue,
                [id]: {
                    ...changes
                }
            }
        }));
    };

    const addExpensePendingChange = (id, changes) => {
        setPendingChanges(prev => ({
            ...prev,
            expenses: {
                ...prev.expenses,
                [id]: {
                    ...changes
                }
            }
        }));
    };

    const calculateTotalBudgetIncome = () => {
        return revenueData.reduce((total, income) => total + parseFloat(income.expected_amount || 0), 0);
    };

    const calculateTotalActualIncome = () => {
        return revenueData.reduce((total, income) => total + parseFloat(income.amount || 0), 0);
    };

    const calculateTotalBudgetExpenses = () => {
        return budgetCategories.reduce((total, category) => total + parseFloat(category.expected_amount || 0), 0);
    };

    const calculateTotalActualExpenses = () => {
        return expensesData.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
    };

    const handleSaveChanges = async () => {
        // Track success counts
        let revenueUpdated = 0;
        let expensesUpdated = 0;

        // Update revenue items
        const revenueIds = Object.keys(pendingChanges.revenue);
        for (const id of revenueIds) {
            try {
                await revenueApi.update(id, pendingChanges.revenue[id]);
                revenueUpdated++;
            } catch (error) {
                console.error('Error updating revenue:', error);
                toast.error(`Failed to update revenue item #${id}`);
            }
        }

        // Update expense items
        const expenseIds = Object.keys(pendingChanges.expenses);
        for (const id of expenseIds) {
            try {
                await expensesApi.update(id, pendingChanges.expenses[id]);
                expensesUpdated++;
            } catch (error) {
                console.error('Error updating expense:', error);
                toast.error(`Failed to update expense item #${id}`);
            }
        }

        // Show success message if any updates succeeded
        if (revenueUpdated > 0 || expensesUpdated > 0) {
            const successMessage = [
                revenueUpdated > 0 ? `${revenueUpdated} income items updated` : '',
                expensesUpdated > 0 ? `${expensesUpdated} expense items updated` : ''
            ].filter(Boolean).join(' and ');

            toast.success(`${successMessage} successfully!`);

            // Refresh data
            fetchRevenueData();
            fetchExpensesData();

            // Clear pending changes
            setPendingChanges({
                revenue: {},
                expenses: {}
            });

            setIsSnackbarOpen(false);
            setShowFab(false);
        }
    };

    const handleFabClick = () => {
        setIsSnackbarOpen(true);
    };

    const handleQBOImport = async (event) => {
        const file = event.target.files[0];
        if (file) {
            // Verify file type
            if (!file.name.toLowerCase().endsWith('.qbo')) {
                toast.error('Please upload a QBO file.');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const qboData = e.target.result;
                    const processedData = processQBO(qboData);

                    toast.info(`Processing ${processedData.income.length} income and ${processedData.expenses.length} expense transactions...`);

                    if (processedData.transfers.length > 0) {
                        toast.info(`Note: ${processedData.transfers.length} internal transfers (credit card payments) were detected and excluded.`);
                    }

                    // Process the income items
                    if (processedData.income.length > 0) {
                        const incomeItems = processedData.income.map(income => ({
                            name: income.name,
                            amount: income.amount,
                            expected_amount: 0,
                            date: formatDateForAPI(income.date),
                            is_recurring: income.isRecurring,
                            category: 'Income'
                        }));

                        toast.info(`Importing ${incomeItems.length} income transactions...`);
                        const newIncomeItems = await revenueApi.bulkCreate(incomeItems);

                        // Update revenue data with new items
                        setRevenueData(prevData => [...prevData, ...newIncomeItems]);
                        toast.success(`Successfully imported ${newIncomeItems.length} income transactions`);
                    }

                    // Process the expense items
                    if (processedData.expenses.length > 0) {
                        const expenseItems = processedData.expenses.map(expense => ({
                            name: expense.name,
                            amount: expense.amount,
                            expected_amount: 0,
                            date: formatDateForAPI(expense.date),
                            is_recurring: expense.isRecurring,
                            category: expense.category
                        }));

                        toast.info(`Importing ${expenseItems.length} expense transactions...`);
                        const newExpenseItems = await expensesApi.bulkCreate(expenseItems);

                        // Update expenses data with new items
                        setExpensesData(prevData => [...prevData, ...newExpenseItems]);
                        toast.success(`Successfully imported ${newExpenseItems.length} expense transactions`);
                    }

                    toast.success('QBO import completed successfully!');
                } catch (error) {
                    console.error('Error processing QBO file:', error);
                    toast.error('Failed to import QBO data. Please check the file format and try again.');
                }
            };
            reader.readAsText(file);
        }
    };

    // Value to provide through context
    const contextValue = {
        addRevenuePendingChange,
        addExpensePendingChange
    };

    return (
        <ChangeContext.Provider value={contextValue}>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 1 }}>
                    <input
                        accept=".qbo"
                        style={{ display: 'none' }}
                        id="qbo-file"
                        type="file"
                        onChange={handleQBOImport}
                    />
                    <label htmlFor="qbo-file">
                        <Button variant="contained" component="span">
                            Import QBO
                        </Button>
                    </label>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<SaveIcon />}
                        onClick={() => setSaveReportOpen(true)}
                        sx={{ mb: 2 }}
                    >
                        Save Monthly Report
                    </Button>
                </Box>

                <Grid container spacing={1} style={{ height: '80vh' }}>
                    <Grid item xs={6} style={{ height: '50%' }}>
                        <Paper style={{ height: '100%', overflow: 'auto' }}>
                            <IncomeBudget revenueData={revenueData} setRevenueData={setRevenueData} />
                        </Paper>
                    </Grid>
                    <Grid item xs={6} style={{ height: '50%' }}>
                        <Paper style={{ height: '100%', overflow: 'auto' }}>
                            <ActualIncome revenueData={revenueData} setRevenueData={setRevenueData} />
                        </Paper>
                    </Grid>

                    <Grid item xs={6} style={{ height: '50%' }}>
                        <Paper style={{ height: '100%', overflow: 'auto' }}>
                            <ExpensesBudget
                                budgetCategories={budgetCategories}
                                expensesData={expensesData}
                                setExpensesData={setExpensesData}
                            />
                        </Paper>
                        <ProfitSummary
                            budgetIncome={calculateTotalBudgetIncome()}
                            budgetExpenses={calculateTotalBudgetExpenses()}
                            actualIncome={calculateTotalActualIncome()}
                            actualExpenses={calculateTotalActualExpenses()}
                        />
                    </Grid>
                    <Grid item xs={6} style={{ height: '50%' }}>
                        <Paper style={{ height: '100%', overflow: 'auto' }}>
                            <ActualExpenses
                                expensesData={expensesData}
                                setExpensesData={setExpensesData}
                            />
                        </Paper>
                    </Grid>
                </Grid>

                {/* Snackbar for unsaved changes */}
                <Snackbar
                    open={isSnackbarOpen && hasChanges}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    onClose={() => {
                        setIsSnackbarOpen(false);
                        setShowFab(true);
                    }}
                    autoHideDuration={null}
                >
                    <Alert
                        action={
                            <Button color="inherit" size="small" onClick={handleSaveChanges}>
                                Save
                            </Button>
                        }
                        severity="info"
                    >
                        You have unsaved changes.
                    </Alert>
                </Snackbar>

                {/* FAB for saving changes */}
                {showFab && (
                    <Fab
                        color="primary"
                        aria-label="save"
                        style={{
                            position: 'fixed',
                            bottom: 16,
                            right: 16,
                            zIndex: 1000
                        }}
                        onClick={handleFabClick}
                    >
                        <SaveIcon />
                    </Fab>
                )}
            </Box>
            <SaveMonthlyReportModal
                open={saveReportOpen}
                onClose={() => setSaveReportOpen(false)}
                financialData={{
                    budgetIncome: calculateTotalBudgetIncome(),
                    actualIncome: calculateTotalActualIncome(),
                    budgetExpenses: calculateTotalBudgetExpenses(),
                    actualExpenses: calculateTotalActualExpenses()
                }}
            />
        </ChangeContext.Provider>
    );
}

export default Dashboard;