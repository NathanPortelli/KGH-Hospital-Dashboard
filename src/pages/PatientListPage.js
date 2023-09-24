import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { MenuItem, Card, Table, Stack, Button, TableRow, TableBody, TableCell, Container, Typography, IconButton, TableContainer, TablePagination, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import { toast } from 'react-toastify';
// components
import { updateDoc, doc, collection, getDocs, query, limit, startAfter } from 'firebase/firestore';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead } from '../sections/@dashboard/user';
// firebase
import { auth, db } from '../config/firebase';
// components
import { handleDroppedFile } from '../sections/@dashboard/patient/import';


// ----------------------------------------------------------------------

// Headers of patient list table
const TABLE_HEAD = [
  { id: 'idnum', label: 'ID Number', alignRight: false },
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'gender', label: 'Sex', alignRight: false },
  { id: 'admissiondate', label: 'Admitted on', alignRight: false },
  { id: 'consultant', label: 'Consultant', alignRight: false },
  { id: 'ward', label: 'Ward', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'viewedit', label: 'View/Edit', alignRight: true },
];

// Sets date as "1 January 1900" rather than "1900-1-1" as saved in Firebase
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

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

export default function UserPage() {
  const [searchQuery, setSearchQuery] = useState(''); // Used for storing user query in search box
  const [patientList, setPatientList] = useState([]); // Used to store list of patients
  const patientCollectionRef = collection(db, 'patients'); // Stores collection patients from Firestore

  // For patient list
  const [page, setPage] = useState(0);
  const [order] = useState('asc');
  const [selected] = useState([]);
  const [orderBy] = useState('name');
  const [filterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Checks if user is logged in
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

  const [lastDoc, setLastDoc] = useState(null); // Used while getting patient list to limit reads
  const [startAfterDoc] = useState(null); // Used while getting patient list to limit reads

  // Gets list of patients from patients collection in Firestore
  const getPatientList = async (startAfterDoc) => {
    try {
      let data;
      // Limited to 10 patients per view
      if (startAfterDoc) {
        // If not the first set of patients list, start from after the last viewed
        data = await getDocs(query(patientCollectionRef, startAfter(startAfterDoc), limit(10)));
      } else {
        // If the first set of patients in the list
        data = await getDocs(query(patientCollectionRef, limit(10))); 
      }

      // Get patient's details
      const patientData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const lastDoc = data.docs[data.docs.length - 1]; // Last viewed patient (for startAfterDoc)
      setLastDoc(lastDoc);
  
      // Maps patient details that is included in admissiondetails map and patient's status
      const newPatientList = patientData.map((patient) => {
        const admissionDetailsData = patient.admissiondetails || {};
        const patientStatus = patient.patientStatus || 'Not Set'; // If no status is yet set, show status as "Not Set"
  
        return {
          ...patient,
          AdmitDate: admissionDetailsData.AdmitDate || '',
          AdmissionWard: admissionDetailsData.AdmissionWard || '',
          Consultant: admissionDetailsData.Consultant || '',
          patientStatus,
        };
      });
      setPatientList(newPatientList);  
    } catch (e) {
      console.error("Error getting patient list: ", e);
      toast.error("Error while getting list of patient. Please try again later.");
    }
  };
  useEffect(() => { getPatientList(startAfterDoc); }, [startAfterDoc]);

  const navigate = useNavigate();
  const handleEditClick = (idNum) => { navigate(`/dashboard/patient/${idNum}`); }; // When clicking on View/Edit icon, takes user to Patient Details page

  // Left from React MUI sample, checks when rows empty (used when searching patients)
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - patientList.length) : 0;
  // List of filtered patients based on search query
  const filteredPatients = applySortFilter(
    patientList,
    getComparator(order, orderBy),
    filterName || searchQuery
  );
  
  // When user clicks on prev or next page button
  const handleChangePage = async (event, newPage) => {
    const pageCount = Math.ceil(filteredPatients.length / rowsPerPage);
    // If a 'next' page exists
    if (newPage >= 0 && newPage < pageCount) {
      setPage(newPage);
      if (newPage > page) {
        await getPatientList(lastDoc);
        setPage(0);  // reset page state
      } else {
        // sets patient based off last record showed
        const patientsPerPage = rowsPerPage;
        const previousPageStartIndex = (newPage - 1) * patientsPerPage;
        const previousPageStartAfterDoc = filteredPatients[previousPageStartIndex - 1].id;
  
        getPatientList(previousPageStartAfterDoc);
      }
    }
  };  

  useEffect(() => {
    getPatientList(null); 
  }, []);
  
  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10)); // First 10 patients
  };

  // Used for "+ Add new patients" button when importing a list of patients

  // When a file is dragged to the Dialog popup
  const [isFileDragging, setIsFileDragging] = useState(false);

  // Set up event listeners for handling drag-and-drop interactions for a file upload in the drop area
  useEffect(() => {
    const handleDragEnter = (event) => {
      event.preventDefault();
      // Check if the dragged element is not the file upload input itself.
      if (!event.target.classList.contains('file-upload-input')) {
        setIsFileDragging(true); // Indicates that a file is being dragged over the drop area.
        event.dataTransfer.dropEffect = 'copy'; // Sets the drop effect to copy the file
      }
    };
    const handleDragOver = (event) => {
      event.preventDefault();
      if (!event.target.classList.contains('file-upload-input')) { event.dataTransfer.dropEffect = 'copy'; } // Sets the drop effect to copy the file
    };
    const handleDragLeave = (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) { setIsFileDragging(false); } // Indicates that the file is no longer being dragged over the drop area
    };

    // Links to 'import.js' to process and upload records to Firebase
    const handleDrop = (event) => {
      event.preventDefault();
      setIsFileDragging(false); // File dropped
      const {files} = event.dataTransfer;
      if (files.length > 0) {
        const file = files[0]; // First file
        handleDroppedFile(file);
      }
    };

    // Add event listeners for drag and drop
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    // Clean up event listeners when component unmounts to prevent memory leaks
    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Links to 'import.js' to process and upload records to Firebase
  // When file is uploaded using the button rather than drag-and-drop
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    handleDroppedFile(file);
  };

  const [openDialog, setOpenDialog] = useState(false); // Used for the popup Dialog to "Add new patients"
  const [selectedPatient, setSelectedPatient] = useState(null); // For status setting
  const [openStatusDialog, setOpenStatusDialog] = useState(false); // Used for popup Dialog to change status of patient
  const [selectedStatus, setSelectedStatus] = useState('Not Set'); // Default status if user has no set status
  const handleOpenDialog = () => { setOpenDialog(true); }; // Opening "Add new patients" Dialog
  const handleCloseDialog = () => { setOpenDialog(false); }; // Closing "Add new patients" Dialog
  // Opening "Change Status" Dialog, setting selected status to patient's current
  const handleOpenStatusDialog = (idNum) => {
    const selectedPatient = patientList.find((patient) => patient.id === idNum);
    setSelectedPatient(selectedPatient);
    setSelectedStatus(selectedPatient.patientStatus || 'Not Set');
    setOpenStatusDialog(true);
  };
  // Closing "Change Status" Dialog, saving patient's status to currently selected status
  const handleCloseStatusDialog = async () => {
    try {
      const patientRef = doc(db, 'patients', selectedPatient.id);
      await updateDoc(patientRef, { patientStatus: selectedStatus });
      // Updating the status in the local for selected patient
      const updatedPatientList = patientList.map((patient) =>
        patient.id === selectedPatient.id ? { ...patient, patientStatus: selectedStatus } : patient
      );
      setPatientList(updatedPatientList);
      setSelectedPatient(null);
      setOpenStatusDialog(false);
    } catch (error) {
      console.error('Error updating patient status:', error);
      toast.error('Error while updating patient status. Please try again.');
    }
  };

  // List of possible patient statuses, and related colour scheme to show in pill box
  const getPatientStatusColor = (status) => {
    switch (status) {
      case 'Not Set': return 'grey';
      case 'Awaiting List': return 'black';
      case 'Current Patient': return '#008000';
      case 'Observation': return 'teal';
      case 'Day Hospital': return '#ba000d';
      case 'Outpatient': return 'brown';
      case 'Discharged': return 'red';
      case 'RIP': return '#5A5A5A';
      default: return 'grey';
    }
  };
  
  // Sends user to login screen if not logged in
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
        {/* Button opens Dialog popup to go to "Add New Patient" page and a drag-and-drop box to upload records in bulk */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" gutterBottom> Patient List </Typography>
          <Button variant="contained" onClick={handleOpenDialog}> + Add New Patients </Button>
        </Stack>

        {/* Dialog popup containing a list of possible statuses to change user to */}
        <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
          <DialogTitle>Select Status</DialogTitle>
          <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={handleCloseStatusDialog}><CloseIcon /></IconButton>
          <DialogContent sx={{ minWidth: '200px' }}>
            <TextField select fullWidth label="Status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <MenuItem value="Not Set">Not Set</MenuItem>
              <MenuItem value="Awaiting List">Awaiting List</MenuItem>
              <MenuItem value="Current Patient">Current Patient</MenuItem>
              <MenuItem value="Observation">Observation</MenuItem>
              <MenuItem value="Day Hospital">Day Hospital</MenuItem>
              <MenuItem value="Outpatient">Outpatient</MenuItem>
              <MenuItem value="Discharged">Discharged</MenuItem>
              <MenuItem value="RIP">RIP</MenuItem>
            </TextField>
          </DialogContent>
          {/* OnSave status value of the picked user is set to selected status */}
          <DialogActions>
            <Button onClick={handleCloseStatusDialog} variant="contained" autoFocus> Save </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog popup containing a button to go to "Add New Patient" page and a drag-and-drop box to upload records in bulk */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Add New Patients</DialogTitle>
          <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
          <DialogContent>
            <Container>
              <Button fullWidth variant='contained' startIcon={<Iconify icon="eva:plus-fill" />} href="/dashboard/newpatient"> Add a Patient </Button>
              <Typography align="center" variant="h5" sx={{mt: 5}} gutterBottom> ...or upload in bulk </Typography>
              <input type="file" id="file-upload-input" className="file-upload-input" accept=".xlsx" onChange={handleFileUpload} style={{display: 'none'}}/>
              <label htmlFor="file-upload-input" 
                onDragOver={(e) => e.preventDefault()} // When user starts dragging a file over the box
                onDragEnter={(e) => { e.preventDefault(); setIsFileDragging(true); }} // Handles the drop effect to copy the file
                onDragLeave={(e) => { e.preventDefault(); setIsFileDragging(false); }} // When user drags over the box and leaves
                style={{ padding: '2rem', backgroundColor: isFileDragging ? 'cyan' : 'lightblue', border: '2px dashed gray', borderRadius: '5px', cursor: 'pointer', height: '750px',
                  width: '100%', margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', outline: 'none',}}>
                <Iconify icon="eva:upload-fill" style={{ width: '65px', height: '65px', marginRight: '0.5rem' }} />
                <Typography sx={{mt: 3}}variant="h4" gutterBottom>Drag and drop your Excel (XLSX) file here</Typography>
                <Typography sx={{mt: 1, mb: 2}} gutterBottom>
                  Ensure that the file is in <b>.XLSX</b> format and that the first row contains the headers with some of the following patient details:<br /><hr />
                {/* List of possible values accepted by the process to be entered in bulk. */}
                <Typography variant="h6" sx={{mb: 2}}>Personal Details</Typography>
                <ul style={{columns: '3', listStyle:'none'}}>
                  <li>ID Number</li>
                  <li>First Name</li>
                  <li>Last Name</li>
                  <li>Sex (M/F)</li>
                  <li>Age</li>
                  <li>Date of Birth</li>
                  <li>Locality</li>
                </ul><br /><hr />
                <Typography variant="h6" sx={{mb: 2}}>Admission Details</Typography>
                <ul style={{columns: '3', listStyle:'none'}}>
                  <li>Admission Through</li>
                  <li>Admission Ward</li>
                  <li>Date of Admission</li>
                  <li>Consultant</li>
                  <li>Main Diagnosis</li>
                  <li>Past Medical History (Other diagnosis)</li>
                </ul><br /><hr />
                <Typography variant="h6" sx={{mb: 2}}>Barthel Admission Scores</Typography>
                  <ul style={{columns: '3', listStyle:'none'}}>
                    <li>Bowels</li>
                    <li>Transferring</li>
                    <li>Bladder</li>
                    <li>Mobility</li>
                    <li>Grooming</li>
                    <li>Dressing</li>
                    <li>Toilet Use</li>
                    <li>Stairs</li>
                    <li>Feeding</li>
                    <li>Bathing</li>
                  </ul><br /><hr />
                </Typography>
                {/* Unless user is dragging a file, "Browse Files" appears, allowing user to click on it and pick a file through browsing file explorer. */}
                {/* Tablet/Mobile Phone friendly */}
                <Button variant="contained" startIcon={<Iconify icon="eva:upload-fill" />}>{isFileDragging ? 'Drop the file here' : 'browse files'}</Button>
                <br />
              </label>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Allows user to input search queries, automatically filtering patient list */}
        <TextField id="search"label="Search patients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} fullWidth margin="normal" variant="outlined"/>
        {/* Patient List */}
        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={patientList.length}
                  numSelected={selected.length}/>
                <TableBody>
                  {/* filteredPatient for use by setSearchQuery */}
                  {filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, IDNum, Sex, FirstName, LastName, AdmissionWard, AdmitDate, Consultant } = row; // All shown rows
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
                        {/* Status button able to be clicked on, showing Dialog popup with list of statuses */}
                        {/* Pillbox colour set according to getPatientStatusColor */}
                        <TableCell>
                          <Button size="small" onClick={() => handleOpenStatusDialog(row.id)} style={{ color: 'white', backgroundColor: getPatientStatusColor(row.patientStatus) }}>{row.patientStatus}</Button>
                        </TableCell>
                        {/* Links to user's Patient Details */}
                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={() => handleEditClick(IDNum)}><Iconify color="#ba2737" icon={'tabler:eye-edit'} /></IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (<TableRow style={{ height: 53 * emptyRows }}><TableCell colSpan={6} /></TableRow>)}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
          {/* Handles listing of total number of records available, and pagination */}
          <TablePagination
            rowsPerPageOptions={[5]}
            component="div"
            count={filteredPatients.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
  </>
  );
}