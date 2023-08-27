import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useNavigate, Link } from 'react-router-dom';

import { toast } from 'react-toastify';

// @mui
import { getDocs, collection, query, limit, startAfter } from 'firebase/firestore';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { Card, IconButton, FormControlLabel, Checkbox, Box, Dialog, DialogTitle, DialogContent, Button, Grid, Container, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from "@mui/icons-material/Close";

// sections
import { AppCurrentVisits, AppChart, AppWidgetSummary, } from '../sections/@dashboard/app';
import LatestAdmissionsTable from '../sections/@dashboard/patient/lastestadmissions';

import { auth, db } from '../config/firebase';
import Iconify from '../components/iconify';

// ----------------------------------------------------------------------

// Used in getComparator for descending sort
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) { return -1; }
  if (b[orderBy] > a[orderBy]) { return 1; }
  return 0;
}

// Used in applySortFilter to order patients
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Used to sort the list of patients (filteredPatients) shown on dashboard
function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => {
      const { IDNum, FirstName, LastName } = _user;
      const searchText = query.toLowerCase();
      return (
        IDNum.toLowerCase().indexOf(searchText) !== -1 ||
        FirstName.toLowerCase().indexOf(searchText) !== -1 ||
        LastName.toLowerCase().indexOf(searchText) !== -1
      );
    });
  }
  return stabilizedThis.map((el) => el[0]);
}

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const theme = useTheme();
  const [isLOSDialogOpen, setIsLOSDialogOpen] = useState(false); // Used to open the "More Info" button in "Average LOS (Days)" info button
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Used to open the "More Info" button in "Available beds" info button & "Patient by ward" chart
  const [isPersonnelDialogOpen, setIsPersonnelDialogOpen] = useState(false); // Used to open the "More Info" button in "Available Personnel" info button
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false); // Used to open the Chart List Dialog for the "Show/Hide Charts" button
  const [isAgeDialogOpen, setIsAgeDialogOpen] = useState(false); // Used to open the "More Info" button in "Admissions by Age" chart
  const [isTransfersDialogOpen, setIsTransfersDialogOpen] = useState(false); // Used to open the "More Info" button in "Admissions/Discharges" chart
  const [isAdmissionsDialogOpen, setIsAdmissionsDialogOpen] = useState(false); // Used to open the "More Info" button in "Admission/Discharges per ward" chart
  const [wardList, setWardList] = useState([]); // Used for getting and setting the ward list from wards collection in Firestore
  const [gridVisibility, setGridVisibility] = useState({ grid1: true, grid2: true, grid3: true, grid4: true, grid5: true, }); // Sets the visibility of the charts, all set to 'true' when initially loading

  const [patientList, setPatientList] = useState([]); // Used for the patient list from patients colleciton in Firestore
  const patientCollectionRef = collection(db, 'patients'); // Used for the patient list from patients colleciton in Firestore

  const [lastDoc, setLastDoc] = useState(null); // Used while getting patient list to limit reads
  const [startAfterDoc, setStartAfterDoc] = useState(null); // Used while getting patient list to limit reads

  // Checks if user is logged in
  const [setIsAuthenticated] = useState(false);
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
  
  const navigate = useNavigate();

  const handleAverageLOS = () => { setIsLOSDialogOpen(true); }; // Sets the Dialog box for the "Average LOS (Days)" info button to appear
  const handleAvailableBedsClick = () => { setIsDialogOpen(true); }; // Sets the Dialog box for the "Available Beds" info button to appear
  const handleAvailablePersonnelClick = () => { setIsPersonnelDialogOpen(true); }; // Sets the Dialog box for the "Available Personnel" info button to appear
  const handleChartsToggleClick = () => { setIsChartDialogOpen(true); }; // Sets the Chart List Dialog for the "Show/Hide Charts" button to appear
  const handleAgeToggleClick = () => { setIsAgeDialogOpen(true); }; // Sets the Dialog box for the "Admissions by Age" chart to appear
  const handleTransfersToggleClick = () => { setIsTransfersDialogOpen(true); }; // Sets the Dialog box for the "Transfers from" chart to appear
  const handleAdmissionsToggleClick = () => { setIsAdmissionsDialogOpen(true); }; // Sets the Dialog box for the "Admission/Discharges per ward" chart to appear

  // Used for the "Transfers from" popup Dialog
  const [selectedTransfers, setSelectedTransfers] = useState(null);
  const [patientCount, setPatientCount] = useState(10); // Initially set to show details for "Internal" button
  const [wardName, setWardName] = useState("Internal Transfers"); // Initially set to show details for "Internal" button
  const handleTransfersButton = (buttonName) => {
    setSelectedTransfers(buttonName);
    switch (buttonName) {
      // Changes the values in the header when each button in the "Transfers from" popup Dialog are pressed
      case 'Internal': setPatientCount(10); setWardName("Internal Transfers"); break;
      case 'MDH': setPatientCount(55); setWardName("Mater Dei Hospital"); break;
      case 'Own': setPatientCount(30); setWardName("Own Home"); break;
      case 'Care': setPatientCount(35); setWardName("Care Homes"); break;
      case 'Private': setPatientCount(7); setWardName("Private Hospitals"); break;
      case 'Hospitals': setPatientCount(6); setWardName("Other Hospitals"); break;
      case 'Other': setPatientCount(3); setWardName("Other"); break;
      default: setPatientCount(10); setWardName("Hospital"); break;
    }
  };

  // Used for the "Admissions by Age" popup Dialog
  const [selectedAge, setSelectedAge] = useState(null);
  const [ageCount, setAgeCount] = useState(13); // Initially set to show details for "0-45" button
  const [age, setAge] = useState("0-45"); // Initially set to show details for "0-45" button
  const handleAgeButton = (buttonName) => {
    setSelectedAge(buttonName);
    switch (buttonName) {
      // Changes the values in the header when each button in the "Admissions by Age" popup Dialog are pressed
      case '0-45': setAgeCount(13); setAge("0-45"); break;
      case '46-65': setAgeCount(25); setAge("46-65"); break;
      case '66-75': setAgeCount(108); setAge("66-75"); break;
      case '76-85': setAgeCount(221); setAge("76-85"); break;
      case '86-95': setAgeCount(191); setAge("86-95"); break;
      case '96+': setAgeCount(7); setAge("96+"); break;
      default: setAgeCount(13); setAge("0-45"); break;
    }
  };

  // Headers for list of consultants in the "available personnel" list
  const personnelColumns = [
    { field: 'id', headerName: 'ID', width: 75 },
    { field: 'name', headerName: 'Consultant', width: 300 },
  ];
  // List of consultants for "available personnel" list
  const personnelRows = [
    { id: 1, name: 'Dr. S. Abela' },
    { id: 2, name: 'Dr. E. Bellia' },
    { id: 3, name: 'Dr. J. Cordina' },
    { id: 4, name: 'Dr. S. Dalli' },
    { id: 5, name: 'Dr. J. Dimech' },
    { id: 6, name: 'Dr. B. Farrugia' },
    { id: 7, name: 'Dr. P. Ferry' },
    { id: 8, name: 'Dr. S. La Maestra' },
    { id: 9, name: 'Dr. M. A. Vassallo' },
  ];

  // Sets date as "1 January 1900" rather than "1900-1-1" as saved in Firebase
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };  

  // Gets list of patients from patients collection in Firestore
  const getPatientList = async (startAfterDoc) => {
    try {
      let data;
      // Limited to 5 patients per view
      if (startAfterDoc) {
        // If not the first set of patients list, start from after the last viewed
        data = await getDocs(query(patientCollectionRef, startAfter(startAfterDoc), limit(5))); 
      } else {
        // If the first set of patients in the list
        data = await getDocs(query(patientCollectionRef, limit(5))); 
      }
      
      // Get patient's details
      const patientData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const lastDoc = data.docs[data.docs.length - 1]; // Last viewed patient (for startAfterDoc)
      setLastDoc(lastDoc);
  
      // Maps patient details that is included in admissiondetails map
      const newPatientList = patientData.map((patient) => {
        const admissionDetailsData = patient.admissiondetails || {};  
        return {
          ...patient,
          AdmitDate: admissionDetailsData.AdmitDate || '',
          AdmissionWard: admissionDetailsData.AdmissionWard || '',
          Consultant: admissionDetailsData.Consultant || '',
        };
      });
      setPatientList(newPatientList);
    } catch (e) {
      console.error("Error getting patient list: ", e);
      toast.error("Error while getting list of patient. Please try again later.");
    }
  };
  useEffect(() => { getPatientList(startAfterDoc); }, [startAfterDoc]);

  // Gets list of wards from wards collection
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const wardsCollectionRef = collection(db, 'wards');
        const snapshot = await getDocs(wardsCollectionRef);
        const wardsData = snapshot.docs.map((doc) => doc.data());
        setWardList(wardsData);
      } catch (error) {
        toast.error("Error occurred while getting ward list. Please try again later.");
        console.error('Error fetching wards:', error);
      }
    };
    fetchWards();
  }, []);  

  // For patient list
  const [page] = useState(0);
  const [order] = useState('desc');
  const [orderBy] = useState('admitdate');
  const [filterName] = useState('');
  const [rowsPerPage] = useState(5);

  // List of patients filtered by applySortFilter
  const filteredPatients = applySortFilter(patientList, getComparator(order, orderBy), filterName);
  // For use to display current date as "January 1, 1900"
  const currentDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', });

  // Test - Temp removed while testing due to reloading sending user to login immediately
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     navigate('/login');
  //   }
  // }, [isAuthenticated, navigate]);
    return (
      <>
      <Helmet>
        <title> Dashboard | KGH </title>
      </Helmet>

      <Container maxWidth="xl">
        <Box display="flex" justifyContent="space-between" alignItems="flex-end">
          <Typography variant="h4" sx={{ mb: 5 }}>Overview</Typography>
          <Typography variant="h5" sx={{ mb: 5, fontWeight: 'normal' }}>{currentDate}</Typography>
        </Box>
        <Grid container spacing={1}>
          {/* Patient list of "latest admissions" */}
          <Grid item xs={12} md={8} lg={8}> 
            <Card sx={{ pr: 3 }}>
              <Box sx={{ width: '100%' }} m={1} pt={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1.2rem', ml: 1 }}> Latest Admissions </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <div> 
                      {/* Takes user to Add Patients page */}
                      <Button component={Link} to="/dashboard/newpatient" variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>Add New Patient</Button>
                    </div>
                    <div> 
                      {/* Takes user to Patient List page */}
                      <Button variant="contained" startIcon={<Iconify icon="ion:list" />} onClick={() => navigate('/dashboard/patientlist')}>Full List</Button>
                    </div>
                  </Box>
                </Box>
                <LatestAdmissionsTable patientList={filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)} formatDate={formatDate} />
              </Box>
            </Card>
          </Grid>
          {/* List of information boxes */}
          <Grid item xs={12} md={4} lg={4}> 
            <Card sx={{ pr: 3 }}>
              <Box sx={{ width: '100%', display: 'flex', mb: 1 }} m={1} pt={1} >
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1.2rem', ml: 1, mb: 2}}>
                  Hospital Information Summary
                </Typography>
              </Box>
              {/* Onclick takes patient to Patient List page */}
              <Box sx={{ width: '100%', cursor: 'pointer'}} m={1} pt={1}>
                <AppWidgetSummary title="Listed Patients" total={735} color="info" icon={'material-symbols:patient-list'} onClick={() => navigate('/dashboard/patientlist')}/>
              </Box>
              {/* Onclick outputs Dialog popup with Length of Stay chart */}
              <Box sx={{ width: '100%', cursor: 'pointer' }} m={1} pt={1} onClick={handleAverageLOS}>
                <AppWidgetSummary title="Average LOS (Days)" total={44} color="info" icon={'material-symbols:date-range'} />
              </Box>
              {/* Onclick takes patient to list of wards, number of available beds & total number of patients */}
              <Box sx={{ width: '100%', cursor: 'pointer' }} m={1} pt={1} onClick={handleAvailableBedsClick}>
                <AppWidgetSummary title="Available Beds" total={wardList.reduce((total, ward) => total + ward.available, 0)} color="info" icon={'material-symbols:bed'} />
              </Box>
              {/* Onclick takes patient to list of personnel types and available personnel table */}
              <Box sx={{ width: '100%', cursor: 'pointer' }} m={1} mb={4} pt={1} onClick={handleAvailablePersonnelClick}>
                <AppWidgetSummary title="Available Personnel" total={39} color="info" icon={'material-symbols:groups'} />
              </Box>
            </Card>

            {/* Dialog Boxes - Start */}

            {/* Dialog box for 'Show/Hide Chart' button */}
            <Dialog open={isChartDialogOpen} onClose={() => setIsChartDialogOpen(false)}>
              <DialogTitle>Show/Hide Charts</DialogTitle>
              <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={() => setIsChartDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
              <DialogContent sx={{ minWidth: '375px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {/* When ticked/unticked it displays/removed the chart using setGridVisibility */}
                  <FormControlLabel control={<Checkbox checked={gridVisibility.grid3} onChange={(event) => setGridVisibility((prevVisibility) => ({...prevVisibility, grid3: event.target.checked,}))}/>}
                    label="Admission/discharges per day"/>
                  <FormControlLabel control={<Checkbox checked={gridVisibility.grid4} onChange={(event) => setGridVisibility((prevVisibility) => ({...prevVisibility, grid4: event.target.checked,}))}/>}
                    label="Patients by ward"/>
                  <FormControlLabel control={<Checkbox checked={gridVisibility.grid1} onChange={(event) => setGridVisibility((prevVisibility) => ({...prevVisibility, grid1: event.target.checked,}))}/>}
                    label="Length of stay"/>
                  <FormControlLabel control={<Checkbox checked={gridVisibility.grid2} onChange={(event) => setGridVisibility((prevVisibility) => ({...prevVisibility, grid2: event.target.checked,}))}/>}
                    label="Transfers from"/>
                  <FormControlLabel control={<Checkbox checked={gridVisibility.grid5} onChange={(event) => setGridVisibility((prevVisibility) => ({...prevVisibility, grid5: event.target.checked,}))}/>}
                    label="Admissions by age"/>
                </Box>
              </DialogContent>
            </Dialog>
            {/* Dialog box for 'Admissions by Age' chart */}
            <Dialog open={isAgeDialogOpen} onClose={() => setIsAgeDialogOpen(false)}>
              <DialogTitle>Admissions by Age</DialogTitle>
              <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={() => setIsAgeDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
              <DialogContent sx={{ minWidth: '500px' }}>
                <Grid item xs={12} sx={{mb: 3}}>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={() => handleAgeButton('0-45')}>0-45</Button>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={() => handleAgeButton('46-65')}>46-65</Button>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={() => handleAgeButton('66-75')}>66-75</Button>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={() => handleAgeButton('76-85')}>76-85</Button>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={() => handleAgeButton('86-95')}>86-95</Button>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={() => handleAgeButton('96+')}>96+</Button>
                </Grid>
                {/* Changes according to button pressed, using handleAgeButton */}
                <Typography variant='h5' sx={{textAlign:"center", fontWeight:"bold", mb:2}}>Age Range {age}: {ageCount} patients</Typography>
                <Grid item xs={12}>
                  <LatestAdmissionsTable patientList={filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)} formatDate={formatDate} />
                </Grid>
              </DialogContent>
            </Dialog>
            {/* Dialog box for 'Transfers from' chart */}
            <Dialog open={isTransfersDialogOpen} onClose={() => setIsTransfersDialogOpen(false)}>
              <DialogTitle>Transfers from</DialogTitle>
              <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={() => setIsTransfersDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
              <DialogContent sx={{ minWidth: '500px' }}>
                <Grid item xs={12} sx={{mb: 3}}>
                  <Button variant="outlined" sx={{ mr: 1, mt: 1 }} onClick={() => handleTransfersButton('Internal')}>Internal</Button>
                  <Button variant="outlined" sx={{ mr: 1, mt: 1 }} onClick={() => handleTransfersButton('MDH')}>MDH</Button>
                  <Button variant="outlined" sx={{ mr: 1, mt: 1 }} onClick={() => handleTransfersButton('Own')}>Own Home</Button>
                  <Button variant="outlined" sx={{ mr: 1, mt: 1 }} onClick={() => handleTransfersButton('Care')}>Care Home</Button>
                  <Button variant="outlined" sx={{ mr: 1, mt: 1 }} onClick={() => handleTransfersButton('Private')}>Private Hospitals</Button>
                  <Button variant="outlined" sx={{ mr: 1, mt: 1 }} onClick={() => handleTransfersButton('Hospitals')}>Other Hospitals</Button>
                  <Button variant="outlined" sx={{ mr: 1, mt: 1 }} onClick={() => handleTransfersButton('Other')}>Other</Button>
                </Grid>
                {/* Changes according to button pressed, using handleTransfersButton */}
                <Typography variant='h5' sx={{textAlign:"center", fontWeight:"bold", mb:2}}>{wardName}: {patientCount} patients</Typography>
                <Grid item xs={12}>
                  <LatestAdmissionsTable patientList={filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)} formatDate={formatDate} />
                </Grid>
              </DialogContent>
            </Dialog>
            {/* Dialog box for 'Available Personnel' button */}
            <Dialog open={isPersonnelDialogOpen} onClose={() => setIsPersonnelDialogOpen(false)}>
              <DialogTitle>Available Personnel</DialogTitle>
              <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={() => setIsPersonnelDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
              <DialogContent sx={{ minWidth: '500px' }}>
                <Typography variant='h5' sx={{textAlign:"center", fontWeight:"bold", mb:2}}>Available Consultants: 9</Typography>
                <Grid container spacing={2}>  
                  <Grid item xs={3}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Button variant="outlined" style={{ width: "120px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Physicians</Button>
                        <Button variant="outlined" style={{ width: "120px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Nurses</Button>
                        <Button variant="outlined" style={{ width: "120px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Physiotherapist</Button>
                        <Button variant="contained" style={{ width: "120px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Consultants</Button>
                        <Button variant="outlined" style={{ width: "120px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Speech Therapists</Button>
                        <Button variant="outlined" style={{ width: "120px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Occupational Therapists</Button>
                        <Button variant="outlined" style={{ width: "120px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Podiatrists</Button>
                        <Button variant="outlined" style={{ width: "120px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Specialists</Button>
                        <Button variant="outlined" style={{ width: "120px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Social Workers</Button>
                        <Button variant="outlined" style={{ width: "120px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Other</Button>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={9}> 
                    <DataGrid rows={personnelRows} columns={personnelColumns} pageSize={5}/>
                  </Grid>
                </Grid>
              </DialogContent>
            </Dialog>
            {/* Dialog box for 'Average LOS (Days)' button */}
            <Dialog open={isLOSDialogOpen} onClose={() => setIsLOSDialogOpen(false)}>
              <DialogTitle>Length of Stay</DialogTitle>
              <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={() => setIsLOSDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
              <Grid container spacing={2}>
                <DialogContent sx={{ minWidth: '500px' }}>
                  <AppChart
                    chartLabels={[ '0', '10', '20', '30', '40', '50+', ]}
                    chartData={[
                      { name: 'Ward 1', type: 'line', fill: 'solid', data: [23, 11, 22, 27, 13, 18], },
                      { name: 'Ward 2', type: 'line', fill: 'solid', data: [24, 25, 11, 17, 12, 23], },
                      { name: 'Ward 3', type: 'line', fill: 'solid', data: [30, 25, 36, 30, 5, 15], },
                      { name: 'Ward 4', type: 'line', fill: 'solid', data: [5, 10, 12, 2, 3, 9], }, 
                      { name: 'Ward 5', type: 'line', fill: 'solid', data: [26, 12, 10, 22, 16, 8], },
                      { name: 'Ward 6', type: 'line', fill: 'solid', data: [4, 23, 24, 12, 25, 13], },
                      { name: 'Ward 7', type: 'line', fill: 'solid', data: [19, 17, 19, 16, 11, 22], },
                      { name: 'Ward 8', type: 'line', fill: 'solid', data: [10, 41, 31, 6, 11, 1], },
                      { name: 'Ward 9', type: 'line', fill: 'solid', data: [9, 12, 37, 15, 20, 12], },
                      { name: 'Ward 10', type: 'line', fill: 'solid', data: [22, 13, 25, 21, 19, 4], },
                    ]}
                  />
                </DialogContent>
              </Grid>
            </Dialog>
            {/* Dialog box for 'Available Beds' button or the 'Patients by ward' chart */}
            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
              <DialogTitle>Available Beds</DialogTitle>
              <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={() => setIsDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
              <Grid container spacing={2}>
                <DialogContent sx={{ minWidth: '500px' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                    <Grid container spacing={1} alignItems="center" sx={{pl: 1, mb: 2}}>
                      <Grid item xs={4}><Box sx={{ display: 'inline-flex' }}><Typography sx={{fontWeight: 'bold'}}>Ward No.</Typography></Box></Grid>
                      <Grid item xs={5}><Box sx={{ display: 'inline-flex' }}><Typography sx={{fontWeight: 'bold'}}> Available no. of beds </Typography></Box></Grid>
                      <Grid item xs={3}><Box sx={{ display: 'inline-flex' }}><Typography sx={{fontWeight: 'bold'}}> Total patients </Typography></Box></Grid>
                    </Grid>
                    {wardList
                      .sort((a, b) => a.wardno - b.wardno) // Sort wardList based on ward number
                      .map((ward) => (
                        <Grid container spacing={1} alignItems="center" key={ward.wardno}>
                          {/* If available beds is equal to 0, display the values in red */}
                          <Grid item xs={4}>
                            <Box sx={{width: '100px', bgcolor: ward.available === 0 ? 'red' : '#D0F2FF', p: 2, mb: 1, display: 'inline-flex'}}>
                              <Typography sx={{ fontWeight: 'bold' }}>Ward {ward.wardno}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={5}>
                            <Box sx={{ display: 'inline-flex' }}>
                              <Typography sx={{ color: ward.available === 0 ? 'red' : 'inherit' }}> {ward.available} available beds </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={3}>
                            <Box sx={{ display: 'inline-flex' }}> 
                              <Typography sx={{ color: ward.available === 0 ? 'red' : 'inherit' }}> {ward.patientno} patients </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      ))}
                  </Box>
                </DialogContent>
              </Grid>
            </Dialog>
            {/* Dialog box for 'Admission/Discharge' chart */}
            <Dialog Dialog open={isAdmissionsDialogOpen} onClose={() => setIsAdmissionsDialogOpen(false)}>
              <DialogTitle>Admission/Discharges per ward</DialogTitle>
              <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={() => setIsAdmissionsDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
              <DialogContent sx={{ minWidth: '500px' }}>
                <Grid container spacing={1}>  
                  <Grid item xs={12} sx={{mb: 3}}>
                    <Button variant="contained" style={{ width: "80px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>15 July</Button>
                    <Button variant="outlined" style={{ width: "80px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>16 July</Button>
                    <Button variant="outlined" style={{ width: "80px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>17 July</Button>
                    <Button variant="outlined" style={{ width: "80px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>18 July</Button>
                    <Button variant="outlined" style={{ width: "80px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>19 July</Button>
                    <Button variant="outlined" style={{ width: "80px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>20 July</Button>
                  </Grid>
                </Grid>
                <AppChart
                  title="Admissions/Discharges on 15th July 2023"
                  chartLabels={['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8', 'Ward 9', 'Ward 10']}
                  chartData={[
                    { name: 'Admissions', type: 'column', fill: 'solid', data: [3, 1, 0, 2, 0, 1, 0, 4, 5, 6], },
                    { name: 'Discharges', type: 'column', fill: 'solid', data: [0, 1, 3, 1, 2, 2, 0, 1, 2, 4], },
                  ]}
                />
              </DialogContent>
            </Dialog>
            {/* Dialog Boxes - End */}

          </Grid>
        </Grid>
        <hr style={{ border:'0', marginBottom:'50px', marginTop:'50px', height:'0.5px', background:'#D3D3D3', }}/>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="h4" sx={{ mb: 4 }}>Hospital Details</Typography>
          <Button variant="outlined" startIcon={<Iconify icon="mdi:eye" />} onClick={handleChartsToggleClick} sx={{ mb: 0 }}>
            Show / Hide Charts
          </Button>
        </Box>
        {/* Charts are visible if gridVisibility is set to true (default) */}
        {/* Chart containing admission/discharge numbers in the last 5 days */}
        <Grid container spacing={1}>
            {gridVisibility.grid3 && (
              <Grid item xs={12} md={6} lg={6}>
                <AppChart
                  title="Admissions/Discharges"
                  chartLabels={['16/07', '17/07', '18/07', '19/07', '20/07',]}
                  chartData={[
                    { name: 'Admissions', type: 'column', fill: 'solid', data: [3, 0, 2, 0, 1], },
                    { name: 'Discharges', type: 'column', fill: 'solid', data: [1, 2, 0, 2, 2], },
                  ]}
                  onClick={handleAdmissionsToggleClick}
                />
              </Grid>
            )}
            {/* Chart containing percentage of patients by ward */}
            {gridVisibility.grid4 && (
              <Grid item xs={12} md={6} lg={6}>
                <AppCurrentVisits
                  title="Patients by Ward"
                  chartData={[
                    { label: 'Ward 1', value: 80 },
                    { label: 'Ward 2', value: 35 },
                    { label: 'Ward 3', value: 19 },
                    { label: 'Ward 4', value: 42 },
                    { label: 'Ward 5', value: 13 },
                    { label: 'Ward 6', value: 15 },
                    { label: 'Ward 7', value: 21 },
                    { label: 'Ward 8', value: 4 },
                    { label: 'Ward 9', value: 31 },
                    { label: 'Ward 10', value: 19 },
                  ]}
                  chartColors={[ theme.palette.primary.main, theme.palette.info.main, theme.palette.warning.main, theme.palette.error.main, ]}
                  onClick={handleAvailableBedsClick}
                />
              </Grid>
            )}
            {/* Chart containing the amount of time a number of patients have spent at the hospital */}
            {gridVisibility.grid1 && (
              <Grid item xs={12} md={12} lg={12} sx={{mt: 2, mb: 2}}>
                <AppChart
                  title="Length of Stay"
                  chartLabels={[ '0', '5', '10', '15',  '20', '25', '30', '35', '40', '45', '50+', ]}
                  chartData={[
                    { name: 'Ward 1', type: 'line', fill: 'solid', data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30], },
                    { name: 'Ward 2', type: 'line', fill: 'solid', data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43], },
                    { name: 'Ward 3', type: 'line', fill: 'solid', data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39], },
                    { name: 'Ward 4', type: 'line', fill: 'solid', data: [5, 10, 12, 2, 3, 9, 10, 2, 9, 9, 4], }, 
                    { name: 'Ward 5', type: 'line', fill: 'solid', data: [26, 12, 10, 22, 51, 23, 13, 3, 9, 28, 32], },
                    { name: 'Ward 6', type: 'line', fill: 'solid', data: [4, 23, 54, 12, 45, 32, 11, 6, 31, 41, 10], },
                    { name: 'Ward 7', type: 'line', fill: 'solid', data: [39, 36, 49, 52, 61, 32, 45, 12, 32, 15, 12], },
                    { name: 'Ward 8', type: 'line', fill: 'solid', data: [10, 41, 31, 6, 11, 32, 45, 12, 54, 23, 4], },
                    { name: 'Ward 9', type: 'line', fill: 'solid', data: [9, 12, 37, 45, 60, 12, 13, 33, 21, 4, 24], },
                    { name: 'Ward 10', type: 'line', fill: 'solid', data: [82, 63, 45, 21, 19, 43, 44, 23, 43, 19, 25], },
                  ]}
                />
              </Grid>
            )}
            {/* Chart containing details of where patient was transferred from */}
            {gridVisibility.grid2 && (
              <Grid item xs={12} md={6} lg={6}>
                <AppCurrentVisits
                  title="Transfers from"
                  chartData={[
                    { label: 'Internal Transfers', value: 10 },
                    { label: 'Mater Dei Hospital', value: 55 },
                    { label: 'Own Homes', value: 30 },
                    { label: 'Care Homes', value: 35 },
                    { label: 'Private Hospitals', value: 7 },
                    { label: 'Other Government Hospitals', value: 6 },
                    { label: 'Other', value: 3 },
                  ]}
                  chartColors={[
                    theme.palette.primary.main,
                    theme.palette.info.main,
                    theme.palette.warning.main,
                    theme.palette.error.main,
                  ]}
                  onClick={handleTransfersToggleClick} 
                />
              </Grid>
            )}
            {/* Chart containing the total number of admissions based off their age range */}
            {gridVisibility.grid5 && (
              <Grid item xs={12} md={6} lg={6}>
                <AppChart
                  title="Admissions by Age"
                  chartLabels={[ '0-45', '46-65', '66-75', '76-85', '86-95', '96+', ]}
                  chartData={[ {name: 'Ages', type: 'column', fill: 'solid', data: [13, 25,	108,	221, 191,	7], }, ]}
                  onClick={handleAgeToggleClick}
                />
              </Grid>
            )}
          </Grid>
      </Container>
    </>
  );
}