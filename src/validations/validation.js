export function isNameValid(name) {
    const regex = /^[A-Za-z.-]+$/;
    return regex.test(name);
}

export function isIDNumValid(idNum) {
    const regex = /^\d+[A-Za-z]$/;
    return regex.test(idNum);
}

export function isAgeValid(age) {
    const parsedAge = parseInt(age, 10);
    return !Number.isNaN(parsedAge) && parsedAge >= 0 && parsedAge <= 120;
}

export function isDOBValid(dob) {
    const minDate = new Date('1900-01-01');
    const maxDate = new Date('2023-01-01');
    const inputDate = new Date(dob);
    return inputDate >= minDate && inputDate <= maxDate;
}

export function isAdminDateValid(admDate) {
    const minDate = new Date('2017-01-01');
    const maxDate = new Date('2025-01-01');
    const inputDate = new Date(admDate);
    return inputDate >= minDate && inputDate <= maxDate;
}
