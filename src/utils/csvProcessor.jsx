// Helper function to clean and standardize transaction descriptions
const cleanDescription = (description) => {
    return description
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .trim()
        .toUpperCase();
};

// Helper function to determine if a transaction is recurring
const identifyRecurringPattern = (transactions, description, amount) => {
    const similarTransactions = transactions.filter(t =>
        t.description.includes(description) &&
        Math.abs(t.amount - amount) < 1 // Allow for minor variations in amount
    );

    return similarTransactions.length >= 2;
};

// Helper function to parse various date formats
const parseDate = (dateStr) => {
    try {
        // First try to split the date string
        const parts = dateStr.split(/[/-]/);

        // Handle common US format (MM/DD/YYYY)
        if (parts.length === 3) {
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            return `${year}-${month}-${day}`;
        }

        // If the above fails, return today's date as fallback
        const today = new Date();
        return today.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error parsing date:', dateStr, error);
        // Return today's date as fallback
        const today = new Date();
        return today.toISOString().split('T')[0];
    }
};

export const processCSV = (csvData) => {
    const lines = csvData.trim().split('\n');
    const transactions = [];
    const recurringPatterns = new Map();

    // Skip header row if it exists
    const startIndex = lines[0].toLowerCase().includes('account') ? 1 : 0;

    // First pass: collect all transactions
    for (let i = startIndex; i < lines.length; i++) {
        const [accountNumber, description, date, type, amount, balance] = lines[i]
            .split(',')
            .map(item => item.replace(/["\r]/g, '').trim());

        const cleanedDescription = cleanDescription(description);
        const parsedAmount = parseFloat(amount);
        const formattedDate = parseDate(date); // Use our new parseDate function

        transactions.push({
            description: cleanedDescription,
            originalDescription: description,
            amount: parsedAmount,
            date: formattedDate,
            type
        });

        // Track potential recurring patterns
        const key = `${cleanedDescription}-${Math.abs(parsedAmount).toFixed(2)}`;
        recurringPatterns.set(key, (recurringPatterns.get(key) || 0) + 1);
    }

    // Second pass: categorize transactions
    const categorizedTransactions = transactions.map(transaction => {
        const isRecurring = recurringPatterns.get(
            `${transaction.description}-${Math.abs(transaction.amount).toFixed(2)}`
        ) >= 2;

        const category = determineCategory(transaction.description);

        return {
            ...transaction,
            isRecurring,
            category,
            transactionType: transaction.amount >= 0 ? 'income' : 'expense'
        };
    });

    // Separate income and expenses
    const income = categorizedTransactions
        .filter(t => t.amount > 0)
        .map(t => ({
            name: t.originalDescription,
            amount: t.amount,
            date: t.date,
            isRecurring: t.isRecurring,
            category: 'Income'
        }));

    const expenses = categorizedTransactions
        .filter(t => t.amount < 0)
        .map(t => ({
            name: t.originalDescription,
            amount: Math.abs(t.amount),
            date: t.date,
            isRecurring: t.isRecurring,
            category: t.category
        }));

    return {
        income,
        expenses,
        summary: {
            totalIncome: income.reduce((sum, t) => sum + t.amount, 0),
            totalExpenses: expenses.reduce((sum, t) => sum + t.amount, 0),
            recurringExpenses: expenses.filter(t => t.isRecurring),
            recurringIncome: income.filter(t => t.isRecurring)
        }
    };
};

const determineCategory = (description) => {
    const categories = {
        FOOD: ['RESTAURANT', 'FOOD', 'GRUBHUB', 'DOORDASH', 'UBER EATS', 'CAFE', 'DELI'],
        TRANSPORTATION: ['UBER', 'LYFT', 'GAS', 'FUEL', 'PARKING', 'TRANSIT'],
        SHOPPING: ['AMAZON', 'WALMART', 'TARGET', 'COSTCO', 'WALGREENS', 'CVS'],
        UTILITIES: ['ELECTRIC', 'WATER', 'GAS', 'INTERNET', 'PHONE', 'CABLE'],
        HOUSING: ['RENT', 'MORTGAGE', 'HOA'],
        ENTERTAINMENT: ['NETFLIX', 'SPOTIFY', 'HULU', 'DISNEY', 'CINEMA', 'MOVIE'],
        HEALTHCARE: ['MEDICAL', 'PHARMACY', 'DOCTOR', 'HEALTH'],
        SUBSCRIPTIONS: ['SUBSCRIPTION', 'RECURRING', 'MONTHLY'],
        TRANSFER: ['TRANSFER', 'ZELLE', 'VENMO', 'PAYPAL']
    };

    const desc = description.toUpperCase();

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => desc.includes(keyword))) {
            return category;
        }
    }

    return 'MISCELLANEOUS';
};