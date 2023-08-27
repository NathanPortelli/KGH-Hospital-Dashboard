import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// @mui
import { Box, Drawer, Divider, Typography, Button } from '@mui/material';
import { collection, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../config/firebase';
// hooks
import useResponsive from '../../../hooks/useResponsive';
import Iconify from '../../../components/iconify';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
import navConfig from './config';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280; // Width of total navbar

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const { pathname } = useLocation();
  const [patientList, setPatientList] = useState([]);
  const recentPatientsCollectionRef = collection(db, "recentpatients"); // Collection with recently created patients/patients with recently updated details

  const navigate = useNavigate();
  const handleEditClick = (idNum) => {
    navigate(`/dashboard/patient/${idNum}`); // Clicking on patients in list takes user to their patient details page
  };
  
  const isDesktop = useResponsive('up', 'lg');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getLastestPatients = async () => {
    try {
      const querySnapshot = await getDocs(recentPatientsCollectionRef, limit(5)); // Limits query to top 5 patients
      const patientData = querySnapshot.docs.map((doc) => doc.data()); // Gets patients data
      const uniquePatientList = [];
      const uniqueIDs = new Set();
      
      // Only gets the patients who have not yet been listed, one listing per patient
      patientData.forEach((patient) => {
        const { IDNum, FirstName, LastName } = patient;
        if (!uniqueIDs.has(IDNum)) { // Check for uniqueness based on IDNum
          uniqueIDs.add(IDNum);
          uniquePatientList.push({ IDNum, FirstName, LastName });
        }
      });
      setPatientList(uniquePatientList);
    } catch (e) {
      console.error('Error getting latest patients: ', e);
    }
  };

  // For clicking logo button
  const routeHome = () =>{ 
    const path = `/dashboard/app`; 
    navigate(path);
  }  

  useEffect(() => {
    if (openNav) { onCloseNav(); }
    getLastestPatients(); // List of recently updated patients
  }, [pathname]);

  // Navbar contents
  const renderContent = (
    <Scrollbar sx={{ height: 1, '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' }, }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 5, display: 'inline-flex' }}>
        <Button onClick={routeHome} sx={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}> {/* Clicking logo returns user to main app page */}
          <Logo sx={{ml: -23}} />
          <Typography sx={{ fontWeight: 'bold', color: '#000000', fontSize: '23px', ml: 5, mt: -6 }}>KARIN GRECH</Typography>
          <Typography sx={{ fontWeight: 'bold', color: '#C53F4E', fontSize: '12px', ml: 5, mt: -1 }}>REHABILITATION HOSPITAL</Typography>
        </Button>
      </Box>
      {/* Menu contents from navConfig */}
      <NavSection data={navConfig} />
      <br /><Divider /><br />
      {/* List of top recently updated patients */}
      <Typography variant="h7" gutterBottom sx={{ml: 1, mb: 2, color: '#000000'}}>
        Recently Updated Patients
      </Typography>
      <Box sx={{ml: -1, mr: 1}}>
        <ul>
          {/* Maps info of recently updated patients from list */}
          {patientList.map((patient) => (
            <li key={patient.IDNum}>
              <Button variant="outlined" fullWidth sx={{ mb: 1, color: '#C53F4E', borderColor: '#C53F4E', justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => handleEditClick(patient.IDNum)}>
                <Iconify  sx={{ mr: 1, width: 40, height: 40, color: '#637381' }} icon="fluent:patient-20-regular" /> {/* Patient in bed icon */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#637381' }}>{patient.FirstName} {patient.LastName}</Typography>
                  <Typography sx={{ fontSize: '14px', color: '#637381' }}>{patient.IDNum}</Typography>
                </div>
              </Button>
            </li>
          ))}
        </ul>
      </Box>
    </Scrollbar>
  );

  return (
    <Box component="nav" sx={{ flexShrink: { lg: 0 }, width: { lg: NAV_WIDTH }, }}> {/* If navbar will be fixed or not. */}
      {isDesktop ? (
        <Drawer open variant="permanent" PaperProps={{ sx: { width: NAV_WIDTH, bgcolor: 'background.default', borderRightStyle: 'solid', borderLeft: '12px solid #ba2737', }, }}>
          {renderContent} {/* If large screen, the navbar is always visible */}
        </Drawer>
      ) : (   
        <Drawer open={openNav} onClose={onCloseNav} ModalProps={{ keepMounted: true, }} PaperProps={{ sx: { width: NAV_WIDTH, bgcolor: 'background.default', }, }}>
          {renderContent} {/* If smaller screen, navbar is opened with a menu icon */}
        </Drawer>
      )}
    </Box>
  );
}
