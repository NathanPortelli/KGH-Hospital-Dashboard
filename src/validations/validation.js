// List of validations used in patient details and new patient pages

// Checks first name and last name for any numbers and special characters
export function isNameValid(name) {
    const regex = /^[A-Za-z.-]+$/;
    return regex.test(name);
}

// Checks if ID Num is "numbers followed by a letter"
export function isIDNumValid(idNum) {
    const regex = /^\d+[A-Za-z]$/;
    return regex.test(idNum);
}

// Checks if age is a number between 0 and 120
export function isAgeValid(age) {
    const parsedAge = parseInt(age, 10);
    return !Number.isNaN(parsedAge) && parsedAge >= 0 && parsedAge <= 120;
}

// Checks if Date of Birth is between 1900 and current date
export function isDOBValid(dob) {
    const minDate = new Date('1900-01-01');
    const maxDate = new Date();
    const inputDate = new Date(dob);
    return inputDate >= minDate && inputDate <= maxDate;
}

// Checks if admission date is between start 2017 and 6 months from current date
export function isAdminDateValid(admDate) {
    const minDate = new Date('2017-01-01');
    const maxDate = new Date(); // Get the current date
    maxDate.setMonth(maxDate.getMonth() + 6); // Add 6 months to the current date
    const inputDate = new Date(admDate);
    return inputDate >= minDate && inputDate <= maxDate;
}
