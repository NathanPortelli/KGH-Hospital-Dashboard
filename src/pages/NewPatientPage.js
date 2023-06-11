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
        // User is logged in
        setIsAuthenticated(true);
      } else {
        // User is logged out
        setIsAuthenticated(false);
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

  const patientCollectionRef = collection(db, "patients");

  const setFormattedDOB = (dateString) => {
    const dateDOB = new Date(dateString);
    const formattedDateDOB = format(dateDOB, 'yyyy-MM-dd');
    setNewDOB(formattedDateDOB);
  };
  
  const setFormattedAdmDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = format(date, 'yyyy-MM-dd');
    setNewAdmDate(formattedDate);
  };

  // VALIDATIONS
  const [fieldValidity, setFieldValidity] = useState({
    firstName: true,
    lastName: true,
    idNum: true,
    age: true,
    dob: true,
  });

  const isFirstNameValid = (firstName) => {
    const regex = /^[A-Za-z.-]+$/;
    return regex.test(firstName);
  };
  useEffect(() => {
    const isValid = isFirstNameValid(newFirstName);
    setFieldValidity((prevState) => ({ ...prevState, firstName: isValid }));
  }, [newFirstName]);

  const isLastNameValid = (lastName) => {
    const regex = /^[A-Za-z.-]+$/;
    return regex.test(lastName);
  };
  useEffect(() => {
    const isValid = isLastNameValid(newLastName);
    setFieldValidity((prevState) => ({ ...prevState, lastName: isValid }));
  }, [newLastName]);
  
  const isIDNumValid = (idNum) => {
    const regex = /^\d+[A-Za-z]$/;
    return regex.test(idNum);
  };
  useEffect(() => {
    const isValid = isIDNumValid(newIDNum);
    setFieldValidity((prevState) => ({ ...prevState, idNum: isValid }));
  }, [newIDNum]);  

  const isAgeValid = (age) => {
    const parsedAge = parseInt(age, 10);
    return !Number.isNaN(parsedAge) && parsedAge >= 0 && parsedAge <= 120;
  };
  useEffect(() => {
    const isValid = isAgeValid(newAge);
    setFieldValidity((prevState) => ({ ...prevState, age: isValid }));
  }, [newAge]);  
  
  const isDOBValid = (dob) => {
    const minDate = new Date('1900-01-01');
    const maxDate = new Date('2023-01-01');
    const inputDate = new Date(dob);
    return inputDate >= minDate && inputDate <= maxDate;
  };
  useEffect(() => {
    const isValid = isDOBValid(newDOB);
    setFieldValidity((prevState) => ({ ...prevState, dob: isValid }));
  }, [newDOB]); 
  
  const isAdminDateValid = (admDate) => {
    const minDate = new Date('2017-01-01');
    const maxDate = new Date('2025-01-01');
    const inputDate = new Date(admDate);
    return inputDate >= minDate && inputDate <= maxDate;
  };
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

        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', p: 3, backgroundColor: 'grey.200' }}>
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
                <DatePicker id="dob" name="dob" slotProps={{ textField: { fullWidth: true } }} format="DD-MM-YYYY" label="Date of Birth" onChange={(date) => setFormattedDOB(date)} error={!fieldValidity.dob} helperText={!fieldValidity.dob && "Please input a valid date."}/>
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
                <Select
                  labelId="locality"
                  id="locality"
                  label="Locality"
                  onChange={(e) => setNewLocality(e.target.value)}
                >
                  <MenuItem value={"Attard"}>Attard</MenuItem>
                  <MenuItem value={"Balzan"}>Balzan</MenuItem>
                  <MenuItem value={"Birkirkara"}>Birkirkara</MenuItem>
                  <MenuItem value={"Birżebbuġa"}>Birżebbuġa</MenuItem>
                  <MenuItem value={"Cospicua"}>Cospicua</MenuItem>
                  <MenuItem value={"Dingli"}>Dingli</MenuItem>
                  <MenuItem value={"Fgura"}>Fgura</MenuItem>
                  <MenuItem value={"Floriana"}>Floriana</MenuItem>
                  <MenuItem value={"Fontana"}>Fontana</MenuItem>
                  <MenuItem value={"Gudja"}>Gudja</MenuItem>
                  <MenuItem value={"Għajnsielem"}>Għajnsielem</MenuItem>
                  <MenuItem value={"Għarb"}>Għarb</MenuItem>
                  <MenuItem value={"Għargħur"}>Għargħur</MenuItem>
                  <MenuItem value={"Għasri"}>Għasri</MenuItem>
                  <MenuItem value={"Għaxaq"}>Għaxaq</MenuItem>
                  <MenuItem value={"Gżira"}>Gżira</MenuItem>
                  <MenuItem value={"Iklin"}>Iklin</MenuItem>
                  <MenuItem value={"Gżira"}>Il-Gżira</MenuItem>
                  <MenuItem value={"Imdina"}>Imdina</MenuItem>
                  <MenuItem value={"Imqabba"}>Imqabba</MenuItem>
                  <MenuItem value={"Imsida"}>Imsida</MenuItem>
                  <MenuItem value={"Imtarfa"}>Imtarfa</MenuItem>
                  <MenuItem value={"Imġarr"}>Imġarr</MenuItem>
                  <MenuItem value={"Kalkara"}>Kalkara</MenuItem>
                  <MenuItem value={"Kerċem"}>Kerċem</MenuItem>
                  <MenuItem value={"Kirkop"}>Kirkop</MenuItem>
                  <MenuItem value={"Lija"}>Lija</MenuItem>
                  <MenuItem value={"Luqa"}>Luqa</MenuItem>
                  <MenuItem value={"Marsa"}>Marsa</MenuItem>
                  <MenuItem value={"Marsaskala"}>Marsaskala</MenuItem>
                  <MenuItem value={"Marsaxlokk"}>Marsaxlokk</MenuItem>
                  <MenuItem value={"Mellieħa"}>Mellieħa</MenuItem>
                  <MenuItem value={"Mosta"}>Mosta</MenuItem>
                  <MenuItem value={"Munxar"}>Munxar</MenuItem>
                  <MenuItem value={"Nadur"}>Nadur</MenuItem>
                  <MenuItem value={"Naxxar"}>Naxxar</MenuItem>
                  <MenuItem value={"Paola"}>Paola</MenuItem>
                  <MenuItem value={"Pembroke"}>Pembroke</MenuItem>
                  <MenuItem value={"Pieta"}>Pietà</MenuItem>
                  <MenuItem value={"Qala"}>Qala</MenuItem>
                  <MenuItem value={"Qormi"}>Qormi</MenuItem>
                  <MenuItem value={"Qrendi"}>Qrendi</MenuItem>
                  <MenuItem value={"Rabat"}>Rabat, Malta</MenuItem>
                  <MenuItem value={"Safi"}>Safi</MenuItem>
                  <MenuItem value={"Saint Pauls Bay"}>Saint Pauls Bay</MenuItem>
                  <MenuItem value={"San Lawrenz"}>San Lawrenz</MenuItem>
                  <MenuItem value={"San Ġiljan"}>San Ġiljan</MenuItem>
                  <MenuItem value={"San Ġwann"}>San Ġwann</MenuItem>
                  <MenuItem value={"Sannat"}>Sannat</MenuItem>
                  <MenuItem value={"Santa Luċija"}>Santa Luċija</MenuItem>
                  <MenuItem value={"Santa Venera"}>Santa Venera</MenuItem>
                  <MenuItem value={"Senglea"}>Senglea</MenuItem>
                  <MenuItem value={"Siġġiewi"}>Siġġiewi</MenuItem>
                  <MenuItem value={"Sliema"}>Sliema</MenuItem>
                  <MenuItem value={"Swieqi"}>Swieqi</MenuItem>
                  <MenuItem value={"Tarxien"}>Tarxien</MenuItem>
                  <MenuItem value={"Ta Xbiex"}>Ta Xbiex</MenuItem>
                  <MenuItem value={"Valletta"}>Valletta</MenuItem>
                  <MenuItem value={"Victoria"}>Victoria</MenuItem>
                  <MenuItem value={"Vittoriosa"}>Vittoriosa</MenuItem>
                  <MenuItem value={"Xagħra"}>Xagħra</MenuItem>
                  <MenuItem value={"Xewkija"}>Xewkija</MenuItem>
                  <MenuItem value={"Xgħajra"}>Xgħajra</MenuItem>
                  <MenuItem value={"Ħamrun"}>Ħamrun</MenuItem>
                  <MenuItem value={"Żabbar"}>Żabbar</MenuItem>
                  <MenuItem value={"Żebbuġ"}>Żebbuġ</MenuItem>
                  <MenuItem value={"Żebbuġ"}>Żebbuġ</MenuItem>
                  <MenuItem value={"Żejtun"}>Żejtun</MenuItem>
                  <MenuItem value={"Żurrieq"}>Żurrieq</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', mt:5, p: 3, backgroundColor: 'grey.200' }}>
          <Typography variant="h6" gutterBottom>
            Admission Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker id="admissiondate" name="admissiondate" slotProps={{ textField: { fullWidth: true } }} format="DD-MM-YYYY" label="Admission Date" onChange={(date) => setFormattedAdmDate(date)} error={!fieldValidity.admDate} helperText={!fieldValidity.admDate && "Please input only numbers between 0 and 120."}/>
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                  Admission Through
                </InputLabel>
                <Select labelId="admissionthru" id="admissionthru" label="Admission Through" onChange={(e) => setNewAdmThru(e.target.value)}>
                  <MenuItem value={"Internal Transfer"}>Internal Transfer</MenuItem>
                  <MenuItem value={"MDH"}>Mater Dei Hospital</MenuItem>
                  <MenuItem value={"Own Home"}>Own Home</MenuItem>
                  <MenuItem value={"Care Home"}>Care Home</MenuItem>
                  <MenuItem value={"Private Hospita"}>Private Hospital</MenuItem>
                  <MenuItem value={"Other"}>Other Government Hospital</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                  Consultant
                </InputLabel>
                <Select labelId="consultant" id="consultant" label="Consultant" onChange={(e) => setNewAdmConsultant(e.target.value)}>
                  <MenuItem value={"Dr. S. Abela"}>Dr. S. Abela</MenuItem>
                  <MenuItem value={"Dr. E. Bellia"}>Dr. E. Bellia</MenuItem>
                  <MenuItem value={"Dr. J. Cordina"}>Dr. J. Cordina</MenuItem>
                  <MenuItem value={"Dr. S. Dalli"}>Dr. S. Dalli</MenuItem>
                  <MenuItem value={"Dr. J. Dimech"}>Dr. J. Dimech</MenuItem>
                  <MenuItem value={"Dr. B. Farrugia"}>Dr. B. Farrugia</MenuItem>
                  <MenuItem value={"Dr. P. Ferry"}>Dr. P. Ferry</MenuItem>
                  <MenuItem value={"Dr. S. La Maestra"}>Dr. S. La Maestra</MenuItem>
                  <MenuItem value={"Dr. M. A. Vassallo"}>Dr. M. A. Vassallo</MenuItem>      
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', mt:5, p: 3, backgroundColor: 'grey.200' }}>
          <Typography variant="h6" gutterBottom>
            Reason for Admission
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} onChange={(e) => setNewAdmMainDiag(e.target.value)}>
              <TextField
                id="maindiagnosis"
                name="maindiagnosis"
                label="Main Diagnosis"
                fullWidth
                variant="standard"
              />
            </Grid>
            <Grid item xs={12} sm={6} onChange={(e) => setNewAdmOtherDiag(e.target.value)}>
              <TextField
                id="otherdiagnosis"
                name="otherdiagnosis"
                label="Other Diagnosis"
                fullWidth
                variant="standard"
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', mt: 5, p: 3, backgroundColor: 'grey.200' }}>
          <Grid>
            <Typography variant="h6" gutterBottom>
              Pick Ward
            </Typography>
            <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
              <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                Current Ward
              </InputLabel>
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
        </Box>
      </Container>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <Button variant="contained" startIcon={<Iconify icon="formkit:submit" />} sx={{ mx: 2, fontSize: '1.1rem', padding: '8px 16px' }} onClick={onSubmitPatientDetails}>
          Submit Details
        </Button>
      </Box>
    </>
  );
}
