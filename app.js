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
            console.log(expense.id);//בדיקה
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


    // עמודת עריכה
    const editCell = row.insertCell(6);
    const editButton = document.createElement('button');
    editButton.innerHTML = '<i class="fas fa-edit"></i>'; // אייקון עט
    editButton.className = 'edit-btn';
    editButton.addEventListener('click', () => editExpense(expense, row));
    editCell.appendChild(editButton);

    // עמודת מחיקה
    const deleteCell = row.insertCell(7);
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>'; // אייקון פח
    deleteButton.className = 'delete-btn';
    deleteButton.addEventListener('click', () => deleteExpense(expense, row));
    deleteCell.appendChild(deleteButton);

}

function addExpense() {
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    const paymentMethodInput = document.getElementById('paymentMethod');
    const typeInputs = document.getElementsByName('type');
    const dateInput = document.getElementById('expenseDate'); // שדה התאריך החדש
    
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

    // בדיקת שדה התאריך
    const selectedDate = dateInput.value ? new Date(dateInput.value) : new Date();
    const gregorianDate = selectedDate.toLocaleDateString("he-IL"); // תאריך לועזי
    const hebrewDate = getHebrewDate(selectedDate); // שימוש בפונקציה קיימת לתאריך עברי
    const fullDate = `${gregorianDate} / ${hebrewDate}`; // שילוב התאריכים

    if (isNaN(amount) || description === "" || type === null) {
        alert("אנא הזן סכום תקין, תיאור וצורת תשלום, ובחר הכנסה או הוצאה.");
        return;
    }

    // // תאריך לועזי
    // const gregorianDate = new Date().toLocaleDateString("he-IL");
    // // תאריך עברי
    // const hebrewDate = getHebrewDate();
    // // שילוב התאריכים
    // const fullDate = `${gregorianDate} / ${hebrewDate}`;

    // הוספת ההוצאה/ההכנסה לרשימה הפנימית
    const expense = { id: Date.now(), fullDate, amount, description, paymentMethod, type }; // מזהה ייחודי מבוסס תאריך
    expenses.push(expense);
    //Date.now(), // מזהה ייחודי מבוסס תאריך
    console.log(expenses);

    addExpenseToTable(expense);

    // איפוס שדות הקלט לאחר הוספה
    amountInput.value = '';
    descriptionInput.value = '';
    paymentMethodInput.value = 'מזומן';
    dateInput.value = ''; // איפוס שדה התאריך
    typeInputs.forEach(input => input.checked = false);

    updateTotal();
    saveExpensesToLocalStorage();
}

// function updateTotal() {
//     // חישוב סך ההכנסות וההוצאות
//     const total = expenses.reduce((sum, expense) => {
//         return sum + (expense.type === 'income' ? expense.amount : -expense.amount);
//     }, 0);

//     document.getElementById('total').innerText = `סך הכל: ${total.toFixed(2)}`;
// }

function updateTotal(filteredExpenses = null) {
    if(!filteredExpenses){
        filteredExpenses = expenses;
    }
    else if (filteredExpenses.length === 0) {
        console.log("No expenses to calculate");
        document.getElementById('total').innerText = "סך הכל: 0";
        document.getElementById('totalIncome').innerText = "סך הכנסות: 0";
        document.getElementById('totalExpense').innerText = "סך הוצאות: 0";
        return;
    }
    // חישוב סך ההכנסות
    const totalIncome = filteredExpenses //expenses
        .filter(expense => expense.type === 'income')
        .reduce((sum, expense) => sum + expense.amount, 0);

    // חישוב סך ההוצאות
    const totalExpense = filteredExpenses //expenses
        .filter(expense => expense.type === 'expense')
        .reduce((sum, expense) => sum + expense.amount, 0);

    // חישוב סך הכל (הכנסות פחות הוצאות)
    const total = totalIncome - totalExpense;

    // עדכון התצוגה
    document.getElementById('total').innerText = `סך הכל: ${total.toFixed(2)}`;
    document.getElementById('totalIncome').innerText = `סך הכנסות: ${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpense').innerText = `סך הוצאות: ${totalExpense.toFixed(2)}`;
}


// פונקציה למחיקת הוצאה
function deleteExpense(expense, row) {
    // חיפוש האובייקט במערך על בסיס המזהה הייחודי (id)
    const expenseIndex = expenses.findIndex(e => e.id === expense.id);

    if (expenseIndex !== -1) {
        // הסרת האובייקט מהמערך
        expenses.splice(expenseIndex, 1);

        // הסרת השורה מהטבלה
        row.remove();

        // עדכון ה-localStorage
        saveExpensesToLocalStorage();

        // עדכון הסך הכל
        updateTotal();
    } else {
        console.error("ההוצאה לא נמצאה במערך ולא ניתן למחוק אותה.");
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
        const expenseIndex = expenses.findIndex(e => e.id === expense.id);//expenses.indexOf(expense); // מוצאים את המיקום של האובייקט במערך
        console.log("ID לחיפוש:", expense.id);// בדיקה
        console.log("תוצאה של findIndex:", expenseIndex);// בדיקה
        if (expenseIndex !== -1) {
            expenses[expenseIndex] = {
                id: expense.id, // שמירה על המזהה
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

document.addEventListener("DOMContentLoaded", loadExpensesFromLocalStorage);