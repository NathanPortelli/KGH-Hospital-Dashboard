import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

// @mui
import { getDocs, collection, query, limit, startAfter } from 'firebase/firestore';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { FormControlLabel, Checkbox, Box, Dialog, DialogTitle, DialogContent, Button, Grid, Container, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
// sections
import { AppCurrentVisits, AppChart, AppWidgetSummary, } from '../sections/@dashboard/app';
import LatestAdmissionsTable from '../sections/@dashboard/patient/lastestadmissions';

import { auth, db } from '../config/firebase';
import Iconify from '../components/iconify';

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) { return -1; }
  if (b[orderBy] > a[orderBy]) { return 1; }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

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
  const [isLOSDialogOpen, setIsLOSDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPersonnelDialogOpen, setIsPersonnelDialogOpen] = useState(false);
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false);
  const [isAgeDialogOpen, setIsAgeDialogOpen] = useState(false);
  const [isTransfersDialogOpen, setIsTransfersDialogOpen] = useState(false);
  const [isAdmissionsDialogOpen, setIsAdmissionsDialogOpen] = useState(false);
  const [wardList, setWardList] = useState([]);
  const [gridVisibility, setGridVisibility] = useState({ grid1: true, grid2: true, grid3: true, grid4: true, grid5: true, });

  const [patientList, setPatientList] = useState([]);
  const patientCollectionRef = collection(db, 'patients');

  const [lastDoc, setLastDoc] = useState(null);
  const [startAfterDoc, setStartAfterDoc] = useState(null);

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
  
  const navigate = useNavigate();

  const handleAverageLOS = () => { setIsLOSDialogOpen(true); };
  const handleAvailableBedsClick = () => { setIsDialogOpen(true); };
  const handleAvailablePersonnelClick = () => { setIsPersonnelDialogOpen(true); };
  const handleChartsToggleClick = () => { setIsChartDialogOpen(true); };
  const handleAgeToggleClick = () => { setIsAgeDialogOpen(true); };
  const handleTransfersToggleClick = () => { setIsTransfersDialogOpen(true); };
  const handleAdmissionsToggleClick = () => { setIsAdmissionsDialogOpen(true); };

  const [selectedTransfers, setSelectedTransfers] = useState(null);
  const [patientCount, setPatientCount] = useState(10);
  const [wardName, setWardName] = useState("Internal Transfers");
  const handleTransfersButton = (buttonName) => {
    setSelectedTransfers(buttonName);
    switch (buttonName) {
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

  const [selectedAge, setSelectedAge] = useState(null);
  const [ageCount, setAgeCount] = useState(13);
  const [age, setAge] = useState("0-45");
  const handleAgeButton = (buttonName) => {
    setSelectedAge(buttonName);
    switch (buttonName) {
      case '0-45': setAgeCount(13); setAge("0-45"); break;
      case '46-65': setAgeCount(25); setAge("46-65"); break;
      case '66-75': setAgeCount(108); setAge("66-75"); break;
      case '76-85': setAgeCount(221); setAge("76-85"); break;
      case '86-95': setAgeCount(191); setAge("86-95"); break;
      case '96+': setAgeCount(7); setAge("96+"); break;
      default: setAgeCount(13); setAge("0-45"); break;
    }
  };

  const personnelColumns = [
    { field: 'id', headerName: 'ID', width: 75 },
    { field: 'name', headerName: 'Consultant', width: 300 },
  ];
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };  

  const getPatientList = async (startAfterDoc) => {
    try {
      let data;
      if (startAfterDoc) {
        data = await getDocs(query(patientCollectionRef, startAfter(startAfterDoc), limit(5)));
      } else {
        data = await getDocs(query(patientCollectionRef, limit(5))); 
      }
      
      const patientData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const lastDoc = data.docs[data.docs.length - 1];
      setLastDoc(lastDoc);
  
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
      console.error(e);
      toast.error("Error getting patient list. Please try again later.");
    }
  };
  useEffect(() => { getPatientList(startAfterDoc); }, [startAfterDoc]);

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const wardsCollectionRef = collection(db, 'wards');
        const snapshot = await getDocs(wardsCollectionRef);
        const wardsData = snapshot.docs.map((doc) => doc.data());
        setWardList(wardsData);
      } catch (error) {
        console.error('Error fetching wards:', error);
      }
    };
    fetchWards();
  }, []);  

  const [page] = useState(0);
  const [order] = useState('desc');
  const [orderBy] = useState('admdate');
  const [filterName] = useState('');
  const [rowsPerPage] = useState(5);

  const filteredPatients = applySortFilter(patientList, getComparator(order, orderBy), filterName);
  const currentDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
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
          <Grid item xs={12} md={7} lg={7} sx={{ml: 2, backgroundColor: '#ffffff' }}>
            <Box sx={{ width: '100%' }} m={1} pt={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}> Latest Admissions </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} href="/dashboard/newpatient">Add New Patient</Button>
                  <Button variant="contained" startIcon={<Iconify icon="ion:list" />} onClick={() => navigate('/dashboard/patientlist')}>Full List</Button>
                </Box>
              </Box>
              <LatestAdmissionsTable patientList={filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)} formatDate={formatDate} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4} lg={4} sx={{ml: 2}}>
            <Box sx={{ width: '100%', cursor: 'pointer'}} m={1} pt={1}>
              <AppWidgetSummary title="Listed Patients" total={735} color="info" icon={'material-symbols:patient-list'} onClick={() => navigate('/dashboard/patientlist')}/>
            </Box>
            <Box sx={{ width: '100%', cursor: 'pointer' }} m={1} pt={1} onClick={handleAverageLOS}>
              <AppWidgetSummary title="Average LOS (Days)" total={44} color="info" icon={'material-symbols:date-range'} />
            </Box>
            <Box sx={{ width: '100%', cursor: 'pointer' }} m={1} pt={1} onClick={handleAvailableBedsClick}>
              <AppWidgetSummary title="Available Beds" total={wardList.reduce((total, ward) => total + ward.available, 0)} color="info" icon={'material-symbols:bed'} />
            </Box>
            <Box sx={{ width: '100%', cursor: 'pointer' }} m={1} pt={1} onClick={handleAvailablePersonnelClick}>
              <AppWidgetSummary title="Available Personnel" total={39} color="info" icon={'material-symbols:groups'} />
            </Box>
            {/* Dialog Boxes - Start */}
            <Dialog open={isChartDialogOpen} onClose={() => setIsChartDialogOpen(false)}>
              <DialogTitle>Show/Hide Charts</DialogTitle>
              <DialogContent sx={{ minWidth: '375px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
            <Dialog open={isAgeDialogOpen} onClose={() => setIsAgeDialogOpen(false)}>
              <DialogTitle>Admissions by Age</DialogTitle>
              <DialogContent sx={{ minWidth: '500px' }}>
                <Grid item xs={12} sx={{mb: 3}}>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={() => handleAgeButton('0-45')}>0-45</Button>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={() => handleAgeButton('46-65')}>46-65</Button>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={() => handleAgeButton('66-75')}>66-75</Button>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={() => handleAgeButton('76-85')}>76-85</Button>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={() => handleAgeButton('86-95')}>86-95</Button>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={() => handleAgeButton('96+')}>96+</Button>
                </Grid>
                <Typography variant='h5' sx={{textAlign:"center", fontWeight:"bold", mb:2}}>Age Range {age}: {ageCount} patients</Typography>
                <Grid item xs={12}>
                  <LatestAdmissionsTable patientList={filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)} formatDate={formatDate} />
                </Grid>
              </DialogContent>
            </Dialog>
            <Dialog open={isTransfersDialogOpen} onClose={() => setIsTransfersDialogOpen(false)}>
              <DialogTitle>Transfers from</DialogTitle>
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
                <Typography variant='h5' sx={{textAlign:"center", fontWeight:"bold", mb:2}}>{wardName}: {patientCount} patients</Typography>
                <Grid item xs={12}>
                  <LatestAdmissionsTable patientList={filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)} formatDate={formatDate} />
                </Grid>
              </DialogContent>
            </Dialog>
            <Dialog open={isPersonnelDialogOpen} onClose={() => setIsPersonnelDialogOpen(false)}>
              <DialogTitle>Available Personnel</DialogTitle>
              <DialogContent sx={{ minWidth: '500px' }}>
                <Typography variant='h5' sx={{textAlign:"center", fontWeight:"bold", mb:2}}>Available Consultants: 9</Typography>
                <Grid container spacing={2}>  
                  <Grid item xs={3}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Button variant="outlined" style={{ width: "100px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Physicians</Button>
                        <Button variant="outlined" style={{ width: "100px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Nurses</Button>
                        <Button variant="contained" style={{ width: "100px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Consultants</Button>
                        <Button variant="outlined" style={{ width: "100px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Speech Therapists</Button>
                        <Button variant="outlined" style={{ width: "100px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Occupational Therapists</Button>
                        <Button variant="outlined" style={{ width: "100px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Podiatrists</Button>
                        <Button variant="outlined" style={{ width: "100px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Specialists</Button>
                        <Button variant="outlined" style={{ width: "100px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Social Workers</Button>
                        <Button variant="outlined" style={{ width: "100px", height: "50px",}} sx={{ mr: 1, mt: 1 }}>Other</Button>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={9}> 
                    <DataGrid rows={personnelRows} columns={personnelColumns} pageSize={5}/>
                  </Grid>
                </Grid>
              </DialogContent>
            </Dialog>
            <Dialog open={isLOSDialogOpen} onClose={() => setIsLOSDialogOpen(false)}>
              <DialogTitle>Length of Stay</DialogTitle>
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
            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
              <DialogTitle>Available Beds</DialogTitle>
              <Grid container spacing={2}>
                <DialogContent sx={{ minWidth: '500px' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                    <Grid container spacing={1} alignItems="center" sx={{pl: 2, mb: 2}}>
                      <Grid item xs={4}>
                        <Box>
                          <Typography sx={{fontWeight: 'bold'}}>Ward No.</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={5}>
                        <Box sx={{ display: 'inline-flex' }}>
                          <Typography sx={{fontWeight: 'bold'}}> Available no. of beds </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ display: 'inline-flex' }}> 
                          <Typography sx={{fontWeight: 'bold'}}> Total patients </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    {wardList
                      .sort((a, b) => a.wardno - b.wardno) // Sort wardList based on ward number
                      .map((ward) => (
                        <Grid container spacing={1} alignItems="center" key={ward.wardno} sx={{pl: 2}}>
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
            <Dialog Dialog open={isAdmissionsDialogOpen} onClose={() => setIsAdmissionsDialogOpen(false)}>
              <DialogTitle>Admission/Discharges per ward</DialogTitle>
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
                  title="Admissions/discharges on 15th July 2023"
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
        <Grid container spacing={1}>
            {gridVisibility.grid3 && (
              <Grid item xs={12} md={6} lg={6} sx={{ cursor: 'pointer' }} onClick={handleAdmissionsToggleClick}>
                <AppChart
                  title="Admissions/discharges per day"
                  chartLabels={['15/07', '16/07', '17/07', '18/07', '19/07', '20/07',]}
                  chartData={[
                    { name: 'Admissions', type: 'column', fill: 'solid', data: [3, 1, 0, 2, 0, 1], },
                    { name: 'Discharges', type: 'column', fill: 'solid', data: [0, 1, 3, 1, 2, 2], },
                  ]}
                />
              </Grid>
            )}
            {gridVisibility.grid4 && (
              <Grid item xs={12} md={6} lg={6} sx={{ cursor: 'pointer' }} onClick={handleAvailableBedsClick}>
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
                />
              </Grid>
            )}
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
            {gridVisibility.grid2 && (
              <Grid item xs={12} md={6} lg={6} sx={{ cursor: 'pointer' }} onClick={handleTransfersToggleClick}>
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
                />
              </Grid>
            )}
            {gridVisibility.grid5 && (
              <Grid item xs={12} md={6} lg={6} sx={{ cursor: 'pointer' }} onClick={handleAgeToggleClick}>
                <AppChart
                  title="Admissions by Age"
                  chartLabels={[ '0-45', '46-65', '66-75', '76-85', '86-95', '96+', ]}
                  chartData={[ {name: 'Ages', type: 'column', fill: 'solid', data: [13, 25,	108,	221, 191,	7], }, ]}
                />
              </Grid>
            )}
          </Grid>
      </Container>
    </>
  );
}