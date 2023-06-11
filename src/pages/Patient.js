import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// @mui
import { Tabs, Tab, Grid, Button, Typography, TextField, InputLabel, Input, FormControl, Select, MenuItem, Box, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';

import { doc, setDoc, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

import Iconify from '../components/iconify';

// ----------------------------------------------------------------------

export default function PatientPage() {
  const { idNum } = useParams();

  const [tabValue, setTabValue] = useState(0);

  const navigate = useNavigate();

  const [patientDocumentId, setPatientDocumentId] = useState(null);
  const [admdetailsDocumentId, setAdmDetailsDocumentId] = useState(null);

  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newIDNum, setNewIDNum] = useState("");
  const [newSex, setNewSex] = useState("");
  const [newLocality, setNewLocality] = useState("");
  const [newAge, setNewAge] = useState(0);
  const [newDOB, setNewDOB] = useState(0);

  const [newAdmDate, setNewAdmDate] = useState(0);
  const [newAdmThru, setNewAdmThru] = useState("");
  const [newAdmConsultant, setNewAdmConsultant] = useState("");
  const [newAdmMainDiag, setNewAdmMainDiag] = useState("");
  const [newAdmOtherDiag, setNewAdmOtherDiag] = useState("");
  const [newAdmWard, setNewAdmWard] = useState("");

  const [newBarthBowels, setNewBarthBowels] = useState("")
  const [newBarthTransfers, setNewBarthTransfers] = useState("")
  const [newBarthBladder, setNewBarthBladder] = useState("")
  const [newBarthMobility, setNewBarthMobility] = useState("")
  const [newBarthGrooming, setNewBarthGrooming] = useState("")
  const [newBarthDressing, setNewBarthDressing] = useState("")
  const [newBarthToilet, setNewBarthToilet] = useState("")
  const [newBarthStairs, setNewBarthStairs] = useState("")
  const [newBarthFeeding, setNewBarthFeeding] = useState("")
  const [newBarthBathing, setNewBarthBathing] = useState("")

  const [newWaterWeightSize, setNewWaterWeightSize] = useState("")
  const [newWaterContinence, setNewWaterContinence] = useState("")
  const [newWaterSkin, setNewWaterSkin] = useState("")
  const [newWaterMobility, setNewWaterMobility] = useState("")
  const [newWaterAppetite, setNewWaterAppetite] = useState("")
  const [newWaterTissue, setNewWaterTissue] = useState("")
  const [newWaterNeuro, setNewWaterNeuro] = useState("")
  const [newWaterSurgery, setNewWaterSurgery] = useState("")
  const [newWaterMedication, setNewWaterMedication] = useState("")
  
  const patientCollectionRef = collection(db, "patients");
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [patientNotes, setPatientNotes] = useState([]);
  // const patientNotesCollectionRef = collection(patientCollectionRef, patientDocumentId, 'notes');
  const [patientNotesCollectionRef, setPatientNotesCollectionRef] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true); // User is logged in
      } else {
        setIsAuthenticated(false); // User is logged out
      }
    });
    return () => unsubscribe(); // Unsubscribe from the authentication listener when the component unmounts
  }, []);

  const onSubmitPatientDetails = async () => {
    if (
      newFirstName === '' ||
      newLastName === '' ||
      newIDNum === '' ||
      newSex === '' ||
      newAge === 0 ||
      newDOB === 0 ||
      newLocality === ''
    ) {
      toast.error('Please fill in all fields.');
      return;
    }
  
    try {
      const patientDocRef = doc(patientCollectionRef, patientDocumentId);
  
      // Saving a new note
      if (noteTitle && noteText) {
        const patientNotesCollectionRef = collection(patientCollectionRef, patientDocumentId, 'notes');
        const noteDocRef = doc(patientNotesCollectionRef);
        await setDoc(noteDocRef, {
          title: noteTitle,
          text: noteText,
          date: new Date().toISOString(),
          user: auth.currentUser.displayName,
        });
      }
  
      await setDoc(patientDocRef, {
        FirstName: newFirstName,
        LastName: newLastName,
        IDNum: newIDNum,
        Sex: newSex,
        Age: newAge,
        DOB: newDOB,
        Locality: newLocality,
        admissiondetails: {
          IDNum: newIDNum,
          AdmissionThru: newAdmThru,
          AdmissionWard: newAdmWard,
          AdmitDate: newAdmDate,
          Consultant: newAdmConsultant,
          MainDiagnosis: newAdmMainDiag,
          OtherDiagnosis: newAdmOtherDiag,
        },
        bartheladm: {
          Bowels: newBarthBowels,
          Transfers: newBarthTransfers,
          Bladder: newBarthBladder,
          Mobility: newBarthMobility,
          Grooming: newBarthGrooming,
          Dressing: newBarthDressing,
          Toilet: newBarthToilet,
          Stairs: newBarthStairs,
          Feeding: newBarthFeeding,
          Bathing: newBarthBathing,
        },
        waterlow: {
          WeightSize: newWaterWeightSize,
          Continence: newWaterContinence,
          Skin: newWaterSkin,
          WaterMobility: newWaterMobility,
          Appetite: newWaterAppetite,
          Tissue: newWaterTissue,
          Neuro: newWaterNeuro,
          Surgery: newWaterSurgery,
          Medication: newWaterMedication,
        },
      });
  
      toast.success('Patient details updated successfully!');
      navigate('/dashboard/patientlist');
    } catch (e) {
      toast.error('An error occurred while editing the patient details. Please try again.');
    }
  };  

  const getPatientDetails = async () => {
    try {
      const patientQuery = query(patientCollectionRef, where("IDNum", "==", idNum));
      const patientSnapshot = await getDocs(patientQuery);

      patientSnapshot.forEach((doc) => {
        setNewFirstName(doc.data().FirstName);
        setNewLastName(doc.data().LastName);
        setNewIDNum(doc.data().IDNum);
        setNewSex(doc.data().Sex);
        setNewLocality(doc.data().Locality);
        setNewAge(doc.data().Age);
        setNewDOB(doc.data().DOB);
        setPatientDocumentId(doc.id);
  
        // Retrieve admission details from the subcollection
        const admissionDetails = doc.data().admissiondetails;
        if (admissionDetails) {
          setNewAdmDate(admissionDetails.AdmitDate);
          setNewAdmThru(admissionDetails.AdmissionThru);
          setNewAdmConsultant(admissionDetails.Consultant);
          setNewAdmMainDiag(admissionDetails.MainDiagnosis);
          setNewAdmOtherDiag(admissionDetails.OtherDiagnosis);
          setNewAdmWard(admissionDetails.AdmissionWard);
          setAdmDetailsDocumentId(admissionDetails.documentId);
        }
      
        // Retrieve barthel admission details from the subcollection
        const barthelAdm = doc.data().bartheladm;
        if (barthelAdm) {
          setNewBarthBowels(barthelAdm.Bowels);
          setNewBarthTransfers(barthelAdm.Transfers);
          setNewBarthBladder(barthelAdm.Bladder);
          setNewBarthMobility(barthelAdm.Mobility);
          setNewBarthGrooming(barthelAdm.Grooming);
          setNewBarthDressing(barthelAdm.Dressing);
          setNewBarthToilet(barthelAdm.Toilet);
          setNewBarthStairs(barthelAdm.Stairs);
          setNewBarthFeeding(barthelAdm.Feeding);
          setNewBarthBathing(barthelAdm.Bathing);
        }

        const waterlowAdm = doc.data().waterlow;
        if (waterlowAdm) {
          setNewWaterWeightSize(waterlowAdm.WeightSize);
          setNewWaterContinence(waterlowAdm.Continence);
          setNewWaterSkin(waterlowAdm.Skin);
          setNewBarthMobility(waterlowAdm.WaterMobility);
          setNewWaterAppetite(waterlowAdm.Appetite);
          setNewWaterTissue(waterlowAdm.Tissue);
          setNewWaterNeuro(waterlowAdm.Neuro);
          setNewWaterSurgery(waterlowAdm.Surgery);
          setNewWaterMedication(waterlowAdm.Medication);
        }

        const patientNotesCollectionRef = collection(patientCollectionRef, doc.id, 'notes');
        setPatientNotesCollectionRef(patientNotesCollectionRef);
      });      
    } catch (e) {
      toast.error('An error occurred while fetching patient details. Please try again.');
      console.log('An error occurred while fetching patient details.', e);
    }
  };
  useEffect(() => { getPatientDetails(); }, []);

  const deletePatient = async () => {
    try {
      const patientDocRef = doc(patientCollectionRef, patientDocumentId);
      await deleteDoc(patientDocRef);
      toast.success('Patient deleted successfully!');
      navigate('/dashboard/patientlist');
    } catch (e) {
      toast.error('An error occurred while deleting the patient. Please try again.');
    }
  };  

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

  const getPatientNotes = async () => {
    try {
      if (patientNotesCollectionRef) {
        const notesSnapshot = await getDocs(patientNotesCollectionRef);
        const notes = notesSnapshot.docs.map((doc) => doc.data());
        setPatientNotes(notes);
      }
    } catch (e) {
      console.error('Error fetching patient notes:', e);
      toast.error('An error occurred while fetching patient notes. Please try again.')
    }
  };
  useEffect(() => {
    getPatientNotes();
  }, [patientNotesCollectionRef]);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
    return (
      <>
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Patient</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete <b>{newFirstName} {newLastName}</b>'s details?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={deletePatient} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>

        <Helmet>
          <title> {newFirstName} {newLastName} | KGH </title>
        </Helmet>
        <Grid container spacing={1} ml={5} alignItems="center">
          <Grid item xs={6}>
            <Typography variant="h4" gutterBottom> {newFirstName} {newLastName} </Typography>
            <Typography gutterBottom mb={5}> {newIDNum} </Typography>
          </Grid>
          <Grid item xs={6} textAlign="center">
            <Button variant="contained" color="error" startIcon={<Iconify icon="material-symbols:delete" />} onClick={() => setDeleteDialogOpen(true)} sx={{ minWidth: '150px' }}>
              Delete Patient
            </Button>
          </Grid>
        </Grid>

        <Tabs sx={{mt: 3}} variant="scrollable" scrollButtons allowScrollButtonsMobile value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
          <Tab label="Personal Details" />
          <Tab label="Admission Details" />
          <Tab label="Barthel Index - Admission Score" />
          <Tab label="Waterlow Risk Assessment" />
          <Tab label="Notes" />
        </Tabs>
        {tabValue === 0 && (
          <Box sx={{ p: 2, bgcolor: 'grey.200' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Personal Details </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField required id="firstName" name="firstName" label="First Name" fullWidth autoComplete="given-name" variant="standard" value={newFirstName}  onChange={(e) => setNewFirstName(e.target.value)}/>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required id="lastName" name="lastName" label="Last Name" fullWidth autoComplete="family-name" variant="standard" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField required id="idnum" name="idnum" label="ID Card Number" fullWidth autoComplete="idnum" variant="standard" value={newIDNum} onChange={(e) => setNewIDNum(e.target.value)}/>
              </Grid> 
              <Grid item xs={12} sm={6}>
              <TextField id="age" name="age" label="Age" fullWidth autoComplete="age" variant="standard" type="number" value={newAge} inputProps={{ max: 120, inputcomponent: Input }} onChange={(e) => setNewAge(Number(e.target.value))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker id="dob" name="dob" slotProps={{ textField: { fullWidth: true } }} format="DD-MM-YYYY" label="Date of Birth" value={dayjs(newDOB)} onChange={(e) => setNewDOB(Date(e.target.value))}/>
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Sex </InputLabel>
                  <Select labelId="sex" id="sex" label="Sex" value={newSex} onChange={(e) => setNewSex(e.target.value)}>
                    <MenuItem value={"M"}>Male</MenuItem>
                    <MenuItem value={"F"}>Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Locality </InputLabel>
                  <Select labelId="locality" id="locality" label="Locality"value={newLocality} onChange={(e) => setNewLocality(e.target.value)}>
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
        )}
        {tabValue === 1 && (
          <Box sx={{ p: 2, bgcolor: 'grey.200' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Admission Details </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker id="admissiondate" name="admissiondate" slotProps={{ textField: { fullWidth: true } }} format="DD-MM-YYYY" label="Admission Date" value={dayjs(newAdmDate)} onChange={(e) => setNewAdmDate(Date(e.target.value))}/>
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
                    <MenuItem value={"Private Hospita"}>Private Hospital</MenuItem>
                    <MenuItem value={"Other"}>Other Government Hospital</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Consultant </InputLabel>
                  <Select labelId="consultant" id="consultant" label="Consultant" value={newAdmConsultant} onChange={(e) => setNewAdmConsultant(e.target.value)}>
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
              <Grid item xs={12}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Current Ward </InputLabel>
                  <Select labelId="currentward" id="currentward" label="Current Ward" onChange={(e) => setNewAdmWard(e.target.value)}>
                    {wards.sort((a, b) => a.wardno - b.wardno).map((ward) => (
                        <MenuItem key={ward.wardno} value={ward.wardno} disabled={ward.available === 0} sx={{ color: ward.available === 0 ? 'red' : 'inherit' }}>
                          {`Reh Ward ${ward.wardno}: ${ward.available} available beds`}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography gutterBottom variant='h6' sx={{ fontWeight: 'bold' }} pt={5}> Reasons for Admission </Typography> 
              </Grid>
              <Grid item xs={12} sm={6}> 
                <TextField id="maindiagnosis" name="maindiagnosis" label="Main Diagnosis" fullWidth variant="standard" value={newAdmMainDiag} onChange={(e) => setNewAdmMainDiag(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField id="otherdiagnosis" name="otherdiagnosis" label="Other Diagnosis" fullWidth variant="standard" value={newAdmOtherDiag} onChange={(e) => setNewAdmOtherDiag(e.target.value)} />
              </Grid>
            </Grid>
          </Box>
        )}
        {tabValue === 2 && (
          <Box sx={{ p: 2, bgcolor: 'grey.200' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Barthel Index - Admission Score </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Bowels </InputLabel>
                  <Select labelId="currentward" id="currentward" label="Current Ward" value={newBarthBowels} onChange={(e) => setNewBarthBowels(e.target.value)}>
                    <MenuItem value={0}>Incontinent</MenuItem>
                    <MenuItem value={1}>Occasional Accident</MenuItem>
                    <MenuItem value={2}>Continent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Transfers </InputLabel>
                  <Select labelId="transfers" id="transfers" label="Current Ward" value={newBarthTransfers} onChange={(e) => setNewBarthTransfers(e.target.value)}>
                    <MenuItem value={0}>Unable</MenuItem>
                    <MenuItem value={1}>Major Help</MenuItem>
                    <MenuItem value={2}>Minor Help</MenuItem>
                    <MenuItem value={2}>Independent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Bladder </InputLabel>
                  <Select labelId="bladder" id="bladder" label="Bladder" value={newBarthBladder} onChange={(e) => setNewBarthBladder(e.target.value)}>
                    <MenuItem value={0}>Incontinent</MenuItem>
                    <MenuItem value={1}>Occasional Accident</MenuItem>
                    <MenuItem value={2}>Continent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Mobility </InputLabel>
                  <Select labelId="mobility" id="mobility" label="Mobility" value={newBarthMobility} onChange={(e) => setNewBarthMobility(e.target.value)}>
                    <MenuItem value={0}>Immobile</MenuItem>
                    <MenuItem value={1}>Wheelchair Dependent</MenuItem>
                    <MenuItem value={2}>Walks with help of one person</MenuItem>
                    <MenuItem value={3}>Independent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Grooming </InputLabel>
                  <Select labelId="grooming" id="grooming" label="Grooming" value={newBarthGrooming} onChange={(e) => setNewBarthGrooming(e.target.value)}>
                    <MenuItem value={0}>Needs help with personal care</MenuItem>
                    <MenuItem value={1}>Needs help but can groom self</MenuItem>
                    <MenuItem value={2}>Independent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Dressing </InputLabel>
                  <Select labelId="dressing" id="dressing" label="Dressing" value={newBarthDressing} onChange={(e) => setNewBarthDressing(e.target.value)}>
                    <MenuItem value={0}>Dependent</MenuItem>
                    <MenuItem value={1}>Needs help but can do half unaided</MenuItem>
                    <MenuItem value={2}>Independent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>Toilet Use</InputLabel>
                  <Select labelId="toilet" id="toilet" label="Toilet Use" value={newBarthToilet} onChange={(e) => setNewBarthToilet(e.target.value)}>
                    <MenuItem value={0}>Dependent</MenuItem>
                    <MenuItem value={1}>Needs some help</MenuItem>
                    <MenuItem value={2}>Independent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>Stairs</InputLabel>
                  <Select labelId="stairs" id="stairs" label="Stairs" value={newBarthStairs} onChange={(e) => setNewBarthStairs(e.target.value)}>
                    <MenuItem value={0}>Unable</MenuItem>
                    <MenuItem value={1}>Needs some help</MenuItem>
                    <MenuItem value={2}>Independent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>Feeding</InputLabel>
                  <Select labelId="feeding" id="feeding" label="Feeding" value={newBarthFeeding} onChange={(e) => setNewBarthFeeding(e.target.value)}>
                    <MenuItem value={0}>Dependent</MenuItem>
                    <MenuItem value={1}>Needs help but can feed self</MenuItem>
                    <MenuItem value={2}>Independent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>Bathing</InputLabel>
                  <Select labelId="bathing" id="bathing" label="Bathing" value={newBarthBathing} onChange={(e) => setNewBarthBathing(e.target.value)}>
                    <MenuItem value={0}>Dependent</MenuItem>
                    <MenuItem value={1}>Needs help but can bath self</MenuItem>
                    <MenuItem value={2}>Independent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
        {tabValue === 3 && (
          <Box sx={{ p: 2, bgcolor: 'grey.200' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Waterlow Risk Assessment </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>Weight/Size Relationship</InputLabel>
                  <Select labelId="weight" id="weight" label="Weight" value={newWaterWeightSize} onChange={(e) => setNewWaterWeightSize(e.target.value)}>
                    <MenuItem value={0}>Standard</MenuItem>
                    <MenuItem value={1}>Above standards</MenuItem>
                    <MenuItem value={2}>Obese</MenuItem>
                    <MenuItem value={3}>Below standards</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>Continence</InputLabel>
                  <Select labelId="continence" id="continence" label="Continence" value={newWaterContinence} onChange={(e) => setNewWaterContinence(e.target.value)}>
                    <MenuItem value={0}>Complete, urine catheter</MenuItem>
                    <MenuItem value={1}>Occasional incontinence</MenuItem>
                    <MenuItem value={2}>Unire catheter</MenuItem>
                    <MenuItem value={3}>Double incontinence</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}> Skin type and visual aspects of risk areas </InputLabel>
                  <Select labelId="skintype" id="skintype" label="Skin Type" value={newWaterSkin} onChange={(e) => setNewWaterSkin(e.target.value)}>
                    <MenuItem value={0}>Healthy</MenuItem>
                    <MenuItem value={1}>Frail</MenuItem>
                    <MenuItem value={2}>Edematous</MenuItem>
                    <MenuItem value={3}>Cold & humid</MenuItem>
                    <MenuItem value={4}>Alterations in colour</MenuItem>
                    <MenuItem value={5}>Wounded</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>Mobility</InputLabel>
                  <Select labelId="waterlowmobility" id="waterlowmobility" value={newWaterAppetite} onChange={(e) => setNewWaterAppetite(e.target.value)}>
                    <MenuItem value={0}>Complete</MenuItem>
                    <MenuItem value={1}>Restless</MenuItem>
                    <MenuItem value={2}>Apathy</MenuItem>
                    <MenuItem value={3}>Restricted</MenuItem>
                    <MenuItem value={4}>Inert</MenuItem>
                    <MenuItem value={5}>On chair</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>Appetite</InputLabel>
                  <Select labelId="appetite" id="appetite" label="Appetite" value={newWaterAppetite} onChange={(e) => setNewWaterAppetite(e.target.value)}>
                    <MenuItem value={0}>Normal</MenuItem>
                    <MenuItem value={1}>Scarce/Feeding tube</MenuItem>
                    <MenuItem value={2}>Liquid intavenous</MenuItem>
                    <MenuItem value={3}>Anorexia/Absolute diet</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Typography gutterBottom variant='h6' sx={{ fontWeight: 'bold' }} pt={2}> Special Risks </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>Tissue Malnutrition</InputLabel>
                  <Select labelId="tissuemalnutrition" id="tissuemalnutrition" label="Tissue Malnutrition" value={newWaterTissue} onChange={(e) => setNewWaterTissue(e.target.value)} >
                    <MenuItem value={8}>Terminal/cachexia</MenuItem>
                    <MenuItem value={5}>Cardiac insufficiency</MenuItem>
                    <MenuItem value={6}>Peripheral vascular insufficiency</MenuItem>
                    <MenuItem value={2}>Anemia</MenuItem>
                    <MenuItem value={1}>Smoker</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>Neurological Deficit</InputLabel>
                  <Select labelId="neurologicaldeficit" id="neurologicaldeficit" label="Neurological Deficit" value={newWaterNeuro} onChange={(e) => setNewWaterNeuro(e.target.value)}>
                    <MenuItem value={5}>Diabetes, paraplegic, ACV</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>Surgery</InputLabel>
                  <Select labelId="surgery" id="surgery" label="Surgery" value={newWaterSurgery} onChange={(e) => setNewWaterSurgery(e.target.value)}>
                    <MenuItem value={5}>Orthopedic surgery below waist</MenuItem>
                    <MenuItem value={5}>Over 2 hours in surgery</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>Medication</InputLabel>
                  <Select labelId="medication" id="medication" label="Medication" value={newWaterMedication} onChange={(e) => setNewWaterMedication(e.target.value)}>
                    <MenuItem value={4}>Steroid, crytoxics</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
        {tabValue === 4 && (
          <Box sx={{ p: 2, bgcolor: 'grey.200' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Notes </Typography>
            <Accordion sx={{ borderRadius: '10px', mb: 1, backgroundColor: 'grey.300' }}>
              <AccordionSummary container expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                <Typography variant="h5">Add a New Note</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField id="noteTitle" name="noteTitle" label="Note Title" fullWidth variant="standard" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)}/>
                <TextField id="noteText" name="noteText" label="Note Text"fullWidth variant="standard" multiline rows={10} value={noteText} onChange={(e) => setNoteText(e.target.value)}/>
              </AccordionDetails>
            </Accordion>
            <Grid sx={{ mt: 5 }}>
              {patientNotes.map((note, index) => {
                // Workaround, tochange
                const formattedDate = new Date(note.date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });
                const formattedTime = new Date(note.date).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <Accordion key={index} sx={{ borderRadius: '10px', mb: 1 }}>
                    <AccordionSummary container expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                      <Typography variant="h5">{note.title} | {formattedDate} - {formattedTime}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography><b>{note.user}</b></Typography><br/>
                      <Typography>{note.text}</Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Grid>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <Button variant="contained" startIcon={<Iconify icon="tabler:edit" />} onClick={onSubmitPatientDetails} sx={{ mx: 2, fontSize: '1.1rem', padding: '8px 16px' }}>
            Submit Changes
          </Button>
        </Box>
      </>
    );
}