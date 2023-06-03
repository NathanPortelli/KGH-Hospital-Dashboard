import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';

// @mui
import {
  Grid,
  Button,
  Container,
  Typography,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// ----------------------------------------------------------------------

const associationRulesData = `
  Antecedents,Consequents,Support,Confidence,Lift,Leverage,Conviction,Zhang's Metric
  Stairs,Bathing,0.911359725,0.95148248,1.022777652,0.020296332,1.436746988,0.528126265
  Bathing,Stairs,0.911359725,0.979648474,1.022777652,0.020296332,2.072015334,0.31948379
  Dressing,Stairs,0.723752151,0.996445498,1.040314167,0.028046783,11.86345382,0.141602914
  Dressing,Bathing,0.720309811,0.991706161,1.066015318,0.044606753,8.404720925,0.226287355
`;

const antecedentsOptions = [
  { value: 'Bowels ', label: 'Bowels' },
  { value: 'Transferring ', label: 'Transferring' },
  { value: 'Bladder ', label: 'Bladder' },
  { value: 'Mobility ', label: 'Mobility' },
  { value: 'Grooming ', label: 'Grooming' },
  { value: 'Dressing ', label: 'Dressing' },
  { value: 'Toilet Use ', label: 'Toilet Use' },
  { value: 'Stairs ', label: 'Stairs' },
  { value: 'Feeding Use ', label: 'Feeding Use' },
  { value: 'Bathing ', label: 'Bathing' }
];

export default function AnalyticsPage() {
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [associationRulesData, setAssociationRulesData] = useState(null); // Updated

  const handleMenuItemSelect = (event) => {
    const value = event.target.value;
    setSelectedItems((prevSelectedItems) => {
      const exists = prevSelectedItems.includes(value);
      if (!exists && prevSelectedItems.length < 3) {
        return [...prevSelectedItems, value];
      }
      if (exists) {
        return prevSelectedItems.filter((item) => item !== value);
      }
      return prevSelectedItems;
    });
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleFindRules = () => {
    const selectedAntecedents = selectedItems;
    const associationRules = parseAssociationRules();

    // Filter association rules based on selected antecedents
    const filteredRules = associationRules.filter((rule) => {
      const ruleAntecedents = rule.Antecedents.split(',');
      return selectedAntecedents.every((antecedent) =>
        ruleAntecedents.includes(antecedent.trim())
      );
    });

    // Display or process the filtered rules as desired
    console.log('Filtered Rules:', filteredRules);
  };

  const parseAssociationRules = () => {
    if (associationRulesData) {
      const lines = associationRulesData.trim().split('\n');
      const headers = lines[0].split(',');

      const associationRules = lines.slice(1).map((line) => {
        const values = line.split(',');
        const rule = {};

        headers.forEach((header, index) => {
          rule[header.trim()] = values[index].trim();
        });

        return rule;
      });

      return associationRules;
    }

    return [];
  };

  useEffect(() => {
    setAssociationRulesData(associationRulesData);
  }, []);
  return (
    <>
      <Helmet>
        <title> Predictive Analytics | KGH </title>
      </Helmet>

      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Predictive Analytics
        </Typography>

        {/* Antecent Input for FP-Growth Alg */}  

        <Accordion sx={{borderRadius: '10px', mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography variant="h6">FP-Growth: Antecedents</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth size="large">
                <Select
                  labelId="sex"
                  id="sex"
                  label="Sex"
                  multiple
                  value={selectedItems}
                  onChange={handleMenuItemSelect}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <Typography>Select Antecedents</Typography>;
                    }
                    return <Chip key={selected[selected.length - 1]} label={selected[selected.length - 1]} />;
                  }}
                >
                  {antecedentsOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <Button onClick={handleClearSelection}>Clear Selection</Button>
                <br />
                <Button onClick={handleFindRules} variant="contained">
                  Find Rules
                </Button>
              </FormControl>
            </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Admission Results Input for Random Forest / Gradient Boosting */}  
                
        <Accordion sx={{borderRadius: '10px', mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
            <Typography variant="h6">Barthel ADL Predictions - Admission Results</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 400, m: 0 }} size="large">
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
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 400, m: 0 }} size="large">
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
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 400, m: 0 }} size="large">
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
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 400, m: 0 }} size="large">
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
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 400, m: 0 }} size="large">
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
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 400, m: 0 }} size="large">
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
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 400, m: 0 }} size="large">
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
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 400, m: 0 }} size="large">
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
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 400, m: 0 }} size="large">
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
            <Grid item xs={12} sm={6}>
              <FormControl sx={{ minWidth: 400, m: 0 }} size="large">
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
          <Button onClick={handleFindRules} variant="contained" fullWidth>
              Submit Admission Score
          </Button>
        </Accordion>
      </Container>
    </>
  );
}
