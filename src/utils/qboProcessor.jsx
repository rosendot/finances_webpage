// Function to parse QBO file
export const processQBO = (qboData) => {
    try {
        // Extract transactions from QBO XML data
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(qboData, "text/xml");

        // Get all transaction elements
        const transactions = Array.from(xmlDoc.querySelectorAll('STMTTRN'));

        const income = [];
        const expenses = [];

        transactions.forEach(transactionElem => {
            // Extract transaction data
            const type = transactionElem.querySelector('TRNTYPE')?.textContent;
            const amount = parseFloat(transactionElem.querySelector('TRNAMT')?.textContent || '0');
            const memo = transactionElem.querySelector('MEMO')?.textContent || '';
            const datePosted = transactionElem.querySelector('DTPOSTED')?.textContent || '';

            // Convert date format (20250301000000.000[-5:EST]) to YYYY-MM-DD
            const parsedDate = parseQBODate(datePosted);

            // Determine if this is a recurring transaction based on description patterns
            const isRecurring = isRecurringTransaction(memo);

            // Create transaction object
            const transactionData = {
                name: memo,
                amount: Math.abs(amount),
                date: parsedDate,
                isRecurring: isRecurring,
                category: determineCategory(memo)
            };

            // Add to appropriate array based on transaction type (CREDIT = income, DEBIT = expense)
            if (type === 'CREDIT' || amount > 0) {
                income.push(transactionData);
            } else if (type === 'DEBIT' || amount < 0) {
                expenses.push(transactionData);
            }
        });

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
    } catch (error) {
        console.error('Error processing QBO file:', error);
        throw new Error('Failed to process QBO file. Please check the file format.');
    }
};

// Helper function to parse QBO date format
const parseQBODate = (dateStr) => {
    try {
        // QBO date format: YYYYMMDDHHMMSS.SSS[timezone]
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);

        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error parsing QBO date:', dateStr, error);
        return new Date().toISOString().split('T')[0]; // Return today as fallback
    }
};

// Helper function to determine if transaction is recurring
const isRecurringTransaction = (description) => {
    const recurringKeywords = [
        'SUBSCRIPTION', 'MONTHLY', 'NETFLIX', 'SPOTIFY', 'APPLE', 'GOOGLE',
        'MICROSOFT', 'ADOBE', 'RECURRING', 'AUTO PAY', 'DIRECT DEP'
    ];

    return recurringKeywords.some(keyword =>
        description.toUpperCase().includes(keyword)
    );
};

// Helper function to determine transaction category
const determineCategory = (description) => {
    const categories = {
        FOOD: ['RESTAURANT', 'FOOD', 'GRUBHUB', 'DOORDASH', 'UBER EATS', 'CAFE', 'DELI', 'CHIPOTLE'],
        TRANSPORTATION: ['UBER', 'LYFT', 'GAS', 'FUEL', 'PARKING', 'TRANSIT'],
        SHOPPING: ['AMAZON', 'WALMART', 'TARGET', 'COSTCO', 'WALGREENS', 'CVS'],
        UTILITIES: ['ELECTRIC', 'WATER', 'GAS', 'INTERNET', 'PHONE', 'CABLE', 'TMOBILE'],
        HOUSING: ['RENT', 'MORTGAGE', 'HOA', 'ALCOVE'],
        ENTERTAINMENT: ['NETFLIX', 'SPOTIFY', 'HULU', 'DISNEY', 'CINEMA', 'MOVIE', 'ELLATION'],
        HEALTHCARE: ['MEDICAL', 'PHARMACY', 'DOCTOR', 'HEALTH', 'FITNESS', 'TRUFIT', 'CRUNCH'],
        SUBSCRIPTIONS: ['SUBSCRIPTION', 'RECURRING', 'MONTHLY', 'ADOBE', 'MICROSOFT', 'APPLE', 'GOOGLE', 'NETFLIX', 'SPOTIFY'],
        TRANSFER: ['TRANSFER', 'ZELLE', 'VENMO', 'PAYPAL', 'CASH APP'],
        INCOME: ['DIRECT DEP', 'DEPOSIT', 'INTEREST', 'REFUND', 'TAX REF']
    };

    const desc = description.toUpperCase();

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => desc.includes(keyword))) {
            return category;
        }
    }

    return 'MISCELLANEOUS';
};