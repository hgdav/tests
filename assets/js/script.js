document.addEventListener('DOMContentLoaded', () => {
    const addIncomeBtn = document.getElementById('add-income-btn');
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const transactionName = document.getElementById('transaction-name');
    const transactionAmount = document.getElementById('transaction-amount');
    const transactionTag = document.getElementById('transaction-tag');
    const saveTransactionBtn = document.getElementById('save-transaction');
    const transactionList = document.getElementById('transaction-list');
    const totalAmountDisplay = document.getElementById('total-amount');
    const combinedCtx = document.getElementById('combinedChart').getContext('2d');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const currentMonthDisplay = document.getElementById('current-month');

    let isIncome = true;
    let editingTransactionIndex = -1;
    let combinedChart;
    let showingChart = false;
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    function formatMonthYear(month, year) {
        const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        return `${months[month]} ${year}`;
    }

    function updateTransactionList() {
        transactionList.innerHTML = '';
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        let totalAmount = 0;

        transactions.forEach((transaction, index) => {
            const transactionElement = document.createElement('div');
            transactionElement.className = `transaction ${transaction.type}`;
            transactionElement.innerHTML = `
                <span class="transaction-name" data-index="${index}">${transaction.name}</span>
                <span class="transaction-amount" data-index="${index}">${transaction.amount.toFixed(2)}</span>
            `;

            if (transaction.type === 'income') {
                totalAmount += transaction.amount;
            } else {
                totalAmount -= transaction.amount;
            }

            transactionList.appendChild(transactionElement);
        });

        totalAmountDisplay.textContent = `S/${totalAmount.toFixed(2)}`;

        document.querySelectorAll('.transaction-name').forEach(element => {
            element.addEventListener('click', () => editTransaction(element.dataset.index));
        });

        document.querySelectorAll('.transaction-amount').forEach(element => {
            element.addEventListener('click', () => deleteTransaction(element.dataset.index));
        });

        if (showingChart) {
            updateChart();
        }
    }

    function updateChart() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const incomeByMonth = {};
        const expenseByMonth = {};

        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const month = date.getMonth();
            const year = date.getFullYear();

            if (month === currentMonth && year === currentYear) {
                if (transaction.type === 'income') {
                    if (!incomeByMonth[month]) {
                        incomeByMonth[month] = 0;
                    }
                    incomeByMonth[month] += transaction.amount;
                } else {
                    if (!expenseByMonth[month]) {
                        expenseByMonth[month] = 0;
                    }
                    expenseByMonth[month] += transaction.amount;
                }
            }
        });

        const income = incomeByMonth[currentMonth] || 0;
        const expense = expenseByMonth[currentMonth] || 0;

        if (combinedChart) {
            combinedChart.destroy();
        }

        combinedChart = new Chart(combinedCtx, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Gastos'],
                datasets: [{
                    label: 'Transacciones',
                    data: [income, expense],
                    backgroundColor: ['#ffffff', '#c4332e']
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        currentMonthDisplay.textContent = formatMonthYear(currentMonth, currentYear);
    }

    function toggleView() {
        showingChart = !showingChart;
        if (showingChart) {
            transactionList.classList.add('hidden');
            document.getElementById('footer').classList.add('hidden');
            document.getElementById('chart-container').classList.remove('hidden');
            updateChart();
        } else {
            transactionList.classList.remove('hidden');
            document.getElementById('footer').classList.remove('hidden');
            document.getElementById('chart-container').classList.add('hidden');
        }
    }

    function changeMonth(increment) {
        currentMonth += increment;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear -= 1;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear += 1;
        }
        updateChart();
    }

    function openModal(income) {
        isIncome = income;
        modalTitle.textContent = isIncome ? 'Agregar Ingreso' : 'Agregar Egreso';
        transactionName.value = '';
        transactionAmount.value = '';
        transactionTag.value = 'Otros';
        editingTransactionIndex = -1;
        modal.style.display = 'block';
    }

    function closeModalHandler() {
        modal.style.display = 'none';
    }

    function saveTransaction() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const newTransaction = {
            name: transactionName.value,
            amount: parseFloat(transactionAmount.value),
            tag: transactionTag.value,
            type: isIncome ? 'income' : 'expense',
            date: new Date().toISOString()
        };

        if (editingTransactionIndex > -1) {
            transactions[editingTransactionIndex] = newTransaction;
        } else {
            transactions.push(newTransaction);
        }

        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateTransactionList();
        closeModalHandler();
    }

    function editTransaction(index) {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const transaction = transactions[index];
        transactionName.value = transaction.name;
        transactionAmount.value = transaction.amount;
        transactionTag.value = transaction.tag;
        isIncome = transaction.type === 'income';
        modalTitle.textContent = isIncome ? 'Editar Ingreso' : 'Editar Egreso';
        editingTransactionIndex = index;
        modal.style.display = 'block';
    }

    function deleteTransaction(index) {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        transactions.splice(index, 1);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateTransactionList();
    }

    addIncomeBtn.addEventListener('click', () => openModal(true));
    addExpenseBtn.addEventListener('click', () => openModal(false));
    closeModal.addEventListener('click', closeModalHandler);
    saveTransactionBtn.addEventListener('click', saveTransaction);
    totalAmountDisplay.addEventListener('click', toggleView);
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));

    window.addEventListener('click', event => {
        if (event.target === modal) {
            closeModalHandler();
        }
    });

    updateTransactionList();
});