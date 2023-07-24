import { Helmet } from 'react-helmet-async';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
// @mui
import { Dialog, DialogTitle, Box, DialogContent, IconButton, Grid, Button, Container, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { auth } from '../config/firebase';
import Iconify from '../components/iconify';
import associationData from '../sections/@dashboard/algorithms/associationData';
import BatteryBar from '../sections/@dashboard/algorithms/batteryBar';

// ----------------------------------------------------------------------

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [foundAssociations, setFoundAssociations] = useState([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false); // test | So "no association found" text would only be visible when user click button
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState(null);

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

  const [optionsAmount, setOptionsAmount] = useState([]);

  const options = [
    { value: 'Bowels', label: 'Bowels' },
    { value: 'Transferring', label: 'Transferring', isDisabled: 'true' },
    { value: 'Bladder', label: 'Bladder' },
    { value: 'Mobility', label: 'Mobility' },
    { value: 'Dressing', label: 'Dressing' },
    { value: 'Toilet Use', label: 'Toilet Use' },
    { value: 'Stairs', label: 'Stairs' },
    { value: 'Feeding', label: 'Feeding', isDisabled: 'true' },
    { value: 'Bathing', label: 'Bathing' }
  ];

  const sortedAssociations = foundAssociations.sort(
    (a, b) => b.Support - a.Support
  );

  const findAssociations = () => {
    const selectedAntecedents = optionsAmount.map((option) => option.value);
    const filteredAssociations = associationData.filter((association) =>
      selectedAntecedents.every((antecedent) =>
        association.Antecedents.includes(antecedent)
      )
    );
    setFoundAssociations(filteredAssociations);
    setIsButtonClicked(true);
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <Helmet>
        <title> Predictive Analytics | KGH </title>
      </Helmet>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Additional Metrics</DialogTitle>
        <DialogContent sx={{ minWidth: '500px' }}>
          {selectedAssociation !== null && (
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

        <Accordion sx={{borderRadius: '10px', backgroundColor: '#f5f5f5', mb: 5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
            <Typography variant="h4">Barthel ADL - Predictions on Length of Stay</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div><iframe style={{ border: '0px' }} title="myFrame" height="1300px" width="100%" src="http://127.0.0.1:5000/" /></div>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ borderRadius: '10px', backgroundColor: '#f5f5f5', mb: 5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
            <Typography variant="h4">Barthel ADL - Risk Associations</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Select
              isMulti
              onChange={(o) => setOptionsAmount(o)}
              isOptionDisabled={() => optionsAmount.length >= 3}
              options={options}
              labelId="antecedents" id="antecedents" label="Antecedents"
              sx={{ width: '200px' }}
            />
            <Button fullWidth sx={{ mb: 4, mt: 3 }} onClick={findAssociations}>
              Find Associations
            </Button>
              <Grid container spacing={2}>
              {foundAssociations.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>No.</TableCell>
                        <TableCell>Problem</TableCell>
                        <TableCell>Risk</TableCell>
                        <TableCell>Probability</TableCell>
                        <TableCell>Accuracy</TableCell>
                        <TableCell>&nbsp;</TableCell>
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
                          <TableCell align="right">
                            <IconButton size="large" color="inherit" onClick={() => handleAssociationClick(association)}><Iconify icon={'uil:analytics'} /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                isButtonClicked === true ? (
                  <Typography color="#888888" sx={{ mt: 2, ml: 2 }}>
                    No associations found with the given options.
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