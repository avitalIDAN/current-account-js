const budget = {
    totalBudget: 0, // סכום התקציב
    startEndDay: null, // יום התחלה וסיום בחודש
    usedBudget: 0, // סכום שנוצל (מתעדכן אוטומטית)
    months: []       // אובייקטים עבור כל חודש (כולל הוצאות, תאריכים וכו')
};

function openBudgetModal() {
    document.getElementById("budgetModal").style.display = "block";
}

function closeBudgetModal() {
    document.getElementById("budgetModal").style.display = "none";
}

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
        budget.months = parsedBudget.months || [];
    }
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
    `;//לטפל
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
        // שמירת הערכים באובייקט התקציב
        if (budget.startEndDay != budgetStartEndDay) {
            if (!confirm("שינוי תאריך התקציב ידרוס נתונים קיימים. האם להמשיך?")) return;//בדיקה אם בטוח רוצים לשנות את התאריך- יקח כמה שניות וכו. שימוש confirm


            budget.months= []; // איפוס רשימת החודשים                    
            budget.usedBudget = 0;// איפוס ניצול התקציב
            budget.totalBudget = totalBudget;
            budget.startEndDay = budgetStartEndDay;
            UpdateListDates();
        }
        else{
            budget.totalBudget = totalBudget;
            
            budget.months.forEach(month => month.totalBudget = totalBudget);
        }
    }


    // שמירת התקציב ב-localStorage
    localStorage.setItem("budget", JSON.stringify(budget));

    // עדכון התצוגה
    updateBudgetDisplay();

    // סגירת ה-modal
    closeBudgetModal();
}

function addExpenseToBudget(amount, date) {
    // מציאת החודש הרלוונטי מתוך המערך
    let currentMonthObject = budget.months.find(month => month.isDateInBudgetRange(date));

    // אם החודש נמצא, הוסף את ההוצאה
    if (!currentMonthObject) {
        const year = date.getFullYear();
        const month = date.getDate() >= budget.startEndDay ? date.getMonth() : date.getMonth() - 1;

        currentMonthObject = new MonthlyBudget(year, month, budget.startEndDay);
        budget.months.push(currentMonthObject);
    } 
    currentMonthObject.addExpense(amount, date); // הוספת ההוצאה למופע החדש

    budget.usedBudget += amount; // לטפל
    updateBudgetDisplay();  // עדכון תצוגת התקציב
}



class MonthlyBudget {
    constructor(year, month, startDate) {
        this.year = year; // שנה
        this.month = month; // חודש
        this.startDate = new Date(year, month, startDate); // יום תחילת התקציב (המשתמש בחר את היום)
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
        return date >= this.startDate && date <= this.endDate;
    }
}



// const budget = {
//     totalBudget: 0, // סכום התקציב
//     startEndDay: null, // יום התחלה וסיום בחודש
//     usedBudget: 0, // סכום שנוצל (מתעדכן אוטומטית)
//     months: []       // אובייקטים עבור כל חודש (כולל הוצאות, תאריכים וכו')
// };

// function openBudgetModal() {
//     document.getElementById("budgetModal").style.display = "block";
// }

// function closeBudgetModal() {
//     document.getElementById("budgetModal").style.display = "none";
// }


// function updateBudgetDisplay() {
//     const budgetDisplay = document.getElementById("budgetDisplay");
//     if (!budgetDisplay) {
//         console.error("לא נמצא אלמנט להצגת התקציב.");
//         return;
//     }

//     // const today = new Date();
//     // let dayInMonth = d.getDate();
//     // if (dayInMonth>budget.startEndDay) {
        
//     // }
//     budgetDisplay.innerHTML = `
//         <h3>תקציב חודשי: ${budget.totalBudget.toFixed(2)} ₪</h3>
//         <h3>הסכום שנוצל: ${budget.usedBudget.toFixed(2)} ₪</h3>
//         <h3>ניצול חודשי: ${(budget.usedBudget/budget.totalBudget).toFixed(2)} %</h3>
//         <p> מספר הימים מתחילת התקציב: --</p>

//     `;
//     // <p>טווח ימים: ${budget.startDay} - ${budget.endDay}</p>
// }

// function UpdateListDates(){
//     expenses.forEach(expense => {
//         const date = new Date(expense.fullDate.split(" / ")[0].split('.').reverse().join('-'))
//         addExpenseToBudget(budget.totalBudget, date);
//     });
// }

// function saveBudget() {
//     const totalBudget = parseFloat(document.getElementById("budgetAmount").value);
//     const budgetStarEndDate = parseInt(document.getElementById("budgetStarEndDate").value);
//     // const endDay = parseInt(document.getElementById("budgetEndDay").value, 10);

//     // בדיקת תקינות הערכים
//     if (isNaN(totalBudget) || isNaN(budgetStarEndDate) || budgetStarEndDate < 1 || budgetStarEndDate > 28) {
//         alert("אנא הזן ערכים תקינים לתקציב ולתאריכים.");
//         return;
//     }

//     if(budget.totalBudget != totalBudget || budget.budgetStarEndDate != budgetStarEndDate){
//         // שמירת הערכים באובייקט התקציב
//         if (budget.budgetStarEndDate != budgetStarEndDate) {
//             //בדיקה אם בטוח רוצים לשנות את התאריך- יקח כמה שניות וכו


//             budget.months= []; // איפוס רשימת התאריכים                    
//             budget.usedBudget = 0;// איפוס ניצול התקציב
//             budget.totalBudget = totalBudget;
//             budget.budgetStarEndDate = budgetStarEndDate;
//             UpdateListDates();
//         }
//         else{
//             budget.totalBudget = totalBudget;
            
//             const date = new date();
//             // מציאת החודש הנוכחי מתוך המערך
//             const currentMonthObject = budget.months.find(month => month.isDateInBudgetRange(date));

//             // אם החודש נמצא, הוסף את ההוצאה
//             if (!currentMonthObject) {
//                 let newMonthBudget;
//                 if(date.getDate()>=budget.startEndDay){
//                     newMonthBudget = new MonthlyBudget(date.getFullYear(), date.getMonth(), budget.startEndDay);  // יצירת מופע חדש של MonthlyBudget
//                 }
//                 else{
//                     newMonthBudget = new MonthlyBudget(date.getFullYear(), date.getMonth()-1, budget.startEndDay);  // יצירת מופע חדש של MonthlyBudget
//                 }
//                 budget.months.push(newMonthBudget); // הוספת החודש החדש למערך ה-months
//                  currentMonthObject = newMonthBudget;
//             } 
//         }

//         // budget.totalBudget = totalBudget;
//         // budget.budgetStarEndDate = budgetStarEndDate;
//         // budget.endDay = endDay;
//     }


//     // שמירת התקציב ב-localStorage
//     localStorage.setItem("budget", JSON.stringify(budget));

//     // עדכון התצוגה
//     updateBudgetDisplay();

//     // סגירת ה-modal
//     closeBudgetModal();
// }

// // function addExpenseToBudget(amount, day) {
// //     if (day >= budget.startDay && day <= budget.endDay) {
// //         budget.usedBudget += amount;  // עדכון סכום ההוצאות
// //         updateBudgetDisplay();  // עדכון התצוגה
// //     }
// // }

// function addExpenseToBudget(amount, date) {
//     // מציאת החודש הנוכחי מתוך המערך
//     const currentMonthObject = budget.months.find(month => month.isDateInBudgetRange(date));

//     // אם החודש נמצא, הוסף את ההוצאה
//     if (!currentMonthObject) {
//         let newMonthBudget;
//         if(date.getDate()>=budget.startEndDay){
//             newMonthBudget = new MonthlyBudget(date.getFullYear(), date.getMonth(), budget.startEndDay);  // יצירת מופע חדש של MonthlyBudget
//         }
//         else{
//             newMonthBudget = new MonthlyBudget(date.getFullYear(), date.getMonth()-1, budget.startEndDay);  // יצירת מופע חדש של MonthlyBudget
//         }
//         budget.months.push(newMonthBudget); // הוספת החודש החדש למערך ה-months
//         newMonthBudget.addExpense(amount, date); // הוספת ההוצאה למופע החדש
//     } 
//     // else {
//     //     // אם החודש לא נמצא, צור חודש חדש
//     //     const newMonthBudget = new MonthlyBudget(date, budget.startEndDay);  // יצירת מופע חדש של MonthlyBudget
//     //     // newMonthBudget.addExpense(amount, date); // הוספת ההוצאה למופע החדש
//     //     budget.months.push(newMonthBudget); // הוספת החודש החדש למערך ה-months
//     //     // budget.usedBudget += amount; // עדכון סך ההוצאות
//     //     // updateBudgetDisplay(); // עדכון תצוגת התקציב
//     // }
//     currentMonthObject.addExpense(amount, date);
//     budget.usedBudget += amount;
//     updateBudgetDisplay();  // עדכון תצוגת התקציב
// }



// class MonthlyBudget {
//     constructor(year, month, startDate) {
//         this.year = year; // שנה
//         this.month = month; // חודש
//         this.startDate = new Date(year, month, startDate); // יום תחילת התקציב (המשתמש בחר את היום)
//         this.endDate = this.calculateEndDate(startDate); // יום סיום התקציב (מספר הימים בחודש הבא)
//         this.expenses = 0; // הוצאות החודש
//         this.numberOfDays = this.calculateDaysInMonth(); // מספר הימים בחודש
//     }

//     // חישוב מספר הימים בחודש
//     calculateDaysInMonth() {
//         return new Date(this.year, this.month + 1, 0).getDate(); // מחזיר את מספר הימים בחודש
//     }

//     // חישוב תאריך סיום החודש
//     calculateEndDate(startDate) {
//         // התאריך האחרון בחודש יהיה ה-9 לחודש הבא
//         const nextMonth = this.month + 1;
//         const endDate = new Date(this.year, nextMonth, startDate-1); // תאריך סיום החודש 
//         return endDate;
//     }

//     // הוספת הוצאות
//     addExpense(amount,date) { 
//         if(this.isDateInBudgetRange(date)){
//         this.expenses += amount; // הוספת סכום ההוצאה
//         } else {
//             console.log("ההוצאה לא מתאימה לתקציב החודשי.");
//         }
//     }

//     // הצגת סיכום התקציב
//     getSummary() {
//         return {
//             year: this.year,
//             month: this.month,
//             startDate: this.startDate,
//             endDate: this.endDate,
//             expenses: this.expenses,
//             numberOfDays: this.numberOfDays
//         };
//     }

//     // פונקציה לבדוק אם תאריך מסויים נמצא בטווח החודש
//     isDateInBudgetRange(date) {
//         return date >= this.startDate && date <= this.endDate;
//     }
// }