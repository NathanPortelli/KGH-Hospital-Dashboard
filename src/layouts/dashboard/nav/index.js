import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// @mui
import { Box, Drawer, Divider, Typography, Button } from '@mui/material';

import { collection, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../config/firebase';

// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
//
import navConfig from './config';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const { pathname } = useLocation();
  const [patientList, setPatientList] = useState([]);
  const recentPatientsCollectionRef = collection(db, "recentpatients");

  const navigate = useNavigate();
  const handleEditClick = (idNum) => { navigate(`/dashboard/patient/${idNum}`); };  

  const isDesktop = useResponsive('up', 'lg');

  const getLastestPatients = async () => {
    try {
      const querySnapshot = await getDocs(recentPatientsCollectionRef, limit(5));
      const patientData = querySnapshot.docs.map((doc) => doc.data());
  
      const uniquePatientList = [];
      const uniqueIDs = new Set();
  
      patientData.forEach((patient) => {
        const { IDNum, FirstName, LastName } = patient;
        if (!uniqueIDs.has(IDNum)) {
          uniqueIDs.add(IDNum);
          uniquePatientList.push({ IDNum, FirstName, LastName });
        }
      });
  
      setPatientList(uniquePatientList);
    } catch (e) {
      console.error('Error getting latest patients: ', e);
    }
  };
  

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    getLastestPatients();
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{ height: 1, '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' }, }}
    >
      <Box sx={{ px: 3, py: 5, display: 'inline-flex' }}>
        <Logo />
      </Box>
      <NavSection data={navConfig} />
      <br /><Divider /><br />
      <Typography variant="h6" gutterBottom sx={{ml: 1, mb: 2}}>
        Recently Updated Patients
      </Typography>
      <Box sx={{ml: -1, mr: 1}}>
        <ul>
          {patientList.map((patient) => (
            <li key={patient.id}>
              <Button variant="outlined" fullWidth sx = {{mb: 1, color: '#000080', borderColor: '#000080', justifyContent: 'flex-end',  textAlign: 'right'}} onClick={() => handleEditClick(patient.IDNum)}>
                {patient.FirstName} {patient.LastName} ({patient.IDNum})
              </Button>
            </li>
          ))}
        </ul>
      </Box>
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'solid',
              borderLeft: '12px solid #000080',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
