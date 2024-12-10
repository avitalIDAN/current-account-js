
// function sortExpenses(criteria) {
//     const sortedExpenses = expenses.slice().sort((a, b) => {
//         if (criteria === 'amount') {
//             return a.amount - b.amount;
//         } else if (criteria === 'date') {
//             // מיון תאריכים
//             console.log(a.fullDate.split(" / ")[0]);
//             //console.log(new Date(a.fullDate.split(" / ")[0]));
//             // return new Date(a.fullDate.split(" / ")[0]) - new Date(b.fullDate.split(" / ")[0]);

//             // המרת תאריך לפורמט ISO לפני מיון
//             const dateA = new Date(a.fullDate.split(" / ")[0].split('.').reverse().join('-'));
//             const dateB = new Date(b.fullDate.split(" / ")[0].split('.').reverse().join('-'));
//             console.log("" + dateA + dateB);
//             return dateA - dateB;
//         } else if (criteria === 'expense') {
//             // מיון תאריכים
//             return a["type"].localeCompare(b["type"]);
//         } else if (criteria === 'income') {
//             // מיון תאריכים
//             return -a["type"].localeCompare(b["type"]);
//         } else {
//             // מיון טקסטואלי (תיאור, צורת תשלום, סוג)
//             return a[criteria].localeCompare(b[criteria]);
//         }
//     });
//     renderTable(sortedExpenses);
// }
const sortState = {
    column: null, // שם העמודה שממיינים לפי
    order: null   // null (ללא מיון), "asc" (עולה), "desc" (יורד)
};



function sortExpenses(criteria) {
    // עדכון מצב המיון
    if (sortState.column === criteria) {
        sortState.order = sortState.order === "asc" ? "desc" : sortState.order === "desc" ? null : "asc";
    } else {
        sortState.column = criteria;
        sortState.order = "asc";
    }

    // בדיקה אם צריך לבטל את המיון
    if (!sortState.order) {        
        renderTable(expenses); // הצגת הסדר המקורי
        updateSortIcons(criteria);  // עדכון האייקונים
        return;
    }

    // מיון לפי המצב הנוכחי
    const sortedExpenses = expenses.slice().sort((a, b) => {
        let comparison = 0;
        if (criteria === 'amount') {
            comparison = a.amount - b.amount;
        } else if (criteria === 'date') {
            const dateA = new Date(a.fullDate.split(" / ")[0].split('.').reverse().join('-'));
            const dateB = new Date(b.fullDate.split(" / ")[0].split('.').reverse().join('-'));
            comparison = dateA - dateB;
        } else {
            comparison = a[criteria].localeCompare(b[criteria]);
        }

        return sortState.order === "asc" ? comparison : -comparison;
    });

    renderTable(sortedExpenses); // רענון הטבלה
    updateSortIcons(criteria);  // עדכון האייקונים
}


function updateSortIcons(criteria) {
    // הסרת כל האייקונים הקודמים
    const icons = document.querySelectorAll('.sort-icon');
    icons.forEach(icon => {
        icon.classList.remove('asc', 'desc');
    });

    // הוספת אייקון לעמודה הנוכחית
    if (sortState.order) {
        const currentIcon = document.querySelector(`th[onclick="sortExpenses('${criteria}')"] .sort-icon`);
        if (currentIcon) {
            currentIcon.classList.add(sortState.order);
        }
    }
}


function filterExpenses(type = null) {
    const filters = document.querySelectorAll('thead input');
    console.log("Filters:", filters); // בדיקה שהשדות נטענים נכון

    const filtered = expenses.filter(expense => {
        //console.log("Expense being checked:", expense); // בדיקה שהשדות קיימים בכל פריט

        const dateFilter = filters[0].value ? expense.fullDate && expense.fullDate.includes(filters[0].value) : true;
        const amountFilter = filters[1].value ? expense.amount && expense.amount === parseFloat(filters[1].value) : true;
        const descriptionFilter = filters[2].value ? expense.description && expense.description.includes(filters[2].value) : true;
        const paymentMethodFilter = filters[3].value ? expense.paymentMethod && expense.paymentMethod.includes(filters[3].value) : true;
        //const typeFilter = filters[4].value ? expense.type && expense.type.includes(filters[4].value) : true;
        // סינון לפי סוג
        const typeFilter = type ? expense.type === type : true;

        return dateFilter && amountFilter && descriptionFilter && paymentMethodFilter && typeFilter;
    });

    //console.log("Filtered results:", filtered); // בדיקה שהתוצאה סבירה

    renderTable(filtered);
    updateTotal(filtered); // חישוב סך הכל לפי המסונן
}


// function filterExpenses() {
//     console.log("נכנס");
//     const filters = document.querySelectorAll('thead input');
//     console.log(filters);
//     const filtered = expenses.filter(expense => {
//         const dateFilter = filters[0].value ? expense.fullDate.includes(filters[0].value) : true;
//         const amountFilter = filters[1].value ? expense.amount === parseFloat(filters[1].value) : true;
//         const descriptionFilter = filters[2].value ? expense.description.includes(filters[2].value) : true;
//         const paymentMethodFilter = filters[3].value ? expense.paymentMethod.includes(filters[3].value) : true;
//         //const typeFilter = filters[4].value ? expense.type.includes(filters[4].value) : true;

//         return dateFilter && amountFilter && descriptionFilter && paymentMethodFilter && typeFilter;
//     });
//     renderTable(filtered);
//     updateTotal(filtered); // חישוב סך הכל לפי המסונן
// }

function filterByDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const filtered = expenses.filter(expense => {
        const expenseDate = new Date(expense.fullDate.split(" / ")[0].split('.').reverse().join('-'));
        return (!startDate || expenseDate >= new Date(startDate)) &&
               (!endDate || expenseDate <= new Date(endDate));
    });
    renderTable(filtered);
    updateTotal(filtered); // חישוב סך הכל לפי טווח התאריכים
}



function renderTable(expensesArray) {
    const tableBody = document.getElementById('expenseTable').querySelector('tbody');
    tableBody.innerHTML = ''; // ניקוי הטבלה

    expensesArray.forEach(expense => addExpenseToTable(expense));
}


