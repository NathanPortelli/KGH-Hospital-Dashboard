import * as React from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import { Grid, Button, Container, Stack, Typography, TextField, InputLabel, Input, FormControl, Select, MenuItem, Box } from '@mui/material';
import Iconify from '../components/iconify';

// ----------------------------------------------------------------------

const handleAgeInputChange = (event) => {
  const inputValue = event.target.value;
  const truncatedValue = inputValue.slice(0, 3);
  event.target.value = truncatedValue;
};

// ----------------------------------------------------------------------
  
export default function NewPatientPage() {
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

        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', p: 3, backgroundColor: 'white' }}>
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
              inputProps={{ max: 120, inputComponent: Input }}
              onChange={handleAgeInputChange}
            />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputLabel sx={{ fontSize: '12px' }}>Date of Birth</InputLabel>
              <TextField
                  id="dob"
                  name="dob"
                  fullWidth
                  autoComplete="date"
                  variant="standard"
                  type="date"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                  Sex
                </InputLabel>
                <Select labelId="sex" id="sex" label="Sex">
                  <MenuItem value={1}>Male</MenuItem>
                  <MenuItem value={0}>Female</MenuItem>
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
                  m
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
                  <MenuItem>Għajnsielem</MenuItem>
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                  Admission Through
                </InputLabel>
                <Select labelId="admissionthru" id="admissionthru" label="Admission Through">
                  <MenuItem value={1}>Internal Transfer</MenuItem>
                  <MenuItem value={2}>Mater Dei Hospital</MenuItem>
                  <MenuItem value={3}>Own Home</MenuItem>
                  <MenuItem value={4}>Care Home</MenuItem>
                  <MenuItem value={5}>Private Hospital</MenuItem>
                  <MenuItem value={6}>Other Government Hospital</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
                <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                  Consultant
                </InputLabel>
                <Select labelId="consultant" id="consultant" label="Consultant">
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
            <Grid item xs={12} sm={6}>
              <TextField
                id="maindiagnosis"
                name="maindiagnosis"
                label="Main Diagnosis"
                fullWidth
                variant="standard"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <FormControl sx={{ minWidth: 'calc(100%)', m: 0 }} size="large">
              <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>
                Patient's Admission Ward
              </InputLabel>
              <Select labelId="currentward" id="currentward" label="Current Ward">
                <MenuItem value={1}>Reh Ward 1: 1 available bed</MenuItem>
                <MenuItem value={2}>Reh Ward 2: 2 available bed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Box>
      </Container>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <Button variant="contained" startIcon={<Iconify icon="formkit:submit" />} sx={{ mx: 2, fontSize: '1.1rem', padding: '8px 16px' }}>
          Submit Details
        </Button>
      </Box>
    </>
  );
}
