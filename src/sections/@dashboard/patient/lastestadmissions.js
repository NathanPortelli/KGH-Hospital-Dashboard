import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

function LatestAdmissionsTable({ patientList, formatDate }) {
  const limitedList = patientList.slice(0, 5);

  return (
    <TableContainer component={Paper}>
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
                <TableCell>{formatDate(AdmitDate)}</TableCell>
                <TableCell align="left">{Consultant}</TableCell>
                <TableCell align="left">{AdmissionWard}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default LatestAdmissionsTable;
