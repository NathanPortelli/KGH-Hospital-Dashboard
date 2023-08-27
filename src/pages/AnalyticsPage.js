import { Helmet } from 'react-helmet-async';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
// @mui
import { Dialog, DialogTitle, DialogContent, IconButton, Grid, Button, Container, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';

import { auth } from '../config/firebase';
import Iconify from '../components/iconify';
import associationData from '../sections/@dashboard/algorithms/associationData';
import BatteryBar from '../sections/@dashboard/algorithms/batteryBar';

// ----------------------------------------------------------------------

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Checks user is logged in
  const [foundAssociations, setFoundAssociations] = useState([]); // Filtered list
  const [isButtonClicked, setIsButtonClicked] = useState(false); // So "no association found" text would only be visible when user click button
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState(null);

  // 'More information' icon click
  const handleAssociationClick = (value) => {
    setIsDialogOpen(true); 
    setSelectedAssociation(value);
  };

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

  const [optionsAmount, setOptionsAmount] = useState([]); // Amount of options inputted by user in react-select input (max 3)

  // List of options in select input
  const options = [
    { value: 'Bowels', label: 'Bowels' },
    { value: 'Transferring', label: 'Transferring', isDisabled: true }, // Set to 'disabled' as provided associationData list contains none with 'Transferring' in association
    { value: 'Bladder', label: 'Bladder' },
    { value: 'Mobility', label: 'Mobility' },
    { value: 'Dressing', label: 'Dressing' },
    { value: 'Toilet Use', label: 'Toilet Use' },
    { value: 'Stairs', label: 'Stairs' },
    { value: 'Feeding', label: 'Feeding', isDisabled: true }, // Set to 'disabled' as provided associationData list contains none with 'Feeding' in association
    { value: 'Bathing', label: 'Bathing' }
  ];

  // Sort list based off support 
  const sortedAssociations = foundAssociations.sort(
    (a, b) => b.Support - a.Support
  );

  // When clicking 'Find Associations' button, checks list of inputted values and filters from associationData list of antecedents
  const findAssociations = () => {
    const selectedAntecedents = optionsAmount.map((option) => option.value);
    const filteredAssociations = associationData.filter((association) =>
      selectedAntecedents.every((antecedent) =>
        association.Antecedents.includes(antecedent)
      )
    );
    setFoundAssociations(filteredAssociations); // List is not empty
    setIsButtonClicked(true);
  };

  if (!isAuthenticated) { // Checks that user is logged in
    navigate('/login');
    return null;
  }
  return (
    <>
      <Helmet>
        <title> Predictive Analytics | KGH </title>
      </Helmet>

      {/* Popup with additional information for each listed in 'Risk Association; */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Additional Metrics</DialogTitle>
        <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={() => setIsDialogOpen(false)}>
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ minWidth: '500px' }}>
          {selectedAssociation !== null && (
            // Up to 4 dps
            <Typography>
              <b>Lift:</b> {selectedAssociation.Lift.toFixed(4)}<br />
              <b>Leverage:</b> {selectedAssociation.Leverage.toFixed(4)}<br />
              <b>Conviction:</b> {selectedAssociation.Conviction.toFixed(4)}<br />
              <b>Zhang's Metric:</b> {selectedAssociation.ZhangsMetric.toFixed(4)}<br />
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Predictive Analytics
        </Typography>
        {/* Prediction on Length of Stay */}
        {/* This is run from 'FlaskApp' through iframe */}
        <Accordion sx={{ backgroundColor: '#f5f5f5', mb: 5 }}>
          <AccordionSummary sx={{ borderRadius: '10px', backgroundColor: '#ba2737', color: 'white'}} expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} aria-controls="panel2a-content" id="panel2a-header">
            <Typography variant="h4">Barthel ADL - Predictions on Length of Stay</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div><iframe style={{ border: '0px' }} title="myFrame" height="1300px" width="100%" src="http://127.0.0.1:5000/" /></div> {/* Set src to relevant IP/localhost */}
          </AccordionDetails>
        </Accordion>

        {/* Prediction on potential Risk Associations */}
        <Accordion sx={{ backgroundColor: '#f5f5f5', mb: 5 }}>
          <AccordionSummary sx={{ borderRadius: '10px', backgroundColor: '#ba2737', color: 'white'}} expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} aria-controls="panel2a-content" id="panel2a-header">
            <Typography variant="h4">Barthel ADL - Risk Associations</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Allows user to select up to 3 Barthel score types */}
            <Typography sx={{ mt: 2, mb: 2 }}>Select between <b>1</b> and <b>3</b> Barthel Index activities that the patient scored poorly <i>(highly dependent)</i>:</Typography>
            <Select
              placeholder='Select activity/activities...'
              isMulti
              onChange={(o) => setOptionsAmount(o)}
              isOptionDisabled={() => optionsAmount.length >= 3}
              options={options}
              labelId="antecedents" id="antecedents" label="Antecedents"
              sx={{ width: '200px' }}
            />
            <Button variant='contained' sx={{ display: 'block', margin: 'auto', mb: 4, mt: 3, fontSize: '16px' }} onClick={findAssociations}>
              Find Associations
            </Button>
            <Grid container>
              {foundAssociations.length > 0 ? (
                <Grid item xs={12}>
                  <Typography sx={{ mt: 2, mb: 2 }}>The probability of the patient also being at risk of developing issues with the following activities <i>(based on previous admissions)</i>:</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>No.</TableCell>
                          <TableCell>Problem/s</TableCell>
                          <TableCell>Risk</TableCell>
                          <TableCell>Probability</TableCell>
                          <TableCell>Accuracy</TableCell>
                          <TableCell sx={{textAlign: 'center'}}>More</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedAssociations.map((association, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{association.Antecedents}</TableCell>
                            <TableCell>{association.Consequents}</TableCell>
                            <TableCell sx={{ textAlign: "left" }}> 
                              <BatteryBar percentage={(association.Support * 100).toFixed(1)} />
                              {(association.Support * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                              <BatteryBar percentage={(association.Confidence * 100).toFixed(1)} />
                              {(association.Confidence * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell align="center">
                              <IconButton size="large" color="inherit" onClick={() => handleAssociationClick(association)}><Iconify icon={'uil:analytics'} /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              ) : (
                // If the combination returns nothing from the associationData list
                isButtonClicked === true ? (
                  <Typography color="#888888" sx={{ mt: 2, ml: 2 }}>
                    No associations found with the given option/s.
                  </Typography>
                ) : null // So the above is not visible when the user has not yet submitted anything
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Container>
    </>
  );
}