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
            if (currentSection !== 'other' && values.length === 4 && values[0].trim() !== 'Name' && values[0].trim() !== '') {
                const item = {
                    name: values[0].trim(),
                    amount: values[1].trim(),
                    date: values[2].trim(),
                    include: values[3].trim(),
                };
                result[currentSection].push(item);
            } else if (currentSection === 'other' && values[0].trim() !== 'Person' && values[0].trim() !== '') {
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

// Function to populate individual table with data
function populateTable(tableId, data) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');

    tbody.innerHTML = '';

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
                <td><input type="text" value="${item.person}" class="editable-cell"></td>
                <td><input type="text" value="${item.goal}" class="editable-cell"></td>
                <td><input type="text" value="${item.saved}" class="editable-cell"></td>
                <td>${percentage.toFixed(2)}%</td>
            `;
        } else {
            let date = new Date(item.date);

            if (date < today) {
                if (tableId === 'revenue' && item.name === 'Paycheck') {
                    if (date.getDate() == 2) {
                        date.setDate(17);
                    } else if (date.getDate() == 17) {
                        date.setMonth(date.getMonth() + 1);
                        date.setDate(2);
                    }
                } else if (tableId === 'recurring-payments' && item.name === 'Prime') {
                    date.setFullYear(date.getFullYear() + 1);
                } else {
                    date.setMonth(date.getMonth() + 1);
                }
            }

            rowHTML = `
                <td><input type="text" value="${item.name}" class="editable-cell"></td>
                <td><input type="text" value="${item.amount}" class="editable-cell"></td>
                <td><input type="text" value="${item.date === "" ? "" : defaultDateFormat(date)}" class="editable-cell"></td>
                <td><input type="checkbox" class="include-checkbox" ${item.include === 'Yes' ? 'checked' : ''}></td>
            `;

            rowHTML += `
                <td><button class="delete-btn">Delete</button></td>
            `;
        }
        row.innerHTML = rowHTML;
        tbody.appendChild(row);
    });

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
            const amountInput = row.querySelectorAll('.editable-cell')[1];
            const amount = parseFloat(amountInput.value.replace(/[^0-9.-]+/g, ""));
            if (!isNaN(amount)) {
                total += amount;
            }
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
    const tables = [
        { id: 'revenue', title: 'Revenue' },
        { id: 'recurring-payments', title: 'Recurring' },
        { id: 'manual-payments', title: 'Manual' },
        { id: 'other', title: 'Other' }
    ];
    let csvContent = '';

    tables.forEach(table => {
        const tableElement = document.getElementById(table.id);
        const rows = tableElement.querySelectorAll('tbody tr');

        // Add table header to CSV content
        csvContent += `${table.title},,,\n`;

        // Add table headers
        if (table.id === 'other') {
            csvContent += 'Person, Goal , Saved ,\n';
        } else {
            csvContent += 'Name, Amount ,Date,Include\n';
        }

        // Add table rows to CSV content
        rows.forEach(row => {
            if (!row.classList.contains('deleted')) {
                const cells = row.querySelectorAll('td');
                const rowData = Array.from(cells)
                    .filter(cell => !cell.querySelector('.delete-btn'))
                    .map((cell, index) => {
                        if (cell.querySelector('.include-checkbox')) {
                            return cell.querySelector('.include-checkbox').checked ? 'Yes' : 'No';
                        } else {
                            let cellContent = '';
                            const inputField = cell.querySelector('.editable-cell');
                            if (inputField) {
                                cellContent = inputField.value.trim();
                            } else {
                                cellContent = cell.textContent.trim();
                            }
                            return cellContent;
                        }
                    }).join(', ');
                csvContent += `${rowData}\n`;
            }
        });

        csvContent += ',,,\n';
    });

    return csvContent.trim();
}

// Function to create the payments distribution chart
function createPaymentsChart() {
    const paymentsTotals = {
        manual: 0,
        recurring: 0,
        revenue: 0
    };

    const tables = ['manual-payments', 'recurring-payments', 'revenue'];
    tables.forEach(tableId => {
        const table = document.getElementById(tableId);
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const includeCheckbox = row.querySelector('.include-checkbox');
            if (includeCheckbox && includeCheckbox.checked) {
                const amountInput = row.querySelectorAll('.editable-cell')[1];
                const amount = parseFloat(amountInput.value.replace(/[^0-9.-]+/g, ""));
                if (!isNaN(amount)) {
                    if (tableId === 'manual-payments') {
                        paymentsTotals.manual += amount;
                    } else if (tableId === 'recurring-payments') {
                        paymentsTotals.recurring += amount;
                    } else if (tableId === 'revenue') {
                        paymentsTotals.revenue += amount;
                    }
                }
            }
        });
    });

    const remaining = paymentsTotals.revenue - paymentsTotals.manual - paymentsTotals.recurring;
    console.log(remaining); console.log(paymentsTotals)
    const ctx = document.getElementById('payments-chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Manual', 'Recurring', 'Remaining'],
            datasets: [{
                data: [paymentsTotals.manual, paymentsTotals.recurring, remaining],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Payments Distribution'
            }
        }
    });
}

// Function to handle the click event of the "Update Totals" button
function handleUpdateTotalsClick() {
    try {
        updateTotal('recurring-payments');
        updateTotal('manual-payments');
        updateTotal('revenue');
        showNotification('Totals updated successfully!');
    } catch (error) {
        showNotification('Error updating totals: ' + error.message);
    }
}

// Function to handle the click event of the "Update Dates" button
function handleUpdateDatesClick() {
    try {
        populateTables();
        showNotification('Dates updated successfully!');
    } catch (error) {
        showNotification('Error updating dates: ' + error.message);
    }
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
                showNotification('CSV file updated successfully!');
            } else {
                showNotification('Failed to update CSV file.');
            }
        })
        .catch(error => {
            showNotification('Error updating CSV file: ' + error.message);
        });
}

// Add event listeners
document.addEventListener('input', function (event) {
    if (event.target.classList.contains('editable-cell')) {
        updateTotal(event.target.closest('table').id);
    }
});

document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', handlePageNavigation);
});

document.addEventListener('click', function (event) {
    if (event.target.classList.contains('delete-btn')) {
        const row = event.target.closest('tr');
        const tableId = row.closest('table').id;
        row.remove();
        updateTotal(tableId);
    }
});

// Attach event listeners
document.querySelector('.update-totals-btn').addEventListener('click', handleUpdateTotalsClick);
document.querySelector('.update-dates-btn').addEventListener('click', handleUpdateDatesClick);
document.querySelector('.update-csv-btn').addEventListener('click', handleUpdateCSVClick);

function defaultDateFormat(inputString) {
    const date = new Date(inputString);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const formattedString = `${month}-${day}-${year}`;

    return formattedString;
}

// Function to handle page navigation
function handlePageNavigation(event) {
    const pageNumber = event.target.getAttribute('data-page');
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        if (page.id === `page-${pageNumber}`) {
            page.style.display = 'block';
        } else {
            page.style.display = 'none';
        }
    });
}

// Function to show a notification
function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(message);
    } else {
        alert(message);
    }
}

// Call the function to populate the tables with data
populateTables();
createPaymentsChart();