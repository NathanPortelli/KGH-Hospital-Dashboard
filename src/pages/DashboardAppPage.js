import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
// sections
import {
  AppCurrentVisits,
  AppChart,
  AppWidgetSummary,
} from '../sections/@dashboard/app';

import { auth } from '../config/firebase';
import Iconify from '../components/iconify';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const theme = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navigate = useNavigate()

  const handleAvailableBedsClick = () => {
    setIsDialogOpen(true);
  };

  const [tableData, setTableData] = useState([]);
  
  useEffect(() => {
    const sampleData = [
      { idnum: '400101M', name: 'Alfred Borg', admittedon: '29/05/2023', consultant: 'Dr. Ebejer', ward: 'Reh Wd 1' },
      { idnum: '104161M', name: 'Simon Caruana', admittedon: '29/05/2023', consultant: 'Dr. Mifsud', ward: 'Reh Wd 5' },
      { idnum: '838392M', name: 'Maria Psaila', admittedon: '29/05/2023', consultant: 'Dr. Mizzi', ward: 'Reh Wd 6' },
      { idnum: '102934M', name: 'Josephine Mizzi', admittedon: '29/05/2023', consultant: 'Dr. Mifsud', ward: 'Reh Wd 2' },
      { idnum: '001201M', name: 'Anthony Sant', admittedon: '29/05/2023', consultant: 'Dr. Ebejer', ward: 'Reh Wd 1' },
      { idnum: '657392M', name: 'Georgina Ebejer', admittedon: '29/05/2023', consultant: 'Dr. Mizzi', ward: 'Reh Wd 10' },
    ];
    setTableData(sampleData);
  }, []);
  

  return (
    <>
      <Helmet>
        <title> Dashboard | KGH </title>
      </Helmet>

      <Container maxWidth="xl">
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
                    {tableData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.idnum}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.admittedon}</TableCell>
                        <TableCell>{row.consultant}</TableCell>
                        <TableCell>{row.ward}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>

          <Grid item xs={12} md={4} lg={4} sx={{ml: 2}}>
            <Box sx={{ width: '100%' }} m={1} pt={1}>
              <AppWidgetSummary title="Listed Patients" total={1035} color="info" icon={'material-symbols:patient-list'} />
            </Box>

            <Box sx={{ width: '100%' }} m={1} pt={1}>
              <AppWidgetSummary title="Inpatients" total={269} color="info" icon={'material-symbols:recent-patient'} />
            </Box>

            <Box sx={{ width: '100%', cursor: 'pointer' }} m={1} pt={1} onClick={handleAvailableBedsClick}>
              <AppWidgetSummary title="Available Beds" total={24} color="info" icon={'material-symbols:bed'} />
            </Box>

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
              <DialogTitle>Available Beds</DialogTitle>
              <DialogContent sx={{ minWidth: '375px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: '#D0F2FF', p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Ward 1</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography>2 available beds</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: '#D0F2FF', p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Ward 2</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography>0 available beds</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: '#D0F2FF', p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Ward 3</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography>4 available beds</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: '#D0F2FF', p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Ward 4</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography>6 available beds</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: '#D0F2FF', p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Ward 5</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography>1 available beds</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: '#D0F2FF', p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Ward 6</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography>3 available beds</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: '#D0F2FF', p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Ward 7</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography>0 available beds</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: '#D0F2FF', p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Ward 8</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography>0 available beds</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: '#D0F2FF', p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Ward 9</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography>4 available beds</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={4}>
                      <Box sx={{ bgcolor: '#D0F2FF', p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Ward 10</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={8}>
                      <Box sx={{ p: 2, mb: 1, display: 'inline-flex' }}>
                        <Typography>4 available beds</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              </DialogActions>
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