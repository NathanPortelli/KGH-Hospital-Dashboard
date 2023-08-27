import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { format } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// @mui
import { Slider, Divider, IconButton, ListItemIcon, ListItemText, Popover, Tabs, Tab, Grid, Button, Typography, TextField, Select, MenuItem, Box, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";

import { updateDoc, doc, setDoc, collection, getDocs, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

import Iconify from '../components/iconify';

import CustomFormBox from '../layouts/CustomFormBox'
import { isNameValid, isIDNumValid, isAgeValid, isDOBValid, isAdminDateValid } from '../validations/validation';


// ----------------------------------------------------------------------

// Function to calculate age based on DOB
const calculateAge = (dob) => {
  const currentDate = new Date();
  const birthDate = new Date(dob);
  let age = currentDate.getFullYear() - birthDate.getFullYear(); // Reduced year of birth with current year
  const monthDiff = currentDate.getMonth() - birthDate.getMonth(); // Reduced month of birth with current month
  if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) { age -= 1; }
  return age;
};

export default function PatientPage() {
  const { idNum } = useParams();

  const [tabValue, setTabValue] = useState(0); // Value of currently active tab
  // ... icon to check delete patient option
  const [openPopover, setOpenPopover] = useState(null);
  const handleOpenPopover = (event) => {
    if (openPopover && openPopover === event.currentTarget) { setOpenPopover(null); } else { setOpenPopover(event.currentTarget); } 
  };
  const handleClosePopover = () => { setOpenPopover(null); };

  // Changes format of date to "1900-1-1"
  const handleDOBInputChange = (dateString) => {
    const dateDOB = new Date(dateString);
    const formattedDate = format(dateDOB, 'yyyy-MM-dd');
    setNewDOB(formattedDate);
    const newAge = calculateAge(dateDOB); // uses calculateAge to set patient's age based off DOB
    setNewAge(newAge);
  };
  const handleAdmDateInputChange = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = format(date, 'yyyy-MM-dd');
    setNewAdmDate(formattedDate);
  }
  const handleDischDateInputChange = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = format(date, 'yyyy-MM-dd');
    setNewDischDate(formattedDate);
  }

  const navigate = useNavigate();

  const [patientDocumentId, setPatientDocumentId] = useState(null); // Reference to current patient's document in Firestore
  const [admDetailsDocumentId, setAdmDetailsDocumentId] = useState(null);

  // List inside drop-down menu
  const localities = [ "Attard", "Balzan", "Birkirkara", "Birżebbuġa", "Cospicua", "Dingli", "Fgura", "Floriana", "Fontana", "Gudja", "Għajnsielem", "Għarb", "Għargħur", "Għasri", "Għaxaq", "Gżira", "Iklin", "Il-Gżira", "Imdina", "Imqabba", "Imsida", "Imtarfa", "Imġarr", "Kalkara", "Kerċem", "Kirkop", "Lija", "Luqa", "Marsa", "Marsaskala", "Marsaxlokk", "Mellieħa", "Mosta", "Munxar", "Nadur", "Naxxar", "Paola", "Pembroke", "Pieta", "Qala", "Qormi", "Qrendi", "Rabat, Malta", "Safi", "Saint Pauls Bay", "San Lawrenz", "San Ġiljan", "San Ġwann", "Sannat", "Santa Luċija", "Santa Venera", "Senglea", "Siġġiewi", "Sliema", "Swieqi", "Tarxien", "Ta Xbiex", "Valletta", "Victoria", "Vittoriosa", "Xagħra", "Xewkija", "Xgħajra", "Ħamrun", "Żabbar", "Żebbuġ", "Żebbuġ", "Żejtun", "Żurrieq", ];
  const consultants = [ "Dr. S. Abela", "Dr. E. Bellia", "Dr. J. Cordina", "Dr. S. Dalli", "Dr. J. Dimech", "Dr. B. Farrugia", "Dr. P. Ferry", "Dr. S. La Maestra", "Dr. M. A. Vassallo", ];

  // Store and set patient details from patient collection in Firestore
  // Patient Personal Details
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newIDNum, setNewIDNum] = useState("");
  const [newSex, setNewSex] = useState("");
  const [newLocality, setNewLocality] = useState("");
  const [newAge, setNewAge] = useState(0);
  const [newDOB, setNewDOB] = useState("");
  // Patient Status
  const [newPatientStatus, setNewPatientStatus] = useState("");
  // Admission details
  const [newAdmDate, setNewAdmDate] = useState("");
  const [newAdmThru, setNewAdmThru] = useState("");
  const [newAdmConsultant, setNewAdmConsultant] = useState("");
  const [newAdmMainDiag, setNewAdmMainDiag] = useState("");
  const [newAdmOtherDiag, setNewAdmOtherDiag] = useState("");
  const [newAdmWard, setNewAdmWard] = useState("");
  const [newHomeEnvironment, setNewHomeEnvironment] = useState(null);
  const [newSupport, setNewSupport] = useState(null);
  const [newExpectation, setNewExpectation] = useState(null);
  // New Internal Care Pathway
  const [newTransWard, setNewTransWard] = useState("");
  // Discharge details
  const [newDischDate, setNewDischDate] = useState(null);
  const [newDischTo, setNewDischTo] = useState("");
  const [newDischNotes, setNewDischNotes] = useState("");
  // Barthel Index details
  const [newBarthBowels, setNewBarthBowels] = useState(0)
  const [newBarthTransfers, setNewBarthTransfers] = useState(0)
  const [newBarthBladder, setNewBarthBladder] = useState(0)
  const [newBarthMobility, setNewBarthMobility] = useState(0)
  const [newBarthGrooming, setNewBarthGrooming] = useState(0)
  const [newBarthDressing, setNewBarthDressing] = useState(0)
  const [newBarthToilet, setNewBarthToilet] = useState(0)
  const [newBarthStairs, setNewBarthStairs] = useState(0)
  const [newBarthFeeding, setNewBarthFeeding] = useState(0)
  const [newBarthBathing, setNewBarthBathing] = useState(0)
  const [totalCount, setTotalCount] = useState(0); // Used to calculate Total Barthel Index Score on admission
  // Waterlow Score details
  const [newWaterWeightSize, setNewWaterWeightSize] = useState("")
  const [newWaterContinence, setNewWaterContinence] = useState("")
  const [newWaterSkin, setNewWaterSkin] = useState("")
  const [newWaterMobility, setNewWaterMobility] = useState("")
  const [newWaterAppetite, setNewWaterAppetite] = useState("")
  const [newWaterTissue, setNewWaterTissue] = useState("")
  const [newWaterNeuro, setNewWaterNeuro] = useState("")
  const [newWaterSurgery, setNewWaterSurgery] = useState("")
  const [newWaterMedication, setNewWaterMedication] = useState("")
  
  const patientCollectionRef = collection(db, "patients"); // patients collection in Firestore
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false); // popover open/closed
  const [openStatusDialog, setOpenStatusDialog] = useState(false); // status dialog popup
  const [selectedStatus, setSelectedStatus] = useState('Not Set'); // If patient does not have a status stored, set to "Not Set"

  // Notes details
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [patientNotes, setPatientNotes] = useState([]);
  const [patientNotesCollectionRef, setPatientNotesCollectionRef] = useState(null); // List of submitted notes

  // Ward changes details
  const [wardHistory, setWardHistory] = useState([]);
  const [wardCollectionRef, setWardCollectionRef] = useState(null);

  // Next of Kin details
  const [kinName, setKinName] = useState('');
  const [kinRelation, setKinRelation] = useState('');
  const [kinContact, setKinContact] = useState('');
  const [kinDetails, setKinDetails] = useState([]);
  const [kinCollectionRef, setKinCollectionRef] = useState(null); // List of saved NOKs

  // MMSE score details
  const [mmseScore, setMMSEScore] = useState(0);
  const [mmseDate, setMMSEDate] = useState('');
  const [patientMMSE, setPatientMMSE] = useState([]);
  const [patientMMSECollectionRef, setPatientMMSECollectionRef] = useState(null); // List of submitted MMSE Scores

  // Medications details
  const [medicationName, setMedicationName] = useState('');
  const [medicationDose, setMedicationDose] = useState('');
  const [medicationFreq, setMedicationFreq] = useState('');
  const [medicationPrescribedBy, setMedicationPrescribedBy] = useState('');
  const [patientMedication, setPatientMedication] = useState([]);
  const [patientMedicationCollectionRef, setPatientMedicationCollectionRef] = useState(null); // List of saved Medications

  // On status click, opens Dialog popup to update patient status from list
  const handleOpenStatusDialog = async () => {
    setSelectedStatus(newPatientStatus || 'Not Set');
    setOpenStatusDialog(true);
  };
  // On closing popup, status is changed to selected
  const handleCloseStatusDialog = async () => {
    try {
      const patientRef = doc(db, 'patients', patientDocumentId);
      await updateDoc(patientRef, { patientStatus: selectedStatus });
      setNewPatientStatus(selectedStatus); // Update the status in the local state
      setOpenStatusDialog(false);
    } catch (error) {
      console.error('Error updating patient status:', error);
      toast.error('Error updating patient status. Please try again.');
    }
  };
  // List of possible patient statuses, and related colour scheme to show in pill box
  const getPatientStatusColor = (patientStatus) => {
    switch (patientStatus) {
      case 'Not Set': return 'grey';
      case 'Awaiting List': return 'black';
      case 'Current Patient ': return 'green';
      case 'Observation': return 'teal';
      case 'Day Hospital': return '#ba000d';
      case 'Outpatient': return 'brown';
      case 'Discharged': return 'red';
      case 'RIP': return '#5A5A5A';
      default: return 'grey';
    }
  };

  const sortedWardHistory = wardHistory.sort((a, b) => new Date(a.date) - new Date(b.date)).reverse(); // Sort the wardHistory array based on the "date" property in ascending order

  // Calculates the 'Total Barthel Index Score on admission'
  const calculateTotalCount = () => {
    const total = newBarthBowels + newBarthTransfers + newBarthBladder + newBarthMobility + newBarthGrooming + newBarthDressing + newBarthToilet + newBarthStairs + newBarthFeeding + newBarthBathing;
    return total;
  };
  // Function to handle changes in the menu items and update the total count
  const handleTotalCount = () => {
    const total = calculateTotalCount();
    setTotalCount(total);
  };
  // useEffect hook to recalculate the total count whenever any of the state variables change
  useEffect(() => {
    handleTotalCount();
  }, [newBarthBowels, newBarthTransfers, newBarthBladder, newBarthMobility, newBarthGrooming, newBarthDressing, newBarthToilet, newBarthStairs, newBarthFeeding, newBarthBathing]);

  // For use to check if user is logged in
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

  // VALIDATIONS -- check validations/validation.js
  const [fieldValidity, setFieldValidity] = useState({
    firstName: true,
    lastName: true,
    idNum: true,
    age: true,
    dob: true,
  });

  useEffect(() => {
    const isValid = isNameValid(newFirstName);
    setFieldValidity((prevState) => ({ ...prevState, firstName: isValid }));
  }, [newFirstName]);
  useEffect(() => {
    const isValid = isNameValid(newLastName);
    setFieldValidity((prevState) => ({ ...prevState, lastName: isValid }));
  }, [newLastName]);
  useEffect(() => {
    const isValid = isIDNumValid(newIDNum);
    setFieldValidity((prevState) => ({ ...prevState, idNum: isValid }));
  }, [newIDNum]);  
  useEffect(() => {
    const isValid = isAgeValid(newAge);
    setFieldValidity((prevState) => ({ ...prevState, age: isValid }));
  }, [newAge]);   
  useEffect(() => {
    const isValid = isDOBValid(newDOB);
    setFieldValidity((prevState) => ({ ...prevState, dob: isValid }));
  }, [newDOB]); 
  useEffect(() => {
    const isValid = isAdminDateValid(newAdmDate);
    setFieldValidity((prevState) => ({ ...prevState, admDate: isValid }));
  }, [newAdmDate]); 
  // END OF VALIDATIONS

  // Saving new internal transfer to ward transfer list
  const saveTransWard = async (newTransWard, patientCollectionRef, patientDocumentId) => {
    if (newTransWard) {
      const wardCollectionRef = collection(patientCollectionRef, patientDocumentId, 'ward');
      const wardDocRef = doc(wardCollectionRef);
      await setDoc(wardDocRef, {
        ward: newTransWard,
        date: new Date().toISOString(), // Sets to current date
      });
    }
  };

  const onSubmitPatientDetails = async () => {
    // Check if fields are valid
    if (
      !fieldValidity.firstName ||
      !fieldValidity.lastName ||
      !fieldValidity.idNum ||
      !fieldValidity.age ||
      !fieldValidity.dob
    ) {
      toast.error('Please fill in all fields.');
      return;
    }
  
    try {
      const patientDocRef = doc(patientCollectionRef, patientDocumentId);
      // Call the functions to save admission and internal transfer data
      await saveTransWard(newTransWard, patientCollectionRef, patientDocumentId);    

      // Saving a new note
      if (noteTitle && noteText) {
        const patientNotesCollectionRef = collection(patientCollectionRef, patientDocumentId, 'notes');
        const noteDocRef = doc(patientNotesCollectionRef);
        await setDoc(noteDocRef, {
          title: noteTitle,
          text: noteText,
          date: new Date().toISOString(), // Sets to current date
          user: auth.currentUser.displayName, // Sets to currently logged-in user
        });
      }

      // Saving a new MMSE Score
      if (mmseScore && mmseDate) {
        const mmseDateISO = mmseDate.toISOString();
        const patientMMSECollectionRef = collection(patientCollectionRef, patientDocumentId, 'mmse');
        const mmseDocRef = doc(patientMMSECollectionRef);
        await setDoc(mmseDocRef, {
          score: mmseScore,
          date: mmseDateISO,
        });
      }

      // Saving a new medication
      if (medicationName || medicationDose || medicationFreq || medicationPrescribedBy) {
        const patientMedicationCollectionRef = collection(patientCollectionRef, patientDocumentId, 'medication');
        const medicationDocRef = doc(patientMedicationCollectionRef);
        await setDoc(medicationDocRef, {
          name: medicationName,
          dose: medicationDose,
          freq: medicationFreq,
          presribedby: medicationPrescribedBy,
        });
      }

      // Saving a new next of kin
      if (kinName && kinRelation && kinContact) {
        const kinCollectionRef = collection(patientCollectionRef, patientDocumentId, 'kin');
        const kinDocRef = doc(kinCollectionRef);
        await setDoc(kinDocRef, {
          name: kinName,
          relation: kinRelation,
          contact: kinContact,
        });
      }
      
      // Update patient document in patient collection
      await setDoc(patientDocRef, {
        FirstName: newFirstName,
        LastName: newLastName,
        IDNum: newIDNum,
        Sex: newSex,
        Age: newAge,
        DOB: newDOB,
        Locality: newLocality,
        patientStatus: newPatientStatus || 'Not Set', // If not set, show as "Not Set"
        // Save into map
        admissiondetails: {
          IDNum: newIDNum,
          AdmissionThru: newAdmThru,
          AdmissionWard: newAdmWard,
          AdmitDate: newAdmDate,
          Consultant: newAdmConsultant,
          MainDiagnosis: newAdmMainDiag,
          OtherDiagnosis: newAdmOtherDiag,
          HomeEnvironment: newHomeEnvironment || '',
          Support: newSupport || '',
          Expectation: newExpectation || '',
        },
        dischargedetails: {
          DischDate: newDischDate,
          DischTo: newDischTo,
          DischNotes: newDischNotes,
        },
        bartheladm: {
          Bowels: newBarthBowels,
          Transfers: newBarthTransfers,
          Bladder: newBarthBladder,
          Mobility: newBarthMobility,
          Grooming: newBarthGrooming,
          Dressing: newBarthDressing,
          Toilet: newBarthToilet,
          Stairs: newBarthStairs,
          Feeding: newBarthFeeding,
          Bathing: newBarthBathing,
        },
        waterlow: {
          WeightSize: newWaterWeightSize,
          Continence: newWaterContinence,
          Skin: newWaterSkin,
          WaterMobility: newWaterMobility,
          Appetite: newWaterAppetite,
          Tissue: newWaterTissue,
          Neuro: newWaterNeuro,
          Surgery: newWaterSurgery,
          Medication: newWaterMedication,
        },
      });

      // Store user in "Recently Updated" list, recentpatients collection
      const recentPatientsCollectionRef = collection(db, "recentpatients");
      const recentPatientDocRef = doc(recentPatientsCollectionRef);
      await setDoc(recentPatientDocRef, {
        FirstName: newFirstName,
        LastName: newLastName,
        IDNum: newIDNum,
        LastAccessed: serverTimestamp(),
      });
  
      toast.success('Patient details updated successfully!');
      navigate('/dashboard/patientlist'); // On submitting, send user back to Patient List page
    } catch (e) {
      toast.error('An error occurred while editing the patient details. Please try again.');
      console.log('Error occurred while editing the patient details: ', e)
    }
  };  

  // Set inputs with available patient's details
  const getPatientDetails = async () => {
    try {
      const patientQuery = query(patientCollectionRef, where("IDNum", "==", idNum)); // Retrieves patient details based on their idNum from patient collection in Firestore
      const patientSnapshot = await getDocs(patientQuery);

      patientSnapshot.forEach(async (doc) => {
        const newFirstName = doc.data().FirstName;
        const newLastName = doc.data().LastName;
        const newIDNum = doc.data().IDNum;
        
        // Retrieve basic patient details 
        setNewFirstName(newFirstName);
        setNewLastName(newLastName);
        setNewIDNum(newIDNum);
        setNewPatientStatus(doc.data().patientStatus);
        setNewSex(doc.data().Sex);
        setNewLocality(doc.data().Locality);
        setNewAge(calculateAge(newDOB));
        setNewDOB(doc.data().DOB);
        setPatientDocumentId(doc.id);

        // Retrieve admission details from the subcollection
        const admissionDetails = doc.data().admissiondetails;
        if (admissionDetails) {
          setNewAdmDate(admissionDetails.AdmitDate);
          setNewAdmThru(admissionDetails.AdmissionThru);
          setNewAdmConsultant(admissionDetails.Consultant);
          setNewAdmMainDiag(admissionDetails.MainDiagnosis);
          setNewAdmOtherDiag(admissionDetails.OtherDiagnosis);
          setNewAdmWard(admissionDetails.AdmissionWard);
          setNewHomeEnvironment(admissionDetails.HomeEnvironment);
          setNewSupport(admissionDetails.Support);
          setNewExpectation(admissionDetails.Expectation);
          setAdmDetailsDocumentId(admissionDetails.documentId);
        }
        
        // Retrieve discharge details from the subcollection
        const dischargeDetails = doc.data().dischargedetails;
        if (dischargeDetails) {
          setNewDischDate(dischargeDetails.DischDate);
          setNewDischTo(dischargeDetails.DischTo);
          setNewDischNotes(dischargeDetails.DischNotes);
        }

        // Retrieve barthel admission details from the subcollection
        const barthelAdm = doc.data().bartheladm;
        if (barthelAdm) {
          setNewBarthBowels(barthelAdm.Bowels);
          setNewBarthTransfers(barthelAdm.Transfers);
          setNewBarthBladder(barthelAdm.Bladder);
          setNewBarthMobility(barthelAdm.Mobility);
          setNewBarthGrooming(barthelAdm.Grooming);
          setNewBarthDressing(barthelAdm.Dressing);
          setNewBarthToilet(barthelAdm.Toilet);
          setNewBarthStairs(barthelAdm.Stairs);
          setNewBarthFeeding(barthelAdm.Feeding);
          setNewBarthBathing(barthelAdm.Bathing);
        }

        // Retrieve waterlow score details from the subcollection
        const waterlowAdm = doc.data().waterlow;
        if (waterlowAdm) {
          setNewWaterWeightSize(waterlowAdm.WeightSize);
          setNewWaterContinence(waterlowAdm.Continence);
          setNewWaterSkin(waterlowAdm.Skin);
          setNewWaterMobility(waterlowAdm.WaterMobility);
          setNewWaterAppetite(waterlowAdm.Appetite);
          setNewWaterTissue(waterlowAdm.Tissue);
          setNewWaterNeuro(waterlowAdm.Neuro);
          setNewWaterSurgery(waterlowAdm.Surgery);
          setNewWaterMedication(waterlowAdm.Medication);
        }

        // To display list of documents in each collection is available
        const kinCollectionRef = collection(patientCollectionRef, doc.id, 'kin');
        setKinCollectionRef(kinCollectionRef);
        const wardCollectionRef = collection(patientCollectionRef, doc.id, 'ward');
        setWardCollectionRef(wardCollectionRef);
        const patientNotesCollectionRef = collection(patientCollectionRef, doc.id, 'notes');
        setPatientNotesCollectionRef(patientNotesCollectionRef);
        const patientMMSECollectionRef = collection(patientCollectionRef, doc.id, 'mmse');
        setPatientMMSECollectionRef(patientMMSECollectionRef);
        const patientMedicationCollectionRef = collection(patientCollectionRef, doc.id, 'medication');
        setPatientMedicationCollectionRef(patientMedicationCollectionRef);
      });  
      
    } catch (e) {
      toast.error('An error occurred while fetching patient details. Please try again.');
      console.log('An error occurred while fetching patient details.', e);
    }
  };
  useEffect(() => {
    getPatientDetails();
  }, []);

  // When DOB field is changed, updates age value
  useEffect(() => {
    if (newDOB) {
      const dateDOB = new Date(newDOB);
      const newAge = calculateAge(dateDOB);
      setNewAge(newAge);
    }
  }, [newDOB]);
  
  // Deletes patient from patient collection entirely
  const deletePatient = async () => {
    try {
      const patientDocRef = doc(patientCollectionRef, patientDocumentId);
      await deleteDoc(patientDocRef);
      toast.success('Patient deleted successfully!');
      navigate('/dashboard/patientlist'); // Returns user to "Patient List" when done
    } catch (e) {
      toast.error('An error occurred while deleting the patient. Please try again.');
      console.log("Error while deleteing patient details:", e)
    }
  };  

  // Used to get list of wards & available beds from wards collection
  const [wards, setWards] = useState([]);
  useEffect(() => {
    const fetchWards = async () => {
      const wardsCollectionRef = collection(db, 'wards');
      const wardsSnapshot = await getDocs(wardsCollectionRef);
      const wardsData = wardsSnapshot.docs.map((doc) => doc.data());
      setWards(wardsData);
    };
    fetchWards();
  }, []);

  // Used to get list of internal ward transfers from subcollection
  const getWardHistory = async () => {
    try {
      if (wardCollectionRef) {
        const wardSnapshot = await getDocs(wardCollectionRef);
        const wards = wardSnapshot.docs.map((doc) => doc.data());
        setWardHistory(wards);
      }
    } catch (e) {
      console.error('Error fetching ward history:', e);
      toast.error('An error occurred while fetching patient ward history. Please try again later.')
    }
  };

  // Used to get list of NOKs from subcollection
  const getKin = async () => {
    try {
      if (kinCollectionRef) {
        const kinSnapshot = await getDocs(kinCollectionRef);
        const kinSnap = kinSnapshot.docs.map((doc) => doc.data());
        setKinDetails(kinSnap);
      }
    } catch (e) {
      console.error('Error fetching patient next of kin details:', e);
      toast.error('An error occurred while fetching patient next of kin details. Please try again later.')
    }
  };

  // Used to get list of notes from subcollection
  const getPatientNotes = async () => {
    try {
      if (patientNotesCollectionRef) {
        const notesSnapshot = await getDocs(patientNotesCollectionRef);
        const notes = notesSnapshot.docs.map((doc) => doc.data());
        setPatientNotes(notes);
      }
    } catch (e) {
      console.error('Error fetching patient notes:', e);
      toast.error('An error occurred while fetching patient notes. Please try again later.')
    }
  };

  // Used to get list of list of MMSE scores from subcollection
  const getMMSE = async () => {
    try {
      if (patientMMSECollectionRef) {
        const mmseSnapshot = await getDocs(patientMMSECollectionRef);
        const mmse = mmseSnapshot.docs.map((doc) => doc.data());
        setPatientMMSE(mmse);
      }
    } catch (e) {
      console.error('Error fetching patient MMSE scores:', e);
      toast.error('An error occurred while fetching patient MMSE scores. Please try again later.')
    }
  };

  // Used to get list of medications from subcollection
  const getPatientMedication = async () => {
    try {
      if (patientMedicationCollectionRef) {
        const medicationSnapshot = await getDocs(patientMedicationCollectionRef);
        const medication = medicationSnapshot.docs.map((doc) => doc.data());
        setPatientMedication(medication);
      }
    } catch (e) {
      console.error('Error fetching patient medication details:', e);
      toast.error('An error occurred while fetching patient medication details. Please try again later.')
    }
  };

  useEffect(() => {
    getKin();
    getWardHistory();
    getPatientNotes();
    getPatientMedication();
    getMMSE();
  }, [kinCollectionRef, wardCollectionRef, patientNotesCollectionRef, patientMedicationCollectionRef, patientMMSECollectionRef]);

  // Sends user to login screen if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
    return (
      <>
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Patient</DialogTitle>
          <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={() => setDeleteDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
          <DialogContent>
            <Typography>Are you sure you want to delete <b>{newFirstName} {newLastName}</b>'s details?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={deletePatient} color="error" variant="contained">Delete</Button> {/* Deletes patient details from patients collection */}
          </DialogActions>
        </Dialog>

        {/* Status Change Dialog */}
        <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
          <DialogTitle>Select Status</DialogTitle>
          <IconButton style={{ position: "absolute", top: "0", right: "0" }} onClick={handleCloseStatusDialog}>
            <CloseIcon />
          </IconButton>
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
            <Button onClick={handleCloseStatusDialog} variant="contained" autoFocus> Save Status </Button>
          </DialogActions>
        </Dialog>

        <Helmet>
          <title> {newFirstName} {newLastName} | KGH </title>
        </Helmet>
        <Grid container spacing={1} ml={5} alignItems="center">
          <Grid item xs={8}>
            <Typography variant="h4" gutterBottom> {newFirstName} {newLastName} </Typography>
            <Typography gutterBottom mb={5}> {newIDNum} </Typography>
          </Grid>
          {/* Patient status pillbox, onclick opens Dialog popup to change patient status. Colour based off getPatientStatusColor */}
          <Grid item xs={2} textAlign="right"><Button size="small" onClick={() => handleOpenStatusDialog()} style={{ color: 'white', backgroundColor: getPatientStatusColor(newPatientStatus) }}>{newPatientStatus || 'Not Set'}</Button></Grid>
          {/* ... menu with Delete Patient option, hidden inside the dots menu due to recommendation */}
          <Grid item xs={2} textAlign="right">
            <Grid onClick={handleOpenPopover} onClose={handleClosePopover} container direction="row" alignItems="center" sx={{ cursor: "pointer", ml: 3, position: 'relative', padding: '8px', }}>
              <Iconify icon="tabler:dots" />
              <Popover
                open={Boolean(openPopover)}
                anchorEl={openPopover}
                onClose={handleClosePopover}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { p: 0, mt: 1.5, ml: 0.75, width: 225, '& .MuiMenuItem-root': { typography: 'body2', borderRadius: 0.75, }, }, }} >
                <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'red' }, }}>
                  <ListItemIcon><Iconify icon="material-symbols:delete" sx={{ color: 'white' }} /></ListItemIcon>
                  <ListItemText primaryTypographyProps={{ color: 'white' }}>Delete Patient</ListItemText>
                </MenuItem>
              </Popover>
            </Grid>
          </Grid>
        </Grid>
        {/* List of available tabs, set to "Personal Details" as default */}
        <Tabs sx={{mt: 3, ml: -4}} variant="scrollable" scrollButtons allowScrollButtonsMobile value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
          <Tab label="Personal Details" />
          <Tab label="Admission Details" />
          <Tab label="Discharge Details" />
          <Tab label="Internal Transfers" />
          <Tab label="Barthel Index" />
          <Tab label="Waterlow Score" />
          <Tab label="MMSE Scores" />
          <Tab label="Medication" />
          <Tab label="Notes" />
        </Tabs>
        {/* Personal Details */}
        {tabValue === 0 && (
          <Box sx={{ p: 2, bgcolor: '#f2f2f2', borderRadius: '10px' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Personal Details </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField required id="firstName" name="firstName" label="First Name" fullWidth autoComplete="given-name" variant="standard" value={newFirstName}  onChange={(e) => setNewFirstName(e.target.value)} error={!fieldValidity.firstName} helperText={!fieldValidity.firstName && "Use only letters, '.', or '-'"}/>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required id="lastName" name="lastName" label="Last Name" fullWidth autoComplete="family-name" variant="standard" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} error={!fieldValidity.lastName} helperText={!fieldValidity.lastName && "Use only letters, '.', or '-'"}/>
              </Grid>
              <Grid item xs={12}>
                <TextField required id="idnum" name="idnum" label="ID Card Number" fullWidth autoComplete="idnum" variant="standard" value={newIDNum} error={!fieldValidity.idNum} helperText={!fieldValidity.idNum && "The format should be numbers, followed by a letter."}/>
              </Grid> 
              {/* Onchange, updates the age value as well */}
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {/* Dayjs used to display date value correctly */}
                  <DatePicker id="dob" name="dob" slotProps={{ textField: { fullWidth: true } }} format="DD-MM-YYYY" label="Date of Birth" value={dayjs(newDOB)} onChange={(date) => handleDOBInputChange(date)} error={!fieldValidity.dob} helperText={!fieldValidity.dob && "Please input a valid date."}/>
                </LocalizationProvider>
              </Grid>
              {/* Disabled input for user, only DOB needs to be inputted for this value to be updated automatically. */}
              <Grid item xs={12} sm={6}>
                <TextField id="age" name="age" label="Age" fullWidth autoComplete="age" variant="standard" type="number" value={newAge} inputProps={{ max: 120, readOnly: true }} disabled onChange={(e) => setNewAge(Number(e.target.value))} error={!fieldValidity.age} helperText={!fieldValidity.age && "Please input only numbers between 0 and 120."}/>
              </Grid>
              <CustomFormBox title="Sex">
                <Select labelId="sex" id="sex" label="Sex" value={newSex} onChange={(e) => setNewSex(e.target.value)}>
                  <MenuItem value={"M"}>Male</MenuItem>
                  <MenuItem value={"F"}>Female</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Locality">
                <Select labelId="locality" id="locality" label="Locality"value={newLocality} onChange={(e) => setNewLocality(e.target.value)}>
                  {/* Maps list of localities based off 'localities' list */}
                  {localities.map((locality) => (
                    <MenuItem key={locality} value={locality}>
                      {locality}
                    </MenuItem>
                  ))}
                </Select>
              </CustomFormBox>
            </Grid>
            <Divider sx={{mt: 5, mb: 5}}/>
            {/* NOK details */}
            <Typography variant="h5" sx={{ mb: 5 }}> Next of Kin Details </Typography>
            <Box sx={{ bgcolor: '#f2f2f2', borderRadius: '10px' }}>
              <Accordion sx={{ borderRadius: '10px', mb: 1, backgroundColor: '#e9e9e9' }}>
                <AccordionSummary container expandIcon={<ExpandMoreIcon sx={{ color: 'white' }}/>} aria-controls="panel1a-content" id="panel1a-header" sx={{ backgroundColor: '#ba2737', borderRadius: '20px', color: 'white'}}>
                  <Typography variant="h5" sx={{display: 'flex', alignItems: 'center'}}><Iconify icon="eva:plus-fill" sx={{ width: 30, height: 30, display: 'flex', alignItems: 'center', mr: 2, color: 'white'  }}/>Add a New Kin</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField id="kinName" label="Next of Kin Name" fullWidth variant="standard" value={kinName} onChange={(e) => setKinName(e.target.value)}/>
                  <TextField id="kinRelation" label="Relation to Patient" fullWidth variant="standard" value={kinRelation} onChange={(e) => setKinRelation(e.target.value)}/>
                  <TextField id="kinContact" label="Contact Details" fullWidth variant="standard" value={kinContact} onChange={(e) => setKinContact(e.target.value)}/>
                </AccordionDetails>
              </Accordion>
              <Grid sx={{ mt: 5 }}>
                {/* Displays list of NOK details based on subcollection */}
                {kinDetails.map((kinDetails, index) =>  {
                  // Workaround, tochange
                  const formattedDate = new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });

                  return (
                    <Accordion key={index} sx={{ borderRadius: '10px', mb: 1 }}>
                    <AccordionSummary container expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                      <Typography variant="h5">{kinDetails.name} | {kinDetails.relation}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container xs={10} spacing={2}>
                        <Grid item xs={3}><Typography>Next of Kin Name:</Typography></Grid><Grid item xs={9}><span style={{fontWeight: 'bold'}}>{kinDetails.name}</span></Grid>
                        <Grid item xs={3}><Typography>Relation to Patient:</Typography></Grid><Grid item xs={9}><span style={{fontWeight: 'bold'}}>{kinDetails.relation}</span></Grid>
                        <Grid item xs={3}><Typography>Contact Details:</Typography></Grid><Grid item xs={9}><span style={{fontWeight: 'bold'}}>{kinDetails.contact}</span></Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                  );
                })}
              </Grid>
            </Box>
          </Box>
        )}
        {/* Admission details */}
        {tabValue === 1 && (
          <Box sx={{ p: 2, bgcolor: '#f2f2f2', borderRadius: '10px' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Admission Details </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {/* Dayjs used to display date value correctly */}
                  <DatePicker id="admissiondate" name="admissiondate" slotProps={{ textField: { fullWidth: true } }} format="DD-MM-YYYY" label="Admission Date" value={dayjs(newAdmDate)} onChange={(date) => handleAdmDateInputChange(date)} error={!fieldValidity.admDate} helperText={!fieldValidity.admDate && "Please input a valid date."}/>
                </LocalizationProvider>
              </Grid>
              <CustomFormBox title="Admission Through">
                <Select labelId="admissionthru" id="admissionthru" label="Admission Through" value={newAdmThru} onChange={(e) => setNewAdmThru(e.target.value)}>
                  <MenuItem value={"Internal Transfer"}>Internal Transfer</MenuItem>
                  <MenuItem value={"MDH"}>Mater Dei Hospital</MenuItem>
                  <MenuItem value={"Own Home"}>Own Home</MenuItem>
                  <MenuItem value={"Care Home"}>Care Home</MenuItem>
                  <MenuItem value={"Private Hospital"}>Private Hospital</MenuItem>
                  <MenuItem value={"Other"}>Other Government Hospital</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Consultant">
                <Select labelId="consultant" id="consultant" label="Consultant" value={newAdmConsultant} onChange={(e) => setNewAdmConsultant(e.target.value)}>
                  {/* Maps list of consultants based off 'consultants' list */}
                  {consultants.map((consultant) => (
                    <MenuItem key={consultant} value={consultant}>
                      {consultant}
                    </MenuItem>
                  ))}      
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Admitted to Ward">
                <Select labelId="firstward" id="firstward" label="Admission Ward" value={newAdmWard} onChange={(e) => setNewAdmWard(e.target.value)}>
                  {/* Maps list of wards and available beds based off wards collection */}
                  {wards.sort((a, b) => a.wardno - b.wardno).map((ward) => (
                    <MenuItem key={ward.wardno} value={ward.wardno} disabled={ward.available === 0} sx={{ color: ward.available === 0 ? 'red' : 'inherit' }}>
                      {`Reh Ward ${ward.wardno}: ${ward.available} available beds`}
                    </MenuItem>
                  ))}
                </Select>
              </CustomFormBox> 
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant='h6' pt={5}> Reasons for Admission </Typography> 
              </Grid>
              <Grid item xs={12} sm={6}> 
                <TextField id="maindiagnosis" name="maindiagnosis" label="Main Diagnosis" fullWidth variant="standard" value={newAdmMainDiag} onChange={(e) => setNewAdmMainDiag(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* Changed to "Past Medical History" based off Domain Expert preferences */}
                <TextField id="otherdiagnosis" name="otherdiagnosis" label="Past Medical History" fullWidth variant="standard" value={newAdmOtherDiag} onChange={(e) => setNewAdmOtherDiag(e.target.value)} />
              </Grid>
            </Grid>
            <Typography variant="h6" pt={5} pb={2}> Patient's Personal Environment </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}> 
                <TextField id="homeenvironment" name="homeenvironment" label="Home Environment" multiline rows={2} fullWidth variant="standard" value={newHomeEnvironment} onChange={(e) => setNewHomeEnvironment(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField id="support" name="support" label="Support from family/loved ones" multiline rows={2} fullWidth variant="standard" value={newSupport} onChange={(e) => setNewSupport(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField id="expected" name="expected" label="Patient expectations post-discharge" multiline rows={2} fullWidth variant="standard" value={newExpectation} onChange={(e) => setNewExpectation(e.target.value)} />
              </Grid>
            </Grid>
          </Box>
        )}
        {/* Discharge details */}
        {tabValue === 2 && (
          <Box sx={{ p: 2, bgcolor: '#f2f2f2', borderRadius: '10px' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Discharge Details </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {/* Dayjs used to display date value correctly */}
                  <DatePicker id="dischdate" name="dischdate" slotProps={{ textField: { fullWidth: true } }} format="DD-MM-YYYY" label="Date of Discharge" value={newDischDate ? dayjs(newDischDate) : null} onChange={(date) => handleDischDateInputChange(date)} />
                </LocalizationProvider>
              </Grid>
              <CustomFormBox title="Discharged to">
                <Select labelId="dischargedto" id="dischargedto" label="Discharged to" value={newDischTo} onChange={(e) => setNewDischTo(e.target.value)}>
                  <MenuItem value={"Internal Transfer"}>Internal Transfer</MenuItem>
                  <MenuItem value={"MDH"}>Mater Dei Hospital</MenuItem>
                  <MenuItem value={"Own Home"}>Own Home</MenuItem>
                  <MenuItem value={"Care Home"}>Care Home</MenuItem>
                  <MenuItem value={"Private Hospital"}>Private Hospital</MenuItem>
                  <MenuItem value={"Other"}>Other Government Hospital</MenuItem>
                </Select>
              </CustomFormBox>
            </Grid>
            <Grid item xs={12} pt={5}> 
              <TextField id="dischNotes" name="dischNotes" label="Additional Notes on Discharge" multiline rows={4} fullWidth variant="standard" value={newDischNotes} onChange={(e) => setNewDischNotes(e.target.value)} />
            </Grid>
          </Box>
        )}
        {/* Internal Transfers */}
        {tabValue === 3 && (
          <Box sx={{ p: 2, bgcolor: '#f2f2f2', borderRadius: '10px' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Internal Care Pathway </Typography>
            <Accordion sx={{ borderRadius: '10px', mb: 1, backgroundColor: '#e9e9e9' }}>
              <AccordionSummary container expandIcon={<ExpandMoreIcon sx={{ color: 'white' }}/>} aria-controls="panel1a-content" id="panel1a-header" sx={{ backgroundColor: '#ba2737', borderRadius: '20px', color: 'white'}}>
                <Typography variant="h5" sx={{display: 'flex', alignItems: 'center' }}><Iconify icon="eva:plus-fill" sx={{ width: 30, height: 30, display: 'flex', alignItems: 'center', mr: 2 }}/>Add a New Transfer</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <CustomFormBox title="Transferred to Ward">
                  <Select labelId="currentward" id="currentward" label="Current Ward" value={newTransWard} onChange={(e) => setNewTransWard(e.target.value)}>
                    {/* Maps list of wards and available beds based off wards collection */}
                    {wards.sort((a, b) => a.wardno - b.wardno).map((ward) => (
                      <MenuItem key={ward.wardno} value={ward.wardno} disabled={ward.available === 0} sx={{ color: ward.available === 0 ? 'red' : 'inherit' }}>
                        {`Reh Ward ${ward.wardno}: ${ward.available} available beds`}
                      </MenuItem>
                    ))}
                  </Select>
                </CustomFormBox> 
              </AccordionDetails>
            </Accordion>
            <Typography variant="h5" sx={{mt: 5}}> Transfer History </Typography>
            <Grid sx={{ mt: 5 }}>
              {/* Displays list of transfer history details based on subcollection content */}
              {sortedWardHistory.map((ward, index) => {
                // Sets date to current date and time
                const formattedDate = new Date(ward.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', });
                const formattedTime = new Date(ward.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', });
                return (
                  <Accordion key={index} sx={{ borderRadius: '10px', mb: 2, p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'normal' }}>
                      Transferred to Ward: <b>{ward.ward}</b> | Admitted on: <b>{formattedDate} @ {formattedTime}</b>
                    </Typography>
                  </Accordion>
                );
              })}
            </Grid>
          </Box>
        )}
        {/* Barthel Index score */}
        {tabValue === 4 && (
          <Box sx={{ p: 2, bgcolor: '#f2f2f2', borderRadius: '10px' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Barthel Index on Admission </Typography>
            <Grid container spacing={3}>
              <CustomFormBox title="Bowels">
                <Select labelId="bowels" id="bowels" label="Bowels" value={newBarthBowels} onChange={(e) => { setNewBarthBowels(+e.target.value); handleTotalCount();}}>
                  <MenuItem value={0}>Incontinent</MenuItem>
                  <MenuItem value={1}>Occasional Accident</MenuItem>
                  <MenuItem value={2}>Continent</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Transfers">
                <Select labelId="transfers" id="transfers" label="Transfers" value={newBarthTransfers} onChange={(e) => { setNewBarthTransfers(+e.target.value); handleTotalCount();}}>
                  <MenuItem value={0}>Unable</MenuItem>
                  <MenuItem value={1}>Major Help</MenuItem>
                  <MenuItem value={2}>Minor Help</MenuItem>
                  <MenuItem value={3}>Independent</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Bladder">
                <Select labelId="bladder" id="bladder" label="Bladder" value={newBarthBladder} onChange={(e) => { setNewBarthBladder(+e.target.value); handleTotalCount();}}>
                    <MenuItem value={0}>Incontinent</MenuItem>
                    <MenuItem value={1}>Occasional Accident</MenuItem>
                    <MenuItem value={2}>Continent</MenuItem>
                  </Select>
              </CustomFormBox>
              <CustomFormBox title="Mobility">
                <Select labelId="mobility" id="mobility" label="Mobility" value={newBarthMobility} onChange={(e) => { setNewBarthMobility(+e.target.value); handleTotalCount();}}>
                  <MenuItem value={0}>Immobile</MenuItem>
                  <MenuItem value={1}>Wheelchair Dependent</MenuItem>
                  <MenuItem value={2}>Walks with help of one person</MenuItem>
                  <MenuItem value={3}>Independent</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Grooming">
                <Select labelId="grooming" id="grooming" label="Grooming" value={newBarthGrooming} onChange={(e) => { setNewBarthGrooming(+e.target.value); handleTotalCount();}}>
                  <MenuItem value={0}>Needs help with personal care</MenuItem>
                  <MenuItem value={1}>Needs help but can groom self</MenuItem>
                  <MenuItem value={2}>Independent</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Dressing">
                <Select labelId="dressing" id="dressing" label="Dressing" value={newBarthDressing} onChange={(e) => { setNewBarthDressing(+e.target.value); handleTotalCount();}}>
                  <MenuItem value={0}>Dependent</MenuItem>
                  <MenuItem value={1}>Needs help but can do half unaided</MenuItem>
                  <MenuItem value={2}>Independent</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Toilet Use">
                <Select labelId="toilet" id="toilet" label="Toilet Use" value={newBarthToilet} onChange={(e) => { setNewBarthToilet(+e.target.value); handleTotalCount();}}>
                  <MenuItem value={0}>Dependent</MenuItem>
                  <MenuItem value={1}>Needs some help</MenuItem>
                  <MenuItem value={2}>Independent</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Stairs">
                <Select labelId="stairs" id="stairs" label="Stairs" value={newBarthStairs} onChange={(e) => { setNewBarthStairs(+e.target.value); handleTotalCount();}}>
                  <MenuItem value={0}>Unable</MenuItem>
                  <MenuItem value={1}>Needs some help</MenuItem>
                  <MenuItem value={2}>Independent</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Feeding">
                <Select labelId="feeding" id="feeding" label="Feeding" value={newBarthFeeding} onChange={(e) => { setNewBarthFeeding(+e.target.value); handleTotalCount();}}>
                  <MenuItem value={0}>Dependent</MenuItem>
                  <MenuItem value={1}>Needs help but can feed self</MenuItem>
                  <MenuItem value={2}>Independent</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Bathing">
                <Select labelId="bathing" id="bathing" label="Bathing" value={newBarthBathing} onChange={(e) => { setNewBarthBathing(+e.target.value); handleTotalCount();}}>
                  <MenuItem value={0}>Dependent</MenuItem>
                  <MenuItem value={1}>Needs help but can bath self</MenuItem>
                  <MenuItem value={2}>Independent</MenuItem>
                </Select>
              </CustomFormBox>
              {/* Displays total count of chosen values from select options above */}
              <TextField id="totalCount" name="totalCount" label="Total Barthel Index Score on admission" autoComplete="off" variant="standard" value={totalCount} InputProps={{ disableUnderline: true }} readOnly sx={{ ml: 4, mt: 3, '.MuiInputBase-input': { fontSize: '1.75rem', fontWeight: 'bold' }, backgroundColor: '#f2f2f2', borderRadius: '5px', color: 'gray' }} />            
            </Grid>
          </Box>
        )}
        {/* Waterlow score */}
        {tabValue === 5 && (
          <Box sx={{ p: 2, bgcolor: '#f2f2f2', borderRadius: '10px' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Waterlow Risk Assessment </Typography>
            <Grid container spacing={3}>
              <CustomFormBox title="Weight">
                <Select labelId="weight" id="weight" label="Weight" value={newWaterWeightSize} onChange={(e) => setNewWaterWeightSize(e.target.value)}>
                  <MenuItem value={0}>Underweight</MenuItem>
                  <MenuItem value={1}>Normal</MenuItem>
                  <MenuItem value={2}>Overweight</MenuItem>
                  <MenuItem value={3}>Obese</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Continence">
                <Select labelId="continence" id="continence" label="Continence" value={newWaterContinence} onChange={(e) => setNewWaterContinence(e.target.value)}>
                  <MenuItem value={0}>Complete, urine catheter</MenuItem>
                  <MenuItem value={1}>Occasional incontinence</MenuItem>
                  <MenuItem value={2}>Unire catheter</MenuItem>
                  <MenuItem value={3}>Double incontinence</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Skin type and visual aspects of risk areas">
                <Select labelId="skintype" id="skintype" label="Skin Type" value={newWaterSkin} onChange={(e) => setNewWaterSkin(e.target.value)}>
                <MenuItem value={0}>Healthy</MenuItem>
                <MenuItem value={1}>Frail</MenuItem>
                <MenuItem value={2}>Edematous</MenuItem>
                <MenuItem value={3}>Cold & humid</MenuItem>
                <MenuItem value={4}>Alterations in colour</MenuItem>
                <MenuItem value={5}>Wounded</MenuItem>
              </Select>
              </CustomFormBox>
              <CustomFormBox title="Mobility">
                <Select labelId="waterlowmobility" id="waterlowmobility" value={newWaterAppetite} onChange={(e) => setNewWaterMobility(e.target.value)}>
                  <MenuItem value={0}>Walks independent</MenuItem>
                  <MenuItem value={1}>Walks with help of one</MenuItem>
                  <MenuItem value={2}>Walks with help of two</MenuItem>
                  <MenuItem value={3}>Chair user</MenuItem>
                  <MenuItem value={4}>Bed bound</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Appetite">
                  <Select labelId="appetite" id="appetite" label="Appetite" value={newWaterAppetite} onChange={(e) => setNewWaterAppetite(e.target.value)}>
                    <MenuItem value={0}>Normal</MenuItem>
                    <MenuItem value={1}>Scarce/Feeding tube</MenuItem>
                    <MenuItem value={2}>Liquid intavenous</MenuItem>
                    <MenuItem value={3}>Anorexia/Absolute diet</MenuItem>
                  </Select>
               </CustomFormBox>
            </Grid>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Typography gutterBottom variant='h6' sx={{ fontWeight: 'bold' }} pt={2}> Special Risks </Typography>
              </Grid>
              <CustomFormBox title="Tissue Malnutrition">
                <Select labelId="tissuemalnutrition" id="tissuemalnutrition" label="Tissue Malnutrition" value={newWaterTissue} onChange={(e) => setNewWaterTissue(e.target.value)} >
                  <MenuItem value={8}>Terminal/cachexia</MenuItem>
                  <MenuItem value={5}>Cardiac insufficiency</MenuItem>
                  <MenuItem value={6}>Peripheral vascular insufficiency</MenuItem>
                  <MenuItem value={2}>Anemia</MenuItem>
                  <MenuItem value={1}>Smoker</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Neurological Deficit">
                <Select labelId="neurologicaldeficit" id="neurologicaldeficit" label="Neurological Deficit" value={newWaterNeuro} onChange={(e) => setNewWaterNeuro(e.target.value)}>
                  <MenuItem value={5}>Diabetes, paraplegic, ACV</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Surgery">
                <Select labelId="surgery" id="surgery" label="Surgery" value={newWaterSurgery} onChange={(e) => setNewWaterSurgery(e.target.value)}>
                  <MenuItem value={5}>Orthopedic surgery below waist</MenuItem>
                  <MenuItem value={5}>Over 2 hours in surgery</MenuItem>
                </Select>
              </CustomFormBox>
              <CustomFormBox title="Medication">
                <Select labelId="medication" id="medication" label="Medication" value={newWaterMedication} onChange={(e) => setNewWaterMedication(e.target.value)}>
                  <MenuItem value={4}>Steroid, crytoxics</MenuItem>
                </Select>
              </CustomFormBox>
            </Grid>
          </Box>
        )}
        {/* MMSE scores */}
        {tabValue === 6 && (
          <Box sx={{ p: 2, bgcolor: '#f2f2f2', borderRadius: '10px' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> MMSE Tests Conducted </Typography>
            <Accordion sx={{ borderRadius: '10px', mb: 1, backgroundColor: '#e9e9e9' }}>
              <AccordionSummary container expandIcon={<ExpandMoreIcon sx={{ color: 'white' }}/>} aria-controls="panel1a-content" id="panel1a-header" sx={{ backgroundColor: '#ba2737', borderRadius: '20px', color: 'white'}}>
                <Typography variant="h5" sx={{display: 'flex', alignItems: 'center'}}><Iconify icon="eva:plus-fill" sx={{ width: 30, height: 30, display: 'flex', alignItems: 'center', mr: 2, color: 'white' }}/>Add a MMSE Test Result</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container>
                  <Grid container xs={12} md={9} sx={{mr: 5}}>
                    <Typography id="mmseScoreLabel" gutterBottom>MMSE test score (0 - 30):</Typography>
                    <Slider value={mmseScore} onChange={(e, value) => setMMSEScore(value)} aria-labelledby="mmseScoreLabel" step={1} marks={[{ value: 0, label: '0' }, { value: 30, label: '30' },]} min={0} max={30}/>
                  </Grid>
                  {/* Displays chosen value in above slider */}
                  <Grid container xs={12} md={2}>
                    <TextField id="mmseScoreText" label="MMSE Selected Score" variant="standard" value={mmseScore} disabled fullWidth InputProps={{ disableUnderline: true, readOnly: true }} sx={{ '.MuiInputBase-input': { fontSize: '1.25rem' }, }}/>
                  </Grid>
                  <Grid container xs={12} md={9} sx={{mt: 3}}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker id="mmseDate" name="mmseDate" slotProps={{ textField: { fullWidth: true } }} format="DD-MM-YYYY" label="Date carried out" onChange={(selectedDate) => setMMSEDate(selectedDate)} />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Typography variant="h5" sx={{ mt: 3 }}>Previous Tests</Typography>
            <Grid sx={{ mt: 5 }}>
              {/* Displays list of MMSE scores based on subcollection content */}
              {patientMMSE.map((mmse, index) =>  {
                // Changes date and time from Firestore format
                const formattedDate = new Date(mmse.date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });
                return (
                  <Accordion key={index} sx={{ borderRadius: '10px', mb: 1 }}>
                  <AccordionSummary container expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                    <Typography variant="h5">Score: {mmse.score} | {formattedDate} </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container xs={10} spacing={2}>
                      <Grid item xs={3}><Typography>MMSE Total Score:</Typography></Grid><Grid item xs={9}><span style={{fontWeight: 'bold'}}>{mmse.score}</span></Grid>
                      <Grid item xs={3}><Typography>Date carried out:</Typography></Grid><Grid item xs={9}><span style={{fontWeight: 'bold'}}>{formattedDate}</span></Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                );
              })}
            </Grid>
          </Box>
        )}
        {/* Medication list */}
        {tabValue === 7 && (
          <Box sx={{ p: 2, bgcolor: '#f2f2f2', borderRadius: '10px' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Prescribed Medication </Typography>
            <Accordion sx={{ borderRadius: '10px', mb: 1, backgroundColor: '#e9e9e9' }}>
              <AccordionSummary container expandIcon={<ExpandMoreIcon sx={{ color: 'white' }}/>} aria-controls="panel1a-content" id="panel1a-header" sx={{ backgroundColor: '#ba2737', borderRadius: '20px', color: 'white'}}>
                <Typography variant="h5" sx={{display: 'flex', alignItems: 'center'}}><Iconify icon="eva:plus-fill" sx={{ width: 30, height: 30, display: 'flex', alignItems: 'center', mr: 2, color: 'white' }}/>Add a New Prescription</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField id="medicationName" label="Medication Name" fullWidth variant="standard" value={medicationName} onChange={(e) => setMedicationName(e.target.value)}/>
                <TextField id="medicationDose" label="Medication Dose" fullWidth variant="standard" value={medicationDose} onChange={(e) => setMedicationDose(e.target.value)}/>
                <TextField id="medicationFreq" label="Frequency" fullWidth variant="standard" value={medicationFreq} onChange={(e) => setMedicationFreq(e.target.value)}/>
                <TextField id="medicationPrescribedBy" label="Prescribed By" fullWidth variant="standard" value={medicationPrescribedBy} onChange={(e) => setMedicationPrescribedBy(e.target.value)}/>
              </AccordionDetails>
            </Accordion>
            <Grid sx={{ mt: 5 }}>
              {/* Displays Medication list based on subcollection content */}
              {patientMedication.map((medication, index) =>  {
                // Workaround, tochange
                const formattedDate = new Date(medication.prescribedon).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });
                
                return (
                  <Accordion key={index} sx={{ borderRadius: '10px', mb: 1 }}>
                  <AccordionSummary container expandIcon={<ExpandMoreIcon sx={{ color: 'white' }}/>} aria-controls="panel1a-content" id="panel1a-header">
                    <Typography variant="h5">{medication.name} | {medication.dose} | {medication.freq}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container xs={10} spacing={2}>
                      <Grid item xs={3}><Typography>Medication Name:</Typography></Grid><Grid item xs={9}><span style={{fontWeight: 'bold'}}>{medication.name}</span></Grid>
                      <Grid item xs={3}><Typography>Medication Dosage:</Typography></Grid><Grid item xs={9}><span style={{fontWeight: 'bold'}}>{medication.dose}</span></Grid>
                      <Grid item xs={3}><Typography>Medication Frequency:</Typography></Grid><Grid item xs={9}><span style={{fontWeight: 'bold'}}>{medication.freq}</span></Grid>
                      <Grid item xs={3}><Typography>Prescribed By:</Typography></Grid><Grid item xs={9}><span style={{fontWeight: 'bold'}}>{medication.presribedby}</span></Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                );
              })}
            </Grid>
          </Box>
        )}
        {/* Notes */}
        {tabValue === 8 && (
          <Box sx={{ p: 2, bgcolor: '#f2f2f2', borderRadius: '10px' }}>
            <Typography variant="h5" sx={{ mb: 5 }}> Notes </Typography>
            <Accordion sx={{ borderRadius: '10px', mb: 1, backgroundColor: '#e9e9e9' }}>
              <AccordionSummary container expandIcon={<ExpandMoreIcon sx={{ color: 'white' }}/>} aria-controls="panel1a-content" id="panel1a-header" sx={{ backgroundColor: '#ba2737', borderRadius: '20px', color: 'white'}}>
                <Typography variant="h5" sx={{display: 'flex', alignItems: 'center'}}><Iconify icon="eva:plus-fill" sx={{ width: 30, height: 30, display: 'flex', alignItems: 'center', mr: 2, color: 'white' }}/>Add a New Note</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField id="noteTitle" name="noteTitle" label="Note Title" fullWidth variant="standard" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)}/>
                <TextField id="noteText" name="noteText" label="Note Text"fullWidth variant="standard" multiline rows={10} value={noteText} onChange={(e) => setNoteText(e.target.value)}/>
              </AccordionDetails>
            </Accordion>
            <Grid sx={{ mt: 5 }}>
              {/* Displays list of notes based on subcollection content */}
              {patientNotes.map((note, index) => {
                // Changes date and time from Firestore format
                const formattedDate = new Date(note.date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });
                const formattedTime = new Date(note.date).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <Accordion key={index} sx={{ borderRadius: '10px', mb: 1 }}>
                    <AccordionSummary container expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                      <Typography variant="h5">{note.title} | {formattedDate} - {formattedTime}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography><b>{note.user}</b></Typography><br/>
                      <Typography>{note.text}</Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Grid>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          {/* Onsubmit patient's details are updated in patient collection in Firestore */}
          <Button variant="contained" startIcon={<Iconify icon="tabler:edit" />} onClick={onSubmitPatientDetails} sx={{ mx: 2, fontSize: '1.1rem', padding: '8px 16px' }}>
            Submit Changes
          </Button>
        </Box>
      </>
    );
}