function editExpense(expense, row) {
// פונקציה לעריכת הוצאה
    openEditModal(expense, row);
}



// function editExpense(expense, row) {
//     console.log("בדיקה");// בדיקה
//     // const newFullDate = prompt("עדכן תאריך:", expense.fullDate);
//     // const newAmount = parseFloat(prompt("עדכן סכום:", expense.amount));
//     // const newDescription = prompt("עדכן תיאור:", expense.description);
//     // const newPaymentMethod = prompt("עדכן צורת תשלום:", expense.paymentMethod);
//     // const newType = prompt("עדכן סוג (income, expense, loan, repayment):", expense.type);

//     const newExpense = openEditModal(expense, row)
//     const newFullDate = newExpense.fullDate;
//     const newAmount = newExpense.amount;
//     const newDescription = newExpense.description;
//     const newPaymentMethod = newExpense.paymentMethod;
//     const newType = newExpense.type;

//     if (!isNaN(newAmount) && newDescription && (newType === 'income' || newType === 'expense'|| newType === 'loan' || newType === 'repayment')) {
//         // עדכון הערך במערך הגלובלי
//         const expenseIndex = expenses.findIndex(e => e.id === expense.id);//expenses.indexOf(expense); // מוצאים את המיקום של האובייקט במערך
//         console.log("ID לחיפוש:", expense.id);// בדיקה
//         console.log("תוצאה של findIndex:", expenseIndex);// בדיקה
//         if (expenseIndex !== -1) {
//             expenses[expenseIndex] = {
//                 id: expense.id, // שמירה על המזהה
//                 fullDate: newFullDate,
//                 amount: newAmount,
//                 description: newDescription,
//                 paymentMethod: newPaymentMethod,
//                 type: newType
//             };

//             // עדכון השורה בטבלה
//             row.cells[0].innerText = newFullDate;
//             row.cells[1].innerText = newAmount.toFixed(2);
//             row.cells[2].innerText = newDescription;
//             row.cells[3].innerText = newPaymentMethod;
//             row.cells[4].innerText = newType === 'income' || newType === 'repayment'? '✔' : '';
//             row.cells[5].innerText = newType === 'expense' || newType === 'loan' ? '✔' : '';

//             // עדכון הצבע לפי סוג
//             updateRowBackground(row, newType)
//             // switch (newType) {
//             //     case 'income':
//             //         row.style.backgroundColor = '#d4f8d4'; // ירוק - הכנסה
//             //         break;
//             //     case 'expense':
//             //         row.style.backgroundColor = '#f8d4d4'; // אדום - הוצאה
//             //         break;
//             //     case 'loan':
//             //         row.style.backgroundColor = '#fff4d4'; // כתום - הלוואה
//             //         break;
//             //     case 'repayment':
//             //         row.style.backgroundColor = '#d4e3f8'; // כחול - החזר
//             //         break;
//             //     default:
//             //         row.style.backgroundColor = ''; // ברירת מחדל
//             // }

//             updateTotal();
//             saveExpensesToLocalStorage(); // שמירת הנתונים המעודכנים
//         } else {
//             console.error("ההוצאה לא נמצאה במערך.");
//         }
//     } else {
//         alert("נתונים לא תקינים, לא ניתן לעדכן.");
//     }
// }

let currentRow = null; // שמירת השורה הנוכחית
let currentExpense = null; // שמירת ההוצאה הנוכחית

function openEditModal(expense, row) {
    currentRow = row;
    currentExpense = expense;

    // מילוי השדות בנתונים הקיימים
    document.getElementById('editDate').value = expense.fullDate.split(" / ")[0].split('.').reverse().join('-');
    document.getElementById('editAmount').value = expense.amount;
    document.getElementById('editDescription').value = expense.description;
    document.getElementById('editPaymentMethod').value = expense.paymentMethod;
    //document.getElementById('editType').value = expense.type;
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
    //const newType = document.getElementById('editType').value;
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
        const expenseIndex = expenses.findIndex(e => e.id === currentExpense.id);//expenses.indexOf(expense); // מוצאים את המיקום של האובייקט במערך
        console.log("ID לחיפוש:", currentExpense.id);// בדיקה
        console.log("תוצאה של findIndex:", expenseIndex);// בדיקה
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



            // expenses[expenseIndex] = {
            //     id: currentExpense.id, // שמירה על המזהה
            //     fullDate: newFullDate,
            //     amount: newAmount,
            //     description: newDescription,
            //     paymentMethod: newPaymentMethod,
            //     type: newType
            // };

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


