import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// @mui
import { Grid, Button, Stack, Typography, TextField, InputLabel, Input, FormControl, Select, MenuItem, Box, Accordion, AccordionSummary, AccordionDetails} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

import Iconify from '../components/iconify';

// ----------------------------------------------------------------------

const handleAgeInputChange = (event) => {
  const inputValue = event.target.value;
  const truncatedValue = inputValue.slice(0, 3);
  event.target.value = truncatedValue;
};

// ----------------------------------------------------------------------
  
export default function PatientPage() {

  const [selectedTissueValues, setSelectedValues] = useState([]);
  const [selectedSurgeryValues, setSelectedSurgeryValues] = useState([]);

  const navigate = useNavigate();

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

  const patientCollectionRef = collection(db, "patients");
  const admissionCollectionRef = collection(db, "patientadmdetails")
  
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
      await addDoc(patientCollectionRef, {
        FirstName: newFirstName,
        LastName: newLastName,
        IDNum: newIDNum,
        Sex: newSex,
        Age: newAge,
        DOB: newDOB,
        Locality: newLocality,
      });

      await addDoc(admissionCollectionRef, {
        IDNum: newIDNum,
        AdmissionThru: newAdmThru,
        AdmissionWard: newAdmWard,
        AdmitDate: newAdmDate,
        Consultant: newAdmConsultant,
        MainDiagnosis: newAdmMainDiag,
        OtherDiagnosis: newAdmOtherDiag,
      });
  
      toast.success('Patient details submitted successfully!');
      navigate('/dashboard/patientlist');
    } catch (e) {
      toast.error('An error occurred while submitting the details. Please try again.');
    }    
  };

  const handleChange = (event) => {
    setSelectedValues(event.target.value);
  };

  const handleSurgeryChange = (event) => {
    setSelectedSurgeryValues(event.target.value);
  };

  return (
    <>
      <Helmet>
        <title> Alfred Borg | KGH </title>
      </Helmet> 

      <Stack direction="row" alignItems="center" justifyContent="space-between" ml={5}>
        <Typography variant="h4" gutterBottom>
          Alfred Borg
        </Typography>
      </Stack>
      <Typography gutterBottom mb={5} ml={5}>
          400101M
      </Typography>

      <Grid container spacing={1} ml={5}>
        <Grid item xs={12} sm={5} md={5}>     
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', p: 3, backgroundColor: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Personal Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                id="firstName"
                name="firstName"
                label="First Name"
                fullWidth
                autoComplete="given-name"
                variant="standard"
                onChange={(e) => setNewFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                id="lastName"
                name="lastName"
                label="Last Name"
                fullWidth
                autoComplete="family-name"
                variant="standard"
                onChange={(e) => setNewLastName(e.target.value)}
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
              />
            </Grid> 
            <Grid item xs={12}>
            <TextField
              id="age"
              name="age"
              label="Age"
              fullWidth
              autoComplete="age"
              variant="standard"
              type="number"
              inputProps={{ max: 120, inputComponent: Input }}
              onChange={(e) => setNewAge(Number(e.target.value))}
            />
            </Grid>
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px' }}>Date of Birth</InputLabel>
              <TextField
                  id="dob"
                  name="dob"
                  fullWidth
                  autoComplete="date"
                  variant="standard"
                  type="date"
                  onChange={(e) => setNewDOB(Date(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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

        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', mt:5, p: 3, backgroundColor: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Admission Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px' }}>Admission Date</InputLabel>
              <TextField
                  id="admissiondate"
                  name="admissiondate"
                  fullWidth
                  autoComplete="date"
                  variant="standard"
                  type="date"
                  onChange={(e) => setNewAdmDate(Date(e.target.value))}
              /> 
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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


        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', mt:5, p: 3, backgroundColor: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Reason for Admission
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} onChange={(e) => setNewAdmMainDiag(e.target.value)}>
              <TextField
                id="maindiagnosis"
                name="maindiagnosis"
                label="Main Diagnosis"
                fullWidth
                variant="standard"
              />
            </Grid>
            <Grid item xs={12} onChange={(e) => setNewAdmOtherDiag(e.target.value)}>
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


        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', mt:5, p: 3, backgroundColor: 'white' }}>
          <Grid>
            <Typography variant="h6" gutterBottom>
              Pick Ward
            </Typography>
            <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large" onChange={(e) => setNewAdmWard(e.target.value)}>
              <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                Patient's Admission Ward
              </InputLabel>
              <Select labelId="currentward" id="currentward" label="Current Ward">
                <MenuItem value={"Reh Ward 1"}>Reh Ward 1: 1 available bed</MenuItem>
                <MenuItem value={"Reh Ward 2"}>Reh Ward 2: 2 available bed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Box>

          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', mt:5, p: 3, backgroundColor: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  id="otherinfo"
                  name="otherinfo"
                  label="More Information"
                  fullWidth
                  variant="standard"
                  multiline
                  rows={10}
                  defaultValue="This patient might be displaying early signs of onset dementia, further tests required."          
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>  

        <Grid item xs={12} sm={5} md={5}>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', backgroundColor: 'white' }}>
            <Accordion sx={{borderRadius: '10px', mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                <Typography variant="h6">Barthel Index - Admission Score</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Bowels
                      </InputLabel>
                      <Select labelId="currentward" id="currentward" label="Current Ward">
                        <MenuItem value={0}>Incontinent</MenuItem>
                        <MenuItem value={1}>Occasional Accident</MenuItem>
                        <MenuItem value={2}>Continent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Transfers
                      </InputLabel>
                      <Select labelId="currentward" id="currentward" label="Current Ward">
                        <MenuItem value={0}>Unable</MenuItem>
                        <MenuItem value={1}>Major Help</MenuItem>
                        <MenuItem value={2}>Minor Help</MenuItem>
                        <MenuItem value={2}>Independent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Bladder
                      </InputLabel>
                      <Select labelId="bladder" id="bladder" label="Bladder">
                        <MenuItem value={0}>Incontinent</MenuItem>
                        <MenuItem value={1}>Occasional Accident</MenuItem>
                        <MenuItem value={2}>Continent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Mobility
                      </InputLabel>
                      <Select labelId="mobility" id="mobility" label="Mobility">
                        <MenuItem value={0}>Immobile</MenuItem>
                        <MenuItem value={1}>Wheelchair Dependent</MenuItem>
                        <MenuItem value={2}>Walks with help of one person</MenuItem>
                        <MenuItem value={3}>Independent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Grooming
                      </InputLabel>
                      <Select labelId="grooming" id="grooming" label="Grooming">
                        <MenuItem value={0}>Needs help with personal care</MenuItem>
                        <MenuItem value={1}>Needs help but can groom self</MenuItem>
                        <MenuItem value={2}>Independent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Dressing
                      </InputLabel>
                      <Select labelId="dressing" id="dressing" label="Dressing">
                        <MenuItem value={0}>Dependent</MenuItem>
                        <MenuItem value={1}>Needs help but can do half unaided</MenuItem>
                        <MenuItem value={2}>Independent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Toilet Use
                      </InputLabel>
                      <Select labelId="toilet" id="toilet" label="Toilet Use">
                        <MenuItem value={0}>Dependent</MenuItem>
                        <MenuItem value={1}>Needs some help</MenuItem>
                        <MenuItem value={2}>Independent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Stairs
                      </InputLabel>
                      <Select labelId="stairs" id="stairs" label="Stairs">
                        <MenuItem value={0}>Unable</MenuItem>
                        <MenuItem value={1}>Needs some help</MenuItem>
                        <MenuItem value={2}>Independent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Feeding
                      </InputLabel>
                      <Select labelId="feeding" id="feeding" label="Feeding">
                        <MenuItem value={0}>Dependent</MenuItem>
                        <MenuItem value={1}>Needs help but can feed self</MenuItem>
                        <MenuItem value={2}>Independent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Bathing
                      </InputLabel>
                      <Select labelId="bathing" id="bathing" label="Bathing">
                        <MenuItem value={0}>Dependent</MenuItem>
                        <MenuItem value={1}>Needs help but can bath self</MenuItem>
                        <MenuItem value={2}>Independent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Box mt={3} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', backgroundColor: 'white' }}>
            <Accordion sx={{borderRadius: '10px', mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                <Typography variant="h6">Waterlow Scale</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Weight/Size Relationship
                      </InputLabel>
                      <Select labelId="weight" id="weight" label="Weight">
                        <MenuItem value={0}>Standard</MenuItem>
                        <MenuItem value={1}>Above standards</MenuItem>
                        <MenuItem value={2}>Obese</MenuItem>
                        <MenuItem value={3}>Below standards</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Continence
                      </InputLabel>
                      <Select labelId="continence" id="continence" label="Continence">
                        <MenuItem value={0}>Complete, urine catheter</MenuItem>
                        <MenuItem value={1}>Occasional incontinence</MenuItem>
                        <MenuItem value={2}>Unire catheter</MenuItem>
                        <MenuItem value={3}>Double incontinence</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Skin type and visual aspects of risk areas
                      </InputLabel>
                      <Select labelId="skintype" id="skintype" label="Skin Type">
                        <MenuItem value={0}>Healthy</MenuItem>
                        <MenuItem value={1}>Frail</MenuItem>
                        <MenuItem value={2}>Edematous</MenuItem>
                        <MenuItem value={3}>Cold & humid</MenuItem>
                        <MenuItem value={4}>Alterations in colour</MenuItem>
                        <MenuItem value={5}>Wounded</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Mobility
                      </InputLabel>
                      <Select labelId="waterlowmobility" id="waterlowmobility" label="Moblity">
                        <MenuItem value={0}>Complete</MenuItem>
                        <MenuItem value={1}>Restless</MenuItem>
                        <MenuItem value={2}>Apathy</MenuItem>
                        <MenuItem value={3}>Restricted</MenuItem>
                        <MenuItem value={4}>Inert</MenuItem>
                        <MenuItem value={5}>On chair</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Appetite
                      </InputLabel>
                      <Select labelId="appetite" id="appetite" label="Appetite">
                        <MenuItem value={0}>Normal</MenuItem>
                        <MenuItem value={1}>Scarce/Feeding tube</MenuItem>
                        <MenuItem value={2}>Liquid intavenous</MenuItem>
                        <MenuItem value={3}>Anorexia/Absolute diet</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Typography gutterBottom sx={{ fontWeight: 'bold' }} pl={3} pt={3}> 
                    Special Risks
                  </Typography>
                  <Grid item xs={12}>
                    <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Tissue Malnutrition
                      </InputLabel>
                      <Select labelId="tissuemalnutrition" id="tissuemalnutrition" label="Tissue Malnutrition" multiple value={selectedTissueValues} onChange={handleChange} >
                        <MenuItem value={8}>Terminal/cachexia</MenuItem>
                        <MenuItem value={5}>Cardiac insufficiency</MenuItem>
                        <MenuItem value={6}>Peripheral vascular insufficiency</MenuItem>
                        <MenuItem value={2}>Anemia</MenuItem>
                        <MenuItem value={1}>Smoker</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Neurological deficit
                      </InputLabel>
                      <Select labelId="neurologicaldeficit" id="neurologicaldeficit" label="Neurological Deficit"  >
                        <MenuItem value={5}>Diabetes, paraplegic, ACV</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Surgery
                      </InputLabel>
                      <Select labelId="surgery" id="surgery" label="Surgery" multiple value={selectedSurgeryValues} onChange={handleSurgeryChange} >
                        <MenuItem value={5}>Orthopedic surgery below waist</MenuItem>
                        <MenuItem value={5}>Over 2 hours in surgery</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
                      <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                        Medication
                      </InputLabel>
                      <Select labelId="medication" id="medication" label="Medication" >
                        <MenuItem value={4}>Steroid, crytoxics</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <Button variant="contained" startIcon={<Iconify icon="formkit:submit" />} sx={{ mx: 2, fontSize: '1.1rem', padding: '8px 16px' }}>
          Edit Details
        </Button>
      </Box>
    </>
  );
}
