import * as React from 'react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

// @mui
import { Grid, Button, Stack, Typography, TextField, InputLabel, Input, FormControl, Select, MenuItem, Box, Accordion, AccordionSummary, AccordionDetails} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
                  variant="standard"
                  defaultValue="Alfred"          
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
                  defaultValue="Sant"   
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
                  defaultValue="400101L"   
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
                onChange={handleAgeInputChange}
                defaultValue="72"
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
                    defaultValue="1951-02-02"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                    Sex
                  </InputLabel>
                  <Select labelId="sex" id="sex" label="Sex" defaultValue={1}>
                    <MenuItem value={1}>Male</MenuItem>
                    <MenuItem value={0}>Female</MenuItem>
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
                    defaultValue={12}
                  >
                    <MenuItem>Attard</MenuItem>
                    <MenuItem>Balzan</MenuItem>
                    <MenuItem>Birkirkara</MenuItem>
                    <MenuItem>Birżebbuġa</MenuItem>
                    <MenuItem>Cospicua</MenuItem>
                    <MenuItem>Dingli</MenuItem>
                    <MenuItem>Fgura</MenuItem>
                    <MenuItem>Floriana</MenuItem>
                    <MenuItem>Fontana</MenuItem>
                    <MenuItem>Gudja</MenuItem>
                    <MenuItem value={12}>Għajnsielem</MenuItem>
                    <MenuItem>Għarb</MenuItem>
                    <MenuItem>Għargħur</MenuItem>
                    <MenuItem>Għasri</MenuItem>
                    <MenuItem>Għaxaq</MenuItem>
                    <MenuItem>Gżira</MenuItem>
                    <MenuItem>Iklin</MenuItem>
                    <MenuItem>Il-Gżira</MenuItem>
                    <MenuItem>Imdina</MenuItem>
                    <MenuItem>Imqabba</MenuItem>
                    <MenuItem>Imsida</MenuItem>
                    <MenuItem>Imtarfa</MenuItem>
                    <MenuItem>Imġarr</MenuItem>
                    <MenuItem>Kalkara</MenuItem>
                    <MenuItem>Kerċem</MenuItem>
                    <MenuItem>Kirkop</MenuItem>
                    <MenuItem>Lija</MenuItem>
                    <MenuItem>Luqa</MenuItem>
                    <MenuItem>Marsa</MenuItem>
                    <MenuItem>Marsaskala</MenuItem>
                    <MenuItem>Marsaxlokk</MenuItem>
                    <MenuItem>Mellieħa</MenuItem>
                    <MenuItem>Mosta</MenuItem>
                    <MenuItem>Munxar</MenuItem>
                    <MenuItem>Nadur</MenuItem>
                    <MenuItem>Naxxar</MenuItem>
                    <MenuItem>Paola</MenuItem>
                    <MenuItem>Pembroke</MenuItem>
                    <MenuItem>Pietà</MenuItem>
                    <MenuItem>Qala</MenuItem>
                    <MenuItem>Qormi</MenuItem>
                    <MenuItem>Qrendi</MenuItem>
                    <MenuItem>Rabat</MenuItem>
                    <MenuItem>Safi</MenuItem>
                    <MenuItem>Saint Pauls Bay</MenuItem>
                    <MenuItem>San Lawrenz</MenuItem>
                    <MenuItem>San Ġiljan</MenuItem>
                    <MenuItem>San Ġwann</MenuItem>
                    <MenuItem>Sannat</MenuItem>
                    <MenuItem>Santa Luċija</MenuItem>
                    <MenuItem>Santa Venera</MenuItem>
                    <MenuItem>Senglea</MenuItem>
                    <MenuItem>Siġġiewi</MenuItem>
                    <MenuItem>Sliema</MenuItem>
                    <MenuItem>Swieqi</MenuItem>
                    <MenuItem>Tarxien</MenuItem>
                    <MenuItem>Ta Xbiex</MenuItem>
                    <MenuItem>Valletta</MenuItem>
                    <MenuItem>Victoria</MenuItem>
                    <MenuItem>Vittoriosa</MenuItem>
                    <MenuItem>Xagħra</MenuItem>
                    <MenuItem>Xewkija</MenuItem>
                    <MenuItem>Xgħajra</MenuItem>
                    <MenuItem>Ħamrun</MenuItem>
                    <MenuItem>Żabbar</MenuItem>
                    <MenuItem>Żebbuġ</MenuItem>
                    <MenuItem>Żebbuġ</MenuItem>
                    <MenuItem>Żejtun</MenuItem>
                    <MenuItem>Żurrieq</MenuItem>
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
                    defaultValue="2023-05-23"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                    Admission Through
                  </InputLabel>
                  <Select labelId="admissionthru" id="admissionthru" label="Admission Through" defaultValue={4}>
                    <MenuItem value={1}>Internal Transfer</MenuItem>
                    <MenuItem value={2}>Mater Dei Hospital</MenuItem>
                    <MenuItem value={3}>Own Home</MenuItem>
                    <MenuItem value={4}>Care Home</MenuItem>
                    <MenuItem value={5}>Private Hospital</MenuItem>
                    <MenuItem value={6}>Other Government Hospital</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                  <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                    Consultant
                  </InputLabel>
                  <Select labelId="consultant" id="consultant" label="Consultant" defaultValue={3}>
                    <MenuItem value={1}>Dr. S. Abela</MenuItem>
                    <MenuItem value={2}>Dr. E. Bellia</MenuItem>
                    <MenuItem value={3}>Dr. J. Cordina</MenuItem>
                    <MenuItem value={4}>Dr. S. Dalli</MenuItem>
                    <MenuItem value={5}>Dr. J. Dimech</MenuItem>
                    <MenuItem value={6}>Dr. B. Farrugia</MenuItem>
                    <MenuItem value={7}>Dr. P. Ferry</MenuItem>
                    <MenuItem value={8}>Dr. S. La Maestra</MenuItem>
                    <MenuItem value={9}>Dr. M. A. Vassallo</MenuItem>      
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
              <Grid item xs={12}>
                <TextField
                  id="maindiagnosis"
                  name="maindiagnosis"
                  label="Main Diagnosis"
                  fullWidth
                  variant="standard"
                  defaultValue="Falls"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="otherdiagnosis"
                  name="otherdiagnosis"
                  label="Other Diagnosis"
                  fullWidth
                  variant="standard"
                  defaultValue="Head Injury, Fractured Femur"
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', mt:5, p: 3, backgroundColor: 'white' }}>
            <Grid>
              <Typography variant="h6" gutterBottom>
                Pick Ward
              </Typography>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                  Patient's Admission Ward
                </InputLabel>
                <Select labelId="currentward" id="currentward" label="Current Ward" defaultValue={2}>
                  <MenuItem value={1}>Reh Ward 1: 1 available bed</MenuItem>
                  <MenuItem value={2}>Reh Ward 2: 2 available bed</MenuItem>
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
