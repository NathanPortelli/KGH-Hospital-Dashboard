import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { format } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// @mui
import { Grid, Button, Container, Stack, Typography, TextField, InputLabel, Input, FormControl, Select, MenuItem, Box } from '@mui/material';

import { getDocs, doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import Iconify from '../components/iconify';

import { isNameValid, isAgeValid, isIDNumValid, isAdminDateValid, isDOBValid, } from '../validations/validation'
import CustomBox from '../layouts/CustomBox';

// ----------------------------------------------------------------------

export default function NewPatientPage() {
  const navigate = useNavigate();
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const fetchWards = async () => {
      const wardsCollectionRef = collection(db, 'wards');
      const wardsSnapshot = await getDocs(wardsCollectionRef);
      const wardsData = wardsSnapshot.docs.map((doc) => doc.data());
      setWards(wardsData);
    };

    fetchWards();
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  }, []);

  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newIDNum, setNewIDNum] = useState("");
  const [newSex, setNewSex] = useState("");
  const [newLocality, setNewLocality] = useState("");
  const [newAge, setNewAge] = useState(0);
  const [newDOB, setNewDOB] = useState("");

  const [newAdmDate, setNewAdmDate] = useState("");
  const [newAdmThru, setNewAdmThru] = useState("");
  const [newAdmConsultant, setNewAdmConsultant] = useState("");
  const [newAdmMainDiag, setNewAdmMainDiag] = useState("");
  const [newAdmOtherDiag, setNewAdmOtherDiag] = useState("");
  const [newAdmWard, setNewAdmWard] = useState("");

  const localities = [ "Attard", "Balzan", "Birkirkara", "Birżebbuġa", "Cospicua", "Dingli", "Fgura", "Floriana", "Fontana", "Gudja", "Għajnsielem", "Għarb", "Għargħur", "Għasri", "Għaxaq", "Gżira", "Iklin", "Il-Gżira", "Imdina", "Imqabba", "Imsida", "Imtarfa", "Imġarr", "Kalkara", "Kerċem", "Kirkop", "Lija", "Luqa", "Marsa", "Marsaskala", "Marsaxlokk", "Mellieħa", "Mosta", "Munxar", "Nadur", "Naxxar", "Paola", "Pembroke", "Pieta", "Qala", "Qormi", "Qrendi", "Rabat, Malta", "Safi", "Saint Pauls Bay", "San Lawrenz", "San Ġiljan", "San Ġwann", "Sannat", "Santa Luċija", "Santa Venera", "Senglea", "Siġġiewi", "Sliema", "Swieqi", "Tarxien", "Ta Xbiex", "Valletta", "Victoria", "Vittoriosa", "Xagħra", "Xewkija", "Xgħajra", "Ħamrun", "Żabbar", "Żebbuġ", "Żebbuġ", "Żejtun", "Żurrieq", ];
  const consultants = [ "Dr. S. Abela", "Dr. E. Bellia", "Dr. J. Cordina", "Dr. S. Dalli", "Dr. J. Dimech", "Dr. B. Farrugia", "Dr. P. Ferry", "Dr. S. La Maestra", "Dr. M. A. Vassallo", ];

  const patientCollectionRef = collection(db, "patients");

  const setFormattedDate = (dateString) => {
    const dateDOB = new Date(dateString);
    const formattedDate = format(dateDOB, 'yyyy-MM-dd');
    setNewDOB(formattedDate);
  };

  // VALIDATIONS
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
      const newPatientDocRef = await addDoc(patientCollectionRef, {
        FirstName: newFirstName,
        LastName: newLastName,
        IDNum: newIDNum,
        Sex: newSex,
        Age: newAge,
        DOB: newDOB,
        Locality: newLocality,
      });
  
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
  
      toast.success('Patient details submitted successfully!');
      navigate('/dashboard/patientlist');
    } catch (e) {
      toast.error('An error occurred while submitting the details. Please try again.');
    }
  };  

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  return (
    <>
      <Helmet>
        <title> Add New Patient | KGH </title>
      </Helmet> 

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Add New Patient
          </Typography>
        </Stack>

        <CustomBox>
          <Typography variant="h6" gutterBottom>
            Personal Details
          </Typography>
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
            <Grid item xs={12} sm={6}>
              <TextField
                id="age"
                name="age"
                label="Age"
                fullWidth
                autoComplete="age"
                variant="standard"
                type="number"
                inputProps={{ max: 120, inputcomponent: Input }}
                onChange={(e) => setNewAge(Number(e.target.value))}
                error={!fieldValidity.age}
                helperText={!fieldValidity.age && "Please input only numbers between 0 and 120."}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker id="dob" name="dob" slotProps={{ textField: { fullWidth: true } }} format="DD-MM-YYYY" label="Date of Birth" onChange={(date) => setFormattedDate(date)} error={!fieldValidity.dob} helperText={!fieldValidity.dob && "Please input a valid date."}/>
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                  Sex
                </InputLabel>
                <Select labelId="sex" id="sex" label="Sex" onChange={(e) => setNewSex(e.target.value)}>
                  <MenuItem value={"M"}>Male</MenuItem>
                  <MenuItem value={"F"}>Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
              <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                Locality
              </InputLabel>
                <Select labelId="locality" id="locality" label="Locality" onChange={(e) => setNewLocality(e.target.value)}>
                  {localities.map((locality) => (
                    <MenuItem key={locality} value={locality}>
                      {locality}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CustomBox>

        <CustomBox>
          <Typography variant="h6" gutterBottom>
            Admission Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker id="admissiondate" name="admissiondate" slotProps={{ textField: { fullWidth: true } }} format="DD-MM-YYYY" label="Admission Date" onChange={(date) => setFormattedDate(date)} error={!fieldValidity.admDate} helperText={!fieldValidity.admDate && "Please input a valid date."}/>
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Admission Through </InputLabel>
                <Select labelId="admissionthru" id="admissionthru" label="Admission Through" onChange={(e) => setNewAdmThru(e.target.value)}>
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
                <Select labelId="consultant" id="consultant" label="Consultant" onChange={(e) => setNewAdmConsultant(e.target.value)}>
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
              <TextField id="otherdiagnosis" name="otherdiagnosis" label="Other Diagnosis" fullWidth variant="standard"/>
            </Grid>
          </Grid>
        </CustomBox>

        <CustomBox>
          <Grid>
            <Typography variant="h6" gutterBottom> Pick Ward </Typography>
            <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
              <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Current Ward </InputLabel>
              <Select labelId="currentward" id="currentward" label="Current Ward" onChange={(e) => setNewAdmWard(e.target.value)}>
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
        <Button variant="contained" startIcon={<Iconify icon="formkit:submit" />} sx={{ mx: 2, fontSize: '1.1rem', padding: '8px 16px' }} onClick={onSubmitPatientDetails}>
          Submit Details
        </Button>
      </Box>
    </>
  );
}
