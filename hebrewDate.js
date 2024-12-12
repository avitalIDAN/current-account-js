function getHebrewDate(now) {
    //const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', calendar: 'hebrew', numberingSystem: 'hebrew' };
    let dateStr = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', options).format(now);

    // המרת מספרים לאותיות עבריות עבור היום בחודש
    dateStr = replaceNumbersWithHebrew(dateStr);

    // המרת השנה העברית
    dateStr = replaceYearWithHebrew(dateStr);

    return dateStr;
}

// פונקציה להמרת המספרים לייצוג אותיות עבריות
function replaceNumbersWithHebrew(str) {
    const hebrewNumbers = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'י"א', 'י"ב', 'י"ג', 'י"ד', 'ט"ו', 'ט"ז', 'י"ז', 'י"ח', 'י"ט', 'כ', 'כ"א', 'כ"ב', 'כ"ג', 'כ"ד', 'כ"ה', 'כ"ו', 'כ"ז', 'כ"ח', 'כ"ט', 'ל'];
    return str.replace(/\d{1,2}/, match => hebrewNumbers[parseInt(match) - 1]);
}

// פונקציה להמרת שנה מספרית לעברית מלאה (כגון "התשפ"ה")
function replaceYearWithHebrew(str) {
    const yearNumber = str.match(/\d{4}/);
    if (yearNumber) {
        const hebrewYear = getHebrewYearString(parseInt(yearNumber[0]));
        str = str.replace(yearNumber[0], hebrewYear);
    }
    return str;
}

// פונקציה שמחזירה את השנה העברית כתיבה (לדוגמה: התשפ"ה)
function getHebrewYearString(year) {
    const hebrewYears = {
        5784: 'התשפ"ד',
        5785: 'התשפ"ה',
        5786: 'התשפ"ו',
        // הוסף שנים לפי הצורך
    };
    return hebrewYears[year] || year.toString(); // אם השנה לא נמצאת, נשאיר את המספר
}
