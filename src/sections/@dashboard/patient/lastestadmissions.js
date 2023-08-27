import React from 'react';
import { useNavigate } from 'react-router-dom';

import { IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import Iconify from '../../../components/iconify';

// eslint-disable-next-line react/prop-types
function LatestAdmissionsTable({ patientList, formatDate }) {
  // eslint-disable-next-line react/prop-types
  const limitedList = patientList.slice(0, 5); // To limit the total number of patients to the top 5 records
  const navigate = useNavigate();
  const handleEditClick = (idNum) => { navigate(`/dashboard/patient/${idNum}`); };  // Handles click event for the "View/Edit" button

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: '#D0F2FF' }}>
          <TableRow>
            <TableCell>ID No.</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Admitted</TableCell>
            <TableCell>Consultant</TableCell>
            <TableCell>Ward</TableCell>
            <TableCell sx={{textAlign: 'center'}}>View/Edit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Map through the 5 patients and render rows */}
          {limitedList.map((row) => {
            const { id, IDNum, FirstName, LastName, AdmissionWard, AdmitDate, Consultant } = row;
            return (
              <TableRow hover key={id} tabIndex={-1} role="checkbox">
                <TableCell component="th" scope="row" padding-left="7px">
                  <Typography variant="subtitle2" noWrap>
                    {IDNum}
                  </Typography>
                </TableCell>
                <TableCell align="left">{FirstName} {LastName}</TableCell>
                <TableCell>{formatDate(AdmitDate)}</TableCell> {/* For format: "1 Jan 1900" */}
                <TableCell align="left">{Consultant}</TableCell>
                <TableCell align="left">{AdmissionWard}</TableCell>
                <TableCell align="center">
                  {/* Goes to patient details page and load current patient's details */}
                  <IconButton size="large" onClick={() => handleEditClick(IDNum)}><Iconify color="#ba2737" icon={'tabler:eye-edit'} /></IconButton> {/* Eye with pencil icon */}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default LatestAdmissionsTable;
