// src/components/SaveMonthlyReportModal.jsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Box
} from '@mui/material';
import { toast } from 'react-toastify';
import { reportApi } from '../api/api';

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

const SaveMonthlyReportModal = ({ open, onClose, financialData }) => {
    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        try {
            setIsSaving(true);

            const reportData = {
                month,
                year,
                budget_income: financialData.budgetIncome,
                actual_income: financialData.actualIncome,
                budget_expenses: financialData.budgetExpenses,
                actual_expenses: financialData.actualExpenses,
                notes
            };

            await reportApi.saveMonthlyReport(reportData);

            toast.success(`Financial data saved for ${months.find(m => m.value === month).label} ${year}`);
            onClose();
        } catch (error) {
            console.error('Error saving monthly report:', error);
            toast.error('Failed to save financial data');
        } finally {
            setIsSaving(false);
        }
    };

    // Generate year options (current year and 5 years back)
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - i);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Save Monthly Financial Report</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Month</InputLabel>
                            <Select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                label="Month"
                            >
                                {months.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Year</InputLabel>
                            <Select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                label="Year"
                            >
                                {yearOptions.map((yearOption) => (
                                    <MenuItem key={yearOption} value={yearOption}>
                                        {yearOption}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <TextField
                        label="Notes"
                        multiline
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        fullWidth
                    />

                    <Box sx={{ mt: 2 }}>
                        <strong>Summary:</strong>
                        <ul>
                            <li>Budget Income: ${financialData.budgetIncome.toFixed(2)}</li>
                            <li>Actual Income: ${financialData.actualIncome.toFixed(2)}</li>
                            <li>Budget Expenses: ${financialData.budgetExpenses.toFixed(2)}</li>
                            <li>Actual Expenses: ${financialData.actualExpenses.toFixed(2)}</li>
                            <li>Profit: ${(financialData.actualIncome - financialData.actualExpenses).toFixed(2)}</li>
                            <li>Savings Rate: {financialData.actualIncome > 0
                                ? ((financialData.actualIncome - financialData.actualExpenses) / financialData.actualIncome * 100).toFixed(2)
                                : 0}%</li>
                        </ul>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    color="primary"
                    variant="contained"
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Report'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SaveMonthlyReportModal;