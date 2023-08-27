import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { format } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// @mui
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Button, Container, Stack, Typography, TextField, InputLabel, FormControl, Select, MenuItem, Box } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";

import { getDocs, doc, updateDoc, addDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import Iconify from '../components/iconify';
// components
import { isNameValid, isAgeValid, isIDNumValid, isAdminDateValid, isDOBValid, } from '../validations/validation'
import CustomBox from '../layouts/CustomBox';
import { handleDroppedFile } from '../sections/@dashboard/patient/import';
// ----------------------------------------------------------------------

// Function to calculate age based on DOB
const calculateAge = (dob) => {
  const currentDate = new Date();
  const birthDate = new Date(dob);
  let age = currentDate.getFullYear() - birthDate.getFullYear(); // Reduced year of birth with current year
  const monthDiff = currentDate.getMonth() - birthDate.getMonth(); // Reduced month of birth with current month
  if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) { age -= 1; }
  return age;
};

export default function NewPatientPage() {
  const navigate = useNavigate();
  const [wards, setWards] = useState([]);

  // Used to get list of wards & available beds from wards collection
  useEffect(() => {
    const fetchWards = async () => {
      const wardsCollectionRef = collection(db, 'wards');
      const wardsSnapshot = await getDocs(wardsCollectionRef);
      const wardsData = wardsSnapshot.docs.map((doc) => doc.data());
      setWards(wardsData);
    };
    fetchWards();
  }, []);

  // Checks if user is logged in
  const [setIsAuthenticated] = useState(false);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true); // User is logged in
      } else {
        setIsAuthenticated(false); // User is logged out
      }
    });
    // Unsubscribe from the authentication listener when the component unmounts
    return () => unsubscribe();
  }, [setIsAuthenticated]);

  // Store and set patient details from patient collection in Firestore
  // Patient Personal Details
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newIDNum, setNewIDNum] = useState("");
  const [newSex, setNewSex] = useState('');
  const [newLocality, setNewLocality] = useState('');
  const [newAge, setNewAge] = useState(0);
  const [newDOB, setNewDOB] = useState("");

  // Next of Kin Details
  const [kinName, setKinName] = useState('');
  const [kinRelation, setKinRelation] = useState('');
  const [kinContact, setKinContact] = useState('');
  const [setKinCollectionRef] = useState(null);

  // Admission Details
  const [newAdmDate, setNewAdmDate] = useState("");
  const [newAdmThru, setNewAdmThru] = useState('');
  const [newAdmConsultant, setNewAdmConsultant] = useState('');
  const [newAdmMainDiag, setNewAdmMainDiag] = useState("");
  const [newAdmOtherDiag, setNewAdmOtherDiag] = useState("");
  const [newAdmWard, setNewAdmWard] = useState('');

  // List inside drop-down menu
  const localities = [ "Attard", "Balzan", "Birkirkara", "Birżebbuġa", "Cospicua", "Dingli", "Fgura", "Floriana", "Fontana", "Gudja", "Għajnsielem", "Għarb", "Għargħur", "Għasri", "Għaxaq", "Gżira", "Iklin", "Il-Gżira", "Imdina", "Imqabba", "Imsida", "Imtarfa", "Imġarr", "Kalkara", "Kerċem", "Kirkop", "Lija", "Luqa", "Marsa", "Marsaskala", "Marsaxlokk", "Mellieħa", "Mosta", "Munxar", "Nadur", "Naxxar", "Paola", "Pembroke", "Pieta", "Qala", "Qormi", "Qrendi", "Rabat, Malta", "Safi", "Saint Pauls Bay", "San Lawrenz", "San Ġiljan", "San Ġwann", "Sannat", "Santa Luċija", "Santa Venera", "Senglea", "Siġġiewi", "Sliema", "Swieqi", "Tarxien", "Ta Xbiex", "Valletta", "Victoria", "Vittoriosa", "Xagħra", "Xewkija", "Xgħajra", "Ħamrun", "Żabbar", "Żebbuġ", "Żejtun", "Żurrieq", ];
  const consultants = [ "Dr. S. Abela", "Dr. E. Bellia", "Dr. J. Cordina", "Dr. S. Dalli", "Dr. J. Dimech", "Dr. B. Farrugia", "Dr. P. Ferry", "Dr. S. La Maestra", "Dr. M. A. Vassallo", ];

  // patient collection in Firestore
  const patientCollectionRef = collection(db, "patients");
 
  // Changes format of date to "1900-1-1"
  const handleDOBInputChange = (dateString) => {
    const dateDOB = new Date(dateString);
    const formattedDate = format(dateDOB, 'yyyy-MM-dd');
    setNewDOB(formattedDate);
    const newAge = calculateAge(dateDOB); // uses calculateAge to set patient's age based off DOB
    setNewAge(newAge);
  };
  const handleAdmDateInputChange = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = format(date, 'yyyy-MM-dd');
    setNewAdmDate(formattedDate);
  }

  // When a file is dragged to the Dialog popup
  const [isFileDragging, setIsFileDragging] = useState(false);

  // Set up event listeners for handling drag-and-drop interactions for a file upload in the drop area
  useEffect(() => {
    const handleDragEnter = (event) => {
      event.preventDefault();
      // Check if the dragged element is not the file upload input itself.
      if (!event.target.classList.contains('file-upload-input')) {
        setIsFileDragging(true); // Indicates that a file is being dragged over the drop area.
        event.dataTransfer.dropEffect = 'copy'; // Sets the drop effect to copy the file
      }
    };
    const handleDragOver = (event) => {
      event.preventDefault();
      if (!event.target.classList.contains('file-upload-input')) { event.dataTransfer.dropEffect = 'copy'; } // Sets the drop effect to copy the file
    };
    const handleDragLeave = (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) { setIsFileDragging(false); } // Indicates that the file is no longer being dragged over the drop area
    };

    // Links to 'import.js' to process and upload records to Firebase
    const handleDrop = (event) => {
      event.preventDefault();
      setIsFileDragging(false); // File dropped
      const {files} = event.dataTransfer;
      if (files.length > 0) {
        const file = files[0]; // First file
        handleDroppedFile(file);
      }
    };

    // Add event listeners for drag and drop
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    // Clean up event listeners when component unmounts to prevent memory leaks
    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Links to 'import.js' to process and upload records to Firebase
  // When file is uploaded using the button rather than drag-and-drop
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    handleDroppedFile(file);
  };

  const [openDialog, setOpenDialog] = useState(false); // Used for the popup Dialog to "Add new patients"
  const handleOpenDialog = () => { setOpenDialog(true); };
  const handleCloseDialog = () => { setOpenDialog(false); };

  // VALIDATIONS -- check validations/validation.js
  const [fieldValidity, setFieldValidity] = useState({
    firstName: true,
    lastName: true,
    idNum: true,
    age: true,
    dob: true,
  });

  useEffect(() => {
    const isValid = isNameValid(newFirstName);
    setFieldValidity((prevState) => ({ ...prevState, firstName: isValid }));
  }, [newFirstName]);
  useEffect(() => {
    const isValid = isNameValid(newLastName);
    setFieldValidity((prevState) => ({ ...prevState, lastName: isValid }));
  }, [newLastName]);
  useEffect(() => {
    const isValid = isIDNumValid(newIDNum);
    setFieldValidity((prevState) => ({ ...prevState, idNum: isValid }));
  }, [newIDNum]);
  useEffect(() => {
    const isValid = isAgeValid(newAge);
    setFieldValidity((prevState) => ({ ...prevState, age: isValid }));
  }, [newAge]);  
  useEffect(() => {
    const isValid = isDOBValid(newDOB);
    setFieldValidity((prevState) => ({ ...prevState, dob: isValid }));
  }, [newDOB]); 
  useEffect(() => {
    const isValid = isAdminDateValid(newAdmDate);
    setFieldValidity((prevState) => ({ ...prevState, admDate: isValid }));
  }, [newAdmDate]); 
  // END OF VALIDATIONS
  
  const onSubmitPatientDetails = async () => {
    // Check if fields are valid
    if (
      !fieldValidity.firstName ||
      !fieldValidity.lastName ||
      !fieldValidity.idNum ||
      !fieldValidity.age ||
      !fieldValidity.dob
    ) {
      toast.error('Please make sure to fill in all the fields properly.');
      return;
    }
  
    try {
      // Add personal details to new patient collection document
      const newPatientDocRef = await addDoc(patientCollectionRef, {
        FirstName: newFirstName,
        LastName: newLastName,
        IDNum: newIDNum,
        Sex: newSex,
        Age: newAge,
        DOB: newDOB,
        Locality: newLocality,
      });
      // Update the new patient document with admission details, placed in "admissiondetails" map
      await updateDoc(doc(db, "patients", newPatientDocRef.id), {
        admissiondetails: {
          AdmissionThru: newAdmThru,
          AdmissionWard: newAdmWard,
          AdmitDate: newAdmDate,
          Consultant: newAdmConsultant,
          MainDiagnosis: newAdmMainDiag,
          OtherDiagnosis: newAdmOtherDiag,
        },
      });
      // Update the new patient document with next of kin details if available, placed in "kin" subcollection
      if (kinName) {
        const kinCollectionRef = collection(patientCollectionRef, newPatientDocRef.id, 'kin');
        const kinDocRef = doc(kinCollectionRef);
        await setDoc(kinDocRef, {
          name: kinName,
          relation: kinRelation,
          contact: kinContact,
        });
      }
      const kinCollectionRef = collection(patientCollectionRef, newPatientDocRef.id, 'kin');
      setKinCollectionRef(kinCollectionRef);
      
      // Store user in "Recently Updated" list, recentpatients collection
      const recentPatientsCollectionRef = collection(db, "recentpatients");
      const recentPatientDocRef = doc(recentPatientsCollectionRef);
      await setDoc(recentPatientDocRef, {
        FirstName: newFirstName,
        LastName: newLastName,
        IDNum: newIDNum,
        LastAccessed: serverTimestamp(),
      });
  
      toast.success('Patient details submitted successfully!');
      navigate('/dashboard/patientlist');
    } catch (e) {
      toast.error('An error occurred while submitting the details. Please try again.');
    }
  };  

  // When DOB field is changed, updates age value
  useEffect(() => {
    if (newDOB) {
      const dateDOB = new Date(newDOB);
      const newAge = calculateAge(dateDOB);
      setNewAge(newAge);
    }
  }, [newDOB]);

  // Test - Temp removed while testing due to reloading sending user to login immediately
  // if (!isAuthenticated) {
  //   navigate('/login');
  //   return null;
  // }
  return (
    <>
      <Helmet>
        <title> Add New Patient | KGH </title>
      </Helmet> 

      {/* Dialog popup containing a button to go to "Add New Patient" page and a drag-and-drop box to upload records in bulk */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Upload in Bulk</DialogTitle>
          <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
          <DialogContent>
            <Container>
              <input type="file" id="file-upload-input" className="file-upload-input" accept=".xlsx" onChange={handleFileUpload} style={{display: 'none'}}/>
              <label htmlFor="file-upload-input" 
                onDragOver={(e) => e.preventDefault()} // When user starts dragging a file over the box
                onDragEnter={(e) => { e.preventDefault(); setIsFileDragging(true); }} // Handles the drop effect to copy the file
                onDragLeave={(e) => { e.preventDefault(); setIsFileDragging(false); }} // When user drags over the box and leaves
                style={{ padding: '2rem', backgroundColor: isFileDragging ? 'cyan' : 'lightblue', border: '2px dashed gray', borderRadius: '5px', cursor: 'pointer', height: '750px',
                  width: '100%', margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', outline: 'none',}}>
                <Iconify icon="eva:upload-fill" style={{ width: '65px', height: '65px', marginRight: '0.5rem' }} />
                <Typography sx={{mt: 3}}variant="h4" gutterBottom>Drag and drop your XLSX file here</Typography>
                <Typography sx={{mt: 1, mb: 2}} gutterBottom>
                  Ensure that the file is in <b>.XLSX</b> format and that the first row contains the headers with some of the following patient details:<br /><hr />
                {/* List of possible values accepted by the process to be entered in bulk. */}
                <Typography variant="h6" sx={{mb: 2}}>Personal Details</Typography>
                <ul style={{columns: '3', listStyle:'none'}}>
                  <li>ID Number</li>
                  <li>First Name</li>
                  <li>Last Name</li>
                  <li>Sex (M/F)</li>
                  <li>Age</li>
                  <li>Date of Birth</li>
                  <li>Locality</li>
                </ul><br /><hr />
                <Typography variant="h6" sx={{mb: 2}}>Admission Details</Typography>
                <ul style={{columns: '3', listStyle:'none'}}>
                  <li>Admission Through</li>
                  <li>Admission Ward</li>
                  <li>Date of Admission</li>
                  <li>Consultant</li>
                  <li>Main Diagnosis</li>
                  <li>Past Medical History (Other diagnosis)</li>
                </ul><br /><hr />
                <Typography variant="h6" sx={{mb: 2}}>Barthel Admission Scores</Typography>
                  <ul style={{columns: '3', listStyle:'none'}}>
                    <li>Bowels</li>
                    <li>Transferring</li>
                    <li>Bladder</li>
                    <li>Mobility</li>
                    <li>Grooming</li>
                    <li>Dressing</li>
                    <li>Toilet Use</li>
                    <li>Stairs</li>
                    <li>Feeding</li>
                    <li>Bathing</li>
                  </ul><br /><hr />
                </Typography>
                {/* Unless user is dragging a file, "Browse Files" appears, allowing user to click on it and pick a file through browsing file explorer. */}
                {/* Tablet/Mobile Phone friendly */}
                <Button variant="contained" startIcon={<Iconify icon="eva:upload-fill" />}>{isFileDragging ? 'Drop the file here' : 'browse files'}</Button>
                <br />
              </label>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
          </DialogActions>
        </Dialog>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{mb: 3}}>
          <Typography variant="h4" gutterBottom>
            Add New Patient
          </Typography>
          <Button variant='contained' sx={{ml: 2}} onClick={handleOpenDialog} startIcon={<Iconify icon="material-symbols:upload" />}>Upload in Bulk</Button>
        </Stack>
        <CustomBox>
          <Typography variant="h6" gutterBottom> Personal Details </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
            <TextField
              required
              id="firstName"
              name="firstName"
              label="First Name"
              fullWidth
              autoComplete="given-name"
              variant="standard"
              onChange={(e) => setNewFirstName(e.target.value)}
              error={!fieldValidity.firstName}
              helperText={!fieldValidity.firstName && "Use only letters, '.', or '-'"}
            />
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
              required
              id="lastName"
              name="lastName"
              label="Last Name"
              fullWidth
              autoComplete="family-name"
              variant="standard"
              onChange={(e) => setNewLastName(e.target.value)}
              error={!fieldValidity.lastName}
              helperText={!fieldValidity.lastName && "Use only letters, '.', or '-'"}
            />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                required
                id="idnum"
                name="idnum"
                label="ID Card Number"
                fullWidth
                autoComplete="idnum"
                variant="standard"
                onChange={(e) => setNewIDNum(e.target.value)}
                error={!fieldValidity.idNum}
                helperText={!fieldValidity.idNum && "The format should be numbers, followed by a letter."}
              />
            </Grid>
            {/* Onchange, updates the age value as well */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker id="dob" name="dob" slotProps={{ textField: { fullWidth: true } }} format="DD-MM-YYYY" label="Date of Birth" onChange={(date) => handleDOBInputChange(date)} error={!fieldValidity.dob} helperText={!fieldValidity.dob && "Please input a valid date."}/>
              </LocalizationProvider>
            </Grid> 
             {/* Disabled input for user, only DOB needs to be inputted for this value to be updated automatically. */}
            <Grid item xs={12} sm={6}>
              <TextField id="age" name="age" label="Age" fullWidth autoComplete="age" variant="standard" type="number" value={newAge} inputProps={{ max: 120, readOnly: true }} disabled onChange={(e) => setNewAge(Number(e.target.value))} error={!fieldValidity.age} helperText={!fieldValidity.age && "Please input only numbers between 0 and 120."}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                  Sex
                </InputLabel>
                <Select labelId="sex" id="sex" label="Sex" value={newSex} onChange={(e) => setNewSex(e.target.value)}>
                  <MenuItem value={"M"}>Male</MenuItem>
                  <MenuItem value={"F"}>Female</MenuItem>
                   {/* Use of M and F options only is based off KGH hospital datasets */}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                  Locality
                </InputLabel>
                {/* Maps list of localities based off 'localities' list */}
                <Select labelId="locality" id="locality" label="Locality" value={newLocality} onChange={(e) => setNewLocality(e.target.value)}>
                  {localities.map((locality) => (
                    <MenuItem key={locality} value={locality}>
                      {locality}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
           {/* Optional, can only add one NOK but 'Patient Details' allows for whole list. */}
          <Typography sx={{mt: 4}} variant="h6" gutterBottom> Next of Kin Details </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField id="kinName" label="Next of Kin Name" fullWidth variant="standard" value={kinName} onChange={(e) => setKinName(e.target.value)}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField id="kinRelation" label="Relation to Patient" fullWidth variant="standard" value={kinRelation} onChange={(e) => setKinRelation(e.target.value)}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField id="kinContact" label="Contact Details" fullWidth variant="standard" value={kinContact} onChange={(e) => setKinContact(e.target.value)}/>
            </Grid>
          </Grid>
        </CustomBox>

        <CustomBox>
          <Typography variant="h6" gutterBottom>
            Admission Details
          </Typography>
          <Grid container spacing={3}>
            {/* Updates value from default to "1900-1-1" format */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker id="admissiondate" name="admissiondate" slotProps={{ textField: { fullWidth: true } }} format="DD-MM-YYYY" label="Admission Date"  onChange={(date) => handleAdmDateInputChange(date)} error={!fieldValidity.admDate} helperText={!fieldValidity.admDate && "Please input a valid date."}/>
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Admission Through </InputLabel>
                <Select labelId="admissionthru" id="admissionthru" label="Admission Through" value={newAdmThru} onChange={(e) => setNewAdmThru(e.target.value)}>
                  <MenuItem value={"Internal Transfer"}>Internal Transfer</MenuItem>
                  <MenuItem value={"MDH"}>Mater Dei Hospital</MenuItem>
                  <MenuItem value={"Own Home"}>Own Home</MenuItem>
                  <MenuItem value={"Care Home"}>Care Home</MenuItem>
                  <MenuItem value={"Private Hospital"}>Private Hospital</MenuItem>
                  <MenuItem value={"Other"}>Other Government Hospital</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Consultant </InputLabel>
                {/* Maps list of consultants based off 'consultants' list */}
                <Select labelId="consultant" id="consultant" label="Consultant" value={newAdmConsultant} onChange={(e) => setNewAdmConsultant(e.target.value)}>
                  {consultants.map((consultant) => (
                    <MenuItem key={consultant} value={consultant}>
                      {consultant}
                    </MenuItem>
                  ))}    
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CustomBox>

        <CustomBox>
          <Typography variant="h6" gutterBottom>
            Reason for Admission
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} onChange={(e) => setNewAdmMainDiag(e.target.value)}>
              <TextField id="maindiagnosis" name="maindiagnosis" label="Main Diagnosis" fullWidth variant="standard"/>
            </Grid>
            <Grid item xs={12} sm={6} onChange={(e) => setNewAdmOtherDiag(e.target.value)}>
              <TextField id="otherdiagnosis" name="otherdiagnosis" label="Past Medical History" fullWidth variant="standard"/> {/* Changed to "Past Medical History" based off Domain Expert preferences */}
            </Grid>
          </Grid>
        </CustomBox>

        <CustomBox>
          <Grid>
            <Typography variant="h6" gutterBottom> Pick Ward </Typography>
            <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
              <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Current Ward </InputLabel>
              {/* Maps list of wards and available beds based off wards collection */}
              <Select labelId="currentward" id="currentward" label="Current Ward" value={newAdmWard} onChange={(e) => setNewAdmWard(e.target.value)}>
                {wards
                  .sort((a, b) => a.wardno - b.wardno)
                  .map((ward) => (
                    <MenuItem
                      key={ward.wardno}
                      value={ward.wardno}
                      disabled={ward.available === 0}
                      sx={{ color: ward.available === 0 ? 'red' : 'inherit' }}
                    >
                      {`Reh Ward ${ward.wardno}: ${ward.available} available beds`}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        </CustomBox>
      </Container>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        {/* Onsubmit patient's details are saved to patient collection in Firestore */}
        <Button variant="contained" startIcon={<Iconify icon="formkit:submit" />} sx={{ mx: 2, fontSize: '1.1rem', padding: '8px 16px' }} onClick={onSubmitPatientDetails}>
          Submit Details
        </Button>
      </Box>
    </>
  );
}
