const expenses = [];

// פונקציה לעדכון הנתונים ב-localStorage
function saveExpensesToLocalStorage() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// פונקציה לטעינת הנתונים מ-localStorage
function loadExpensesFromLocalStorage() {
    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
        const parsedExpenses = JSON.parse(savedExpenses);
        parsedExpenses.forEach(expense => {
            expenses.push(expense);
            addExpenseToTable(expense);
        });
        updateTotal();
    }
}


function addExpenseToTable(expense) {
    // הוספת ההוצאה/ההכנסה לטבלה
    const tableBody = document.getElementById('expenseTable').querySelector('tbody');
    const row = tableBody.insertRow();
    row.insertCell(0).innerText = expense.fullDate;
    row.insertCell(1).innerText = expense.amount.toFixed(2);
    row.insertCell(2).innerText = expense.description;
    row.insertCell(3).innerText = expense.paymentMethod;
    row.insertCell(4).innerText = expense.type === 'income' ? '✔' : '';
    row.insertCell(5).innerText = expense.type === 'expense' ? '✔' : '';

    // הוספת כפתור עריכה
    const editCell = row.insertCell(6);
    const editButton = document.createElement("button");
    editButton.innerText = "ערוך";
    editButton.onclick = () => editExpense(expense, row);
    editCell.appendChild(editButton);
    // הוספת כפתור מחיקה
    const deleteCell = row.insertCell(7);
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "מחק";
    deleteButton.onclick = () => deleteExpense(expense, row);
    deleteCell.appendChild(deleteButton);

}

function addExpense() {
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    const paymentMethodInput = document.getElementById('paymentMethod');
    const typeInputs = document.getElementsByName('type');
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    const paymentMethod = paymentMethodInput.value;
    let type = null;

    // בדיקה שהכנסה או הוצאה נבחרה
    for (const input of typeInputs) {
        if (input.checked) {
            type = input.value;
            break;
        }
    }

    if (isNaN(amount) || description === "" || type === null) {
        alert("אנא הזן סכום תקין, תיאור וצורת תשלום, ובחר הכנסה או הוצאה.");
        return;
    }

    // תאריך לועזי
    const gregorianDate = new Date().toLocaleDateString("he-IL");
    // תאריך עברי
    const hebrewDate = getHebrewDate();
    // שילוב התאריכים
    const fullDate = `${gregorianDate} / ${hebrewDate}`;

    // הוספת ההוצאה/ההכנסה לרשימה הפנימית
    expenses.push({ fullDate, amount, description, paymentMethod, type });

    addExpenseToTable({fullDate, amount, description, paymentMethod, type});

    // איפוס שדות הקלט לאחר הוספה
    amountInput.value = '';
    descriptionInput.value = '';
    paymentMethodInput.value = 'מזומן';
    typeInputs.forEach(input => input.checked = false);

    updateTotal();
    saveExpensesToLocalStorage();
}

function updateTotal() {
    // חישוב סך ההכנסות וההוצאות
    const total = expenses.reduce((sum, expense) => {
        return sum + (expense.type === 'income' ? expense.amount : -expense.amount);
    }, 0);

    document.getElementById('total').innerText = `סך הכל: ${total.toFixed(2)}`;
}

// פונקציה למחיקת הוצאה
function deleteExpense(expense, row) {
    const index = expenses.indexOf(expense);
    if (index > -1) {
        expenses.splice(index, 1);
        row.remove(); // הסרה מהטבלה
        updateTotal();
        saveExpensesToLocalStorage(); // שמירת הנתונים המעודכנים
    }
}

// פונקציה לעריכת הוצאה
function editExpense(expense, row) {
    const newFullDate = prompt("עדכן תאריך:", expense.fullDate);
    const newAmount = parseFloat(prompt("עדכן סכום:", expense.amount));
    const newDescription = prompt("עדכן תיאור:", expense.description);
    const newPaymentMethod = prompt("עדכן צורת תשלום:", expense.paymentMethod);
    const newType = prompt("עדכן סוג (income או expense):", expense.type);

    if (!isNaN(newAmount) && newDescription && (newType === 'income' || newType === 'expense')) {
        // עדכון הערך במערך הגלובלי
        const expenseIndex = expenses.indexOf(expense); // מוצאים את המיקום של האובייקט במערך
        if (expenseIndex !== -1) {
            expenses[expenseIndex] = {
                fullDate: newFullDate,
                amount: newAmount,
                description: newDescription,
                paymentMethod: newPaymentMethod,
                type: newType
            };

            // עדכון השורה בטבלה
            row.cells[0].innerText = newFullDate;
            row.cells[1].innerText = newAmount.toFixed(2);
            row.cells[2].innerText = newDescription;
            row.cells[3].innerText = newPaymentMethod;
            row.cells[4].innerText = newType === 'income' ? '✔' : '';
            row.cells[5].innerText = newType === 'expense' ? '✔' : '';

            updateTotal();
            saveExpensesToLocalStorage(); // שמירת הנתונים המעודכנים
        } else {
            console.error("ההוצאה לא נמצאה במערך.");
        }
    } else {
        alert("נתונים לא תקינים, לא ניתן לעדכן.");
    }
}

        // expense.fullDate = newFullDate;
        // expense.amount = newAmount;
        // expense.description = newDescription;
        // expense.paymentMethod = newPaymentMethod;
        // expense.type = newType;

        // // עדכון השורה בטבלה
        // row.cells[0].innerText = newFullDate;
        // row.cells[1].innerText = newAmount.toFixed(2);
        // row.cells[2].innerText = newDescription;
        // row.cells[3].innerText = newPaymentMethod;
        // row.cells[4].innerText = newType === 'income' ? '✔' : '';
        // row.cells[5].innerText = newType === 'expense' ? '✔' : '';

        // updateTotal();
        // saveExpensesToLocalStorage(); // שמירת הנתונים המעודכנים



// קריאה לפונקציה לטעינת הנתונים בעת טעינת הדף

document.addEventListener("DOMContentLoaded", loadExpensesFromLocalStorage);