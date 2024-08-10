export const processCSV = (csvData) => {
    const lines = csvData.split('\n');
    const income = [];
    const expenses = [];

    lines.forEach(line => {
        const [date, amount, , , description] = line.split(',').map(item => item.replace(/"/g, '').trim());
        const parsedAmount = parseFloat(amount);

        if (parsedAmount > 0) {
            // Income
            income.push({
                name: description.includes('DIRECT DEP') ? 'Salary' : 'Other Income',
                amount: Math.abs(parsedAmount),
                date: formatDate(date)
            });
        } else if (parsedAmount < 0) {
            // Expense
            let category = 'Miscellaneous';
            if (description.includes('RECURRING PAYMENT')) {
                category = 'Subscriptions';
            } else if (description.includes('PURCHASE AUTHORIZED')) {
                category = determineCategory(description);
            }

            expenses.push({
                name: description,
                amount: Math.abs(parsedAmount),
                date: formatDate(date),
                category: category
            });
        }
    });

    return { income, expenses };
};

const formatDate = (dateString) => {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const determineCategory = (description) => {
    // You can expand this function to categorize expenses based on keywords in the description
    if (description.includes('RESTAURANT') || description.includes('FOOD')) return 'Food';
    if (description.includes('UBER') || description.includes('LYFT')) return 'Transportation';
    if (description.includes('AMAZON') || description.includes('WALMART')) return 'Shopping';
    // Add more categories as needed
    return 'Miscellaneous';
};