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
    `;
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
            if (!confirm("שינוי תאריך התקציב ידרוס נתונים קיימים. האם להמשיך?")) return;//בדיקה אם בטוח רוצים לשנות את התאריך- יקח כמה שניות וכו. שימוש confirm


            budget.months= []; // איפוס רשימת החודשים                    
            budget.usedBudget = 0;// איפוס ניצול התקציב
            //budget.totalBudget = totalBudget;
            budget.startEndDay = budgetStartEndDay;
            UpdateListDates();
        }
        // else{??
        //     budget.totalBudget = totalBudget;
            
        //     budget.months.forEach(month => month.totalBudget = totalBudget);
        // }
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

    // אם החודש לא קיים, יצירת חודש חדש
    if (!currentMonthObject) {
        const year = date.getFullYear();
        const month = date.getMonth();// >= budget.startEndDay ? date.getMonth() : date.getMonth() - 1;
        const day = date.getDate();

        currentMonthObject = new MonthlyBudget(year, month, budget.startEndDay,day);
        budget.months.push(currentMonthObject);
    } 
    currentMonthObject.addExpense(amount, date); // הוספת ההוצאה למופע החדש


    // מציאת החודש הרלוונטי מתוך המערך
    let nowMonthObject = budget.months.find(month => month.isDateInBudgetRange(new Date()));

    // // אם החודש לא קיים, יצירת חודש חדש
    // if (!nowMonthObject) {
    //     const nowDate = new Date();
    //     const year = nowDate.getFullYear();
    //     const month = nowDate.getMonth(); // >= budget.startEndDay ? date.getMonth() : date.getMonth() - 1;
    //     const day = nowDate.getDate();

    //     nowMonthObject = new MonthlyBudget(year, month, budget.startEndDay);
    //     budget.months.push(nowMonthObject);
    // } 
    // // הוספת ההוצאה רק אם התאריך נמצא בטווח החודש הנוכחי
    // if (nowMonthObject.isDateInBudgetRange(date)) {
    //     budget.usedBudget += amount; // סך כל ההוצאות החודשיות
    // }

    checkAndUpdateUsedBudget();

    updateBudgetDisplay();  // עדכון תצוגת התקציב
}

function checkAndUpdateUsedBudget() {
    const currentDate = new Date();

    // אם החודש הנוכחי לא תואם לחודש האחרון ב-budget, נעדכן
    const currentMonthObject = budget.months.find(month => month.isDateInBudgetRange(currentDate));

    if (!currentMonthObject) {
        // const currentMonth = currentDate.getMonth(); // החודש הנוכחי
        // const currentYear = currentDate.getFullYear(); // השנה הנוכחית
        // let newMonthBudget = new MonthlyBudget(currentYear, currentMonth, budget.startEndDay);
        // budget.months.push(newMonthBudget); // הוספת חודש חדש אם החודש הנוכחי לא נמצא
        budget.usedBudget = 0;// איפוס ניצול התקציב
    }
    else{
        budget.usedBudget = currentMonthObject.expenses;
    }

    // עדכון התצוגה של התקציב בכל פעם שיבדוק את החודש
    updateBudgetDisplay();
}

// בדיקה כל יום ב-12 בלילה
// קביעת זמן להתחיל את הבדיקה ב-12 בלילה
function scheduleNextCheck() {
    const now = new Date();
    const nextCheck = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0); // 12 בלילה מחר
    const delay = nextCheck - now; // זמן שנותר עד 12 בלילה

    setTimeout(() => {
        checkAndUpdateMonth();
        setInterval(checkAndUpdateMonth, 86400000); // עכשיו כל 24 שעות לאחר מכן
    }, delay);
}

// התחלת הבדיקה
scheduleNextCheck();


//setInterval(checkAndUpdateMonth, 86400000); // 86400000 מייצג 24 שעות (24*60*60*1000)


class MonthlyBudget {
    constructor(year, month, startDate, dayForcheck=1) {
        this.year = year; // שנה
        //this.month = month; // חודש
        this.month = dayForcheck >= startDate ? month : month - 1;
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