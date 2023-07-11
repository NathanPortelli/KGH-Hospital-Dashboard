// @mui
import { toast } from 'react-toastify';

// components
import { collection, addDoc } from 'firebase/firestore';
import { read, utils } from 'xlsx';

// firebase
import { db } from '../../../config/firebase';

// ----------------------------------------------------------------------

// Function to format the date from Excel serial date to 'YYYY-MM-DD' format
const formatDateExcel = (serialDate) => {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const excelEpoch = new Date('1900-01-01');
  const millisecondsOffset = (serialDate - 1) * millisecondsPerDay;
  const date = new Date(excelEpoch.getTime() + millisecondsOffset);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const formattedDate = date.toISOString().split('T')[0];
  return formattedDate;
};

// Function to validate the date format
const isValidDateFormat = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // to change to better date format check
  return dateRegex.test(dateString);
};

// Variations
const headerMappings = {
  FirstName: ['given name', 'first name', 'givenName', 'given_name', 'first_name', 'fname', 'prénom', 'personal name', 'forename', 'individual name'],
  Sex: ['gender', 'sex', 'sex/gender', 'gender/sex', 'male/female', 'm/f', 'identity', 'sexuality', 'assigned sex', 'biological gender', 'm/f/other', 'gender at birth', 'm/f/o', 'sexual category', 'gender identity', 'sexual orientation'],
  LastName: ['lastname', 'last name', 'surname', 'family name', 'familyname', 'family_name', 'family', 'surname/last name', 'l_name', 'lname', 'family surname', 'family last name', 'family_name(s)', 'family/last name', 'sirname', 'patronymic', 'familyname_lastname'],
  Age: ['age', 'age (years)', 'years', 'years old', 'age in years', 'age (in years)', 'years of age', 'age (in yrs)', 'age_years', 'yearsold', 'years_inc', 'years_age', 'age (numeric)', 'numeric age', 'age (in digits)', 'age (num)', 'years (num)', 'age_value', 'agenum', 'age_digits', 'years_numeric'],
  IDNum: ['id number', 'id num', 'id numbers', 'idnum', 'id no', 'identification numbers', 'id', 'id#', 'id_code', 'id_code_number', 'id_reference', 'identifier', 'personid', 'patientid', 'recordid', 'uniqueid', 'membershipid'],
  DOB: ['dob', 'date of birth', 'birth date', 'birthdate', 'date_birth', 'dob (yyyy-mm-dd)', 'date of birth (yyyy-mm-dd)', 'birth_date', 'dob (dd-mm-yyyy)', 'date of birth (dd-mm-yyyy)', 'dob (mm/dd/yyyy)', 'date of birth (mm/dd/yyyy)', 'dateofbirth', 'birthdate (yyyy-mm-dd)', 'birthdate (dd/mm/yyyy)', 'dob (numeric)', 'date_of_birth', 'birth_dt', 'dob_date', 'birth_date (yyyy-mm-dd)'],
  Locality: ['locality', 'area', 'region', 'district', 'neighborhood', 'community', 'place', 'zone', 'sector', 'location', 'locale'],
  AdmissionThru: ['admitthru', 'admissionthrough', 'admitthrough', 'admission through', 'admission method', 'admission source', 'enrollment method', 'enrollment source', 'entry mode', 'mode of admission', 'admission pathway', 'admission channel', 'admission route', 'application channel', 'application method', 'registration mode', 'enrollment process', 'admission type', 'admission source', 'enrollment path', 'entry point', 'admission methodology', 'admission modality'],
  AdmissionWard: ['admission ward', 'ward', 'admitting ward', 'admission unit', 'hospital ward', 'inpatient ward', 'patient ward', 'medical ward', 'department', 'admission location', 'inpatient unit', 'ward name', 'ward/unit', 'admission division', 'hospital unit', 'admission section', 'ward/department', 'clinical ward', 'admission area', 'specialty ward'],
  AdmitDate: ['admit date', 'admission date', 'date of admission', 'entry date', 'hospitalization date', 'admission_dt', 'date_admit', 'admission_date', 'date_in', 'inpatient date', 'date_of_entry', 'admission_date (yyyy-mm-dd)', 'admission_date (dd/mm/yyyy)', 'date_of_admission', 'admit_date', 'date_hospitalization', 'date_of_hospitalization', 'date_inpatient', 'admit_date (numeric)', 'admission_date_value'],
  Consultant: ['attending consultant', 'medical consultant', 'physician', 'doctor', 'specialist', 'clinical consultant', 'consulting physician', 'consulting doctor', 'primary consultant', 'attending doctor', 'clinical specialist', 'consultant physician', 'consultant doctor', 'consultant_name', 'consultant_surname', 'consultant_lastname', 'consultant_firstname', 'consultant_id', 'consultant_code'],
  MainDiagnosis: ['maindiagnosis', 'primary diagnosis', 'principal diagnosis', 'diagnosis', 'primary condition', 'main condition', 'main problem', 'main health issue', 'major diagnosis', 'key diagnosis', 'primary dx', 'primary dgn', 'main dx', 'main dgn', 'diagnosis code', 'diagnosis description', 'diagnosis name', 'main diagnostic', 'major condition', 'primary health issue'],
  OtherDiagnosis: ['otherdiagnosis', 'secondary diagnosis', 'any other diagnosis', 'additional diagnosis', 'comorbidities', 'co-occurring diagnoses', 'other conditions', 'other health issues', 'secondary conditions', 'additional conditions', 'other dx', 'other dgn', 'other diagnoses', 'diagnosis (other)', 'additional dx', 'additional dgn', 'other diagnosis code', 'other diagnosis description', 'other diagnosis name', 'secondary diagnostic', 'additional health issues'],
  Bowels: ['bowels', 'barthel admission bowels', 'barthel admission bowels status', 'admission bowel function (barthel)', 'barthel index - bowel admission', 'bowel function at admission (barthel scale)', 'barthel bowel status on admission', 'admission bowel performance (barthel)', 'barthel assessment - bowel admission', 'bowel function on admission (barthel index)', 'barthel bowel score - admission', 'bartheladmbowels', 'bartheladmissionbowels', 'admbarthelbowels'],
  Bladder: ['bartheladmbladder', 'bladderbartheladm', 'admbladder', 'bladder', 'barthel admission bladder', 'barthel admission bladder status', 'admission bladder function (barthel)', 'barthel index - bladder admission', 'bladder function at admission (barthel scale)', 'barthel bladder status on admission', 'admission bladder performance (barthel)', 'barthel assessment - bladder admission', 'bladder function on admission (barthel index)', 'barthel bladder score - admission', 'bartheladmbladder', 'bartheladmissionbladder', 'admbarthelbladder'],
  Dressing: ['bartheladmdressing', 'dressingbartheladm', 'admdressing', 'dressing', 'barthel admission dressing', 'barthel admission dressing status', 'admission dressing function (barthel)', 'barthel index - dressing admission', 'dressing function at admission (barthel scale)', 'barthel dressing status on admission', 'admission dressing performance (barthel)', 'barthel assessment - dressing admission', 'dressing function on admission (barthel index)', 'barthel dressing score - admission', 'bartheladmdressing', 'bartheladmissiondressing','admbartheldressing'],
  Feeding: ['bartheladmfeeding', 'feedingbartheladm', 'admfeeding', 'feeding', 'barthel admission feeding', 'barthel admission feeding status', 'admission feeding function (barthel)', 'barthel index - feeding admission', 'feeding function at admission (barthel scale)', 'barthel feeding status on admission', 'admission feeding performance (barthel)', 'barthel assessment - feeding admission', 'feeding function on admission (barthel index)', 'barthel feeding score - admission', 'bartheladmfeeding', 'bartheladmissionfeeding', 'admbarthelfeeding'],
  Grooming: ['bartheladmgrooming', 'groomingbartheladm', 'admgrooming', 'grooming', 'barthel admission grooming', 'barthel admission grooming status', 'admission grooming function (barthel)', 'barthel index - grooming admission', 'grooming function at admission (barthel scale)', 'barthel grooming status on admission', 'admission grooming performance (barthel)', 'barthel assessment - grooming admission', 'grooming function on admission (barthel index)', 'barthel grooming score - admission', 'bartheladmgrooming', 'bartheladmissiongrooming', 'admbarthelgrooming'],
  Mobility: ['bartheladmmobility', 'mobilitybartheladm', 'admmobility', 'mobility', 'barthel admission mobility', 'barthel admission mobility status', 'admission mobility function (barthel)', 'barthel index - mobility admission', 'mobility function at admission (barthel scale)', 'barthel mobility status on admission', 'admission mobility performance (barthel)', 'barthel assessment - mobility admission', 'mobility function on admission (barthel index)', 'barthel mobility score - admission', 'bartheladmmobility', 'bartheladmissionmobility', 'admbarthelmobility'],
  Stairs: ['bartheladmstair', 'stairsbartheladm', 'admstair', 'stair', 'stairs', 'barthel admission stairs', 'barthel admission stairs status', 'admission stairs function (barthel)', 'barthel index - stairs admission', 'stairs function at admission (barthel scale)', 'barthel stairs status on admission', 'admission stairs performance (barthel)', 'barthel assessment - stairs admission', 'stairs function on admission (barthel index)', 'barthel stairs score - admission', 'bartheladmstairs', 'bartheladmissionstairs', 'admbarthelstairs'],
  Toilet: ['toilet use', 'bartheladmtoilet', 'toiletbartheladm', 'admtoilet', 'admtoiletuse', 'toilets', 'toiletuse', 'toilet', 'barthel admission toilet use', 'barthel admission toilet use status', 'admission toilet use function (barthel)', 'barthel index - toilet admission', 'toilet function at admission (barthel scale)', 'barthel toilet status on admission', 'admission toilet performance (barthel)', 'barthel assessment - toilet use admission', 'toilet function on admission (barthel index)', 'barthel toilet score - admission', 'bartheladmtoilet', 'bartheladmissiontoilet', 'admbartheltoiletuse'],
  Bathing: ['bartheladmbathing', 'bathingbartheladm', 'admbathing', 'bathing', 'barthel admission bathing', 'barthel admission bathing status', 'admission bowel function (barthel)', 'barthel index - bowel admission', 'bowel function at admission (barthel scale)', 'barthel bowel status on admission', 'admission bowel performance (barthel)', 'barthel assessment - bowel admission', 'bowel function on admission (barthel index)', 'barthel bowel score - admission', 'bartheladmbathing', 'bartheladmissionbathing', 'admbarthelbathing'],
  Transfers: ['transferring', 'bartheladmtransfers', 'transfersbartheladm', 'admtransfers', 'transfers', 'barthel admission transfers', 'barthel admission transfers status', 'admission bowel function (barthel)', 'barthel index - bowel admission', 'bowel function at admission (barthel scale)', 'barthel bowel status on admission', 'admission bowel performance (barthel)', 'barthel assessment - bowel admission', 'bowel function on admission (barthel index)', 'barthel bowel score - admission', 'bartheladmtransfers', 'bartheladmissiontransfers', 'admbartheltransfers'], 
}

// Function to find the mapped header for a given variation
const findMappedHeader = (header) => {
  const mappedHeader = Object.keys(headerMappings).find((key) =>
    headerMappings[key].some((variation) => variation.toLowerCase() === header.toLowerCase())
  );
  return mappedHeader || header; // If no mapping is found, return the original header
};

// Function to handle the dropped file
const handleDroppedFile = async (file) => {
  if (!file || !file.name.endsWith('.xlsx')) {
    toast.error('Invalid file format. Please upload an Excel file (.xlsx).');
    return;
  }

  const workbook = await new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: 'array' });
      resolve(workbook);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
    fileReader.readAsArrayBuffer(file);
  });

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

  const requiredHeaders = [
    'Age', 'DOB', 'FirstName', 'IDNum', 'LastName', 'Locality', 'Sex',
    'AdmissionThru', 'AdmissionWard', 'AdmitDate', 'Consultant', 'MainDiagnosis', 'OtherDiagnosis',
    'Bowels', 'Transfers', 'Bladder', 'Dressing', 'Feeding', 'Grooming', 'Mobility',
    'Stairs', 'Toilet', 'Bathing'
  ];

  const mappedHeaders = jsonData[0].map((header) => findMappedHeader(header));

  const missingHeaders = requiredHeaders.filter((requiredHeader) => !mappedHeaders.some((mappedHeader) => mappedHeader.toLowerCase() === requiredHeader.toLowerCase()));
  if (missingHeaders.length > 0) {
    const confirmResult = window.confirm(
      `The following details will not be added to the patient's information as they cannot be found in your file:\n\n${missingHeaders.join(', ')}\n\nDo you want to proceed?`
    );
    if (!confirmResult) {
      return;
    }
  }
  
  const sexHeaderIndex = jsonData[0].indexOf('Sex');
  const sexColumn = jsonData.slice(1).map(row => row[sexHeaderIndex]);
  const uniqueSexValues = [...new Set(sexColumn)];
  if (uniqueSexValues.length !== 2 || !uniqueSexValues.includes('M') || !uniqueSexValues.includes('F')) {
    toast.error(`The "Sex" column must contain either "M" or "F".\nValues found: ${uniqueSexValues.join(', ')}`);
    return;
  }

  const headersToProcess = requiredHeaders.filter(header => !missingHeaders.includes(header));

  jsonData.forEach(async (row, index) => {
    if (index === 0) return; // To skip the header row

    const patientData = {};

    headersToProcess.forEach((header) => {
      const headerIndex = jsonData[0].indexOf(header);
      if (headerIndex !== -1) {
        const value = row[headerIndex];
        const mappedHeader = findMappedHeader(header);
        patientData[mappedHeader] = value;
      }
    });

    try {
      await addDoc(collection(db, 'patients'), patientData);
    } catch (error) {
      toast.error('Error adding patient data to the database');
      console.error('Error adding patient data to the database:', error);
    }
  });

  toast.success('Patients successfully imported. Refresh the page to view.');
};

export { handleDroppedFile };