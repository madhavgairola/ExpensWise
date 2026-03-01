const convertToCSV = (expenses) => {
    if (!expenses || expenses.length === 0) {
        return 'id,amount,description,categoryType,subcategory,transactionDate,source,createdAt\n';
    }

    // Get headers from first object
    const headers = Object.keys(expenses[0]);

    // Create CSV string
    const csvRows = [
        headers.join(','), // Header row
        ...expenses.map(expense => {
            return headers.map(header => {
                let value = expense[header];

                // Handle dates
                if (value instanceof Date) {
                    value = value.toISOString();
                }

                // Escape quotes and wrap in quotes if contains comma
                if (typeof value === 'string') {
                    value = value.replace(/"/g, '""');
                    if (value.includes(',')) {
                        value = `"${value}"`;
                    }
                }

                return value;
            }).join(',');
        })
    ].join('\n');

    return csvRows;
};

module.exports = {
    convertToCSV
};
