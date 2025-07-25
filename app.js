document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const transactionForm = document.getElementById('transaction-form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const categorySelect = document.getElementById('category');
    const transactionList = document.getElementById('transaction-list');
    const balanceDisplay = document.getElementById('balance');
    const incomeDisplay = document.getElementById('income');
    const expenseDisplay = document.getElementById('expense');
    const incomeBtn = document.querySelector('.income-btn');
    const expenseBtn = document.querySelector('.expense-btn');
    
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let currentType = 'income';
    
    // Initialize Chart
    const ctx = document.getElementById('chart').getContext('2d');
    let chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Type Toggle
    incomeBtn.addEventListener('click', function() {
        currentType = 'income';
        incomeBtn.classList.add('active');
        expenseBtn.classList.remove('active');
        categorySelect.innerHTML = `
            <option value="salary">Salary</option>
            <option value="freelance">Freelance</option>
            <option value="investment">Investment</option>
            <option value="other">Other Income</option>
        `;
    });
    
    expenseBtn.addEventListener('click', function() {
        currentType = 'expense';
        expenseBtn.classList.add('active');
        incomeBtn.classList.remove('active');
        categorySelect.innerHTML = `
            <option value="food">Food & Dining</option>
            <option value="transport">Transport</option>
            <option value="shopping">Shopping</option>
            <option value="entertainment">Entertainment</option>
            <option value="bills">Bills & Utilities</option>
            <option value="other">Other</option>
        `;
    });
    
    // Add Transaction
    transactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = categorySelect.value;
        
        if (description === '' || isNaN(amount)) {
            alert('Please enter valid description and amount');
            return;
        }
        
        const transaction = {
            id: generateID(),
            description,
            amount: currentType === 'income' ? amount : -amount,
            category,
            type: currentType,
            date: new Date().toLocaleDateString('en-IN')
        };
        
        transactions.push(transaction);
        updateLocalStorage();
        updateUI();
        transactionForm.reset();
    });
    
    // Generate ID
    function generateID() {
        return Math.floor(Math.random() * 1000000000);
    }
    
    // Update UI
    function updateUI() {
        // Clear transaction list
        transactionList.innerHTML = '';
        
        // Calculate totals
        const amounts = transactions.map(t => t.amount);
        const total = amounts.reduce((acc, item) => acc + item, 0);
        const income = amounts
            .filter(item => item > 0)
            .reduce((acc, item) => acc + item, 0);
        const expense = amounts
            .filter(item => item < 0)
            .reduce((acc, item) => acc + item, 0);
        
        // Update displays
        balanceDisplay.textContent = formatCurrency(total);
        incomeDisplay.textContent = formatCurrency(income);
        expenseDisplay.textContent = formatCurrency(Math.abs(expense));
        
        // Render transactions (newest first)
        transactions.slice().reverse().forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.classList.add('transaction-item');
            
            transactionItem.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-category">
                        <i class="fas fa-${getCategoryIcon(transaction.category)}"></i>
                        ${formatCategory(transaction.category)}
                    </div>
                    <div class="transaction-date">${transaction.date}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(Math.abs(transaction.amount))}
                </div>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            
            transactionList.appendChild(transactionItem);
        });
        
        // Update Chart
        updateChart();
    }
    
    // Delete Transaction
    window.deleteTransaction = function(id) {
        transactions = transactions.filter(t => t.id !== id);
        updateLocalStorage();
        updateUI();
    };
    
    // Update Chart
    function updateChart() {
        // Filter expenses only
        const expenses = transactions.filter(t => t.type === 'expense');
        
        // Group by category
        const categories = {};
        expenses.forEach(expense => {
            if (!categories[expense.category]) {
                categories[expense.category] = 0;
            }
            categories[expense.category] += Math.abs(expense.amount);
        });
        
        // Update chart data
        chart.data.labels = Object.keys(categories).map(formatCategory);
        chart.data.datasets[0].data = Object.values(categories);
        chart.update();
    }
    
    // Helper Functions
    function formatCurrency(amount) {
        return '₹' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
    
    function formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
    }
    
    function getCategoryIcon(category) {
        const icons = {
            'food': 'utensils',
            'transport': 'bus',
            'shopping': 'shopping-bag',
            'entertainment': 'film',
            'bills': 'file-invoice-dollar',
            'salary': 'money-bill-wave',
            'freelance': 'laptop-code',
            'investment': 'chart-line',
            'other': 'ellipsis-h'
        };
        return icons[category] || 'tag';
    }
    
    // Update Local Storage
    function updateLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    // Initialize
    updateUI();
});