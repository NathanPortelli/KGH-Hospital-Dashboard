import { Helmet } from 'react-helmet-async';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from "react-select";

// @mui
import { Grid, Button, Container, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { auth } from '../config/firebase';
import associationData from '../sections/@dashboard/algorithms/associationData';

// ----------------------------------------------------------------------

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [foundAssociations, setFoundAssociations] = useState([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false); // test | So "no association found" text would only be visible when user click button

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

      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Predictive Analytics
        </Typography>

        <Accordion sx={{borderRadius: '10px', backgroundColor: '#f5f5f5', mb: 5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
            <Typography variant="h4">Barthel ADL Predictions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              <iframe style={{border: '0px'}} title="myFrame" height="1300px" width="100%" src="http://127.0.0.1:5000/" />      
            </div>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ borderRadius: '10px', backgroundColor: '#f5f5f5', mb: 5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
            <Typography variant="h4">Barthel ADL Associations</Typography>
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
                        <TableCell>Antecedents</TableCell>
                        <TableCell>Consequents</TableCell>
                        <TableCell>Support</TableCell>
                        <TableCell>Confidence</TableCell>
                        <TableCell>Lift</TableCell>
                        <TableCell>Leverage</TableCell>
                        <TableCell>Conviction</TableCell>
                        <TableCell>Zhang's Metric</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedAssociations.map((association, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{association.Antecedents}</TableCell>
                          <TableCell>{association.Consequents}</TableCell>
                          <TableCell>{association.Support.toFixed(4)}</TableCell>
                          <TableCell sx={{borderRight: '1px solid #CCCCCC'}}>{association.Confidence.toFixed(4)}</TableCell>
                          <TableCell sx={{color: '#888888'}}>{association.Lift.toFixed(4)}</TableCell>
                          <TableCell sx={{color: '#888888'}}>{association.Leverage.toFixed(4)}</TableCell>
                          <TableCell sx={{color: '#888888'}}>{association.Conviction.toFixed(4)}</TableCell>
                          <TableCell sx={{color: '#888888'}}>{association.ZhangsMetric.toFixed(4)}</TableCell>
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