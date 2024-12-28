const budget = {
    totalBudget: 0, // סכום התקציב
    startEndDay: 1, // יום התחלה וסיום בחודש
    usedBudget: 0, // סכום שנוצל (מתעדכן אוטומטית)
    months: [],       // אובייקטים עבור כל חודש (כולל הוצאות, תאריכים וכו')
    ifMessages: false,
    messages: {
        success: [
            { days: 10, usage: 30, message: "כבר עברו 10 ימים והשארת מספיק תקציב לחודש הקרוב!" },
            { days: 20, usage: 60, message: "רוב החודש מאחוריך, והשארת דיי תקציב לסיים את החודש בכיף:)" },
            { days: 28, usage: 90, message: "אפשר להתפנק קצת בקרוב מתחיל תקציב חדש;)" }
        ],
        motivation: [
            { days: 10, usage: 35, message: "רק התחלנו את החודש כדאי להשאיר תקציב לאורך כל החודש" },
            { days: 20, usage: 70, message: "כבר עבר רוב החודש אך עדיין 10 ימים מלפנינו! אל תשכח" },
            { days: 28, usage: 99, message: "עוצר קניות עד תחילת התקציב הבא" }
        ],
        warning: [
            { message: "חריגה מהתקציב!" }
        ]
    }
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
        budget.ifMessages = parsedBudget.ifMessages || false;
        budget.messages = parsedBudget.messages || budget.messages;
        
        // שחזור החודשים כמופעים של MonthlyBudget
        budget.months = parsedBudget.months || [];
        budget.months = parsedBudget.months.map(month => {
            const newMonth = new MonthlyBudget(
                month.year,
                month.month + 1,
                budget.startEndDay
            );
        
            // העתקת ההוצאות והמידע הנוסף
            newMonth.expenses = month.expenses || 0;
        
            return newMonth;
        });

    }
    console.log(budget.months);
    checkAndUpdateUsedBudget();
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

    //משפטי עידוד 

    const checkbox = document.getElementById("toggleMessageCheckbox");
    checkbox.checked = budget.ifMessages;
    toggleMessageConfig();

    const good10 = document.getElementById("good10");
    const good20 = document.getElementById("good20");
    const good30 = document.getElementById("good30");
    const bad10 = document.getElementById("bad10");
    const bad20 = document.getElementById("bad20");
    const bad30 = document.getElementById("bad30");
    const badWarning = document.getElementById("badWarning");

    good10.value = budget.messages.success[0].message;
    good20.value = budget.messages.success[1].message;
    good30.value = budget.messages.success[2].message;

    bad10.value = budget.messages.motivation[0].message;
    bad20.value = budget.messages.motivation[1].message;
    bad30.value = budget.messages.motivation[2].message;
    
    badWarning.value = budget.messages.warning[0].message;

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
    budget.startEndDay = budget.startEndDay ? budget.startEndDay : "--";
    budgetDisplay.innerHTML = `
        <h3>תקציב חודשי: ${budget.totalBudget.toFixed(2)} ₪</h3>
        <h3>הסכום שנוצל: ${budget.usedBudget.toFixed(2)} ₪</h3>
        <h3>ניצול חודשי: ${(usagePercentage)} %</h3>
        <p>יום תחילת התקציב הוא ה${budget.startEndDay} בחודש</p> 
    `;

    renderBudgetChart();     // יצירת הגרף

    checkBudgetStatus();
}

function UpdateListDates(){
    expenses.forEach(expense => {
        if(expense.type === 'expense'){
            const date = new Date(expense.fullDate.split(" / ")[0].split('.').reverse().join('-'))
            addSimpleExpenseToBudget(expense.amount, date);
        }

    });
    checkAndUpdateUsedBudget();
}

// פונקציה להצגת הגדרות משפטים
function toggleMessageConfig() {
    const messageConfigContainer = document.getElementById("messageConfigContainer");
    const checkbox = document.getElementById("toggleMessageCheckbox");

    // הצגת או הסתרת הקונטיינר לפי מצב ה-checkbox
    if (checkbox.checked) {
        budget.ifMessages = true;
        messageConfigContainer.style.display = "block"; // הצגה
    } else {
        budget.ifMessages = false;
        messageConfigContainer.style.display = "none"; // הסתרה
    }
    // שמירת התקציב ב-localStorage
    localStorage.setItem("budget", JSON.stringify(budget));
}


function checkBudgetStatus() {
    if(!budget.ifMessages){
        document.getElementById("chartMessage").value = "";
        return;
    }
    const usagePercentage = (budget.usedBudget / budget.totalBudget) * 100;

    let message = "";
    let color = "black";

    if(usagePercentage>100){
        message = budget.messages.warning[0].message;
        color = "red";
        alert(message);
        updateChartLabel(message, color);
        return;
    }
    
    const currentDate = new Date();

    // אם החודש הנוכחי לא תואם לחודש האחרון ב-budget, נעדכן
    const currentMonthObject = budget.months.find(month => month.isDateInBudgetRange(currentDate));

    if (!currentMonthObject || currentMonthObject.expenses==0) {
        message = "לא הוצאת בכלל החודש!";
    }
    else{
        const rangeDays = getDates(currentMonthObject.startDate, currentDate);
        if (rangeDays>=28) {
            if (usagePercentage<=budget.messages.success[2].usage) {
                message = budget.messages.success[2].message;
                color = "green";
            } else if (usagePercentage>=budget.messages.motivation[2].usage) {
                message = budget.messages.motivation[2].message;
                color = "red";
            }
        }
        else if (rangeDays>=20) {
            if (usagePercentage<=budget.messages.success[1].usage) {
                message = budget.messages.success[1].message;
                color = "green";
            } else if (usagePercentage>=budget.messages.motivation[1].usage) {
                message = budget.messages.motivation[1].message;
                color = "red";
            }
        }
        else if (rangeDays>=10) {
            if (usagePercentage<=budget.messages.success[0].usage) {
                message = budget.messages.success[0].message;
                color = "green";
            } 
        } else if (rangeDays <=10 && usagePercentage>=budget.messages.motivation[0].usage) {
            message = budget.messages.motivation[0].message;
            color = "red";
        }
        else{
            message = "";
        }
    }
    updateChartLabel(message, color); // עדכון תווית הגרף
}
// פונקציה לעדכון תווית הגרף
function updateChartLabel(message, color) {
    const chartLabel = document.getElementById("chartMessage");
    if (chartLabel) {
        chartLabel.innerText = message;
        chartLabel.style.color = color || "black"; // ברירת מחדל: שחור
    }
}

function getDates(startDate, endDate){
    var delta = endDate - startDate;
    return delta / (1000 * 60 * 60 * 24); 
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
    
    if(budget.ifMessages){
        const good10 = document.getElementById("good10");
        const good20 = document.getElementById("good20");
        const good30 = document.getElementById("good30");
        const bad10 = document.getElementById("bad10");
        const bad20 = document.getElementById("bad20");
        const bad30 = document.getElementById("bad30");
        const badWarning = document.getElementById("badWarning");
    
        budget.messages.success[0].message = good10.value;
        budget.messages.success[1].message = good20.value;
        budget.messages.success[2].message = good30.value;
    
        budget.messages.motivation[0].message = bad10.value;
        budget.messages.motivation[1].message = bad20.value;
        budget.messages.motivation[2].message = bad30.value;
        
        budget.messages.warning[0].message = badWarning.value;
    }
    else{
        document.getElementById("chartMessage").value = "";
    }

    // שמירת התקציב ב-localStorage
    localStorage.setItem("budget", JSON.stringify(budget));

    // עדכון התצוגה
    updateBudgetDisplay();

    // סגירת ה-modal
    closeBudgetModal();
}

function deleteExpenseFromBudget(amount, date) {
    // מציאת החודש הרלוונטי מתוך המערך
    let currentMonthObject = budget.months.find(month => month.isDateInBudgetRange(date));
    if (!currentMonthObject) {
        console.log("שגיאה");
        checkAndUpdateUsedBudget();
    }
    else{
        currentMonthObject.deleteExpense(amount,date);
        checkAndUpdateUsedBudget();
    }
    localStorage.setItem("budget", JSON.stringify(budget));
}

function addSimpleExpenseToBudget(amount, date) {
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
}

function addExpenseToBudget(amount, date) {
    
    addSimpleExpenseToBudget(amount, date);
    checkAndUpdateUsedBudget();
    //updateBudgetDisplay
    localStorage.setItem("budget", JSON.stringify(budget));
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

function shiftMonths(direction) {
    // עדכון החודש האחרון המוצג לפי הכיוון (1 קדימה, -1 אחורה)
    displayedLastMonth.setMonth(displayedLastMonth.getMonth() + direction * monthsPerPage);
    renderBudgetChart(); // עדכון הגרף
}

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
    
    const totalBudgetData = monthsShow.map(() => budget.totalBudget); // אותו תקציב עבור כל החודשים

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
    const nextCheck = new Date(now.getFullYear(), now.getMonth(), now.getDate() , 0, 0, 0); 
    const delay = nextCheck - now; 

    setTimeout(() => {
        checkAndUpdateUsedBudget();
        setInterval(checkAndUpdateUsedBudget, 24*60*60*1000);
    }, delay);
}

// התחלת הבדיקה
scheduleNextCheck();

class MonthlyBudget {
    constructor(year, month, startDate, dayForcheck=1) {
        this.year = year; // שנה
        this.month = dayForcheck >= startDate ? month : month - 1;
        this.startDate = new Date(year, this.month, startDate,0,0,0); // יום תחילת התקציב (המשתמש בחר את היום)
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
        return new Date(this.year, this.month + 1, startDate-1, 23,59,59); // תאריך סיום החודש 
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
        return date >= this.startDate && date <= this.endDate;
    }
}