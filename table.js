
const sortState = {
    column: null, // שם העמודה שממיינים לפי
    order: null   // null (ללא מיון), "asc" (עולה), "desc" (יורד)
};



function sortExpenses(criteria) {
    // עדכון מצב המיון
    if (sortState.column === criteria) {
        sortState.order = sortState.order === "desc" ? "asc" : sortState.order === "asc" ? null : "desc";
    } else {
        sortState.column = criteria;
        sortState.order = "desc"; // ברירת מחדל: מיון הפוך
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
        }else if (criteria === 'expense'){ // || criteria === 'repayment') {
            const typeOrder = { income: 3, repayment: 4, expense: 1, loan: 2 };
            comparison = typeOrder[a.type] - typeOrder[b.type];  
             // מיון תאריכים
             //comparison =  a["type"].localeCompare(b["type"]);
        } else if (criteria === 'income'){ //  || criteria === 'loan') {
            const typeOrder = { income: 1, repayment: 2, expense: 3, loan: 4 };
            comparison = typeOrder[a.type] - typeOrder[b.type];  
             // מיון תאריכים
             //comparison = -a["type"].localeCompare(b["type"]);
        } else if (criteria === 'check') {
            comparison = (a.isChecked === b.isChecked) ? 0 : a.isChecked ? -1 : 1; // מיון של 'V' לפני 'ללא V'
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
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const filters = document.querySelectorAll('thead input');
    console.log("Filters:", filters); // בדיקה שהשדות נטענים נכון

    const filtered = expenses.filter(expense => {
        // סינון לפי טווח תאריכים
        const expenseDate = new Date(expense.fullDate.split(" / ")[0].split('.').reverse().join('-'));
        const ByDateRange = (!startDate || expenseDate >= new Date(startDate)) &&
                           (!endDate || expenseDate <= new Date(endDate));

        const dateFilter = filters[0].value ? expense.fullDate && expense.fullDate.includes(filters[0].value) : true;
        const amountFilter = filters[1].value ? expense.amount && expense.amount === parseFloat(filters[1].value) : true;
        const descriptionFilter = filters[2].value ? expense.description && expense.description.includes(filters[2].value) : true;
        const paymentMethodFilter = filters[3].value ? expense.paymentMethod && expense.paymentMethod.includes(filters[3].value) : true;

        // סינון לפי סוג
        const typeFilter = type
        ? type === "all"
            ? true // הצגת הכל
        : type === "loan_repayment"
            ? expense.type === "loan" || expense.type === "repayment"
            : expense.type === type
        : true;


        return dateFilter && amountFilter && descriptionFilter && paymentMethodFilter && typeFilter && ByDateRange;//filterByDateRange(expense);
    });

    renderTable(filtered);
    updateTotal(filtered); // חישוב סך הכל לפי המסונן
}

function renderTable(expensesArray) {
    const tableBody = document.getElementById('expenseTable').querySelector('tbody');
    tableBody.innerHTML = ''; // ניקוי הטבלה

    expensesArray.forEach(expense => addExpenseToTable(expense));
}


