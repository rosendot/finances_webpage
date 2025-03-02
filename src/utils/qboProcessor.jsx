// src/utils/qboProcessor.jsx

// Function to parse QBO file
export const processQBO = (qboData) => {
    try {
        // Extract transactions from QBO XML data
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(qboData, "text/xml");

        // Determine account type (checking or credit card)
        const isChecking = xmlDoc.querySelector('BANKACCTFROM') !== null;
        const isCreditCard = xmlDoc.querySelector('CCACCTFROM') !== null;

        // Get all transaction elements
        const transactions = Array.from(xmlDoc.querySelectorAll('STMTTRN'));

        const income = [];
        const expenses = [];
        const transfers = []; // Track internal transfers

        transactions.forEach(transactionElem => {
            // Extract transaction data
            const type = transactionElem.querySelector('TRNTYPE')?.textContent;
            const amount = parseFloat(transactionElem.querySelector('TRNAMT')?.textContent || '0');
            const memo = transactionElem.querySelector('MEMO')?.textContent || '';
            const name = transactionElem.querySelector('NAME')?.textContent || memo;
            const datePosted = transactionElem.querySelector('DTPOSTED')?.textContent || '';

            // Convert date format (20250301000000.000[-5:EST]) to YYYY-MM-DD
            const parsedDate = parseQBODate(datePosted);

            // Skip internal transfers (credit card payments)
            const isInternalTransfer = isPaymentTransaction(name, memo);

            if (isInternalTransfer) {
                transfers.push({
                    name: truncateString(name || memo),
                    amount: Math.abs(amount),
                    date: parsedDate,
                    isInternal: true
                });
                return; // Skip this transaction
            }

            // Determine if this is a recurring transaction based on description patterns
            const isRecurring = isRecurringTransaction(name, memo);

            // Create transaction object
            const transactionData = {
                name: truncateString(name || memo),
                originalMemo: memo,
                amount: Math.abs(amount),
                date: parsedDate,
                isRecurring: isRecurring,
                category: determineCategory(name, memo)
            };

            // For checking accounts: CREDIT = income, DEBIT = expense
            // For credit cards: CREDIT = payment/refund (ignore already), DEBIT = expense
            if (isChecking && (type === 'CREDIT' || amount > 0) && !isInternalTransfer) {
                income.push(transactionData);
            } else if ((isChecking && (type === 'DEBIT' || amount < 0)) ||
                (isCreditCard && (type === 'DEBIT' || amount < 0))) {
                expenses.push(transactionData);
            }
        });

        return {
            income,
            expenses,
            transfers, // Include transfers for reference
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

// Helper function to truncate long strings
const truncateString = (str, maxLength = 95) => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
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

// Helper function to identify credit card payment transactions
const isPaymentTransaction = (name, memo) => {
    const paymentKeywords = [
        'CAPITAL ONE MOBILE PYMT',
        'CAPITAL ONE ONLINE PYMT',
        'CREDIT CARD PAYMENT',
        'PAYMENT THANK YOU',
        'MOBILE PAYMENT'
    ];

    return paymentKeywords.some(keyword =>
    (name?.toUpperCase().includes(keyword.toUpperCase()) ||
        memo?.toUpperCase().includes(keyword.toUpperCase()))
    );
};

// Helper function to determine if transaction is recurring
const isRecurringTransaction = (name, memo) => {
    const recurringKeywords = [
        'SUBSCRIPTION', 'MONTHLY', 'NETFLIX', 'SPOTIFY', 'APPLE', 'GOOGLE',
        'MICROSOFT', 'ADOBE', 'RECURRING', 'AUTO PAY', 'DIRECT DEP'
    ];

    return recurringKeywords.some(keyword =>
    (name?.toUpperCase().includes(keyword.toUpperCase()) ||
        memo?.toUpperCase().includes(keyword.toUpperCase()))
    );
};

// Helper function to determine transaction category
const determineCategory = (name, memo) => {
    const description = `${name} ${memo}`.toUpperCase();

    const categories = {
        FOOD: ['RESTAURANT', 'FOOD', 'GRUBHUB', 'DOORDASH', 'UBER EATS', 'CAFE', 'DELI', 'CHIPOTLE',
            'CHILIS', 'MCDONALD', 'TACO', 'WENDY', 'COOK OUT', 'BURGER', 'PIZZA', 'POPEYES'],
        TRANSPORTATION: ['UBER', 'LYFT', 'GAS', 'FUEL', 'PARKING', 'TRANSIT', 'EXXON', 'SHELL', 'VALERO',
            'ENTERPRISE RENT', 'DELTA', 'AMERICAN', 'FLIGHT', 'AIRFARE', 'FRONTIER', 'AIRPORT'],
        SHOPPING: ['AMAZON', 'WALMART', 'TARGET', 'COSTCO', 'WALGREENS', 'CVS', 'BURLINGTON',
            'NIKE', 'BEST BUY', 'FIVE BELOW', 'ADIDAS'],
        UTILITIES: ['ELECTRIC', 'WATER', 'GAS', 'INTERNET', 'PHONE', 'CABLE', 'TMOBILE', 'AT&T', 'VERIZON'],
        HOUSING: ['RENT', 'MORTGAGE', 'HOA', 'ALCOVE', 'MOTEL', 'HOTEL', 'AIRBNB'],
        ENTERTAINMENT: ['NETFLIX', 'SPOTIFY', 'HULU', 'DISNEY', 'CINEMA', 'MOVIE', 'ELLATION', 'STEAM',
            'GAME', 'BAR', 'CLUB', 'CIGAR', 'TOTAL WINE'],
        HEALTHCARE: ['MEDICAL', 'PHARMACY', 'DOCTOR', 'HEALTH', 'FITNESS', 'TRUFIT', 'CRUNCH'],
        SUBSCRIPTIONS: ['SUBSCRIPTION', 'RECURRING', 'MONTHLY', 'ADOBE', 'MICROSOFT', 'APPLE', 'GOOGLE',
            'NETFLIX', 'SPOTIFY', 'EXPRESS VPN'],
        INSURANCE: ['INSURANCE', 'LIBERTY MUTUAL'],
        TRANSFER: ['TRANSFER', 'ZELLE', 'VENMO', 'PAYPAL', 'CASH APP'],
        INCOME: ['DIRECT DEP', 'DEPOSIT', 'INTEREST', 'REFUND', 'TAX REF']
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => description.includes(keyword))) {
            return category;
        }
    }

    return 'MISCELLANEOUS';
};