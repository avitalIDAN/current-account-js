function editExpense(expense, row) {
    // פונקציה לעריכת הוצאה
    openEditModal(expense, row);
}

let currentRow = null; // שמירת השורה הנוכחית
let currentExpense = null; // שמירת ההוצאה הנוכחית

function openEditModal(expense, row) {
    currentRow = row;
    currentExpense = expense;

    // מילוי השדות בנתונים הקיימים
    document.getElementById('editDate').value = new Date(expense.fullDate.split(" / ")[0].split('.').reverse().join('-')).toISOString().slice(0, 10);
    document.getElementById('editAmount').value = expense.amount;
    document.getElementById('editDescription').value = expense.description;
    document.getElementById('editPaymentMethod').value = expense.paymentMethod;

    // סוג - נבחר את סוג ההוצאה (income, expense, loan, repayment)
    const typeRadios = document.getElementsByName('editType');
    typeRadios.forEach(radio => {
        if (radio.value === expense.type) {
            radio.checked = true;
        }
    });

    // הצגת ה-modal
    document.getElementById('editModal').style.display = "block";
}


function saveEdit() {
    if (!currentRow || !currentExpense) {
        console.error("אין מידע על השורה או ההוצאה הנוכחית.");
        return;
    }

    // קבלת הערכים החדשים מהטופס
    const newDate = new Date(document.getElementById('editDate').value);
    const newFullDate = viewDate(newDate);
    const newAmount = parseFloat(document.getElementById('editAmount').value);
    const newDescription = document.getElementById('editDescription').value;
    const newPaymentMethod = document.getElementById('editPaymentMethod').value;

    const typeRadios = document.getElementsByName('editType');
    let newType = null;
    for (const radio of typeRadios) {
        if (radio.checked) {
            newType = radio.value; // הערך של הרדיו המסומן
            break;
        }
    }

    if (!isNaN(newAmount) && newDescription && (newType === 'income' || newType === 'expense'|| newType === 'loan' || newType === 'repayment')) {
        // עדכון הערך במערך הגלובלי
        const expenseIndex = expenses.findIndex(e => e.id === currentExpense.id); // מוצאים את המיקום של האובייקט במערך
        console.log("ID לחיפוש:", currentExpense.id);// בדיקה
        console.log("תוצאה של findIndex:", expenseIndex);// בדיקה

        // עדכון בתקציב
        if(expenses[expenseIndex].type === 'expense'){
            const oldAmount = expenses[expenseIndex].amount;
            const oldDate = new Date(expenses[expenseIndex].fullDate.split(" / ")[0].split('.').reverse().join('-'));
            deleteExpenseFromBudget(oldAmount, oldDate) 
        }
        if(newType === 'expense'){
            addExpenseToBudget(newAmount, newDate) 
        }

        if (expenseIndex !== -1) {
            // עדכון האובייקט
            Object.assign(expenses[expenseIndex], {
                ...expenses[expenseIndex],
                fullDate: newFullDate,
                amount: newAmount,
                description: newDescription,
                paymentMethod: newPaymentMethod,
                type: newType
            });

            // עדכון השורה בטבלה
            currentRow.cells[0].innerText = newFullDate;
            currentRow.cells[1].innerText = newAmount.toFixed(2);
            currentRow.cells[2].innerText = newDescription;
            currentRow.cells[3].innerText = newPaymentMethod;
            currentRow.cells[4].innerText = newType === 'income' || newType === 'repayment'? '✔' : '';
            currentRow.cells[5].innerText = newType === 'expense' || newType === 'loan' ? '✔' : '';

            // עדכון הצבע לפי סוג
            updateRowBackground(currentRow, newType)

            updateTotal();
            saveExpensesToLocalStorage(); // שמירת הנתונים המעודכנים
        } else {
            console.error("ההוצאה לא נמצאה במערך.");
        }
    } else {
        alert("נתונים לא תקינים, לא ניתן לעדכן.");
    }

    // סגירת ה-modal
    closeEditModal();
}

function closeEditModal() {
    document.getElementById('editModal').style.display = "none";
}


