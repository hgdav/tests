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
    const incomeCtx = document.getElementById('incomeChart').getContext('2d');
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');

    let isIncome = true;
    let editingTransactionIndex = -1;
    let incomeChart, expenseChart;
    let showingChart = false;

    function updateTransactionList() {
        transactionList.innerHTML = '';
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        let totalAmount = 0;
        const incomeTags = {};
        const expenseTags = {};
        const incomeByMonth = {};
        const expenseByMonth = {};

        transactions.forEach((transaction, index) => {
            const transactionElement = document.createElement('div');
            transactionElement.className = `transaction ${transaction.type}`;
            transactionElement.innerHTML = `
                <span class="transaction-name" data-index="${index}">${transaction.name}</span>
                <span class="transaction-amount" data-index="${index}">${transaction.amount.toFixed(2)}</span>
            `;

            const month = new Date(transaction.date).getMonth();
            if (transaction.type === 'income') {
                totalAmount += transaction.amount;
                if (!incomeTags[transaction.tag]) {
                    incomeTags[transaction.tag] = 0;
                }
                incomeTags[transaction.tag] += transaction.amount;
                if (!incomeByMonth[month]) {
                    incomeByMonth[month] = 0;
                }
                incomeByMonth[month] += transaction.amount;
            } else {
                totalAmount -= transaction.amount;
                if (!expenseTags[transaction.tag]) {
                    expenseTags[transaction.tag] = 0;
                }
                expenseTags[transaction.tag] += transaction.amount;
                if (!expenseByMonth[month]) {
                    expenseByMonth[month] = 0;
                }
                expenseByMonth[month] += transaction.amount;
            }

            transactionList.appendChild(transactionElement);
        });

        totalAmountDisplay.textContent = `S/${totalAmount.toFixed(2)}`;

        if (incomeChart) {
            incomeChart.destroy();
        }

        if (expenseChart) {
            expenseChart.destroy();
        }

        const incomeLabels = Object.keys(incomeTags);
        const incomeData = Object.values(incomeTags);
        const incomeColors = incomeLabels.map(() => '#ffffff');

        incomeChart = new Chart(incomeCtx, {
            type: 'bar',
            data: {
                labels: incomeLabels,
                datasets: [{
                    label: 'Ingresos',
                    data: incomeData,
                    backgroundColor: incomeColors
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

        const expenseLabels = Object.keys(expenseTags);
        const expenseData = Object.values(expenseTags);
        const expenseColors = expenseLabels.map(() => '#c4332e');

        expenseChart = new Chart(expenseCtx, {
            type: 'bar',
            data: {
                labels: expenseLabels,
                datasets: [{
                    label: 'Gastos',
                    data: expenseData,
                    backgroundColor: expenseColors
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

        document.querySelectorAll('.transaction-name').forEach(element => {
            element.addEventListener('click', () => editTransaction(element.dataset.index));
        });

        document.querySelectorAll('.transaction-amount').forEach(element => {
            element.addEventListener('click', () => deleteTransaction(element.dataset.index));
        });
    }

    function toggleView() {
        showingChart = !showingChart;
        if (showingChart) {
            transactionList.classList.add('hidden');
            document.getElementById('footer').classList.add('hidden');
            document.getElementById('incomeChart').classList.remove('hidden');
            document.getElementById('expenseChart').classList.remove('hidden');
        } else {
            transactionList.classList.remove('hidden');
            document.getElementById('footer').classList.remove('hidden');
            document.getElementById('incomeChart').classList.add('hidden');
            document.getElementById('expenseChart').classList.add('hidden');
        }
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

    window.addEventListener('click', event => {
        if (event.target === modal) {
            closeModalHandler();
        }
    });

    updateTransactionList();
});
