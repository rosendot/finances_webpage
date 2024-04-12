// Attach event listeners
document.querySelector('.update-totals-btn').addEventListener('click', handleUpdateTotalsClick);
document.querySelector('.update-dates-btn').addEventListener('click', handleUpdateDatesClick);
document.querySelector('.update-csv-btn').addEventListener('click', handleUpdateCSVClick);

// Function to populate tables with data
function populateTables() {
    fetch('finances.csv')
        .then(response => response.text())
        .then(data => {
            const parsedData = parseCSV(data);
            populateTable('recurring-payments', parsedData.recurring);
            populateTable('manual-payments', parsedData.manual);
            populateTable('revenue', parsedData.revenue);
            populateTable('other', parsedData.other);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function defaultDateFormat(inputString) {
    const date = new Date(inputString);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const formattedString = `${month}-${day}-${year}`;

    return formattedString;
}

// Function to populate individual table with data
function populateTable(tableId, data) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');

    // Clear existing table rows
    tbody.innerHTML = '';

    // Sort data by date in ascending order
    if (tableId === 'recurring-payments') {
        data.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });
    }

    const today = new Date();

    data.forEach(item => {
        const row = document.createElement('tr');
        let rowHTML = '';

        if (tableId === 'other') {
            const goal = parseFloat(item.goal.replace(/[^0-9.-]+/g, ""));
            const saved = parseFloat(item.saved.replace(/[^0-9.-]+/g, ""));
            const percentage = goal !== 0 ? (saved / goal) * 100 : 0;

            rowHTML = `
                <td>${item.person}</td>
                <td>$${item.goal}</td>
                <td>$${item.saved}</td>
                <td>${percentage.toFixed(2)}%</td>
            `;
        } else {
            let date = new Date(item.date);

            // Update the date based on the current date
            if (date < today) {
                if (tableId === 'revenue' && item.name === 'Paycheck') {
                    // Handle specific case for "Bank Account" in revenue table
                    if (date.getDate() == 2) {
                        date.setDate(17);
                    } else if (date.getDate() == 17) {
                        date.setMonth(date.getMonth() + 1);
                        date.setDate(2);
                    }
                } else if (tableId === 'recurring-payments' && item.name === 'Prime') {
                    // Handle specific case for "Prime" in recurring table
                    date.setFullYear(date.getFullYear() + 1);
                } else {
                    // Update to the next month for other cases
                    date.setMonth(date.getMonth() + 1);
                }
            }

            rowHTML = `
                <td>${item.name}</td>
                <td>$${item.amount}</td>
                <td>${item.date === "" ? "" : defaultDateFormat(date)}</td>
                <td><input type="checkbox" class="include-checkbox" ${item.include === 'Yes' ? 'checked' : ''}></td>
            `;
        }
        row.innerHTML = rowHTML;
        tbody.appendChild(row);
    });

    // Update the total
    updateTotal(tableId);
}

// Function to update the total of a table
function updateTotal(tableId) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tbody tr');
    let total = 0;

    rows.forEach(row => {
        const includeCheckbox = row.querySelector('.include-checkbox');
        if (includeCheckbox && includeCheckbox.checked) {
            const amount = parseFloat(row.cells[1].textContent.replace(/[^0-9.-]+/g, ""));
            total += amount;
        }
    });

    // Remove existing total row
    const existingTotalRow = table.querySelector('tfoot tr');
    if (existingTotalRow) {
        existingTotalRow.remove();
    }

    // Add updated total row
    if (tableId !== 'other') {
        const tfoot = table.querySelector('tfoot') || table.createTFoot();
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td>Total</td>
            <td>$${total.toFixed(2)}</td>
        `;
        tfoot.appendChild(totalRow);
    }
}

// Function to collect data from tables and generate CSV content
function generateCSVContent() {
    const tables = ['revenue', 'recurring-payments', 'manual-payments', 'other'];
    let csvContent = '';

    tables.forEach(tableId => {
        const table = document.getElementById(tableId);
        const rows = table.querySelectorAll('tbody tr');

        // Add table header to CSV content
        csvContent += `${tableId.charAt(0).toUpperCase() + tableId.slice(1)},,,\n`;

        // Add table headers
        if (tableId === 'other') {
            csvContent += 'Person,Goal,Saved,\n';
        } else {
            csvContent += 'Name,Amount,Date,Include\n';
        }

        // Add table rows to CSV content
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = Array.from(cells).map((cell, index) => {
                if (cell.querySelector('.include-checkbox')) {
                    return cell.querySelector('.include-checkbox').checked ? 'Yes' : 'No';
                } else {
                    let cellContent = cell.textContent.trim();
                    if (index === 1 && tableId !== 'other') {
                        // Remove "$" symbol from amounts
                        cellContent = cellContent.replace('$', '');
                    } else if ((index === 1 || index === 2) && tableId === 'other') {
                        // Remove "$" symbol from "Goal" and "Saved" columns in "Other" table
                        cellContent = cellContent.replace('$', '');
                    } else if (index === 3 && tableId === 'other') {
                        // Remove "%" symbol from percentages
                        cellContent = cellContent.replace('%', '');
                    }
                    return cellContent;
                }
            }).join(',');
            csvContent += `${rowData}\n`;
        });

        csvContent += ',,,\n';
    });

    return csvContent.trim();
}

// Function to handle the click event of the "Update Totals" button
function handleUpdateTotalsClick() {
    updateTotal('recurring-payments');
    updateTotal('manual-payments');
    updateTotal('revenue');
}

// Function to handle the click event of the "Update Dates" button
function handleUpdateDatesClick() {
    populateTables();
}

// Function to handle the click event of the "Update CSV" button
function handleUpdateCSVClick() {
    const csvContent = generateCSVContent();

    fetch('/update-csv', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csvContent })
    })
        .then(response => {
            if (response.ok) {
                console.log('CSV file updated successfully.');
            } else {
                console.error('Failed to update CSV file.');
            }
        })
        .catch(error => {
            console.error('Error updating CSV file:', error);
        });
}

// Function to parse CSV data
function parseCSV(csvData) {
    const lines = csvData.split('\n');
    const result = {
        revenue: [],
        recurring: [],
        manual: [],
        other: [],
    };
    let currentSection = null;

    lines.forEach(line => {
        if (line.trim() === '') {
            currentSection = null;
        } else if (line.startsWith('Revenue,,,')) {
            currentSection = 'revenue';
        } else if (line.startsWith('Recurring,,,')) {
            currentSection = 'recurring';
        } else if (line.startsWith('Manual,,,')) {
            currentSection = 'manual';
        } else if (line.startsWith('Other,,,')) {
            currentSection = 'other';
        } else if (currentSection) {
            const values = line.split(',');
            if (values.length === 4 && values[0].trim() !== 'Name' && values[0].trim() !== 'Person' && values[0].trim() !== '') {
                const item = {
                    name: values[0].trim(),
                    amount: values[1].trim(),
                    date: values[2].trim(),
                    include: values[3].trim(),
                };
                result[currentSection].push(item);
            } else if (currentSection === 'other' && values.length === 3 && values[0].trim() !== 'Person' && values[0].trim() !== '') {
                const item = {
                    person: values[0].trim(),
                    goal: values[1].trim(),
                    saved: values[2].trim(),
                };
                result[currentSection].push(item);
            }
        }
    });

    return result;
}
// Call the function to populate the tables with data
populateTables();