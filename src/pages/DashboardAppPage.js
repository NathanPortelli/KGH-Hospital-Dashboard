import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

// @mui
import { getDocs, collection, query, where, getFirestore } from 'firebase/firestore';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { Stack, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
// sections
import {
  AppCurrentVisits,
  AppChart,
  AppWidgetSummary,
} from '../sections/@dashboard/app';

import { auth, db } from '../config/firebase';
import Iconify from '../components/iconify';

// ----------------------------------------------------------------------

// const TABLE_HEAD = [
//   { id: 'idnum', label: 'ID Number', alignRight: false },
//   { id: 'name', label: 'Name', alignRight: false },
//   { id: 'admissiondate', label: 'Admitted on', alignRight: false },
//   { id: 'consultant', label: 'Consultant', alignRight: false },
//   { id: 'ward', label: 'Ward', alignRight: false },
//   { id: '' },
// ];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wardList, setWardList] = useState([]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [totalPatients, setTotalPatients] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is logged in
        setIsAuthenticated(true);
      } else {
        // User is logged out
        setIsAuthenticated(false);
      }
    });
    // Unsubscribe from the authentication listener when the component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const firestore = getFirestore();
    const patientsCollectionRef = collection(firestore, 'patients');

    const fetchTotalPatients = async () => {
      try {
        const snapshot = await getDocs(patientsCollectionRef);
        const count = snapshot.size;
        setTotalPatients(count);
      } catch (error) {
        console.error('Error fetching total patients:', error);
      }
    };

    fetchTotalPatients();
  }, []);
  
  const navigate = useNavigate()

  const handleAvailableBedsClick = () => {
    setIsDialogOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };  

  const [patientList, setPatientList] = useState([]);
  const patientCollectionRef = collection(db, 'patients');

  useEffect(() => {
    const getPatientList = async () => {
      try {
        const data = await getDocs(patientCollectionRef);
        const patientData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  
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

    getPatientList();
  }, []);

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
  const [selected] = useState([]);
  const [orderBy] = useState('admdate');
  const [filterName] = useState('');
  const [rowsPerPage] = useState(5);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - patientList.length) : 0;

  const filteredPatients = applySortFilter(patientList, getComparator(order, orderBy), filterName);

  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

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
          <Typography variant="h4" sx={{ mb: 5 }}>
            Overview
          </Typography>
          <Typography variant="h5" sx={{ mb: 5 }}>
            {currentDate}
          </Typography>
        </Box>
        <Grid container spacing={1}>
          <Grid item xs={12} md={7} lg={7} sx={{ml: 2, backgroundColor: '#ffffff' }}>
            <Box sx={{ width: '100%' }} m={1} pt={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Latest Admissions
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} href="/dashboard/newpatient">
                    Add New Patient
                  </Button>
                  <Button variant="contained" onClick={() => navigate('/dashboard/patientlist')}>
                    Full List
                  </Button>
                </Box>
              </Box>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#D0F2FF' }}>
                    <TableRow>
                      <TableCell>ID Number</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Admitted</TableCell>
                      <TableCell>Consultant</TableCell>
                      <TableCell>Ward</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, IDNum, FirstName, LastName, AdmissionWard, AdmitDate, Consultant } = row;
                      const selectedUser = selected.indexOf(FirstName) !== -1;

                      return (
                        <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                          <TableCell component="th" scope="row" padding-left="7px">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography variant="subtitle2" noWrap>
                                {IDNum}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">{FirstName} {LastName}</TableCell>
                          <TableCell>{formatDate(AdmitDate)}</TableCell>
                          <TableCell align="left">{Consultant}</TableCell>
                          <TableCell align="left">{AdmissionWard}</TableCell>
                          {/* ... */}
                        </TableRow>
                      );
                    })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>

          <Grid item xs={12} md={4} lg={4} sx={{ml: 2}}>
            <Box sx={{ width: '100%', cursor: 'pointer'}} m={1} pt={1}>
              <AppWidgetSummary title="Listed Patients" total={totalPatients} color="info" icon={'material-symbols:patient-list'} onClick={() => navigate('/dashboard/patientlist')}/>
            </Box>

            <Box sx={{ width: '100%' }} m={1} pt={1}>
              <AppWidgetSummary title="Inpatients" total={83} color="info" icon={'material-symbols:recent-patient'} />
            </Box>

            <Box sx={{ width: '100%', cursor: 'pointer' }} m={1} pt={1} onClick={handleAvailableBedsClick}>
              <AppWidgetSummary
                title="Available Beds"
                total={wardList.reduce((total, ward) => total + ward.available, 0)}
                color="info"
                icon={'material-symbols:bed'}
              />
            </Box>

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
              <DialogTitle>Available Beds</DialogTitle>
              <DialogContent sx={{ minWidth: '375px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {wardList
                    .sort((a, b) => a.wardno - b.wardno) // Sort the wardList based on wardno
                    .map((ward) => (
                      <Grid container spacing={1} alignItems="center" key={ward.wardno}>
                        <Grid item xs={4}>
                          <Box
                            sx={{
                              bgcolor: ward.available === 0 ? 'red' : '#D0F2FF',
                              p: 2,
                              mb: 1,
                              display: 'inline-flex',
                            }}
                          >
                            <Typography sx={{ fontWeight: 'bold' }}>Ward {ward.wardno}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={8}>
                          <Box sx={{ p: 2, mb: 1, display: 'inline-flex' }}>
                            <Typography sx={{ color: ward.available === 0 ? 'red' : 'inherit' }}>
                              {ward.available} available beds
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    ))}
                </Box>
              </DialogContent>
            </Dialog>
          </Grid>
          <Grid item xs={12} md={12} lg={12} sx={{mt: 2, mb: 2}}>
              <AppChart
                title="Length of Stay"
                // subheader="(+43%) than last quarter"
                chartLabels={[
                  '0',
                  '5',
                  '10',
                  '15', 
                  '20',
                  '25',
                  '30',
                  '35',
                  '40',
                  '45',
                  '50+',
                ]}
                chartData={[
                  {
                    name: 'Ward 1',
                    type: 'line',
                    fill: 'solid',
                    data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                  },
                  {
                    name: 'Ward 2',
                    type: 'line',
                    fill: 'solid',
                    data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                  },
                  {
                    name: 'Ward 3',
                    type: 'line',
                    fill: 'solid',
                    data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                  },
                  {
                    name: 'Ward 4',
                    type: 'line',
                    fill: 'solid',
                    data: [5, 10, 12, 2, 3, 9, 10, 2, 9, 9, 4],
                  },
                  {
                    name: 'Ward 5',
                    type: 'line',
                    fill: 'solid',
                    data: [26, 12, 10, 22, 51, 23, 13, 3, 9, 28, 32],
                  },
                  {
                    name: 'Ward 6',
                    type: 'line',
                    fill: 'solid',
                    data: [4, 23, 54, 12, 45, 32, 11, 6, 31, 41, 10],
                  },
                  {
                    name: 'Ward 7',
                    type: 'line',
                    fill: 'solid',
                    data: [39, 36, 49, 52, 61, 32, 45, 12, 32, 15, 12],
                  },
                  {
                    name: 'Ward 8',
                    type: 'line',
                    fill: 'solid',
                    data: [10, 41, 31, 6, 11, 32, 45, 12, 54, 23, 4],
                  },
                  {
                    name: 'Ward 9',
                    type: 'line',
                    fill: 'solid',
                    data: [9, 12, 37, 45, 60, 12, 13, 33, 21, 4, 24],
                  },
                  {
                    name: 'Ward 10',
                    type: 'line',
                    fill: 'solid',
                    data: [82, 63, 45, 21, 19, 43, 44, 23, 43, 19, 25],
                  },
                ]}
              />
            </Grid>

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
              />
            </Grid>

            <Grid item xs={12} md={6} lg={6}>
              <AppChart
                title="Admissions/discharges per day"
                // subheader="(+43%) than last quarter"
                chartLabels={[
                  '20/05/2023',
                  '21/05/2023',
                  '22/05/2023',
                  '23/05/2023',
                  '24/05/2023',
                  '25/05/2023',
                ]}
                chartData={[
                  {
                    name: 'Admissions',
                    type: 'column',
                    fill: 'solid',
                    data: [3, 1, 0, 2, 0, 1],
                  },
                  {
                    name: 'Discharges',
                    type: 'column',
                    fill: 'solid',
                    data: [0, 1, 3, 1, 2, 2],
                  },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <AppCurrentVisits
                title="Patients by Ward"
                chartData={[
                  { label: 'Ward 1', value: 80 },
                  { label: 'Ward 2', value: 35 },
                  { label: 'Ward 3', value: 19 },
                  { label: 'Ward 4', value: 42 },
                ]}
                chartColors={[
                  theme.palette.primary.main,
                  theme.palette.info.main,
                  theme.palette.warning.main,
                  theme.palette.error.main,
                ]}
              />
            </Grid>
          </Grid>
      </Container>
    </>
  );
}