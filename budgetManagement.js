const budget = {
    totalBudget: 0, // סכום התקציב
    startEndDay: null, // יום התחלה וסיום בחודש
    usedBudget: 0, // סכום שנוצל (מתעדכן אוטומטית)
    months: []       // אובייקטים עבור כל חודש (כולל הוצאות, תאריכים וכו')
};

document.addEventListener("DOMContentLoaded", () => {
    loadBudgetFromStorage(); // טעינת התקציב מה-LocalStorage
    updateBudgetDisplay();   // עדכון התצוגה
});

function loadBudgetFromStorage() {
    const savedBudget = localStorage.getItem("budget");

    if (savedBudget) {
        const parsedBudget = JSON.parse(savedBudget);

        // עדכון אובייקט התקציב עם הערכים השמורים
        budget.totalBudget = parsedBudget.totalBudget || 0;
        budget.startEndDay = parsedBudget.startEndDay || null;
        budget.usedBudget = parsedBudget.usedBudget || 0;
        
        // שחזור החודשים כמופעים של MonthlyBudget
        budget.months = parsedBudget.months || [];
        budget.months = parsedBudget.months.map(month => {
            const newMonth = new MonthlyBudget(
                month.year,
                month.month+1,
                budget.startEndDay
            );
        
            // העתקת ההוצאות והמידע הנוסף
            newMonth.expenses = month.expenses || 0;
        
            return newMonth;
        });

        //??? expenses empty..
        // budget.months= []; // איפוס רשימת החודשים                    
        // budget.usedBudget = 0;// איפוס ניצול התקציב
        // UpdateListDates();
        // updateBudgetDisplay();
    }
    console.log(budget.months);

//     // טיפול בעריכה מחיקה הוספה
//     const addButton = document.getElementById("addButton");

//     // הוסף אירוע לחיצה
//     addButton.addEventListener("click", function() {
//         //alert("הכפתור נלחץ!");??
// });

// document.addEventListener("expenseAdded", (e) => {
//     updateMonthData(e.detail.expense, "add");
// });

// document.addEventListener("expenseEdited", (e) => {
//     updateMonthData(e.detail.oldExpense, "delete");
//     updateMonthData(e.detail.newExpense, "add");
// });

// document.addEventListener("expenseDeleted", (e) => {
//     updateMonthData(e.detail.expense, "delete");
// });
}

function openBudgetModal() {
    // מציאת האלמנטים של שדות הקלט
    const budgetAmountInput = document.getElementById("budgetAmount");
    const budgetStartEndDayInput = document.getElementById("budgetStartEndDay");

    // עדכון הערכים הקיימים
    if (budgetAmountInput && budgetStartEndDayInput) {
        budgetAmountInput.value = budget.totalBudget.toFixed(2); // הצבת התקציב הנוכחי
        budgetStartEndDayInput.value = budget.startEndDay || ""; // הצבת יום תחילת התקציב
    }

    // הצגת ה-modal
    document.getElementById("budgetModal").style.display = "block";
}

function closeBudgetModal() {
    document.getElementById("budgetModal").style.display = "none";
}


function updateBudgetDisplay() {
    const budgetDisplay = document.getElementById("budgetDisplay");
    if (!budgetDisplay) {
        console.error("לא נמצא אלמנט להצגת התקציב.");
        return;
    }

    const usagePercentage = budget.totalBudget > 0 
    ? (budget.usedBudget / budget.totalBudget * 100).toFixed(2) 
    : 0;
    budgetDisplay.innerHTML = `
        <h3>תקציב חודשי: ${budget.totalBudget.toFixed(2)} ₪</h3>
        <h3>הסכום שנוצל: ${budget.usedBudget.toFixed(2)} ₪</h3>
        <h3>ניצול חודשי: ${(usagePercentage)} %</h3>
        <p>יום תחילת התקציב הוא ה${budget.startEndDay} בחודש</p> 
    `;

    renderBudgetChart();     // יצירת הגרף
}

function UpdateListDates(){
    expenses.forEach(expense => {
        if(expense.type === 'expense'){
            const date = new Date(expense.fullDate.split(" / ")[0].split('.').reverse().join('-'))
            addExpenseToBudget(expense.amount, date);
        }

    });
}

function saveBudget() {
    const totalBudget = parseFloat(document.getElementById("budgetAmount").value);
    const budgetStartEndDay = parseInt(document.getElementById("budgetStartEndDay").value);

    // בדיקת תקינות הערכים
    if (isNaN(totalBudget) || isNaN(budgetStartEndDay) || budgetStartEndDay < 1 || budgetStartEndDay > 28) {
        alert("אנא הזן ערכים תקינים לתקציב ולתאריכים.");
        return;
    }

    if(budget.totalBudget != totalBudget || budget.startEndDay != budgetStartEndDay){
        budget.totalBudget = totalBudget;
        // שמירת הערכים באובייקט התקציב
        if (budget.startEndDay != budgetStartEndDay) {
            if (!confirm("שינוי תאריך התקציב ידרוס נתונים קיימים. האם להמשיך?")) return;//בדיקה אם בטוח רוצים לשנות את התאריך- יקח כמה שניות וכו.


            budget.months= []; // איפוס רשימת החודשים                    
            budget.usedBudget = 0;// איפוס ניצול התקציב
            budget.startEndDay = budgetStartEndDay;
            UpdateListDates();
            console.log(budget);
            console.log(budget.months);
        }
    }


    // שמירת התקציב ב-localStorage
    localStorage.setItem("budget", JSON.stringify(budget));

    // עדכון התצוגה
    updateBudgetDisplay();

    // סגירת ה-modal
    closeBudgetModal();
}

// function editExpenseInBudget(oldAmount, newAmount, oldDate, newDate) {
//     deleteExpenseFromBudget(oldAmount, oldDate);
//     addExpenseToBudget(newAmount, newDate)
// }

function deleteExpenseFromBudget(amount, date) {
    // מציאת החודש הרלוונטי מתוך המערך
    let currentMonthObject = budget.months.find(month => month.isDateInBudgetRange(date));
    if (!currentMonthObject) {
        console.log("שגיאה");
    }
    else{
        currentMonthObject.deleteExpense(amount,date);
        checkAndUpdateUsedBudget();
    }
}

function addExpenseToBudget(amount, date) {
    // מציאת החודש הרלוונטי מתוך המערך
    let currentMonthObject = budget.months.find(month => month.isDateInBudgetRange(date));

    // אם החודש לא קיים, יצירת חודש חדש
    if (!currentMonthObject) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        currentMonthObject = new MonthlyBudget(year, month, budget.startEndDay,day);
        budget.months.push(currentMonthObject);
    } 
    currentMonthObject.addExpense(amount, date); // הוספת ההוצאה למופע החדש

    checkAndUpdateUsedBudget();

    //updateBudgetDisplay();  // עדכון תצוגת התקציב
}

function checkAndUpdateUsedBudget() {
    const currentDate = new Date();

    // אם החודש הנוכחי לא תואם לחודש האחרון ב-budget, נעדכן
    const currentMonthObject = budget.months.find(month => month.isDateInBudgetRange(currentDate));

    if (!currentMonthObject) {
        budget.usedBudget = 0;// איפוס ניצול התקציב
    }
    else{
        budget.usedBudget = currentMonthObject.expenses;
    }

    // עדכון התצוגה של התקציב בכל פעם שיבדוק את החודש
    updateBudgetDisplay();
}

let budgetChart = null; // משתנה גלובלי לשמירת הגרף
let displayedLastMonth = new Date(); // אינדקס להתחלת החודשים המוצגים (אחורה)
const monthsPerPage = 6; // מספר החודשים להצגה בגרף

function renderBudgetChart() {
    const ctx = document.getElementById("budgetChart").getContext("2d");

    // יצירת מערך נתונים מחודשים שמורים
    const monthsShow = [];
    for (let i = 0; i < monthsPerPage; i++) {
        const tempDate = new Date(displayedLastMonth); // יצירת עותק של התאריך
        tempDate.setMonth(tempDate.getMonth() - i); // חזרה חודש אחורה
        const month = tempDate.getMonth();
        const year = tempDate.getFullYear();
        monthsShow.push({ month, year });
    }
    monthsShow.reverse(); // סידור החודשים מהישן לחדש

    const labels = monthsShow.map(month => `${month.month + 1}/${month.year}`); // שמות החודשים
    const data = monthsShow.map(month => {
        const currentMonthObject = budget.months.find(m =>
            m.isDateInBudgetRange(new Date(month.year, month.month, budget.startEndDay))
        );
        return currentMonthObject ? currentMonthObject.expenses : 0; // ניצול התקציב או 0 אם אין נתונים
    });
    //     monthsShow[i] = {month:displayedLastMonth.getMonth-monthsPerPage,year: displayedLastMonth.getFullYear()};
    //     (monthsShow[i].month<0)?{month:monthsShow[i].month+12, year: monthsShow[i]-1}:monthsShow[i];
        
    // }
    // const labels = monthsShow.map(month => `${month.month + 1}/${month.year}`); // חודש ושנה   
    // const data = monthsShow.map(month => {
    //     let currentMonthObject = budget.months.find(m => m.isDateInBudgetRange( new Date(month.getFullYear, month.getDate, budget.startEndDay)));
    //     if(currentMonthObject){
    //         return currentMonthObject.expenses;
    //     }
    //     return 0;
    // }); // החודשים עצמם
    
    const totalBudgetData = monthsShow.map(() => budget.totalBudget); // אותו תקציב עבור כל החודשים

    // const labels = budget.months.map(month => `${month.month + 1}/${month.year}`); // חודש ושנה
    // const data = budget.months.map(month => month.expenses); // ניצול התקציב בכל חודש
    // const totalBudgetData = budget.months.map(() => budget.totalBudget); // אותו תקציב עבור כל החודשים

    if (budgetChart) {
        budgetChart.destroy(); 
    }
    // יצירת גרף
    budgetChart = new Chart(ctx, {
        type: "line", // גרף עמודות
        data: {
            labels: labels, // שמות החודשים
            datasets: [
                {
                    label: "ניצול התקציב (₪)",
                    data: data, // ניצול התקציב
                    backgroundColor: "rgba(255, 99, 132, 0.5)", // צבע עמודות הניצול
                    borderColor: "rgba(255, 99, 132, 1)", // צבע קו
                    borderWidth: 1,
                },
                {
                    label: "תקציב חודשי (₪)",
                    data: totalBudgetData, // התקציב החודשי
                    type: "line", // קו המציג את התקציב
                    borderColor: "rgba(54, 162, 235, 1)", // צבע הקו
                    borderWidth: 2,
                    fill: false, // ללא מילוי מתחת לקו
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw} ₪`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "חודשים",
                    },
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "סכום (₪)",
                    },
                },
            },
        },
    });
}


// בדיקה כל יום ב-12 בלילה
// קביעת זמן להתחיל את הבדיקה ב-12 בלילה
function scheduleNextCheck() {
    const now = new Date();
    const nextCheck = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 0, 1); // 12 בלילה מחר
    const delay = nextCheck - now; // זמן שנותר עד 12 בלילה

    setTimeout(() => {
        checkAndUpdateMonth();
        setInterval(checkAndUpdateMonth, 60*60*1000); //  עכשיו כל 24 שעות לאחר מכן  (24*60*60*1000)
    }, delay);
}

// התחלת הבדיקה
scheduleNextCheck();

class MonthlyBudget {
    constructor(year, month, startDate, dayForcheck=1) {
        this.year = year; // שנה
        this.month = dayForcheck >= startDate ? month : month - 1;
        this.startDate = new Date(year, this.month, startDate); // יום תחילת התקציב (המשתמש בחר את היום)
        this.endDate = this.calculateEndDate(startDate); // יום סיום התקציב (מספר הימים בחודש הבא)
        this.expenses = 0; // הוצאות החודש
        this.numberOfDays = this.calculateDaysInMonth(); // מספר הימים בחודש
    }

    // חישוב מספר הימים בחודש
    calculateDaysInMonth() {
        return new Date(this.year, this.month + 1, 0).getDate(); // מחזיר את מספר הימים בחודש
    }

    // חישוב תאריך סיום החודש
    calculateEndDate(startDate) {
        // התאריך האחרון בחודש יהיה יום לפני תחילת החודש הבא
        return new Date(this.year, this.month + 1, startDate-1); // תאריך סיום החודש 
    }

    // הוספת הוצאות
    addExpense(amount,date) { 
        if(this.isDateInBudgetRange(date)){
            this.expenses += amount; // הוספת סכום ההוצאה
        } else {
            console.log("ההוצאה לא שייכת לחודש זה.");
        }
    }
    deleteExpense(amount,date) { 
        if(this.isDateInBudgetRange(date)){
            this.expenses -= amount; // הוספת סכום ההוצאה
        } else {
            console.log("ההוצאה לא שייכת לחודש זה.");
        }
    }


    // הצגת סיכום התקציב
    getSummary() {
        return {
            year: this.year,
            month: this.month,
            startDate: this.startDate,
            endDate: this.endDate,
            expenses: this.expenses,
            numberOfDays: this.numberOfDays
        };
    }

    // פונקציה לבדוק אם תאריך מסויים נמצא בטווח החודש
    isDateInBudgetRange(date) {
        return date >= this.startDate && date < this.endDate;
    }
}