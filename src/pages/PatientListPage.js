import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { MenuItem, Card, Table, Stack, Paper, Button, TableRow, Divider, TableBody, TableCell, Container, Typography, IconButton, TableContainer, TablePagination, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { toast } from 'react-toastify';

// components
import { updateDoc, doc, getDoc, collection, addDoc, getDocs, query, where, limit, startAfter } from 'firebase/firestore';
import { read, utils } from 'xlsx';

import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead } from '../sections/@dashboard/user';
// firebase
import { auth, db } from '../config/firebase';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'idnum', label: 'ID Number', alignRight: false },
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'gender', label: 'Sex', alignRight: false },
  { id: 'admissiondate', label: 'Admitted on', alignRight: false },
  { id: 'consultant', label: 'Consultant', alignRight: false },
  { id: 'ward', label: 'Ward', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

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

export default function UserPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [patientList, setPatientList] = useState([]);
  const patientCollectionRef = collection(db, 'patients');

  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const [lastDoc, setLastDoc] = useState(null);

  const [patientCount, setPatientCount] = useState(0);
  const patientsCounterRef = doc(db, 'patientsCounter', 'counter');

  useEffect(() => {
    getDoc(patientsCounterRef).then((docSnapshot) => {
      if (docSnapshot.exists()) { setPatientCount(docSnapshot.data().count); }
    });
  }, []);

  const getPatientList = async (startAfterDoc) => {
    try {
      let data;
      // set to 10 as test due to raed requests consumption while testing
      if (startAfterDoc) {
        data = await getDocs(query(patientCollectionRef, startAfter(startAfterDoc), limit(10)));
      } else {
        data = await getDocs(query(patientCollectionRef, limit(10))); 
      }
      
      const patientData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const lastDoc = data.docs[data.docs.length - 1];
      setLastDoc(lastDoc);
  
      const newPatientList = patientData.map((patient) => {
        const admissionDetailsData = patient.admissiondetails || {};
        const patientStatus = patient.patientStatus || 'Not Set';
  
        return {
          ...patient,
          AdmitDate: admissionDetailsData.AdmitDate || '',
          AdmissionWard: admissionDetailsData.AdmissionWard || '',
          Consultant: admissionDetailsData.Consultant || '',
          patientStatus,
        };
      });
      setPatientList(newPatientList);

      // // Setting up real-time listener for patient collection -- tofix
      // const unsubscribe = onSnapshot(query(patientCollectionRef, limit(20)), (snapshot) => {
      //   const updatedPatientList = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    
      //   // Update the patient list state
      //   setPatientList(updatedPatientList);
      // });
  
      // // Unsubscribe from the listener when the component unmounts or when the function is called again
      // return () => unsubscribe();
  
    } catch (e) {
      console.error(e);
      toast.error("Error getting patient list. Please try again later.");
    }
    
    // return undefined;
  };
  
  useEffect(() => { getPatientList(); }, []);

  // const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = patientList.map((n) => n.FirstName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    if (newPage > page) {
      getPatientList(lastDoc);
    } else {
      // handle going back in pages -todo
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  // const handleFilterByName = (event) => {
  //   const searchText = event.target.value || '';
  //   setPage(0);
  //   setSearchQuery(searchText);
  // };  

  const navigate = useNavigate();
  const handleEditClick = (idNum) => { navigate(`/dashboard/patient/${idNum}`); };  

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - patientList.length) : 0;
  const filteredPatients = applySortFilter(
    patientList,
    getComparator(order, orderBy),
    filterName || searchQuery
  );

  const formatDateExcel = (serialDate) => {
    console.log("serialDate", serialDate)
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const excelEpoch = new Date('1900-01-01');
    const millisecondsOffset = (serialDate - 1) * millisecondsPerDay;
    const date = new Date(excelEpoch.getTime() + millisecondsOffset);
    console.log("date", date)
    // Check if the date is valid, and return an empty string or any other suitable value for invalid dates
    if (Number.isNaN(date.getTime())) { return ''; }
  
    // Format the valid date as 'YYYY-MM-DD'
    const formattedDate = date.toISOString().split('T')[0];
    console.log("formattedDate", formattedDate)
    return formattedDate;
  };

  const [isFileDragging, setIsFileDragging] = useState(false);

  useEffect(() => {
    const handleDragEnter = (event) => {
      event.preventDefault();
      if (!event.target.classList.contains('file-upload-input')) {
        setIsFileDragging(true);
        event.dataTransfer.dropEffect = 'copy';
      }
    };
    
    const handleDragOver = (event) => {
      event.preventDefault();
      if (!event.target.classList.contains('file-upload-input')) { event.dataTransfer.dropEffect = 'copy'; }
    };

    const handleDragLeave = (event) => {
      // Check if the related target is a child of the drop area
      if (!event.currentTarget.contains(event.relatedTarget)) { setIsFileDragging(false); }
    };

    const handleDrop = (event) => {
      event.preventDefault();
      setIsFileDragging(false);
    
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        handleDroppedFile(file);
      }
    };

    // Add event listeners for drag and drop
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    // Clean up event listeners
    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    // Handle the selected file
    console.log("2")
    handleDroppedFile(file);
  };

  const handleDroppedFile = async (file) => {
    // Check if the file format is valid (in this case, Excel file with .xlsx extension)
    if (!file || !file.name.endsWith('.xlsx')) {
      toast.error('Invalid file format. Please upload an Excel file (.xlsx).');
      return;
    }

    // Read the Excel file
    const workbook = await new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        resolve(workbook);
      };
      fileReader.onerror = (error) => { reject(error); };
      fileReader.readAsArrayBuffer(file);
    });

    // Get the first sheet from the workbook
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert the sheet data into JSON format
    const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

    // Check if the Excel file has the required headers
    const requiredHeaders = ['Age', 'DOB', 'FirstName', 'IDNum', 'LastName', 'Locality', 'Sex', 'AdmissionThru', 'AdmissionWard', 'AdmitDate', 'Consultant', 'MainDiagnosis', 'OtherDiagnosis'];
    const headers = jsonData[0];
    const hasRequiredHeaders = requiredHeaders.every((requiredHeader) =>
      headers.includes(requiredHeader)
    );

    if (!hasRequiredHeaders) {
      toast.error('Invalid file format. The Excel file is missing required headers.');
      return;
    }

    // Get the data without the headers
    const data = jsonData.slice(1);

    // Create an array of objects with keys from headers and values from data
    const patients = data.map((row) => {
      const patient = {};
      row.forEach((value, index) => {
        patient[headers[index]] = value;
      });

      // Format the "AdmitDate" and "DOB" values
      patient.AdmitDate = formatDateExcel(patient.AdmitDate);
      patient.DOB = formatDateExcel(patient.DOB);

      return patient;
    });

    // Import the patients data to Firestore
    const patientCollectionRef = collection(db, 'patients');

    patients.forEach(async (patient) => {
      try {
        const { Age, DOB, FirstName, IDNum, LastName, Locality, Sex, AdmissionThru, AdmissionWard, AdmitDate, Consultant, MainDiagnosis, OtherDiagnosis } = patient;
        const patientData = { 
          Age, DOB, FirstName, IDNum, LastName, Locality, Sex,
          admissiondetails: { AdmissionThru, AdmissionWard, AdmitDate, Consultant, MainDiagnosis, OtherDiagnosis, },
        };
        await addDoc(patientCollectionRef, patientData);
      } catch (e) {
        toast.error('Error adding patient');
        console.log("error adding patient", e);
      }
    });
    toast.success('Patients successfully imported. Refresh the page to view.');
  };    
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  const handleOpenStatusDialog = (idNum) => {
    const selectedPatient = patientList.find((patient) => patient.id === idNum);
    setSelectedPatient(selectedPatient);
    setSelectedStatus(selectedPatient.patientStatus || 'Not Set');
    setOpenStatusDialog(true);
  };
  
  const handleCloseStatusDialog = async () => {
    try {
      const patientRef = doc(db, 'patients', selectedPatient.id);
      await updateDoc(patientRef, { patientStatus: selectedStatus });
      setSelectedPatient(null);
      setOpenStatusDialog(false);
    } catch (error) {
      console.error('Error updating patient status:', error);
      toast.error('Error updating patient status. Please try again.');
    }
  };
  
  const getPatientStatusColor = (status) => {
    switch (status) {
      case 'Not Set':
        return 'grey';
      case 'Reserved':
        return 'black';
      case 'Checking In':
        return 'green';
      case 'Tests':
        return '#ba000d';
      case 'Observation':
        return 'teal';
      case 'Checking Out':
        return 'brown';
      case 'Discharged':
        return 'red';
      default:
        return 'grey';
    }
  };  

  const [selectedStatus, setSelectedStatus] = useState('Not Set');

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  return (
    <>
      <Helmet>
        <title>Patient List | KGH</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" gutterBottom> Patient List </Typography>
          <Button variant="contained" onClick={handleOpenDialog}> + Add New Patients </Button>
        </Stack>

        <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
          <DialogTitle>Select Status</DialogTitle>
          <DialogContent>
            <TextField select fullWidth label="Status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <MenuItem value="Not Set">Not Set</MenuItem>
              <MenuItem value="Reserved">Reserved</MenuItem>
              <MenuItem value="Checking In">Checking In</MenuItem>
              <MenuItem value="Tests">Tests</MenuItem>
              <MenuItem value="Observation">Observation</MenuItem>
              <MenuItem value="Checking Out">Checking Out</MenuItem>
              <MenuItem value="Discharged">Discharged</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStatusDialog} variant="contained" autoFocus> Save </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Add New Patients</DialogTitle>
          <DialogContent>
            <Container>
              <Button sx={{height: '50px', fontSize: '18px', mt: 3}} fullWidth variant='contained' startIcon={<Iconify icon="eva:plus-fill" />} href="/dashboard/newpatient">
                Add a Patient
              </Button>
              <Typography align="center" variant="h5" sx={{mt: 5}} gutterBottom>
                ...or upload in bulk
              </Typography>
              
              <input type="file" id="file-upload-input" className="file-upload-input" accept=".xlsx" onChange={handleFileUpload} style={{display: 'none',}}/>
              <label
                htmlFor="file-upload-input"
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsFileDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsFileDragging(false);
                }}
                style={{ padding: '2rem', backgroundColor: isFileDragging ? 'cyan' : 'lightblue', border: '2px dashed gray', borderRadius: '5px', cursor: 'pointer', height: '350px',
                  width: '100%', margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', outline: 'none',}}>
                <Iconify icon="eva:upload-fill" style={{ width: '65px', height: '65px', marginRight: '0.5rem' }} />
                <Typography sx={{mt: 3}}variant="h4" gutterBottom>Drag and drop your XLSX file here</Typography>
                <Typography sx={{mt: 1, mb: 2}} gutterBottom>
                  Ensure that the file is in <b>.XLSX</b> format and that it contains the following column headers:<br />'Age', 'DOB', 'FirstName', 'IDNum', 'LastName', 'Locality', 'Sex', 'AdmissionThru', 'AdmissionWard', 'AdmitDate', 'Consultant', 'MainDiagnosis', 'OtherDiagnosis'.
                </Typography>
                <Button variant="contained" startIcon={<Iconify icon="eva:upload-fill" />}>{isFileDragging ? 'Drop the file here' : 'browse files'}</Button>
              </label>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
          </DialogActions>
        </Dialog>

        <TextField id="search"label="Search patients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} fullWidth margin="normal" variant="outlined"/>

        <Card>
          {/* <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} /> */}
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={patientList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}/>
                <TableBody>
                  {filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, IDNum, Sex, FirstName, LastName, AdmissionWard, AdmitDate, Consultant } = row;
                    const selectedUser = selected.indexOf(FirstName) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell component="th" scope="row" padding-left="7px">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>{IDNum}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{FirstName} {LastName}</TableCell>
                        <TableCell align="left">{Sex}</TableCell>
                        <TableCell align="left">{formatDate(AdmitDate)}</TableCell>
                        <TableCell align="left">{Consultant}</TableCell> 
                        <TableCell align="left">{AdmissionWard}</TableCell> 
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleOpenStatusDialog(row.id)}
                            style={{ color: 'white', backgroundColor: getPatientStatusColor(row.patientStatus) }}
                          >
                            {row.patientStatus}
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={() => handleEditClick(IDNum)}>
                            <Iconify icon={'tabler:edit'} />
                          </IconButton>
                        </TableCell>
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
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={patientCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
  </>
  );
}